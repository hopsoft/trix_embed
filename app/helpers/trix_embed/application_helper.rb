# frozen_string_literal: true

module TrixEmbed
  module ApplicationHelper
    def trix_embed_attachment(local_assigns = {})
      return local_assigns[:attachable] if local_assigns[:attachable].is_a?(TrixEmbed::Attachment)
      return local_assigns[:attachment].attachable if local_assigns[:attachment]&.attachable.is_a?(TrixEmbed::Attachment)
      nil
    end
  end
end
