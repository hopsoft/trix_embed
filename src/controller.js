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

    // no URLs were pasted, let Trix handle it
    if (!pastedURLs.length) return

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

    // we only have valid media urls, let Trix handle it
    if (validMediaURLs.length && !invalidMediaURLs && !standardURLs.length) return

    event.preventDefault() // taking control from here
    const renderer = new Renderer(this)

    // a single URL was pasted ...............................................................................
    if (pastedURLs.length === 1)
      if (this.validateURL(pastedURLs[0]))
        return this.attachContent(renderer.renderValid(pastedURLs[0]), { range })

    // we only have invalid standard urls
    if (invalidStandardURLs.length && !validStandardURLs.length && !mediaURLs.length) {
      this.editor.setSelectedRange(range)
      return setTimeout(() => {
        this.editor.deleteInDirection('backward')
        this.editor.insertHTML(renderer.renderLinks(invalidStandardURLs))
        this.editor.insertLineBreak()
      })
    }

    // media URLs are all invalid ............................................................................
    if (!validMediaURLs.length && invalidMediaURLs.length) {
      this.attachContent(renderer.renderInvalid(invalidMediaURLs.sort()), {
        range,
        move: !invalidStandardURLs.length
      }).then(() => {
        if (invalidStandardURLs.length) {
          this.editor.insertHTML(renderer.renderLinks(invalidStandardURLs))
          this.editor.insertLineBreak()
        }
      })
    }

    console.log('nate: early return')
    return

    // at least one valid URL ................................................................................

    // render valid media URLs
    if (validMediaURLs.length) validMediaURLs.forEach(url => this.attachContent(renderer.renderValid(url)))

    // render valid standard URLs
    if (validStandardURLs.length)
      validStandardURLs.forEach(url => this.attachContent(renderer.renderValid(url)))

    // render invalid standard URLs (default template)
    //if (invalidStandardURLs.length) this.attachContent(renderer.render(invalidStandardURLs.sort()))
    if (invalidStandardURLs.length) {
      this.removePastedContent(range)
      invalidStandardURLs.forEach((url, i) => this.dispatchPasteEventLater(url, i * 50))
    }

    // render invalid media URLs
    if (invalidMediaURLs.length) this.attachContent(renderer.renderInvalid(invalidMediaURLs.sort()))

    this.removePastedContent(range)
  }

  buildPastedTemplate(content) {
    const template = document.createElement('template')
    template.innerHTML = `<div>${content.trim()}</div>`
    return template
  }

  validateURL(value) {
    const url = new URL(value)
    return !!this.hostsValue.find(host => url.host.includes(host))
  }

  // removePastedContent(options = {}) {
  //   const { range, move, direction } = options
  //   this.editor.setSelectedRange(range)
  //   this.editor.deleteInDirection('backward')
  //   if (move) setTimeout(() => this.editor.moveCursorInDirection(direction))
  // }

  attachContent(content, options = { range: null, delay: 0, move: true, direction: 'backward' }) {
    if (!content) return

    const { range, delay, move, direction } = options
    if (range) this.editor.setSelectedRange(range)

    return new Promise(resolve => {
      setTimeout(() => {
        if (range) this.editor.deleteInDirection('backward')
        const attachment = new Trix.Attachment({ content })
        this.editor.insertAttachment(attachment)
        if (move) this.editor.moveCursorInDirection(direction)
        resolve()
      }, delay)
    })

    //this.editor.moveCursorInDirection('forward')

    //return new Promise(resolve =>
    //  setTimeout(() => {
    //    // this.removePastedContent(options)

    //    console.log('hi there')
    //    this.editor.setSelectedRange(range)
    //    this.editor.deleteInDirection('backward')
    //    this.editor.moveCursorInDirection('forward')

    //    resolve()
    //  }, options.delay)
    //)
  }

  renderURLsAsLinks(urls) {}

  dispatchPasteEvent(url, options = { delay: 0 }) {
    const { delay } = options
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      composed: true,
      clipboardData: new DataTransfer()
    })
    pasteEvent.clipboardData.setData('text/plain', url)
    this.element.dispatchEvent(pasteEvent)
    return new Promise(resolve => setTimeout(resolve, delay))
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
