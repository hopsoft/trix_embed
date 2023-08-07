import { generateEncryptionKey, encryptValues, generateEncryptionKeyAndEncryptValues } from './encryption'
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
  generateEncryptionKey,
  encryptValues,
  generateEncryptionKeyAndEncryptValues
}

export default self.TrixEmbed
