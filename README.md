# Trix Embed

A Stimulus controller to safely embed external media in the Trix editor.

## Setup

```sh
yarn add @hotwired/stimulus trix trix-embed
```

```js
import Trix from 'trix'
import "@rails/actiontext"
import { Application, Controller } from '@hotwired/stimulus'
import TrixEmbed from 'trix-embed'

const application = Application.start()
TrixEmbed.initialize({ application, Controller, Trix })
```

## Usage

### Allow Lists

- Allow links to all sites
- Allow embedded media (images, videos, etc.) from the following hosts:

  * `vimeo.com`
  * `voomly.com`
  * `youtube.com`

```html
<form>
  <input id="content" name="content" type="hidden">
  <trix-editor id="editor" input="content"
    data-controller="trix-embed"
    data-trix-embed-allowed-link-hosts-value='["*"]'
    data-trix-embed-allowed-media-hosts-value='["vimeo.com", "voomly.com", "youtube.com"]'>
  </trix-editor>
</form>
```

### Block Lists

- Block links to the following sites

  * `4chan.org`
  * `8chan.net`
  * `thepiratebay.org`

- Block media (images, videos, etc.) from the following list of hosts:

  * `deviantart.com`
  * `imgur.com`
  * `tumblr.com`

```html
<form>
  <input id="content" name="content" type="hidden">
  <trix-editor id="editor" input="content"
    data-controller="trix-embed"
    data-trix-embed-blocked-link-hosts-value='["4chan.org", "8chan.net", "thepiratebay.org"]'
    data-trix-embed-blocked-media-hosts-value='["deviantart.com", "imgur.com", "tumblr.com"]'>
  </trix-editor>
</form>
```

### Allow Everything

```html
<form>
  <input id="content" name="content" type="hidden">
  <trix-editor id="editor" input="content"
    data-controller="trix-embed"
    data-trix-embed-allowed-link-hosts-value='["*"]'
    data-trix-embed-allowed-media-hosts-value='["*"]'>
  </trix-editor>
</form>
```

### Block Everything

```html
<form>
  <input id="content" name="content" type="hidden">
  <trix-editor id="editor" input="content"
    data-controller="trix-embed"
    data-trix-embed-block-link-hosts-value='["*"]'
    data-trix-embed-block-media-hosts-value='["*"]'>
  </trix-editor>
</form>
```

...or simply.

```html
<form>
  <input id="content" name="content" type="hidden">
  <trix-editor id="editor" input="content" data-controller="trix-embed">
  </trix-editor>
</form>
```

## Sponsors

<p align="center">
  <em>Proudly sponsored by</em>
</p>
<p align="center">
  <a href="https://www.clickfunnels.com?utm_source=hopsoft&utm_medium=open-source&utm_campaign=trix_embed">
    <img src="https://images.clickfunnel.com/uploads/digital_asset/file/176632/clickfunnels-dark-logo.svg" width="575" />
  </a>
</p>

## Developing

```sh
git clone https://github.com/hopsoft/trix_embed.git
cd trix_embed
bin/dev
```

## Releasing

1. Run `yarn` and `bundle` to pick up the latest
1. Bump version number at `lib/trix_embed/version.rb`. Pre-release versions use `.preN`
1. Run `yarn build` - *builds both the Ruby gem and the NPM package*
1. Commit and push changes to GitHub
1. Run `rake release`
1. Run `yarn publish --no-git-tag-version --access public`
1. Yarn will prompt you for the new version. Pre-release versions use `-preN`
1. Commit and push changes to GitHub
1. Create a new release on GitHub ([here](https://github.com/hopsoft/trix_embed/releases)) and generate the changelog for the stable release for it

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
