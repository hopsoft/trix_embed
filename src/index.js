import Controller from './controller'

const defaultOptions = {
  application: null
}

function initialize(options = defaultOptions) {
  const { application } = options
  application.register('trix-embed', Controller)
}

export default { initialize }
