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
    defaultTemplate: String, // dom id of template to use for embeds regardless of validity
    validTemplate: String, // dom id of template to use for valid embeds
    invalidTemplate: String // dom id of template to use for invalid embeds
  }

  paste(event) {
    const { html, string, range } = event.paste
    let content = html || string || ''
    const pastedTemplate = this.buildPastedTemplate(content)
    const pastedURLs = extractURLs(pastedTemplate.content.firstElementChild)

    if (!pastedURLs.length) return // let Trix handle it

    // Media URLs
    const mediaURLs = pastedURLs.filter(url => getMediaType(url))
    Array.from(pastedTemplate.content.firstElementChild.querySelectorAll('iframe')).forEach(frame => {
      if (!mediaURLs.includes(frame.src)) mediaURLs.push(frame.src)
    })
    const validMediaURLs = mediaURLs.filter(url => this.validateURL(url))
    const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))

    // Standard URLs
    const standardURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
    const validStandardURLs = standardURLs.filter(url => this.validateURL(url))
    const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))

    const renderer = new Renderer(this)

    // a single solitary URL was pasted .......................................................................
    if (pastedURLs.length === 1) {
      if (this.validateURL(pastedURLs[0])) {
        this.attachContent(renderer.renderValid(pastedURLs[0]))
        return setTimeout(() => this.removePastedContent(range))
      }
    }

    if (!mediaURLs.length) return // let Trix handle it
    if (mediaURLs.length === validMediaURLs.length && !standardURLs.length) return // let Trix handle it

    // no valid URLs .........................................................................................
    if (!validMediaURLs.length) {
      if (invalidMediaURLs.length) this.attachContent(renderer.renderInvalid(invalidMediaURLs.sort()))
      if (standardURLs.length) this.attachContent(renderer.render(standardURLs.sort()))
      return setTimeout(() => this.removePastedContent(range))
    }

    // at least one valid URL ................................................................................

    // render valid media URLs
    validMediaURLs.forEach(url => this.attachContent(renderer.renderValid(url)))

    // render standard URLs
    this.attachContent(renderer.render(standardURLs.sort()))

    // render invalid media URLs
    if (invalidMediaURLs.length) this.attachContent(renderer.renderInvalid(invalidMediaURLs.sort()))

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
