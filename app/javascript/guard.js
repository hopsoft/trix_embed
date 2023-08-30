import { protectForm } from './forms'

export default class Guard {
  constructor(controller) {
    this.controller = controller
  }

  preventAttachments() {
    this.editor?.removeAttribute('data-direct-upload-url')
    this.editor?.removeAttribute('data-blob-url-template')
    this.editor?.addEventListener('trix-file-accept', event => event.preventDefault(), true)
    this.toolbar?.querySelector('[data-trix-button-group="file-tools"]')?.remove()
  }

  async preventLinks() {
    const allowed = await this.controller.allowedLinkHosts
    const blocked = await this.controller.blockedLinkHosts
    if (!blocked.length && allowed.includes('*')) return
    this.toolbar?.querySelector('[data-trix-action="link"]')?.remove()
  }

  protect(attempt = 0) {
    if (!this.toolbar && attempt < 100) return setTimeout(() => this.protect(attempt + 1), 25)

    this.preventAttachments()
    this.preventLinks()

    if (this.form) protectForm(this.form, this.input)
  }

  get editor() {
    return this.controller.element
  }

  get toolbar() {
    return this.controller.toolbarElement
  }

  get form() {
    return this.controller.formElement
  }

  get input() {
    return this.controller.inputElement
  }
}
