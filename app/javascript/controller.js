import { generateKey, encryptValues, decryptValues } from './encryption'
import {
  createURLObject,
  createURLTextNodeTreeWalker,
  extractURLs,
  extractURLFromElement,
  validateURL
} from './urls'
import { getMediaType, mediaTags, trixAttachmentTag, trixEmbedMediaTypes } from './media'
import Guard from './guard'
import Store from './store'
import Renderer from './renderer'

export function getTrixEmbedControllerClass(options = { Controller: null, Trix: null }) {
  const { Controller, Trix } = options
  return class extends Controller {
    static values = {
      // templates
      embeddedTemplate: String, // dom id of template to for embedded media info
      errorTemplate: String, // dom id of template to for unexpected errors
      iframeTemplate: String, // dom id of template to use for iframe embeds
      imageTemplate: String, // dom id of template to use for image embeds
      linkTemplate: String, // dom id of template to for allowed links
      prohibitedTemplate: String, // dom id of template to for prohibited urls
      warningTemplate: String, // dom id of template to use when invalid embeds are detected

      // security related values
      hosts: Array, // list of hosts/domains that embeds are allowed from
      paranoid: { type: Boolean, default: true } // guard against attacks
    }

    connect() {
      this.oninitialize = this.initialize.bind(this)
      this.onpaste = this.paste.bind(this)

      this.element.addEventListener('trix-initialize', this.oninitialize, true)
      this.element.addEventListener('trix-paste', this.onpaste, true)
    }

    disconnect() {
      this.element.removeEventListener('trix-initialize', this.oninitialize, true)
      this.element.removeEventListener('trix-paste', this.onpaste, true)

      if (this.paranoid) this.guard?.cleanup()
      this.forgetConfig()
    }

    initialize() {
      setTimeout(() => {
        this.store = new Store(this)
        this.rememberConfig()
        if (this.paranoid) this.guard = new Guard(this)
      })
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

        // all invalid URLs
        const invalidURLs = [...invalidMediaURLs, ...invalidStandardURLs]

        // 1. render warnings ................................................................................
        if (invalidURLs.length) await this.insert(renderer.renderWarnings(invalidURLs, hosts.sort()))

        // 2. render valid media urls (i.e. embeds) ..........................................................
        if (validMediaURLs.length) await this.insert(renderer.renderEmbeds(validMediaURLs))

        // 3. exit early if there is only 1 URL and it's a valid media URL (i.e. a single embed) .............
        if (pastedURLs.length === 1 && validMediaURLs.length === 1) return

        // 4. render the pasted content as  HTML .............................................................
        const sanitizedPastedElement = this.sanitizePastedElement(pastedElement, {
          renderer,
          validMediaURLs,
          validStandardURLs
        })
        const sanitizedPastedContent = sanitizedPastedElement.innerHTML.trim()
        if (sanitizedPastedContent.length)
          await this.insert(sanitizedPastedContent, { disposition: 'inline' })
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

    sanitizePastedElement(element, options = { renderer: null, validMediaURLs: [], validStandardURLs: [] }) {
      const { renderer, validMediaURLs, validStandardURLs } = options

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
              ? renderer.render('link', { url, label: url })
              : renderer.render('prohibited', { url, label: 'Prohibited URL' })
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
          ? renderer.render('link', { url, label })
          : renderer.render('prohibited', { url, label: 'Prohibited link' })
        el.replaceWith(this.createTemplateElement(replacement))
      })

      // sanitize media tags
      element.querySelectorAll(mediaTags.join(', ')).forEach(el => {
        const url = extractURLFromElement(el)
        const label = this.extractLabelFromElement(el, { default: url })

        const replacement = validMediaURLs.includes(url)
          ? renderer.render('embedded', { url, label: 'Allowed Media', description: '(embedded above)' })
          : renderer.render('prohibited', { url, label: 'Prohibited media' })

        el.replaceWith(this.createTemplateElement(replacement))
      })

      // sanitize newlines (best effort)
      element.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g, '<br>')

      return element
    }

    createAttachment(content) {
      return new Trix.Attachment({ content, contentType: trixEmbedMediaTypes.attachment })
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
          this.editor.insertAttachment(this.createAttachment(content))
          this.insertNewlines(1, { delay: delay * 1.15 }).finally(resolve)
        }, delay)
      })
    }

    insertHTML(content, options = { delay: 1 }) {
      const { delay } = options
      return new Promise(resolve => {
        setTimeout(() => {
          this.editor.insertHTML(content)
          this.insertNewlines(1, { delay: delay * 1.15 }).finally(resolve)
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
                ? this.insertHTML(content, { delay })
                    .catch(e => this.renderError(e))
                    .finally(resolve)
                : this.insertAttachment(content, { delay })
                    .catch(e => this.renderError(e))
                    .finally(resolve)
            }

            if (Array.isArray(content)) {
              const promises =
                disposition === 'inline'
                  ? content.map(c => this.insertHTML(c, { delay: (delay *= 1.15) }))
                  : content.map(c => this.insertAttachment(c, { delay: (delay *= 1.15) }))
              return Promise.all(promises)
                .catch(e => this.renderError(e))
                .finally(resolve)
            }

            resolve()
          })
        })
      }

      return Promise.resolve()
    }

    get editor() {
      return this.element.editor
    }

    get toolbarElement() {
      const id = this.element.getAttribute('toolbar')
      let toolbar = id ? document.getElementById(id) : null

      if (!toolbar) {
        const sibling = this.element.previousElementSibling
        toolbar = sibling?.tagName.match(/trix-toolbar/i) ? sibling : null
      }

      return toolbar
    }

    get inputElement() {
      const id = this.element.getAttribute('input')
      return id ? this.formElement?.querySelector(`#${id}`) || document.getElementById(id) : null
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
      this.store?.remove('key')
      this.store?.remove('hosts')
      this.store?.remove('paranoid')
    }
  }
}
