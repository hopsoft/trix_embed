const submitGuards = {}

export default class Guard {
  constructor(controller) {
    this.controller = controller
    controller.element.addEventListener('trix-file-accept', event => event.preventDefault())
  }

  protectSubmit = event => {
    const form = this.controller.formElement
    const f = event.target.closest('form')
    if (f && f.action === form.action && f.method === form.method && f !== form) event.preventDefault()
  }

  protect() {
    if (!this.controller.formElement) return
    const form = this.controller.formElement
    const input = this.controller.inputElement
    const key = `${form.method}${form.action}`

    document.removeEventListener('submit', submitGuards[key], true)
    submitGuards[key] = this.protectSubmit.bind(this)
    document.addEventListener('submit', submitGuards[key], true)

    const observer = new MutationObserver((mutations, observer) => {
      mutations.forEach(mutation => {
        const { addedNodes, target, type } = mutation

        switch (type) {
          case 'attributes':
            if (target.closest('form')?.action === form.action)
              if (target.id === input.id || target.name === input.name) target.remove()
            break
          case 'childList':
            addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName.match(/^form$/i) && node.action === form.action) node.remove()
                if (target.closest('form')?.action === form.action)
                  if (node.id === input.id || node.name === input.name) node.remove()
              }
            })
            break
        }
      })
    })

    observer.observe(document.body, {
      attributeFilter: ['id', 'name'],
      attributes: true,
      childList: true,
      subtree: true
    })
  }

  cleanup() {
    const trix = this.controller.element
    const input = this.controller.inputElement
    const toolbar = this.controller.toolbarElement

    input?.remove()
    toolbar?.remove()
    trix?.remove()
  }
}
