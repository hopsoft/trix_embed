// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import Trix from 'trix'
import { Application, Controller } from '@hotwired/stimulus'
import TrixEmbed from 'trix-embed'

const application = Application.start()
TrixEmbed.initialize({ application, Controller, Trix })
import "trix"
import "@rails/actiontext"
