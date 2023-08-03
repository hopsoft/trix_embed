//import Trix from 'trix'
import TrixEmbedController from './trix_embed_controller'

Trix.config.attachments['text/html'] = { caption: { name: true } }

export { TrixEmbedController }
