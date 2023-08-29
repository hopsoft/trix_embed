import { createURLObject, extractURLHosts } from './urls'
import { isImage, getMediaType, trixAttachmentTagName, trixEmbedMediaTypes } from './media'
import templates from './templates'

// Matches server side configuration
// SEE: TrixEmbed::Attachment::ALLOWED_TAGS (app/models/trix_embed/attachment.rb)
const ALLOWED_TAGS = [
  trixAttachmentTagName,
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

// Matches server side configuration
// SEE: TrixEmbed::Attachment::ALLOWED_ATTRIBUTES (app/models/trix_embed/attachment.rb)
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
  'data-trix-embed-prohibited',
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
    this.templates = templates
    Object.keys(templates).forEach(name => this.initializeTemplate(name))
  }

  initializeTemplate(name) {
    const property = `${name}TemplateValue`
    const id = this.controller[property]
    const template = id ? document.getElementById(id)?.innerHTML?.trim() : null
    this.controller[property] = null
    if (template) this.templates[name] = template
    return this.templates[name]
  }

  render(templateName, params = {}) {
    const template = this.templates[templateName]
    return template.replace(/{{(.*?)}}/g, (_, key) => key.split('.').reduce((obj, k) => obj[k], params))
  }

  // TOOO: add support for audio and video
  // Renders a URL as an HTML embed i.e. an iframe or media tag (img, video, audio etc.)
  //
  // @param {String} url - URL
  // @returns {String} HTML
  //
  renderEmbed(url = 'https://example.com') {
    const html = isImage(url) ? this.render('image', { src: url }) : this.render('iframe', { src: url })
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
  renderWarnings(urls = ['https://example.com', 'https://test.com'], allowedHosts = [], blockedHosts = []) {
    if (!urls?.length) return

    allowedHosts = [...allowedHosts].sort()
    if (allowedHosts.includes('*')) allowedHosts.splice(allowedHosts.indexOf('*'), 1)

    blockedHosts = [...blockedHosts]
    if (blockedHosts.includes('*')) blockedHosts.splice(blockedHosts.indexOf('*'), 1)

    const hosts = [...new Set([...blockedHosts, ...extractURLHosts(urls)])].sort()

    return this.render('warning', {
      header: 'Copy/Paste Warning',
      subheader: 'Content includes URLs or media from prohibited hosts or restricted protocols.',
      prohibited: {
        header: 'Prohibited Hosts',
        hosts: hosts.length
          ? hosts.map(host => `<li>${host}</li>`).join('')
          : '<li>URLs and media are restricted to allowed hosts and standard protocols.</li>'
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
    return this.render('error', {
      header: 'Unhandled Exception!',
      subheader: 'Report this problem to a software engineer.',
      error: error
    })
  }
}
