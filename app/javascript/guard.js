const protectors = {}

export default class Guard {
  constructor(controller) {
    this.editor = controller.element
    this.toolbar = controller.toolbarElement
    this.form = controller.formElement
    this.input = controller.inputElement
    this.key = this.form ? `${this.form.method}${this.form.action}` : null
    this.protect()
  }

  preventAttachments() {
    this.editor.removeAttribute('data-direct-upload-url')
    this.editor.removeAttribute('data-blob-url-template')
    this.editor.addEventListener('trix-file-accept', event => event.preventDefault())
    this.toolbar?.querySelector('[data-trix-button-group="file-tools"]')?.remove()
  }

  preventLinks() {
    this.toolbar?.querySelector('[data-trix-action="link"]')?.remove()
  }

  shouldProtectSubmit(form) {
    if (!form || !this.form) return false
    const input = this.input?.name ? form.querySelector(`[name="${this.input.name}"]`) : null
    return form.action === this.form.action && form.method === this.form.method && input
  }

  protectSubmit = event => {
    const form = event.target.closest('form')
    if (this.shouldProtectSubmit(form) && !form.trixEmbed?.guard) event.preventDefault()
  }

  protect() {
    this.preventAttachments()
    this.preventLinks()

    if (!this.key) return

    this.cleanup()
    this.form.trixEmbed = { guard: this }
    protectors[this.key] = this.protectSubmit.bind(this)
    document.addEventListener('submit', protectors[this.key], true)
  }

  cleanup() {
    if (this.key) document.removeEventListener('submit', protectors[this.key], true)
    if (this.form) delete this.form.trixEmbed
  }
}
