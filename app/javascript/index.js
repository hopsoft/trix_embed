import { generateKey, encryptValues, generateKeyAndEncryptValues } from './encryption'
import { getTrixEmbedControllerClass } from './controller'

let initialized = false

const defaultOptions = {
  application: null,
  Controller: null,
  Trix: null
}

function initialize(options = defaultOptions) {
  if (initialized) return
  const { application, Controller, Trix } = options
  application.register('trix-embed', getTrixEmbedControllerClass({ Controller, Trix }))
  initialized = true
}

self.TrixEmbed = {
  initialize,
  generateKey,
  encryptValues,
  generateKeyAndEncryptValues
}

export default self.TrixEmbed
