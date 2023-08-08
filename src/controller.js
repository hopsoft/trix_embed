//import Trix from 'trix'
//import { Controller } from '@hotwired/stimulus'
import { extractURLsFromElement, validateURL } from './urls'
import { getMediaType, mediaTags } from './media'
import Guard from './guard'
import Store from './store'
import Renderer from './renderer'

// imports for developing and testing with test/index.html
import { Controller } from 'https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js'

export default class extends Controller {
  static values = {
    hosts: Array, // list of hosts/domains that embeds are allowed from

    // templates
    validTemplate: String, // dom id of template to use for valid embeds
    invalidTemplate: String, // dom id of template to use for invalid embeds

    // security related values
    key: String, // encryption key used to encrypt/decrypt allowed hosts
    list: Array, // list of encrypted hosts/domains that embeds are allowed from
    paranoid: Boolean // lock down the form when this controller is disconnected
  }

  connect() {
    this.store = new Store(this)
    this.guard = new Guard(this)
    this.rememberConfig()
    if (this.paranoid) this.guard.protect()
  }

  disconnect() {
    if (this.paranoid) this.guard.cleanup()
    this.forgetConfig()
  }

  async paste(event) {
    const { html, string, range } = event.paste
    let content = html || string || ''
    const pastedTemplate = this.buildPastedTemplate(content)
    const pastedElement = pastedTemplate.content.firstElementChild
    const sanitizedPastedElement = this.sanitizePastedElement(pastedElement)
    const sanitizedPastedContent = sanitizedPastedElement.innerHTML.trim()
    const pastedURLs = extractURLsFromElement(pastedElement)

    // no URLs were pasted, let Trix handle it ...............................................................
    if (!pastedURLs.length) return

    event.preventDefault()
    this.editor.setSelectedRange(range)
    const renderer = new Renderer(this)

    // Media URLs (images, videos, audio etc.)
    const mediaURLs = pastedURLs.filter(url => getMediaType(url))
    Array.from(pastedTemplate.content.firstElementChild.querySelectorAll('iframe')).forEach(frame => {
      if (!mediaURLs.includes(frame.src)) mediaURLs.push(frame.src)
    })
    const validMediaURLs = mediaURLs.filter(url => validateURL(url, this.hostsValue))
    const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))

    // Standard URLs (non-media resources i.e. web pages etc.)
    const standardURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
    const validStandardURLs = standardURLs.filter(url => validateURL(url, this.hostsValue))
    const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))

    let urls

    // 1. render invalid media urls ..........................................................................
    urls = invalidMediaURLs
    if (urls.length) await this.insert(renderer.renderInvalid(urls))

    // 2. render invalid standard urls .......................................................................
    urls = invalidStandardURLs
    if (urls.length) {
      await this.insert(renderer.renderHeader('Pasted URLs'))
      await this.insert(renderer.renderLinks(urls), { disposition: 'inline' })
    }

    // 3. render valid media urls ............................................................................
    urls = validMediaURLs
    if (urls.length) {
      if (urls.length > 1) await this.insert(renderer.renderHeader('Embedded Media'))
      await this.insert(renderer.renderValid(urls))
    }

    // 4. render valid standard urls .........................................................................
    urls = validStandardURLs
    if (urls.length) await this.insert(renderer.renderValid(validStandardURLs))

    // exit early if there is only one valid URL and it is the same as the pasted content
    if (pastedURLs.length === 1 || validMediaURLs[0] === sanitizedPastedContent) return
    if (pastedURLs.length === 1 || validStandardURLs[0] === sanitizedPastedContent) return

    // 5. render the pasted content as sanitized HTML ........................................................
    if (sanitizedPastedContent.length) {
      await this.insert(renderer.renderHeader('Pasted Content', sanitizedPastedContent))
      this.editor.insertLineBreak()
      this.insert(sanitizedPastedContent, { disposition: 'inline' })
    }
  }

  buildPastedTemplate(content) {
    const template = document.createElement('template')
    template.innerHTML = `<div>${content.trim()}</div>`
    return template
  }

  sanitizePastedElement(element) {
    element = element.cloneNode(true)
    element.querySelectorAll(mediaTags.join(', ')).forEach(tag => tag.remove())
    return element
  }

  insertAttachment(content, options = { delay: 0 }) {
    const { delay } = options
    return new Promise(resolve => {
      setTimeout(() => {
        const attachment = new Trix.Attachment({ content, contentType: 'application/vnd.trix-embed.html' })
        this.editor.insertAttachment(attachment)
        resolve()
      }, delay)
    })
  }

  insertHTML(content, options = { delay: 0 }) {
    const { delay } = options
    return new Promise(resolve => {
      setTimeout(() => {
        this.editor.insertHTML(content)
        // shenanigans to ensure that Trix considers this block of content closed
        this.editor.moveCursorInDirection('forward')
        this.editor.insertLineBreak()
        this.editor.moveCursorInDirection('backward')
        resolve()
      }, delay)
    })
  }

  insert(content, options = { delay: 0, disposition: 'attachment' }) {
    const { delay, disposition } = options

    if (content?.length) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (typeof content === 'string') {
            if (disposition === 'inline') return this.insertHTML(content, { delay }).then(resolve)
            else return this.insertAttachment(content, { delay }).then(resolve)
          }

          if (Array.isArray(content)) {
            if (disposition === 'inline')
              return content
                .reduce((p, c, i) => p.then(this.insertHTML(c, { delay })), Promise.resolve())
                .then(resolve)
            else
              return content
                .reduce((p, c, i) => p.then(this.insertAttachment(c, { delay })), Promise.resolve())
                .then(resolve)
          }

          resolve()
        })
      })
    }

    return Promise.resolve()
  }

  // Returns the Trix editor
  //
  // @returns {TrixEditor}
  //
  get editor() {
    return this.element.editor
  }

  get toolbarElement() {
    const sibling = this.element.previousElementSibling
    return sibling?.tagName.match(/trix-toolbar/i) ? sibling : null
  }

  get inputElement() {
    return document.getElementById(this.element.getAttribute('input'))
  }

  get formElement() {
    return this.element.closest('form')
  }

  get paranoid() {
    return this.store.read('paranoid') === 'true'
  }

  get key() {
    return this.store.read('key')
  }

  get list() {
    try {
      return JSON.parse(this.store.read('list'))
    } catch {
      return []
    }
  }

  rememberConfig() {
    this.store.write('key', this.keyValue)
    this.element.removeAttribute('data-trix-embed-key-value')

    this.store.write('list', JSON.stringify(this.listValue))
    this.element.removeAttribute('data-trix-embed-list-value')

    this.store.write('paranoid', this.paranoidValue)
    this.element.removeAttribute('data-trix-embed-paranoid')
  }

  forgetConfig() {
    this.store.remove('key')
    this.store.remove('list')
    this.store.remove('paranoid')
  }
}
