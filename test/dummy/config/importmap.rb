# frozen_string_literal: true

# Pin npm packages by running ./bin/importmap

# link the @turbo-boost/commands build to test/dummy/app/javascript/@turbo-boost
target = File.expand_path(Rails.root.join("../../app/assets/builds/trix-embed.js"))
link = File.expand_path(Rails.root.join("app/javascript/trix-embed.js"))
FileUtils.rm_r link, force: true, verbose: true if File.exist?(link) && !File.symlink?(link)
FileUtils.ln_s target, link, force: true, verbose: true unless File.exist?(link)

pin "@hotwired/stimulus", to: "https://ga.jspm.io/npm:@hotwired/stimulus@3.2.2/dist/stimulus.js"
pin "@rails/actiontext", to: "actiontext.js"
pin "trix", to: "trix.js"
pin "trix-embed", to: "trix-embed.js"
pin "application", preload: true
