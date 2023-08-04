export default class Renderer {
  constructor(controller) {
    this.controller = controller
    this.hosts = controller.hostsValue

    if (controller.invalidTemplateValue) {
      const template = document.getElementById(controller.invalidTemplateValue)
      if (template) this.invalidTemplate = template
    }

    if (controller.validTemplateValue) {
      const template = document.getElementById(controller.validTemplateValue)
      if (template) this.validTemplate = template
    }
  }

  renderValid(url) {
    const node = this.validTemplate.content.firstElementChild.cloneNode(true)
    const iframe = node.querySelector('iframe')
    iframe.src = url
    return node.outerHTML
  }

  renderInvalid(urls) {
    const node = this.invalidTemplate.content.firstElementChild.cloneNode(true)
    const hostsElement = node.querySelector('[data-list="hosts"]')
    const urlsElement = node.querySelector('[data-list="urls"]')

    if (hostsElement)
      hostsElement.innerHTML = this.hosts.map(host => `<li><code>${host}</code></li>`).join('')

    if (urlsElement) urlsElement.innerHTML = urls.map(url => `<li><code>${url}</code></li>`).join('')

    return node.outerHTML
  }

  set validTemplate(template) {
    this._validTemplate = template
  }

  get validTemplate() {
    if (this._validTemplate) return this._validTemplate

    const template = document.createElement('template')
    template.innerHTML = `
      <div style="border:solid 1px gainsboro; border-radius:5px; display:inline-block; padding:10px;">
        <iframe
          allow=""
          allowfullscreen
          frameborder="0"
          loading="lazy"
          referrerpolicy="no-referrer"
          scrolling="no"
          width="854"
          height="480"
          style="border:solid 1px gainsboro;">
        </iframe>
      </div>`
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
        <p>The pasted content includes media from an unsupported host.</p>
        <h2>Supported Hosts</h2>
        <ul data-list="hosts"></ul>
        <h2>Pasted URLs</h2>
        <ul data-list="urls"></ul>
      </div>`
    return template
  }
}
