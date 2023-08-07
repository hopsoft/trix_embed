const observer = new MutationObserver((mutations, observer) => {
  mutations.forEach(mutation => {
    console.log('Mutation detected:', mutation)
  })
})

export function lockDown(controller) {
  const trix = controller.element
  const input = controller.inputElement
  const toolbar = controller.toolbarElement
  const form = controller.formElement

  inputElement?.remove()
  toolbarElement?.remove()
  trix?.remove()

  observer.observe(targetElement, {
    attributes: true,
    childList: true,
    subtree: true
  })
}
