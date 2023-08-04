//import Trix from 'trix'
//import { Controller } from '@hotwired/stimulus'
import { extractURLs } from './urls'
import { getMediaType } from './media'
import Renderer from './renderer'

// imports for developing and testing with test/index.html
import { Controller } from 'https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js'

export default class extends Controller {
  static values = {
    hosts: Array, // list of hosts/domains that embeds are allowed from
    template: String, // dom id of the default template to use for embeds regardless of validity
    validTemplate: String, // dom id of template to use for valid embeds
    invalidTemplate: String // dom id of template to use for invalid embeds
  }

  connect() {
    this.setupWeakSecurity()
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

    // we only have valid media urls
    if (mediaURLs.length && mediaURLs.length === validMediaURLs.length && !standardURLs.length) return // let Trix handle it

    // no media urls, and we have standard urls that are not valid
    if (!mediaURLs.length && standardURLs.length && !validStandardURLs.length) return // let Trix handle it

    // no valid URLs .........................................................................................
    if (!validMediaURLs.length) {
      if (invalidMediaURLs.length) this.attachContent(renderer.renderInvalid(invalidMediaURLs.sort()))
      if (standardURLs.length) this.attachContent(renderer.render(standardURLs.sort()))
      return setTimeout(() => this.removePastedContent(range))
    }

    // at least one valid URL ................................................................................

    // render valid media URLs
    if (validMediaURLs.length) validMediaURLs.forEach(url => this.attachContent(renderer.renderValid(url)))

    // render valid standard URLs
    if (validStandardURLs.length)
      validStandardURLs.forEach(url => this.attachContent(renderer.renderValid(url)))

    // render invalid standard URLs (default template)
    if (invalidStandardURLs.length) this.attachContent(renderer.render(invalidStandardURLs.sort()))

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

  // =========================================================================================================
  // Weak security through obscurity and indirection
  // =========================================================================================================

  setupWeakSecurity() {
    const idElement = this.element.closest('[id]')
    const id = idElement ? idElement.id : ''

    this.hostsKey = `trix-embed-hosts-${id}`

    if (this.rememberedHosts) this.hostsValue = this.rememberedHosts
    this.rememberHosts()
  }

  rememberHosts() {
    sessionStorage.setItem(this.hostsKey, JSON.stringify(this.hostsValue))
  }

  get rememberedHosts() {
    const json = sessionStorage.getItem(this.hostsKey)
    if (!json) return null
    return JSON.parse(json)
  }
}
