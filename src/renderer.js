import { createURL, extractURLHosts } from './urls'
import { isImage, getMediaType } from './media'
import { getTemplate } from './templates'

export default class Renderer {
  // Constructs a new Renderer instance
  //
  // @param {Controller} controller - a Stimulus Controller instance
  constructor(controller) {
    this.controller = controller
    this.hosts = this.controller.hostsValue
    this.initializeTempates()
  }

  initializeTempates() {
    const templates = ['error', 'header', 'iframe', 'image']
    templates.forEach(name => this.initializeTemplate(name))
  }

  initializeTemplate(name) {
    let template

    if (this.controller[`has${name.charAt(0).toUpperCase() + name.slice(1)}TemplateValue`])
      template = document.getElementById(this.controller[`${name}TemplateValue`])

    this[`${name}Template`] = template || getTemplate(name)
  }

  // Renders an embed header
  //
  // @param {String} html - HTML
  // @returns {String} HTML
  //
  renderHeader(html) {
    const header = this.headerTemplate.content.firstElementChild.cloneNode(true)
    const h1 = header.tagName.match(/h1/i) ? header : header.querySelector('h1')
    h1.innerHTML = html
    return header.outerHTML
  }

  // TODO: Add templates for links
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

  // Renders a URL as an HTML embed i.e. an iframe or media tag (img, video, audio etc.)
  //
  // @param {String} url - URL
  // @returns {String} HTML
  //
  renderEmbed(url = 'https://example.com') {
    let embed

    // TOOO: add support for audio and video
    if (isImage(url)) {
      embed = this.imageTemplate.content.firstElementChild.cloneNode(true)
      const img = embed.tagName.match(/img/i) ? embed : embed.querySelector('img')
      img.src = url
    } else {
      embed = this.iframeTemplate.content.firstElementChild.cloneNode(true)
      const iframe = embed.tagName.match(/iframe/i) ? embed : embed.querySelector('iframe')
      iframe.src = url
    }

    return embed.outerHTML
  }

  // Renders a list of URLs as HTML embeds i.e. iframes or media tags (img, video, audio etc.)
  //
  // @param {String[]} urls - list of URLs
  // @returns {String[]} list of individual HTML embeds
  //
  renderEmbeds(urls = ['https://example.com', 'https://test.com']) {
    if (!urls?.length) return
    return urls.map(url => this.renderEmbed(url))
  }

  // Renders embed errors
  //
  // @param {String[]} urls - list of URLs
  // @returns {String} HTML
  //
  renderErrors(urls = ['https://example.com', 'https://test.com']) {
    if (!urls?.length) return
    const element = this.errorTemplate.content.firstElementChild.cloneNode(true)
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
}
