import { generateKey, encryptValues, generateKeyAndEncryptValues } from './encryption'
import Controller from './controller'

const defaultOptions = {
  application: null
}

function initialize(options = defaultOptions) {
  const { application } = options
  application.register('trix-embed', Controller)
}

self.TrixEmbed = {
  initialize,
  generateKey,
  encryptValues,
  generateKeyAndEncryptValues
}

export default self.TrixEmbed
