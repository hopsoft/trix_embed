import { getMediaType } from './media'

export default class Renderer {
  constructor(controller) {
    this.controller = controller
    this.hosts = controller.hostsValue

    // invalid urls template
    if (controller.invalidTemplateValue) {
      const template = document.getElementById(controller.invalidTemplateValue)
      if (template) this.invalidTemplate = template
    }

    // valid urls template
    if (controller.validTemplateValue) {
      const template = document.getElementById(controller.validTemplateValue)
      if (template) this.validTemplate = template
    }
  }

  renderLinks(urls) {
    return urls.map(url => `<a href='${url}' target='_blank'>${url}</a>`).join('<br>')
  }

  renderValid(url) {
    const element = this.validTemplate.content.firstElementChild.cloneNode(true)
    const iframe = element.querySelector('iframe')
    const img = element.querySelector('img')

    if (getMediaType(url)) {
      iframe.remove()
      img.src = url
    } else {
      img.remove()
      iframe.src = url
    }
    return element.outerHTML
  }

  renderInvalid(urls) {
    const element = this.invalidTemplate.content.firstElementChild.cloneNode(true)
    const hostsElement = element.querySelector('[data-list="hosts"]')
    const urlsElement = element.querySelector('[data-list="urls"]')

    if (hostsElement)
      if (this.hosts.length)
        hostsElement.innerHTML = this.hosts.map(host => `<li><code>${host}</code></li>`).join('')
      else
        hostsElement.innerHTML = `
          <li>
            <strong>Hosts not configured</strong>
            <p>Example Configuration</p>
            <pre><code>&lt;trix-editor data-trix-embed-hosts-value='["example.com", "test.com"]'&gt;</code></pre>
          </li>`

    if (urlsElement) urlsElement.innerHTML = urls.map(url => `<li><code>${url}</code></li>`).join('')

    return element.outerHTML
  }

  set validTemplate(template) {
    this._validTemplate = template
  }

  get validTemplate() {
    if (this._validTemplate) return this._validTemplate

    const template = document.createElement('template')
    template.innerHTML = '<div><iframe></iframe><img></img></div>'
    return template
  }

  set invalidTemplate(template) {
    this._invalidTemplate = template
  }

  get invalidTemplate() {
    if (this._invalidTemplate) return this._invalidTemplate

    const template = document.createElement('template')
    template.innerHTML = `
      <div style="background-color:ivory; border:solid 1px red; color:red; padding:10px;">
        <h1 slot="header">Unsupported copy/paste embed!</h1>
        <h2>The pasted content includes media from an unsupported host.</h2>
        <h3 style="color:green;">Supported Hosts</h3>
        <ul data-list="hosts" style="color:green;"></ul>
        <h2>Invalid URLs</h2>
        <ul data-list="urls"></ul>
      </div>`
    return template
  }
}
