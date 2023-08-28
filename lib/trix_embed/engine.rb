# frozen_string_literal: true

require "action_text"
require "active_model"
require "active_support/all"
require "globalid"
require_relative "version"

module TrixEmbed
  def self.config
    Rails.application.config.trix_embed
  end

  class Engine < ::Rails::Engine
    isolate_namespace TrixEmbed
    config.trix_embed = ActiveSupport::OrderedOptions.new

    initializer "trix_embed.configuration" do
      Mime::Type.register "trix-embed/attachment", :trix_embed_attachment

      ActiveSupport.on_load :action_controller do
        helper TrixEmbed::ApplicationHelper
      end
    end
  end
end
