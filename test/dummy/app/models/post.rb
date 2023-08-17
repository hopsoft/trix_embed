# frozen_string_literal: true

class Post < ApplicationRecord
  validates :body, presence: true
  has_rich_text :body
end
