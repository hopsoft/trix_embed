export default class Store {
  constructor(controller) {
    this.controller = controller
    this.base = this.obfuscate([location.pathname, this.controller.element.closest('[id]')?.id].join('/'))
  }

  split(list) {
    const index = Math.ceil(list.length / 2)
    return [list.slice(0, index), list.slice(index)]
  }

  obfuscate(value) {
    const chars = [...value].map(char => char.charCodeAt(0))
    const parts = this.split(chars)
    return [parts[1]?.reverse(), chars[0]].flat().join('')
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
    const chars = [...this.obfuscate(value)]
    const [prefix, suffix] = this.split(chars)
    return btoa(`${prefix}/${this.base}/${suffix}`)
  }
}
