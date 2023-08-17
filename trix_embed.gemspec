# frozen_string_literal: true

require_relative "lib/trix_embed/version"

Gem::Specification.new do |s|
  s.name = "trix_embed"
  s.version = TrixEmbed::VERSION
  s.authors = ["Nate Hopkins (hopsoft)"]
  s.email = ["natehop@gmail.com"]
  s.homepage = "https://github.com/hopsoft/trix_embed"
  s.summary = "A Stimulus controller to safely embed external media in the Trix editor"
  s.description = s.summary
  s.license = "MIT"

  s.metadata["homepage_uri"] = s.homepage
  s.metadata["source_code_uri"] = s.homepage
  s.metadata["changelog_uri"] = s.homepage + "/blob/main/CHANGELOG.md"

  s.files = Dir["{app,lib}/**/*", "MIT-LICENSE", "README.md"]

  s.required_ruby_version = ">= 2.7"
  s.add_dependency "rails", ">= 6.1"
  s.add_dependency "nokogiri", ">= 1.15"

  s.add_development_dependency "amazing_print"
  s.add_development_dependency "capybara"
  s.add_development_dependency "capybara-playwright-driver"
  s.add_development_dependency "foreman"
  s.add_development_dependency "importmap-rails"
  s.add_development_dependency "magic_frozen_string_literal"
  s.add_development_dependency "minitest-reporters"
  s.add_development_dependency "model_probe"
  s.add_development_dependency "net-smtp"
  s.add_development_dependency "pry-byebug"
  s.add_development_dependency "pry-doc"
  s.add_development_dependency "pry-rails"
  s.add_development_dependency "puma"
  s.add_development_dependency "rake"
  s.add_development_dependency "rerun"
  s.add_development_dependency "rexml"
  s.add_development_dependency "sprockets-rails"
  s.add_development_dependency "sqlite3"
  s.add_development_dependency "standardrb"
  s.add_development_dependency "tailwindcss-rails"
  # s.add_development_dependency "web-console"
  s.add_development_dependency "webdrivers"
end
