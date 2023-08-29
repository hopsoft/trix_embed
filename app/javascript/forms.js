import { trixEditorTag } from './media'

let patched
let observer
const protectedForms = {}

const events = {
  add: 'trix-embed:form:add',
  create: 'trix-embed:form:create'
}

function makeKey(form) {
  return `${form?.method}:${form?.action}`.trim().toLowerCase()
}

function protect(form) {
  if (!form) return

  const editor = form.closest(trixEditorTag)
  const input = editor ? form.querySelector(`#${editor.getAttribute('input')}`) : {}
  form.protectedInput = { id: input.id, name: input.name }

  const key = makeKey(form)
  protectedForms[key] = protectedForms[key] || new Set()
  protectedForms[key].add(form)
}

function shouldSubmit(form) {
  const key = makeKey(form)
  const protectedForms = [...protectedForms[key]]
  const match = protectedForms.find(f => f === form)

  if (!protectedForms.length) return true
  if (match?.pasting) return false
  if (match) return true

  protectedForms
    .map(form => form.protectedInput)
    .forEach(input => {
      if (input) {
        if (input.name && form.querySlector(`[name="${input.name}"]`)) return false
        if (input.id && form.querySlector(`#${input.id}`)) return false
      }
      return true
    })
}

function submit(event) {
  if (shouldSubmit(event.target)) return
  event.preventDefault()
}

function monitor(form) {
  form.removeEventListener('submit', submit, true)
  form.addEventListener('submit', submit, true)
}

function dispatch(name, form) {
  document.dispatchEvent(
    new CustomEvent(name, {
      bubbles: false,
      cancelable: false,
      detail: { form }
    })
  )
}

function patch() {
  if (patched) return
  patched = true

  const orig = Document.prototype.createElement
  Object.defineProperty(Document.prototype, 'createElement', {
    value: function () {
      const element = orig.apply(this, arguments)

      try {
        const tagName = String(arguments[0]).toUpperCase()
        if (tagName === 'FORM') dispatch(events.form.create, element)
      } catch (error) {
        console.error(`Error during ${events.formCreate}`, error)
      }

      return element
    },
    configurable: false
  })
}

function observe() {
  if (observer) return

  observer = new MutationObserver(mutations =>
    mutations.forEach(mutation =>
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLFormElement) dispatch(events.form.add, element)
      })
    )
  )

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

patch()
observe()

// monitor all forms
document.addEventListener(events.add, event => monitor(event.target), true)
document.addEventListener(events.create, event => monitor(event.target), true)
document.querySelectorAll('form').forEach(form => monitor(form))

// TODO: protect XHR POST requests
// document.addEventListener('readystatechange', event => {
//   const xhr = event.target
//   if (xhr instanceof XMLHttpRequest && xhr.readyState === 1) {
//     // if !shouldSubmit
//     // xhr.send = xhr.abort
//   }
// })

// TODO: protect fetch POST requests
// window.addEventListener('fetch', event => {
//   // if !shouldSubmit
//   // event.preventDefault()
// })

export { protect as protectForm }
