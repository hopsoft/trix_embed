import { createURLObject, extractURLHosts } from './urls'
import { isImage, getMediaType, trixAttachmentTag } from './media'
import templates from './templates'

// TrixEmbed::Attachment::ALLOWED_TAGS
const ALLOWED_TAGS = [
  trixAttachmentTag,
  'a',
  'abbr',
  'acronym',
  'address',
  'b',
  'big',
  'blockquote',
  'br',
  'cite',
  'code',
  'dd',
  'del',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'iframe',
  'img',
  'ins',
  'kbd',
  'li',
  'ol',
  'p',
  'pre',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'tt',
  'ul',
  'var'
]

// TrixEmbed::Attachment::ALLOWED_ATTRIBUTES
const ALLOWED_ATTRIBUTES = [
  'abbr',
  'allow',
  'allowfullscreen',
  'allowpaymentrequest',
  'alt',
  'caption',
  'cite',
  'content-type',
  'credentialless',
  'csp',
  'data-trix-embed',
  'data-trix-embed-error',
  'data-trix-embed-warning',
  'datetime',
  'filename',
  'filesize',
  'height',
  'href',
  'lang',
  'loading',
  'name',
  'presentation',
  'previewable',
  'referrerpolicy',
  'sandbox',
  'sgid',
  'src',
  'srcdoc',
  'title',
  'url',
  'width',
  'xml:lang'
]

export default class Renderer {
  // Constructs a new Renderer instance
  //
  // @param {Controller} controller - a Stimulus Controller instance
  constructor(controller) {
    this.controller = controller
    this.initializeTempates()
  }

  sanitize(html) {
    const template = document.createElement('template')
    template.innerHTML = `<div>${html}</div>`
    const element = template.content.firstElementChild
    const all = [element].concat([...element.querySelectorAll('*')])
    all.forEach(el => {
      if (ALLOWED_TAGS.includes(el.tagName.toLowerCase())) {
        ;[...el.attributes].forEach(attr => {
          if (!ALLOWED_ATTRIBUTES.includes(attr.name.toLowerCase())) el.removeAttribute(attr.name)
        })
      } else {
        el.remove()
      }
    })
    return element.innerHTML
  }

  initializeTempates() {
    const templates = ['error', 'iframe', 'image', 'warning']
    templates.forEach(name => this.initializeTemplate(name))
  }

  initializeTemplate(name) {
    const property = `${name}Template`
    let template

    // attempt to find custom template
    const key = `${property}Value`
    const id = this.controller[key]
    if (id) template = document.getElementById(id)?.innerHTML
    this.controller[key] = null

    template = template || templates[name]
    this[property] = template.trim()
  }

  render(template, params = {}) {
    return template.replace(/{{(.*?)}}/g, (_, key) => key.split('.').reduce((obj, k) => obj[k], params))
  }

  // TOOO: add support for audio and video
  // Renders a URL as an HTML embed i.e. an iframe or media tag (img, video, audio etc.)
  //
  // @param {String} url - URL
  // @returns {String} HTML
  //
  renderEmbed(url = 'https://example.com') {
    const html = isImage(url)
      ? this.render(this.imageTemplate, { src: url })
      : this.render(this.iframeTemplate, { src: url })
    return this.sanitize(html)
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
  renderWarnings(urls = ['https://example.com', 'https://test.com'], allowedHosts = []) {
    if (!urls?.length) return

    const hosts = extractURLHosts(urls).sort()

    return this.render(this.warningTemplate, {
      header: 'Copy/Paste Warning',
      subheader: 'The pasted content includes media from unsupported hosts.',
      prohibited: {
        header: 'Prohibited Hosts',
        hosts: hosts.length
          ? hosts.map(host => `<li>${host}</li>`).join('')
          : '<li>Media is only supported from allowed hosts.</li>'
      },
      allowed: {
        header: 'Allowed Hosts',
        hosts: allowedHosts.length
          ? allowedHosts.map(host => `<li>${host}</li>`).join('')
          : '<li>Allowed hosts not configured.</li>'
      }
    })
  }

  // Renders a JavaScript error
  //
  // @param {Error} error - The error or exception
  // @returns {String} HTML
  //
  renderError(error) {
    return this.render(this.errorTemplate, {
      header: 'Unhandled Exception!',
      subheader: 'Report this problem to a software engineer.',
      error: error
    })
  }
}
