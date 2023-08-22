import metadata from './metadata'
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
  const { application, Controller } = options
  application.register('trix-embed', getTrixEmbedControllerClass({ Controller, Trix }))
  initialized = true
}

self.TrixEmbed = {
  ...metadata,
  encryptValues,
  generateKey,
  generateKeyAndEncryptValues,
  initialize
}

export default self.TrixEmbed
