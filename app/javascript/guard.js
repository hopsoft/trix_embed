import { trixEditorTag } from './media'

const protectedForms = {}

function protectionKey(form) {
  return `${form?.method}:${form?.action}`.trim().toLowerCase()
}

function protect(event) {
  const submittingForm = event.target.closest('form')
  const key = protectionKey(submittingForm)
  const protectedForms = [...protectedForms[key]]

  if (!protectedForms.length) return

  const form = protectedForms.find(f => f === submittingForm)
  if (form?.pasting) event.preventDefault()
  if (form) return

  const protectedInputs = protectedForms.reduce((memo, form) => {
    const editor = form.closest(trixEditorTag)
    const input = form.querySelector(`#${editor.getAttribute('input')}`)
    if (input) memo.push(input)
    return memo
  }, [])

  protectedInputs.forEach(protectedInput => {
    const submittingInput =
      submittingForm.querySlector(`[name="${protectedInput.name}"]`) ||
      submittingForm.querySlector(`#${protectedInput.id}`)
    if (submittingInput) return event.preventDefault()
  })
}

document.addEventListener('submit', protect, true)

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

  preventLinks() {
    this.toolbar?.querySelector('[data-trix-action="link"]')?.remove()
  }

  protect(attempt = 0) {
    if (!this.toolbar && attempt < 10) return setTimeout(() => this.protect(attempt + 1), 25)

    this.preventAttachments()
    this.preventLinks()
    if (!this.form) return
    const key = protectionKey(this.form)
    protectedForms[key] = protectedForms[key] || new Set()
    protectedForms[key].add(this.form)
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
}
