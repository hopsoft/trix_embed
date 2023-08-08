# Trix Embed

Trix Embed is a Stimulus controller that supports safely embedding content from external sources.

## Setup

```sh
yarn add @hotwired/stimulus trix trix-embed
```

```js
import 'trix'
import { Application } from '@hotwired/stimulus'
import TrixEmbed from 'trix-embed'

const application = Application.start()
TrixEmbed.initialize({ application })
```

## Usage

```html
<form>
  <input id="content" name="content" type="hidden">
  <trix-editor id="editor" input="content"
    data-controller="trix-embed"
    data-action="trix-paste->trix-embed#paste"
    data-trix-embed-hosts-value='["example.com", "test.com"]'>
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
yarn
yarn build
yarn start
```

## Releasing

1. Run `yarn` to pick up the latest
1. Run `yarn build`
1. Run `yarn publish`
1. Yarn will prompt you for the new version. Pre-release versions use `-preN`
1. Commit and push changes to GitHub

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
