import { trixEditorTagName } from './media'
import { createURLObject } from './urls'

let patched
let observer
const protectedForms = new Set()
const trixEmbedSelector = `${trixEditorTagName}[data-controller~="trix-embed"]`

const events = {
  add: 'trix-embed:form:add',
  create: 'trix-embed:form:create'
}

function makeKey(form) {
  let { method, action } = form || {}
  action = createURLObject(action)?.pathname || action
  return `${method}:${action}`.trim().toLowerCase()
}

function protect(form, input) {
  if (!form) return
  const key = makeKey(form)
  protectedForms.add({ key, form, input })
}

function shouldSubmit(form) {
  const key = makeKey(form)
  const list = [...protectedForms].filter(f => f.key === key)

  // form is not protected
  if (!list.length) return true

  // form contains a trix-embed and it's currently pasting
  if (form.trixEmbedPasting) return false

  // form contains a trix-embed and it's not currently pasting
  if (form.querySelector(trixEmbedSelector)) return true

  // form is protected but does not contain a trix-embed
  // prevent submit if any of the following conditions are true
  //
  // - the form data includes a protected key
  // - the form action includes a protected querystring key
  //
  const data = new FormData(form)
  const params = createURLObject(form.action)?.searchParams || new URLSearchParams()
  const inputs = list.map(item => item.input)
  const checks = inputs.map(input => {
    if (input.name) {
      if (data.has(input.name)) return false
      if (params.has(input.name)) return false
    }

    if (input.id) {
      if (data.has(input.id)) return false
      if (params.has(input.id)) return false
    }

    return true
  })
  if (checks.includes(false)) return false
  return true
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
