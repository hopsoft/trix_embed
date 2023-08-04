//import Trix from 'trix'
//import { Controller } from '@hotwired/stimulus'
import { extractURLs } from './urls'
import { getMediaType } from './media'
import Renderer from './renderer'

// imports for developing and testing with test/index.html
import { Controller } from 'https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js'

export default class extends Controller {
  static values = {
    hosts: Array, // list of hosts that embeds are allowed from
    validTemplate: String, // dom id of template to use for valid embeds
    invalidTemplate: String // dom id of template to use for invalid embeds
  }

  paste(event) {
    const { html, string, range } = event.paste
    let content = html || string || ''
    const pastedTemplate = this.buildPastedTemplate(content)
    const pastedURLs = extractURLs(pastedTemplate.content.firstElementChild)

    if (!pastedURLs.length) return // let Trix handle it

    // iframe URLs
    const pastedFrames = Array.from(pastedTemplate.content.firstElementChild.querySelectorAll('iframe'))
    const frameURLs = pastedFrames.map(frame => frame.src)
    const validFrameURLs = frameURLs.filter(url => this.validateURL(url))
    const invalidFrameURLs = frameURLs.filter(url => !validFrameURLs.includes(url))

    // Media URLs
    const mediaURLs = pastedURLs.filter(url => getMediaType(url) && !frameURLs.includes(url))
    const validMediaURLs = mediaURLs.filter(url => this.validateURL(url))
    const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))

    // Standard URLs
    const standardURLs = pastedURLs.filter(url => !frameURLs.includes(url) && !mediaURLs.includes(url))
    const validStandardURLs = standardURLs.filter(url => this.validateURL(url))
    //const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))

    // intentionally omit standard URLs from valid/invalid
    const validURLs = [...validFrameURLs, ...validMediaURLs]
    const invalidURLs = [...invalidFrameURLs, ...invalidMediaURLs]

    const renderer = new Renderer(this)

    // detect if a single solitary valid URL was pasted
    const solitaryValidURL =
      !frameURLs.length && !mediaURLs.length && standardURLs.length === 1 && this.validateURL(standardURLs[0])
        ? standardURLs[0]
        : null
    if (solitaryValidURL) {
      this.attachContent(renderer.renderValid(solitaryValidURL))
      return setTimeout(() => this.removePastedContent(range))
    }

    if (!frameURLs.length && !mediaURLs.length) return // let Trix handle it
    if (!frameURLs.length && validMediaURLs.length === mediaURLs.length) return // let Trix handle it

    // no valid URLs
    if (!validURLs.length) {
      this.removePastedContent(range)
      return this.attachContent(renderer.renderInvalid(pastedURLs.sort()))
    }

    // at least one valid URL

    // render valid URLs
    validURLs.forEach(url => this.attachContent(renderer.renderValid(url)))

    // render standard URLs
    if (standardURLs.length) this.attachContent(standardURLs.sort().join('<br>'))

    // render invalid URLs
    if (invalidURLs.length) this.attachContent(renderer.renderInvalid(pastedURLs.sort()))

    setTimeout(() => this.removePastedContent(range))
  }

  buildPastedTemplate(content) {
    const template = document.createElement('template')
    template.innerHTML = `<div>${content.trim()}</div>`
    return template
  }

  removePastedContent(range) {
    this.editor.setSelectedRange(range)
    this.editor.deleteInDirection('backward')
    this.editor.moveCursorInDirection('forward')
  }

  validateURL(value) {
    const url = new URL(value)
    return !!this.hostsValue.find(host => url.host.includes(host))
  }

  attachContent(content) {
    const attachment = new Trix.Attachment({ content })
    this.editor.insertAttachment(attachment)
  }

  get editor() {
    return this.element.editor
  }
}
