const protectedForms = {}

function protectionKey(form) {
  return `${form?.method}:${form?.action}`.trim().toLowerCase()
}

function protect(event) {
  const form = event.target.closest('form')
  const key = protectionKey(form)
  if (protectedForms[key] && !protectedForms[key].has(form)) event.preventDefault()
}

document.addEventListener('submit', protectSubmit, true)

export default class Guard {
  constructor(controller) {
    this.editor = controller.element
    this.toolbar = controller.toolbarElement
    this.form = controller.formElement
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

  protect() {
    this.preventAttachments()
    this.preventLinks()
    const key = protectionKey(this.form)
    protectedForms[key] = protectedForms[key] || new Set()
    protectedForms[key].add(this.form)
  }
}
