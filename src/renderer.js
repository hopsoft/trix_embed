import { createURL, extractURLHosts } from './urls'
import { getMediaType } from './media'

export default class Renderer {
  // Constructs a new Renderer instance
  //
  // @param {Controller} controller - a Stimulus Controller instance
  constructor(controller) {
    this.controller = controller

    this.hosts = this.controller.hostsValue

    // invalid urls template
    if (this.controller.invalidTemplateValue) {
      const template = document.getElementById(this.controller.invalidTemplateValue)
      if (template) this.invalidTemplate = template
    }

    // valid urls template
    if (this.controller.validTemplateValue) {
      const template = document.getElementById(this.controller.validTemplateValue)
      if (template) this.validTemplate = template
    }
  }

  renderHeader(value) {
    return `
    <h1>${value}</h1>
    `
  }

  // Renders a URL as an HTML embed i.e. an iframe or media tag (img, video, audio etc.)
  //
  // @param {String} url - URL
  // @returns {String} HTML
  //
  renderEmbed(url = 'https://example.com') {
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

  // Renders a list of URLs as a list of HTML links i.e. anchor tags <a>
  //
  // @param {String[]} urls - list of URLs
  // @returns {String[]} list of individual HTML links
  //
  renderLinks(urls = ['https://example.com', 'https://test.com']) {
    urls = urls
      .filter(url => {
        let ok = false
        createURL(url, u => (ok = true))
        return ok
      })
      .sort()

    if (!urls.length) return
    const links = urls.map(url => `<li><a href='${url}'>${url}</a></li>`)
    return `<ul>${links.join('')}</ul><br>`
  }

  // Renders a list of URLs as HTML embeds i.e. iframes or media tags (img, video, audio etc.)
  //
  // @param {String[]} urls - list of URLs
  // @returns {String[]} list of individual HTML embeds
  //
  renderValid(urls = ['https://example.com', 'https://test.com']) {
    if (!urls?.length) return
    return urls.map(url => this.renderEmbed(url))
  }

  // Renders a list of URLs as an HTML error block
  //
  // @param {String[]} urls - list of URLs
  // @returns {String} HTML
  //
  renderInvalid(urls = ['https://example.com', 'https://test.com']) {
    if (!urls?.length) return
    const element = this.invalidTemplate.content.firstElementChild.cloneNode(true)
    const allowedHostsElement = element.querySelector('[data-list="allowed-hosts"]')
    const hostsElement = element.querySelector('[data-list="hosts"]')

    if (allowedHostsElement)
      if (this.hosts.length)
        allowedHostsElement.innerHTML = this.hosts.map(host => `<li><code>${host}</code></li>`).join('')
      else
        allowedHostsElement.innerHTML = `
          <li>
            <strong>Allowed hosts not configured yet.</strong>
          </li>
        `

    if (hostsElement) {
      const hosts = extractURLHosts(urls)
      if (hosts.length) hostsElement.innerHTML = hosts.map(host => `<li><code>${host}</code></li>`).join('')
      else hostsElement.innerHTML = '<li><code>Media is only supported from allowed hosts.</code></li>'
    }

    return element.outerHTML
  }

  // Sets the template for valid URLs
  //
  // @param {String} template - the template HTML
  // @returns {void}
  //
  set validTemplate(template) {
    this._validTemplate = template
  }

  // Returns the template for valid URLs
  //
  // @returns {String} template HTML
  //
  get validTemplate() {
    if (this._validTemplate) return this._validTemplate

    const template = document.createElement('template')
    template.innerHTML = '<div><iframe></iframe><img></img></div>'
    return template
  }

  // Sets the template for invalid URLs
  //
  // @param {String} template - the template HTML
  // @returns {void}
  //
  set invalidTemplate(template) {
    this._invalidTemplate = template
  }

  // Returns the template for invalid URLs
  //
  // @returns {String} template HTML
  //
  get invalidTemplate() {
    if (this._invalidTemplate) return this._invalidTemplate

    const template = document.createElement('template')
    template.innerHTML = `
      <div>
        <h1>Copy / Paste</h1>
        <h3>The pasted content includes media from unsupported hosts / domains.</h3>

        <h2>Prohibited Hosts / Domains</h2>
        <ul data-list="hosts"></ul>

        <h2>Allowed Hosts / Domains</h2>
        <ul data-list="allowed-hosts"></ul>
      </div>
    `
    return template
  }
}
