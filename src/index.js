import { generateKey, encryptValues, generateKeyAndEncryptValues } from './encryption'
import { getTrixEmbedControllerClass } from './controller'

const defaultOptions = {
  application: null,
  Controller: null,
  Trix: null
}

function initialize(options = defaultOptions) {
  const { application, Controller, Trix } = options
  application.register('trix-embed', getTrixEmbedControllerClass({ Controller, Trix }))
}

self.TrixEmbed = {
  initialize,
  generateKey,
  encryptValues,
  generateKeyAndEncryptValues
}

export default self.TrixEmbed
