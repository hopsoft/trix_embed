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
            const f = node.closest('form')
            if (form?.action && form.action === f?.action) {
              if (target.id === input.id || target.name === input.name) target.remove()
            }
            break
          case 'childList':
            addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const f = node.closest('form')
                if (form?.action && form.action === f?.action) {
                  if (f !== form) node.remove()
                } else if (input?.name && input.name === node?.name) {
                  node.remove()
                }
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
