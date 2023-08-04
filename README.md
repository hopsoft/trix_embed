# Trix Embed

**Welcome to Trix Embed 👋**

Trix Embed is a Stimulus controller that provides support for managing embedded content (copy/paste) within the Trix editor.

- Iframes
- Audio
- Images
- Videos
- Etc.

## Features

- Allow list for supported hosts (domains)
- Customizable templates

## Dependencies

You application must have the following dependencies installed and configured.

- [@hotwired/stimulus](https://github.com/hotwired/stimulus)
- [trix](https://github.com/basecamp/trix)

## Installation & Configuration

1. Install the libary

   ```bash
   yarn add trix-embed
   ```

2. Configure your app

   ```javascript
   import Trix from 'trix'
   import { Application } from '@hotwired/stimulus'
   import TrixEmbed from 'trix-embed'

   const application = Application.start()
   TrixEmbed.initialize({ application })
   ```

## Usage

Integrating Trix Embed with a `<trix-editor>` is straightforward.

```html
<trix-editor
  data-controller="trix-embed"
  data-action="trix-paste->trix-embed#paste">
</trix-editor>
```

## Configuration Options

You can configure the behavior with data attributes.

- `data-trix-embed-hosts` - list of hosts/domains that embeds are allowed from
- `data-trix-embed-template` - [optional] DOM ID of the default template to use for embeds regardless of validity
- `data-trix-embed-valid-template` - [optional] DOM ID of template to use for valid embeds
- `data-trix-embed-invalid-message` - [optional] DOM ID of template to use for invalid embeds

## Examples

```html
<trix-editor
  data-controller='trix-embed'
  data-action='trix-paste->trix-embed#paste'
  data-trix-embed-hosts-value='["example.com", "test.com"]'
  data-trix-embed-valid-template-value='trix-embed-valid'>
</trix-editor>

<template id='trix-embed-valid'>
  <div style='border:solid 1px gainsboro; border-radius:5px; display:inline-block; padding:10px;'>
  <img style='border:solid 1px gainsboro;'></img>
  <iframe
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture'
    allowfullscreen
    frameborder='0'
    loading='lazy'
    referrerpolicy='no-referrer'
    scrolling='no'
    width='854'
    height='480'
    style='border:solid 1px gainsboro;'>
  </iframe>
  </div>
</template>
```

## License

This project is licensed under the [MIT License](LICENSE).
