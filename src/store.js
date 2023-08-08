export default class Store {
  constructor(controller) {
    this.controller = controller

    this.base = [...[location.pathname, this.controller.element.closest('[id]')?.id].join('/')]
      .map(char => char.charCodeAt(0))
      .reverse()
      .join('')
  }

  read(key) {
    return sessionStorage.getItem(this.generateStorageKey(key))
  }

  write(key, value) {
    return sessionStorage.setItem(this.generateStorageKey(key), value)
  }

  remove(key) {
    return sessionStorage.removeItem(this.generateStorageKey(key))
  }

  generateStorageKey(value) {
    const chars = [...value].map(char => char.charCodeAt(0))
    const index = Math.ceil(chars.length / 2)
    const prefix = chars.slice(0, index).join('')
    const suffix = chars.slice(index).join('')
    return btoa(`${prefix}/${this.base}/${suffix}`)
  }
}
