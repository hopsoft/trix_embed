//import Trix from 'trix'
//import { Controller } from '@hotwired/stimulus'
import { extractURLsFromElement, validateURL } from './urls'
import { getMediaType, mediaTags } from './media'
import Renderer from './renderer'

// imports for developing and testing with test/index.html
import { Controller } from 'https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js'

export default class extends Controller {
  static values = {
    hosts: Array, // list of hosts/domains that embeds are allowed from
    hostsKey: String, // encryption key used to encrypt/decrypt allowed hosts
    hostsList: Array, // list of encrypted hosts/domains that embeds are allowed from
    validTemplate: String, // dom id of template to use for valid embeds
    invalidTemplate: String // dom id of template to use for invalid embeds
  }

  connect() {
    this.rememberEncryptionKey()
  }

  disconnect() {
    this.forgetEncryptionKey()

    // prevent this controller from being reconnected
    //this.closest('form').removeEventListener('submit', this.submitListener)
  }

  paste(event) {
    const { html, string, range } = event.paste
    let content = html || string || ''
    const pastedTemplate = this.buildPastedTemplate(content)
    const pastedElement = pastedTemplate.content.firstElementChild
    const pastedURLs = extractURLsFromElement(pastedElement)
    //console.debug('pastedURLs', pastedURLs?.length, pastedURLs)

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
    const validMediaURLContent = renderer.renderValid(validMediaURLs)
    const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))
    const invalidMediaURLContent = renderer.renderInvalid(invalidMediaURLs)
    //console.log('mediaURLs', mediaURLs.length, mediaURLs)
    //console.debug('validMediaURLs', validMediaURLs.length, validMediaURLs)
    //console.debug('validMediaURLContent', validMediaURLContent)
    //console.debug('invalidMediaURLs', invalidMediaURLs.length, invalidMediaURLs)
    //console.debug('invalidMediaURLContent', invalidMediaURLContent)

    // Standard URLs (non-media resources i.e. web pages etc.)
    const standardURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
    const validStandardURLs = standardURLs.filter(url => validateURL(url, this.hostsValue))
    const validStandardURLContent = renderer.renderValid(validStandardURLs)
    const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))
    const invalidStandardURLContent = renderer.renderLinks(invalidStandardURLs)
    //console.debug('standardURLs', standardURLs.length, standardURLs)
    //console.debug('validStandardURLs', validStandardURLs.length, validStandardURLs)
    //console.debug('validStandardURLContent', validStandardURLContent)
    //console.debug('invalidStandardURLs', invalidStandardURLs.length, invalidStandardURLs)
    //console.debug('invalidStandardURLContent', invalidStandardUinvalidStandardURLContentRLContent)

    const sanitizedPastedElement = this.sanitizePastedElement(pastedElement)
    const sanitizedPastedContent = sanitizedPastedElement.innerHTML

    // 1. render invalid media urls
    this.insert(invalidMediaURLContent, { first: true }).then(() => {
      // 2. render invalid standard urls
      this.insert(renderer.renderHeader('Pasted URLs', invalidStandardURLContent)).then(() => {
        this.insert(invalidStandardURLContent, { disposition: 'inline' }).then(() => {
          // 3. render valid media urls
          this.insert(renderer.renderHeader('Embedded Media', validMediaURLContent)).then(() => {
            this.insert(validMediaURLContent).then(() => {
              // 4. render valid standard urls
              this.insert(validStandardURLContent).then(() => {
                // 5. render the pasted content as sanitized HTML
                this.insert(renderer.renderHeader('Pasted Content', sanitizedPastedContent)).then(() => {
                  this.editor.insertLineBreak()
                  this.insert(sanitizedPastedContent, { disposition: 'inline' })
                })
              })
            })
          })
        })
      })
    })
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

  insert(content, options = { delay: 0, disposition: 'attachment', first: false }) {
    const { delay, disposition, first } = options

    if (content?.length) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (first) this.editor.deleteInDirection('backward')

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

  get editor() {
    return this.element.editor
  }

  // =========================================================================================================
  // Weak security through obscurity and indirection
  // =========================================================================================================

  get storageKey() {
    return btoa(`hopsoft/trix_embed/${this.element.closest('[id]')?.id}`)
  }

  get encryptionKey() {
    return sessionStorage.getItem(this.storageKey)
  }

  rememberEncryptionKey() {
    if (!this.hasHostsKeyValue) return
    sessionStorage.setItem(this.storageKey, this.hostsKeyValue)
    this.element.removeAttribute('data-trix-embed-hosts-key-value')
  }

  forgetEncryptionKey() {
    sessionStorage.removeItem(this.storageKey)
  }
}
