# frozen_string_literal: true

module TrixEmbed
  class Attachment
    include ActiveModel::Model
    include GlobalID::Identification
    include ActionText::Attachable

    CONTENT_TYPE = "application/vnd.trix-embed"

    # TAGS = %W[figure figcaption iframe].freeze
    # ATTRIBUTES = %w[allow allowfullscreen allowpaymentrequest credentialless csp loading referrerpolicy sandbox srcdoc].freeze

    class << self
      # def sanitizer
      #   @sanitizer ||= ...
      # end

      def rewrite_action_text_content(content)
        fragment = Nokogiri::HTML.fragment(content)
        matches = fragment.css("#{ActionText::Attachment.tag_name}[sgid][content-type='#{CONTENT_TYPE}']")

        matches.each do |match|
          attachment = ActionText::Attachment.from_node(match)
          attachable = attachment.attachable

          html = ActionText::Content.render(
            partial: attachable.to_action_text_content_partial_path,
            locals: {attachable: attachable}
          )

          # TODO: sanitize the html
          # match.inner_html = sanitizer.sanitize(html)
          match.replace html

          # TODO: remove this... BulletTrain or CF2 sets visibility to hidden ??? ¯\_(ツ)_/¯
          # match["style"] = "visibility:visible;"
        end

        fragment.to_html.html_safe
      end

      def rewrite_trix_html(trix_html)
        fragment = Nokogiri::HTML.fragment(trix_html)
        matches = fragment.css("[data-trix-attachment][data-trix-content-type='#{CONTENT_TYPE}']")

        matches.each do |match|
          data = JSON.parse(match["data-trix-attachment"]).deep_transform_keys(&:underscore)

          attachable = TrixEmbed::Attachment.new(data)
          attachment = ActionText::Attachment.from_attachable(attachable)

          match.replace ActionText::Content.render(
            partial: attachable.to_partial_path,
            locals: {attachment: attachment}
          )
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

    # What gets saved to the database
    def to_partial_path
      "trix_embed/action_text_attachment"
    end

    # What gets presented in the browser (show view)
    def to_action_text_content_partial_path
      "trix_embed/action_text_content_show"
    end

    # What gets presented in the browser (edit view)
    def to_trix_content_attachment_partial_path
      "trix_embed/action_text_content_edit"
    end
  end
end
