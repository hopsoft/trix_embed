//import Trix from 'trix'
//import { Controller } from '@hotwired/stimulus'
import { extractURLs, validateURL } from './urls'
import { getMediaType, mediaTags } from './media'
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
    const pastedElement = pastedTemplate.content.firstElementChild
    const pastedURLs = extractURLs(pastedElement)

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

    // Standard URLs (non-media resources i.e. web pages etc.)
    const standardURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
    const validStandardURLs = standardURLs.filter(url => validateURL(url, this.hostsValue))
    const validStandardURLContent = renderer.renderValid(validStandardURLs)
    const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))
    const invalidStandardURLContent = renderer.renderLinks(invalidStandardURLs)

    // sanitize the pasted content by removing all media tags
    const sanitizedPastedElement = pastedElement.cloneNode(true)
    sanitizedPastedElement.querySelectorAll(mediaTags.join(', ')).forEach(tag => tag.remove())
    const sanitizedPastedContent = sanitizedPastedElement.innerHTML

    // 1. render invalid media urls
    this.insert(invalidMediaURLContent, { first: true }).then(() => {
      // 2. render invalid standard urls
      this.insert(renderer.renderHeader('Pasted URLs')).then(() => {
        this.insert(invalidStandardURLContent, { disposition: 'inline' }).then(() => {
          // 3. render valid media urls
          this.insert(validMediaURLContent).then(() => {
            // 4. render valid standard urls
            this.insert(validStandardURLContent).then(() => {
              // 5. render the pasted content as sanitized HTML
              this.insert(renderer.renderHeader('Pasted Content')).then(() => {
                this.insert(sanitizedPastedContent, { disposition: 'inline' })
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
        this.editor.insertLineBreak()
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
