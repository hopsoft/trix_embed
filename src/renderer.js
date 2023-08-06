import { createURL, extractURLHosts } from './urls'
import { getMediaType } from './media'

export default class Renderer {
  // Constructs a new Renderer instance
  //
  // @param {Controller} controller - a Stimulus Controller instance
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

  renderHeader(value, content = '') {
    if (!content?.length) return
    return `
    <h1 style="background-color:ivory; border:solid 1px red; color:red; padding:5px; display:flex; align-items:center; font-size:1.25rem; line-height:1.5rem;">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="flex:1; width:1rem; height:1rem;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
      ${value}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="flex:1; width:1rem; height:1rem;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    </h1>
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
      .reduce((list, url) => {
        createURL(url, u => list.push(u))
        return list
      }, urls || [])
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
      <div style="background-color:ivory; border:solid 1px red; color:red; padding:15px; font-size:1rem; line-height:1.5rem;">
        <h1 class="display:flex; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1rem; height:1rem; transform: scale(1.5);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span style="margin-left:5px; margin-right:5px;">Copy / Paste</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1rem; height:1rem; transform: scale(1.5);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </h1>
        <h3 style="font-weight:normal;">The pasted content includes media from unsupported hosts / domains.</h3>

        <h2>Prohibited Hosts / Domains</h2>
        <ul data-list="hosts"></ul>

        <h2 style="color:green;">Allowed Hosts / Domains</h2>
        <ul data-list="allowed-hosts" style="color:green;"></ul>
      </div>
    `
    return template
  }
}
