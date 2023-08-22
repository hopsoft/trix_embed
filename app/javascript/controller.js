import { generateKey, encryptValues, decryptValues } from './encryption'
import {
  createURLObject,
  createURLTextNodeTreeWalker,
  extractURLs,
  extractURLFromElement,
  validateURL
} from './urls'
import { getMediaType, mediaTags, trixAttachmentTag } from './media'
import Guard from './guard'
import Store from './store'
import Renderer from './renderer'

const defaultOptions = {
  Controller: null,
  Trix: null
}

export function getTrixEmbedControllerClass(options = defaultOptions) {
  const { Controller, Trix } = options
  return class extends Controller {
    static values = {
      // templates
      warningTemplate: String, // dom id of template to use when invalid embeds are detected
      iframeTemplate: String, // dom id of template to use for iframe embeds
      imageTemplate: String, // dom id of template to use for image embeds

      // security related values
      hosts: Array, // list of hosts/domains that embeds are allowed from
      paranoid: { type: Boolean, default: true } // guard against attacks
    }

    async connect() {
      this.guard = new Guard(this)
      if (this.paranoidValue) this.guard.protect()

      this.store = new Store(this)
      await this.rememberConfig()

      this.onpaste = this.paste.bind(this)
      this.element.addEventListener('trix-paste', this.onpaste, true)

      window.addEventListener('beforeunload', () => this.disconnect())
    }

    disconnect() {
      this.element.removeEventListener('trix-paste', this.onpaste, true)
      if (this.paranoid) this.guard.cleanup()
      this.forgetConfig()
    }

    async paste(event) {
      const { html, string, range } = event.paste
      let content = html || string || ''
      const pastedElement = this.createTemplateElement(content)
      const pastedURLs = extractURLs(pastedElement)

      // no URLs were pasted, let Trix handle it .............................................................
      if (!pastedURLs.length) return

      event.preventDefault()
      this.editor.setSelectedRange(range)
      const hosts = await this.hosts
      const renderer = new Renderer(this)

      try {
        // Media URLs (images, videos, audio etc.)
        let mediaURLs = new Set(pastedURLs.filter(url => getMediaType(url)))
        const iframes = [...pastedElement.querySelectorAll('iframe')]
        iframes.forEach(frame => mediaURLs.add(frame.src))
        mediaURLs = [...mediaURLs]
        const validMediaURLs = mediaURLs.filter(url => validateURL(url, hosts))
        const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))

        // Standard URLs (non-media resources i.e. web pages etc.)
        const standardURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
        const validStandardURLs = standardURLs.filter(url => validateURL(url, hosts))
        const invalidStandardURLs = standardURLs.filter(url => !validStandardURLs.includes(url))

        let urls

        // 1. render errors (i.e. invalid urls) ..............................................................
        urls = invalidMediaURLs
        if (urls.length) await this.insert(renderer.renderWarnings(urls, hosts.sort()))

        // 2. render valid media urls (i.e. embeds) ..........................................................
        urls = validMediaURLs
        if (urls.length) {
          await this.insert(renderer.renderEmbeds(urls))
        }

        // 3. exit early if there is only 1 URL and it's a valid media URL (i.e. a single embed) .............
        if (pastedURLs.length === 1 && validMediaURLs.length === 1) return

        // 4. render the pasted content as sanitized HTML ....................................................
        const sanitizedPastedElement = this.sanitizePastedElement(pastedElement, {
          validMediaURLs,
          validStandardURLs
        })
        const sanitizedPastedContent = sanitizedPastedElement.innerHTML.trim()
        if (sanitizedPastedContent.length) {
          await this.insert(sanitizedPastedContent, { disposition: 'inline' })
        }
      } catch (e) {
        this.insert(renderer.renderError(e))
      }
    }

    createTemplateElement(content) {
      const template = document.createElement('template')
      template.innerHTML = `<div>${content.trim()}</div>`
      return template.content.firstElementChild
    }

    extractLabelFromElement(el, options = { default: null }) {
      let value = el.title
      if (value && value.length) return value

      value = el.textContent.trim()
      if (value && value.length) return value

      return options.default
    }

    sanitizePastedElement(element, options = { validMediaURLs: [], validStandardURLs: [] }) {
      const { validMediaURLs, validStandardURLs } = options
      element = element.cloneNode(true)

      // sanitize text nodes
      const walker = createURLTextNodeTreeWalker(element)
      const textNodes = []
      let textNode
      while ((textNode = walker.nextNode())) {
        textNode.replacements = textNode.replacements || new Set()
        textNodes.push(textNode)

        const words = textNode.nodeValue.split(/\s+/)
        const matches = words.filter(word => word.startsWith('http'))

        matches.forEach(match => {
          const url = createURLObject(match)?.href
          const replacement =
            validStandardURLs.includes(url) || validStandardURLs.includes(url)
              ? `<a href="${url}">${url}</a>`
              : `<del><strong>PROHIBITED LINK:</strong> <span>${url}<span></del>`
          textNode.replacements.add({ match, replacement })
        })
      }
      textNodes.forEach(node => {
        if (!node.replacements.size) return
        let content = node.nodeValue
        // sort by length to replace the most specific matches first
        const replacements = [...node.replacements].sort((a, b) => b.match.length - a.match.length)
        replacements.forEach(entry => (content = content.replaceAll(entry.match, entry.replacement)))
        node.replaceWith(this.createTemplateElement(content))
      })

      // sanitize anchor tags
      element.querySelectorAll('a').forEach(el => {
        const url = extractURLFromElement(el)
        const label = this.extractLabelFromElement(el, { default: url })
        const replacement = validStandardURLs.includes(url)
          ? `<a href="${url}">${label}</a>`
          : `<del><strong>PROHIBITED LINK:</strong> <span>${label}</span></del>`
        el.replaceWith(this.createTemplateElement(replacement))
      })

      // sanitize media tags
      element.querySelectorAll(mediaTags.join(', ')).forEach(el => {
        const url = extractURLFromElement(el)
        const label = this.extractLabelFromElement(el, { default: url })

        const replacement = validMediaURLs.includes(url)
          ? `<del><strong>ALLOWED MEDIA (embedded above):</strong> ${label}</del>`
          : `<del><strong>PROHIBITED MEDIA:</strong> ${label}</del>`

        el.replaceWith(this.createTemplateElement(replacement))
      })

      // sanitize newlines (best effort)
      element.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g, '<br>')

      return element
    }

    insertNewlines(count = 1, options = { delay: 1 }) {
      const { delay } = options
      return new Promise(resolve => {
        setTimeout(() => {
          for (let i = 0; i < count; i++) this.editor.insertLineBreak()
          resolve()
        }, delay)
      })
    }

    insertAttachment(content, options = { delay: 1 }) {
      const { delay } = options
      return new Promise(resolve => {
        setTimeout(() => {
          const attachment = new Trix.Attachment({ content, contentType: this.attachmentContentType })
          this.editor.insertAttachment(attachment)
          this.insertNewlines(2).then(resolve)
        }, delay)
      })
    }

    insertHTML(content, options = { delay: 1 }) {
      const { delay } = options
      return new Promise(resolve => {
        setTimeout(() => {
          this.editor.insertHTML(content)
          this.insertNewlines().then(resolve)
        }, delay)
      })
    }

    insert(content, options = { delay: 1, disposition: 'attachment' }) {
      let { delay, disposition } = options

      if (content?.length) {
        return new Promise(resolve => {
          setTimeout(() => {
            if (typeof content === 'string') {
              return disposition === 'inline'
                ? this.insertHTML(content, { delay }).then(resolve)
                : this.insertAttachment(content, { delay }).then(resolve)
            }

            if (Array.isArray(content)) {
              return Promise.all(
                disposition === 'inline'
                  ? content.map(c => this.insertHTML(c, { delay: (delay *= 5) }))
                  : content.map(c => this.insertAttachment(c, { delay: (delay *= 5) }))
              ).then(resolve)
            }

            resolve()
          })
        })
      }

      return Promise.resolve()
    }

    // Maches the server side `trix_embed_attachment` mime type
    get attachmentContentType() {
      return 'trix-embed/attachment'
    }

    get editor() {
      return this.element.editor
    }

    get toolbarElement() {
      const sibling = this.element.previousElementSibling
      return sibling?.tagName.match(/trix-toolbar/i) ? sibling : null
    }

    get inputElement() {
      return (
        this.formElement?.querySelector(`#${this.element.getAttribute('input')}`) ||
        document.getElementById(this.element.getAttribute('input'))
      )
    }

    get formElement() {
      return this.element.closest('form')
    }

    get paranoid() {
      return !!this.store.read('paranoid')
    }

    get key() {
      try {
        return JSON.parse(this.store.read('key'))[2]
      } catch {}
    }

    get hosts() {
      try {
        return decryptValues(this.key, JSON.parse(this.store.read('hosts')))
      } catch {
        return []
      }
    }

    get reservedDomains() {
      return [
        'embed.example',
        'embed.invalid',
        'embed.local',
        'embed.localhost',
        'embed.test',
        'trix.embed.example',
        'trix.embed.invalid',
        'trix.embed.local',
        'trix.embed.localhost',
        'trix.embed.test',
        'trix.example',
        'trix.invalid',
        'trix.local',
        'trix.localhost',
        'trix.test',
        'www.embed.example',
        'www.embed.invalid',
        'www.embed.local',
        'www.embed.localhost',
        'www.embed.test',
        'www.trix.example',
        'www.trix.invalid',
        'www.trix.local',
        'www.trix.localhost',
        'www.trix.test'
      ]
    }

    async rememberConfig() {
      const key = await generateKey()

      let fakes = new Set()
      while (fakes.size < 3)
        fakes.add(this.reservedDomains[Math.floor(Math.random() * this.reservedDomains.length)])
      fakes = await encryptValues(key, [...fakes])

      const hosts = await encryptValues(key, this.hostsValue)

      this.store.write('key', JSON.stringify([fakes[0], fakes[1], key, fakes[2]]))
      this.element.removeAttribute('data-trix-embed-key-value')

      this.store.write('hosts', JSON.stringify(hosts))
      this.element.removeAttribute('data-trix-embed-hosts-value')

      if (this.paranoidValue !== false) {
        this.store.write('paranoid', JSON.stringify(fakes.slice(3)))
        this.element.removeAttribute('data-trix-embed-paranoid')
      }
    }

    forgetConfig() {
      this.store.remove('key')
      this.store.remove('hosts')
      this.store.remove('paranoid')
    }
  }
}
