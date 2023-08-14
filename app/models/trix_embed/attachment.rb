# frozen_string_literal: true

module TrixEmbed
  class Attachment
    include ActiveModel::Model
    include GlobalID::Identification
    include ActionText::Attachable

    # TAGS = %W[figure figcaption iframe].freeze
    # ATTRIBUTES = %w[allow allowfullscreen allowpaymentrequest credentialless csp loading referrerpolicy sandbox srcdoc].freeze

    class << self
      # def sanitizer
      #   @sanitizer ||= ...
      # end

      # Renders Trix content with `TrixEmbed::Attachment`s
      #
      # Invoked by the override partial: action_text/contents/content partial
      # SEE: ActionText::Rendering.render and ActionText::Attachable for more details
      #
      # @param content [ActionText::Content] The content to render
      # @param view_context [ActionView::Base] The view context being used for rendering
      # @return [String] The rendered HTML
      def render(content, view_context)
        fragment = content.fragment.source # returns a Nokogiri::HTML4::DocumentFragment

        content.attachments.each do |attachment|
          next unless attachment.attachable.is_a?(TrixEmbed::Attachment)

          match = fragment.at_css("#{ActionText::Attachment.tag_name}[sgid='#{attachment.attachable.attachable_sgid}']")
          next unless match

          # Working with a `TrixEmbed::Attachment`
          trix_embed = attachment.attachable

          # NOTE: `match` is the result of native rendering by `render_action_text_content`,
          #       which sanitizes the markup... and it's important we retain that behavior.
          #
          #       Below is where we override native sanitization for Trix Embeds.
          rerendered_html = view_context.render(trix_embed.to_partial_path, trix_embed: attachment)

          # TODO: sanitize the rerendered_html
          # match.inner_html = sanitizer.sanitize(rerendered_html)
          match.inner_html = rerendered_html

          # TODO: remove this... BulletTrain or CF2 sets visibility to hidden ??? ¯\_(ツ)_/¯
          match["style"] = "visibility:visible;"
        end

        fragment.to_html.html_safe
      end

      # Assigns sgid attributes for `TrixEmbed::Attachment`s in the given Trix HTML.
      #
      # @param trix_html [String] The Trix HTML to update
      # @return [String] The updated Trix HTML
      def update_attachments(trix_html)
        fragment = Nokogiri::HTML.fragment(trix_html)

        # TODO: Figure out why `data-trix-content-type='application/octet-stream'` for TrixEmbed content
        #       It should be be `data-trix-content-type='application/vnd.trix-embed'`
        # attachment_elements = fragment.css("[data-trix-attachment][data-trix-content-type='application/vnd.trix-embed']")
        attachment_elements = fragment.css("[data-trix-attachment]")

        attachment_elements.each do |attachment_element|
          # TODO: Remove this guard one data-trix-content-type is correct in the HTML markup
          attachment_data = JSON.parse(attachment_element["data-trix-attachment"])
          next unless attachment_data["contentType"] == "application/vnd.trix-embed"

          trix_embed = TrixEmbed::Attachment.new(attachment_data.deep_transform_keys(&:underscore))
          attachment_data["sgid"] = trix_embed.attachable_sgid
          attachment_element["data-trix-attachment"] = attachment_data.to_json
        end

        fragment.to_html
      end

      def find(id)
        new JSON.parse(id)
      end
    end

    attr_reader :attributes
    attr_accessor :content_type, :content

    def initialize(attributes = {})
      super @attributes = attributes.with_indifferent_access.slice(:content_type, :content)
    end

    def id
      attributes.to_json
    end

    def persisted?
      true
    end

    def to_partial_path
      "trix_embed/attachments/attachment"
    end

    def to_trix_content_attachment_partial_path
      "trix_embed/attachments/attachment"
    end
  end
end
