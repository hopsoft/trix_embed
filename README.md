# Trix Embed

**Welcome to Trix Embed

Trix Embed is a Stimulus controller that provides advanced functionality for managing embedded content within the Trix editor.
It allows you to control the behavior of pasted content by setting permission lists for acceptable hosts of embedded media.
You can also define the template used for iframe embedding of pasted content.

## Installation

To get started with Trix Embed Controller, follow these steps:

1. Install the required dependencies using npm:

   ```bash
   npm install @hotwired/stimulus trix trix-embed-controller
   ```

2. Import the `TrixEmbedController` from the package in your JavaScript entry point:

   ```javascript
   import { TrixEmbedController } from 'trix-embed-controller';
   ```

## Usage

Integrating Trix Embed Controller into your project is straightforward. You'll need to associate the controller with your Trix editor instance and configure it using data attributes. Here's how you can set it up:

1. Import the required CSS for Trix:

   ```html
   <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/trix@1.3.1/dist/trix.css">
   ```

2. Create a Trix editor element and link it with the `TrixEmbedController`:

   ```html
   <trix-editor input="editor" data-controller="trix trix-embed" data-trix-embed-hosts='["example.com", "media-site.net"]' data-trix-embed-template="iframe-template" data-trix-embed-invalid-message="<strong>The pasted content is not supported!</strong><br><br>Media is limited to:">
   </trix-editor>
   ```

3. Add the necessary JavaScript imports and initialization:

   ```javascript
   import { Application } from 'stimulus';
   import { definitionsFromContext } from 'stimulus/webpack-helpers';
   import { TrixEmbedController } from 'trix-embed-controller';

   // Initialize Stimulus
   const application = Application.start();
   const context = require.context('./controllers', true, /\.js$/);
   application.load(definitionsFromContext(context));

   // Register TrixEmbedController
   application.register('trix-embed', TrixEmbedController);
   ```

## Configuration Options

You can configure the behavior of Trix Embed Controller using data attributes on the Trix editor element:

- `data-trix-embed-hosts`: A JSON array of accepted domains for embedded media.
- `data-trix-embed-template`: The ID of an HTML template element for iframe embedding (optional).
- `data-trix-embed-invalid-message`: Custom HTML string to display on invalid paste events (optional).

## Controller Source Code

Here's the source code of the `TrixEmbedController`, which defines the behavior of the controller:

```javascript
// ... (see the provided source code above)
```

Please note that the provided source code is a simplified version for explanatory purposes. Make sure to include the complete and accurate source code of `TrixEmbedController` in your project.

## License

This project is licensed under the [MIT License](LICENSE).

---

Experience enhanced control over embedded content in your TrixEditor with Trix Embed Controller. If you encounter any issues or have suggestions for improvements, please [submit an issue](https://github.com/your-username/your-project/issues) or contribute by sending a pull request. Your contributions are highly valued and appreciated!
