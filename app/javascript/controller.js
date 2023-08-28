import { sample, shuffle } from './enumerable'
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
      embeddedTemplate: String, // dom id of template to use for EMBEDDED MEDIA info
      errorTemplate: String, // dom id of template to use for UNEXPECTED ERRORS
      iframeTemplate: String, // dom id of template to use for IFRAME EMBEDS
      imageTemplate: String, // dom id of template to use for IMAGE EMBEDS
      linkTemplate: String, // dom id of template to use for ALLOWED LINKS
      prohibitedTemplate: String, // dom id of template to use for PROHIBITED URLS
      warningTemplate: String, // dom id of template to use when invalid embeds are detected

      // security related values
      allowedLinkHosts: Array, // list of hosts/domains that links are allowed from
      blockedLinkHosts: Array, // list of hosts/domains that links are NOT allowed from
      allowedMediaHosts: Array, // list of hosts/domains that media is allowed from
      blockedMediaHosts: Array, // list of hosts/domains that media is NOT allowed from
      paranoid: { type: Boolean, default: true } // guard against attacks
    }

    connect() {
      this.onpaste = this.paste.bind(this)
      this.element.addEventListener('trix-paste', this.onpaste, true)

      this.rememberConfig()

      this.store = new Store(this)
      this.guard = new Guard(this)
      if (this.paranoid) this.guard.protect()
    }

    disconnect() {
      this.element.removeEventListener('trix-paste', this.onpaste, true)
      this.forgetConfig()
    }

    async paste(event) {
      if (this.formElement) this.formElement.pasting = true

      try {
        const { html, string, range } = event.paste
        let content = html || string || ''
        const pastedElement = this.createTemplateElement(content)
        const pastedURLs = extractURLs(pastedElement)

        // no URLs were pasted, let Trix handle it .............................................................
        if (!pastedURLs.length) return

        event.preventDefault()
        this.editor.setSelectedRange(range)

        try {
          const renderer = new Renderer(this)

          // Media URLs (images, videos, audio etc.)
          const allowedMediaHosts = await this.allowedMediaHosts
          const blockedMediaHosts = await this.blockedMediaHosts
          let mediaURLs = new Set(pastedURLs.filter(url => getMediaType(url)))
          const iframes = [...pastedElement.querySelectorAll('iframe')]
          iframes.forEach(frame => mediaURLs.add(frame.src))
          mediaURLs = [...mediaURLs]
          const validMediaURLs = mediaURLs.filter(url =>
            validateURL(url, allowedMediaHosts, blockedMediaHosts)
          )
          const invalidMediaURLs = mediaURLs.filter(url => !validMediaURLs.includes(url))

          // Link URLs (non-media resources i.e. web pages etc.)
          const allowedLinkHosts = await this.allowedLinkHosts
          const blockedLinkHosts = await this.blockedLinkHosts
          const linkURLs = pastedURLs.filter(url => !mediaURLs.includes(url))
          const validLinkURLs = linkURLs.filter(url => validateURL(url, allowedLinkHosts, blockedLinkHosts))
          const invalidLinkURLs = linkURLs.filter(url => !validLinkURLs.includes(url))

          // 1. render warnings ................................................................................
          if (invalidMediaURLs.length || invalidLinkURLs.length) {
            const invalidURLs = [...new Set([...invalidMediaURLs, ...invalidLinkURLs])]
            const allowedHosts = [...new Set([...allowedMediaHosts, ...allowedLinkHosts])].filter(
              host => !this.reservedDomains.includes(host)
            )
            const blockedHosts = [...new Set([...blockedMediaHosts, ...blockedLinkHosts])].filter(
              host => !this.reservedDomains.includes(host)
            )
            await this.insert(renderer.renderWarnings(invalidURLs, allowedHosts, blockedHosts))
          }

          // 2. render valid media urls (i.e. embeds) ..........................................................
          if (validMediaURLs.length) await this.insert(renderer.renderEmbeds(validMediaURLs))

          // 3. exit early if there is only 1 URL and it's a valid media URL (i.e. a single embed) .............
          if (pastedURLs.length === 1 && validMediaURLs.length === 1) return

          // 4. render the pasted content as  HTML .............................................................
          const sanitizedPastedElement = this.sanitizePastedElement(pastedElement, {
            renderer,
            validMediaURLs,
            validLinkURLs
          })
          const sanitizedPastedContent = sanitizedPastedElement.innerHTML.trim()
          if (sanitizedPastedContent.length)
            await this.insert(sanitizedPastedContent, { disposition: 'inline' })
        } catch (e) {
          this.insert(renderer.renderError(e))
        }
      } finally {
        if (this.formElement) delete this.formElement.pasting
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

    sanitizePastedElement(element, options = { renderer: null, validMediaURLs: [], validLinkURLs: [] }) {
      const { renderer, validMediaURLs, validLinkURLs } = options

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
            validLinkURLs.includes(url) || validLinkURLs.includes(url)
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
        const replacement = validLinkURLs.includes(url)
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
          this.insertNewlines(1, { delay: delay }).finally(resolve)
        }, delay)
      })
    }

    insertHTML(content, options = { delay: 1 }) {
      const { delay } = options
      return new Promise(resolve => {
        setTimeout(() => {
          this.editor.insertHTML(content)
          this.insertNewlines(1, { delay }).finally(resolve)
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
                  ? content.map(c => this.insertHTML(c, { delay: delay + 1 }))
                  : content.map(c => this.insertAttachment(c, { delay: delay + 1 }))
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

    get formElement() {
      return this.element.closest('form')
    }

    get inputElement() {
      const id = this.element.getAttribute('input')
      return id ? this.formElement?.querySelector(`#${id}`) : null
    }

    get paranoid() {
      return !!this.store.read('paranoid')
    }

    get key() {
      try {
        return JSON.parse(this.store.read('key'))[2]
      } catch {}
    }

    get hostsValueDescriptors() {
      return Object.values(this.valueDescriptorMap).filter(descriptor =>
        descriptor.name.endsWith('HostsValue')
      )
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
      const controller = this
      let fakes

      // encryption key
      const key = await generateKey()
      fakes = await encryptValues(key, sample(this.reservedDomains, 3))
      this.store.write('key', JSON.stringify([fakes[0], fakes[1], key, fakes[2]]))

      // paranoid
      if (this.paranoidValue !== false) {
        fakes = await encryptValues(key, sample(this.reservedDomains, 4))
        this.store.write('paranoid', JSON.stringify(fakes))
      }
      this.element.removeAttribute('data-trix-embed-paranoid-value')

      // host lists
      this.hostsValueDescriptors.forEach(async descriptor => {
        const { name } = descriptor
        const property = name.slice(0, name.lastIndexOf('Value'))

        let value = this[name]

        // ensure minimum length to help with security-through-obscurity
        if (value.length < 4) value = value.concat(sample(this.reservedDomains, 4 - value.length))

        // store the property value
        this.store.write(property, JSON.stringify(await encryptValues(key, value)))

        // create property getter
        Object.assign(this, {
          get [property]() {
            try {
              return decryptValues(controller.key, JSON.parse(controller.store.read(property)))
            } catch {
              return []
            }
          }
        })

        // cleanup the dom
        this.element.removeAttribute(`data-trix-embed-${descriptor.key}`)
      })

      // more security-through-obscurity
      fakes = await encryptValues(key, sample(this.reservedDomains, 4))
      this.store.write('securityHosts', fakes)
      fakes = await encryptValues(key, sample(this.reservedDomains, 4))
      this.store.write('obscurityHosts', fakes)
    }

    forgetConfig() {
      this.store?.remove('key')
      this.store?.remove('paranoid')

      this.hostsValueDescriptors.forEach(async descriptor => {
        const { name } = descriptor
        const property = name.slice(0, name.lastIndexOf('Value'))
        this.store?.remove('securityHosts')
      })

      this.store?.remove('securityHosts')
      this.store?.remove('obscurityHosts')
    }
  }
}
