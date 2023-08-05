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
    const validMediaURLs = mediaURLs.filter(url => this.validateURL(url))
    const validMediaContent = renderer.renderValid(validMediaURLs)
    const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))
    const invalidMediaContent = renderer.renderInvalid(invalidMediaURLs)

    // Standard URLs (non-media resources i.e. web pages etc.)
    const standardURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
    const validStandardURLs = standardURLs.filter(url => this.validateURL(url))
    const validStandardContent = renderer.renderValid(validStandardURLs)
    const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))
    const invalidStandardContent = renderer.renderLinks(invalidStandardURLs)

    // 1. render invalid media urls
    this.insert(invalidMediaContent, { disposition: 'attachment', first: true }).then(() => {
      // 2. render invalid standard urls
      this.insert(invalidStandardContent, { disposition: 'inline' }).then(() => {
        // 3. render valid media urls
        this.insert(validMediaContent, { disposition: 'attachment' }).then(() => {
          // 4. render valid standard urls
          this.insert(validStandardContent, { disposition: 'attachment' })
        })
      })
    })
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

  insertAttachment(content, options = { delay: 0 }) {
    const { delay } = options
    return new Promise(resolve => {
      setTimeout(() => {
        const attachment = new Trix.Attachment({ content })
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

  insert(content, options = { disposition: 'attachment', first: false }) {
    const { disposition, first } = options

    if (content?.length) {
      return new Promise(resolve => {
        setTimeout(() => {
          if (first) this.editor.deleteInDirection('backward')

          if (typeof content === 'string') {
            if (disposition === 'inline') return this.insertHTML(content).then(resolve)
            else return this.insertAttachment(content).then(resolve)
          }

          if (Array.isArray(content)) {
            if (disposition === 'inline')
              return content.reduce((p, c, i) => p.then(this.insertHTML(c)), Promise.resolve()).then(resolve)
            else
              return content
                .reduce((p, c, i) => p.then(this.insertAttachment(c)), Promise.resolve())
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
