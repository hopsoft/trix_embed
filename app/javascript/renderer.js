import { createURL, extractURLHosts } from './urls'
import { isImage, getMediaType } from './media'
import { getTemplate } from './templates'

// puts TrixEmbed::Attachment::ALLOWED_TAGS.sort.join(" ")
const ALLOWED_TAGS =
  'a abbr acronym action-text-attachment address b big blockquote br cite code dd del dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i iframe img ins kbd li ol p pre samp small span strong sub sup time tt ul var'.split(
    ' '
  )

// puts TrixEmbed::Attachment::ALLOWED_ATTRIBUTES.sort.join(" ")
const ALLOWED_ATTRIBUTES =
  'abbr allow allowfullscreen allowpaymentrequest alt caption cite content-type credentialless csp datetime filename filesize height href lang loading name presentation previewable referrerpolicy sandbox sgid src srcdoc title url width xml:lang'.split(
    ' '
  )

export default class Renderer {
  // Constructs a new Renderer instance
  //
  // @param {Controller} controller - a Stimulus Controller instance
  constructor(controller) {
    this.controller = controller
    this.initializeTempates()
  }

  sanitize(element) {
    const all = [element].concat(Array.from(element.querySelectorAll('*')))
    all.forEach(el => {
      if (ALLOWED_TAGS.includes(el.tagName.toLowerCase())) {
        ;[...el.attributes].forEach(attr => {
          if (!ALLOWED_ATTRIBUTES.includes(attr.name.toLowerCase())) el.removeAttribute(attr.name)
        })
      } else {
        el.remove()
      }
    })
    return element
  }

  initializeTempates() {
    const templates = ['error', 'exception', 'header', 'iframe', 'image']
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

  // TOOO: add support for audio and video
  // Renders a URL as an HTML embed i.e. an iframe or media tag (img, video, audio etc.)
  //
  // @param {String} url - URL
  // @returns {String} HTML
  //
  renderEmbed(url = 'https://example.com') {
    let embed

    if (isImage(url)) {
      embed = this.imageTemplate.content.firstElementChild.cloneNode(true)
      const img = embed.tagName.match(/img/i) ? embed : embed.querySelector('img')
      img.src = url
    } else {
      embed = this.iframeTemplate.content.firstElementChild.cloneNode(true)
      const iframe = embed.tagName.match(/iframe/i) ? embed : embed.querySelector('iframe')
      iframe.src = url
    }

    return this.sanitize(embed).outerHTML
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
  // @param {String[]} allowedHosts - list of allowed hosts
  // @returns {String} HTML
  //
  renderErrors(urls = ['https://example.com', 'https://test.com'], allowedHosts = []) {
    if (!urls?.length) return

    const element = this.errorTemplate.content.firstElementChild.cloneNode(true)
    const prohibitedHostsElement = element.querySelector('[data-list="prohibited-hosts"]')
    const allowedHostsElement = element.querySelector('[data-list="allowed-hosts"]')

    if (prohibitedHostsElement) {
      const hosts = extractURLHosts(urls).sort()
      if (hosts.length) prohibitedHostsElement.innerHTML = hosts.map(host => `<li>${host}</li>`).join('')
    }

    if (allowedHostsElement && allowedHosts.length)
      allowedHostsElement.innerHTML = allowedHosts.map(host => `<li>${host}</li>`).join('')

    return element.outerHTML
  }

  // Renders an exception
  //
  // @param {String[]} ex - The exception
  // @returns {String} HTML
  //
  renderException(ex) {
    const element = this.exceptionTemplate.content.firstElementChild.cloneNode(true)
    const code = element.querySelector('code')
    code.innerHTML = ex.message
    return element.outerHTML
  }
}
