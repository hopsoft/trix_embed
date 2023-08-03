//import Trix from 'trix'
//import { Controller } from '@hotwired/stimulus'

// development imports for testing with test/index.html
import { Controller } from 'https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js'

export default class extends Controller {
  static values = {
    hosts: Array, // list of hosts that embeds are allowed from
    template: String, // template to use for embeds
    invalidMessage: {
      type: String,
      default: '<strong>The pasted content is not supported!</strong><br><br>Media is limited to:'
    }
  }

  paste(event) {
    const { html, string, range } = event.paste
    let content = html || string || ''
    const pastedTemplate = this.buildPastedTemplate(content)
    const pastedContent = this.extractContent(pastedTemplate)
    const pastedMediaURLs = this.extractMediaURLs(pastedTemplate)

    if (!this.validatePasted(pastedTemplate, pastedMediaURLs)) {
      if (pastedMediaURLs.length === 0) return // no media, so let Trix handle it
      return this.createContentAttachment(this.invalidMessage, range)
    }

    if (!this.template) return this.createContentAttachment(pastedContent, range)

    // TODO: add error handling for invalid templates
    const element = this.template.content.firstElementChild.cloneNode(true)
    const iframe = element.tagName.match(/iframe/i) ? element : element.querySelector('iframe')
    iframe.src = this.extractMediaURLs(pastedTemplate)[0]
    this.createContentAttachment(element.outerHTML, range)
  }

  buildPastedTemplate(content) {
    const template = document.createElement('template')
    template.innerHTML = content.trim()
    return template
  }

  validatePasted(template, urls) {
    if (template.content.childNodes.length !== 1) return false
    if (!this.validNodeTypes.includes(template.content.firstChild.nodeType)) return false
    return urls.length === urls.filter(url => this.validateURL(url))
  }

  validateURL(url) {
    return !!this.validHosts.find(host => url.includes(host))
  }

  extractContent(template) {
    switch (template.content.firstChild.nodeType) {
      case Node.TEXT_NODE:
        return template.content.textContent
      case Node.ELEMENT_NODE:
        return template.content.firstElementChild.outerHTML
      default:
        return ''
    }
  }

  sanitizeURL(url) {
    url = String(url).trim()
    return url.startsWith('http') ? url : null
  }

  extractMediaURLs(template) {
    const urls = []

    switch (template.content.firstChild.nodeType) {
      case Node.TEXT_NODE:
        urls.push(this.sanitizeURL(template.content.textContent))
        break
      case Node.ELEMENT_NODE:
        const elements = template.content.querySelectorAll('audio, embed, frame, iframe, img, video')
        elements.forEach(element => urls.push(this.sanitizeURL(element.src || element.href)))
        break
    }

    return urls.filter(url => url)
  }

  createContentAttachment(content, range) {
    console.log('createContentAttachment', content)
    const attachment = new Trix.Attachment({ content, contentType: 'text/html' })
    console.log('attachment', attachment)
    this.editor.insertAttachment(attachment)

    setTimeout(() => {
      this.editor.setSelectedRange(range)
      this.editor.deleteInDirection('backward')
      this.editor.moveCursorInDirection('forward')
    })
  }

  get validNodeTypes() {
    return [Node.ELEMENT_NODE, Node.TEXT_NODE]
  }

  get validHosts() {
    return this.hostsValue
  }

  get invalidMessage() {
    return `${this.invalidMessageValue} <code>${this.hostsValue.join(', ')}</code>`
  }

  get template() {
    if (!this.hasTemplateValue) return null
    return document.getElementById(this.templateValue)
  }

  get editor() {
    return this.element.editor
  }
}
