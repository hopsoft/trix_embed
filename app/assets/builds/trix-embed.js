/*
  trix-embed 0.0.2 (MIT)
  Copyright © 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>
*/
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// app/javascript/metadata.js
var metadata_default = {
  author: "Nate Hopkins (hopsoft) <natehop@gmail.com>",
  copyright: "Copyright \xA9 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>",
  description: "A Stimulus controller to safely embed external media in the Trix editor",
  license: "MIT",
  repository: "https://github.com/hopsoft/trix_embed",
  version: "0.0.2"
};

// app/javascript/encryption.js
var options = { name: "AES-GCM", length: 256 };
var extractable = true;
var purposes = ["encrypt", "decrypt"];
async function generateEncryptionKey() {
  const extractable2 = true;
  const purposes2 = ["encrypt", "decrypt"];
  return await crypto.subtle.generateKey(options, extractable2, purposes2);
}
async function exportKey(key) {
  const exported = await crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(exported);
}
async function importKey(key) {
  const parsed = JSON.parse(key);
  return await crypto.subtle.importKey("jwk", parsed, options, extractable, purposes);
}
async function encrypt(value, key) {
  const encoded = new TextEncoder().encode(String(value));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buffer = await crypto.subtle.encrypt(__spreadProps(__spreadValues({}, options), { iv }), key, encoded);
  const data = {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(buffer))),
    iv: btoa(String.fromCharCode(...iv))
  };
  return btoa(JSON.stringify(data));
}
async function decrypt(encrypted, key) {
  const data = JSON.parse(atob(encrypted));
  const ciphertextArray = new Uint8Array(
    atob(data.ciphertext).split("").map((char) => char.charCodeAt(0))
  );
  const iv = new Uint8Array(
    atob(data.iv).split("").map((char) => char.charCodeAt(0))
  );
  const buffer = await crypto.subtle.decrypt(__spreadProps(__spreadValues({}, options), { iv }), key, ciphertextArray);
  return new TextDecoder().decode(buffer);
}
async function generateKey() {
  const key = await generateEncryptionKey();
  const jsonKey = await exportKey(key);
  const base64Key = btoa(jsonKey);
  return base64Key;
}
async function encryptValues(base64Key, values = []) {
  const key = await importKey(atob(base64Key));
  return Promise.all(values.map((value) => encrypt(value, key)));
}
async function decryptValues(base64Key, encryptedValues = []) {
  const key = await importKey(atob(base64Key));
  return Promise.all(encryptedValues.map((encryptedValue) => decrypt(encryptedValue, key)));
}
async function generateKeyAndEncryptValues(values = []) {
  const key = await generateKey();
  const encryptedValues = await encryptValues(key, values);
  console.log(`data-trix-embed-key-value="${key}"`);
  console.log(`data-trix-embed-hosts-value='${JSON.stringify(encryptedValues)}'`);
  return { key, encryptedValues };
}

// app/javascript/enumerable.js
var random = (cap) => Math.floor(Math.random() * cap);
var sample = (object, count = null) => {
  const array = [...object];
  if (count === "all")
    count = array.length;
  const cap = array.length;
  const result = [];
  const indexes = /* @__PURE__ */ new Set();
  while (result.length < count) {
    let i = random(cap);
    while (indexes.has(i))
      i = random(cap);
    indexes.add(i);
    result.push(array[i]);
  }
  return typeof count === "number" ? result : result[0];
};

// app/javascript/urls.js
function createURLObject(value, callback = (url) => {
}) {
  try {
    const url = new URL(String(value).trim());
    if (url && callback)
      callback(url);
    return url;
  } catch (_error) {
    console.info(`Failed to parse URL! value='${value}']`);
  }
  return null;
}
function extractURLHost(value, callback = (host) => {
}) {
  var _a;
  let host = (_a = createURLObject(value)) == null ? void 0 : _a.host;
  if (host && callback)
    callback(host);
  return host;
}
function createURLTextNodeTreeWalker(element) {
  return document.createTreeWalker(element, NodeFilter.SHOW_TEXT, (node) => {
    return node.nodeValue.match(/http/gi) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  });
}
function extractURLsFromTextNodes(element) {
  const urls = /* @__PURE__ */ new Set();
  const walker = createURLTextNodeTreeWalker(element);
  let node;
  while (node = walker.nextNode())
    node.nodeValue.split(/\s+/).filter((val) => val.startsWith("http")).forEach((match) => createURLObject(match, (url) => urls.add(url.href)));
  return [...urls];
}
function extractURLFromElement(element) {
  if (element.src) {
    const url = element.src.trim();
    if (url.length)
      return url;
  }
  if (element.href) {
    const url = element.href.trim();
    if (url.length)
      return url;
  }
  return "";
}
function extractURLsFromElementNodes(element) {
  const urls = /* @__PURE__ */ new Set();
  if (element.src)
    createURLObject(element.src, (url) => urls.add(url.href));
  if (element.href)
    createURLObject(element.href, (url) => urls.add(url.href));
  const elements = element.querySelectorAll("[src], [href]");
  elements.forEach((el) => createURLObject(extractURLFromElement(el), (u) => urls.add(u.href)));
  return [...urls];
}
function validateURL(value, allowedHosts = [], blockedHosts = []) {
  const host = extractURLHost(value);
  if (blockedHosts.includes("*"))
    return false;
  if (blockedHosts.find((blockedHosts2) => host.endsWith(blockedHosts2)))
    return false;
  if (allowedHosts.find((allowedHosts2) => host.endsWith(allowedHosts2)))
    return true;
  if (allowedHosts.includes("*")) {
    if (host)
      return true;
    if (value.startsWith("data:"))
      return true;
    if (value.startsWith("news:"))
      return true;
    if (value.startsWith("tel:"))
      return true;
  }
  return false;
}
function extractURLHosts(values) {
  return [
    ...values.reduce((hosts, value) => {
      extractURLHost(value, (host) => hosts.add(host));
      return hosts;
    }, /* @__PURE__ */ new Set())
  ];
}
function extractURLs(element) {
  const elementURLs = extractURLsFromElementNodes(element);
  const textNodeURLs = extractURLsFromTextNodes(element);
  const uniqueURLs = /* @__PURE__ */ new Set([...elementURLs, ...textNodeURLs]);
  return [...uniqueURLs];
}

// app/javascript/media.js
var trixEmbedMediaTypes = {
  attachment: "trix-embed/attachment"
};
var imageMediaTypes = {
  avif: "image/avif",
  // AVIF image format
  bmp: "image/bmp",
  // BMP image format
  gif: "image/gif",
  // GIF image format
  heic: "image/heic",
  // HEIC image format
  heif: "image/heif",
  // HEIF image format
  ico: "image/x-icon",
  // ICO image format
  jp2: "image/jp2",
  // JPEG 2000 image format
  jpeg: "image/jpeg",
  // JPEG image format
  jpg: "image/jpeg",
  // JPEG image format (alternative extension)
  jxr: "image/vnd.ms-photo",
  // JPEG XR image format
  png: "image/png",
  // PNG image format
  svg: "image/svg+xml",
  // SVG image format
  tif: "image/tiff",
  // TIFF image format
  tiff: "image/tiff",
  // TIFF image format (alternative extension)
  webp: "image/webp"
  // WebP image format
};
var mediaTypes = imageMediaTypes;
var tagsWithHrefAttribute = [
  "animate",
  // SVG: Animation
  "animateMotion",
  // SVG: Animation
  "animateTransform",
  // SVG: Animation
  "area",
  // HTML: Image map area
  "audio",
  // HTML: Audio content
  "base",
  // HTML: Base URL
  "embed",
  // HTML: Embedded content
  "feDisplacementMap",
  // SVG: Filter primitive
  "feImage",
  // SVG: Filter primitive
  "feTile",
  // SVG: Filter primitive
  "filter",
  // SVG: Filter container
  "font-face-uri",
  // SVG: Font reference
  "iframe",
  // HTML: Inline frame
  "image",
  // SVG: Image
  "link",
  // HTML: External resources (e.g., stylesheets)
  "object",
  // HTML: Embedded content (fallback for non-HTML5 browsers)
  "script",
  // HTML: External scripts
  "source",
  // HTML: Media source
  "track",
  // HTML: Text tracks for media elements
  "use",
  // SVG: Reuse shapes from other documents
  "video"
  // HTML: Video content
];
var tagsWithSrcAttribute = [
  "audio",
  // HTML: Audio content
  "embed",
  // HTML: Embedded content
  "iframe",
  // HTML: Inline frame
  "img",
  // HTML: Images
  "input",
  // HTML: Input elements with type="image"
  "script",
  // HTML: External scripts
  "source",
  // HTML: Media source
  "track",
  // HTML: Text tracks for media elements
  "video",
  // HTML: Video content
  "frame",
  // HTML: Deprecated (use iframe instead)
  "frameset",
  // HTML: Deprecated (use iframe instead)
  "object",
  // HTML: Embedded content
  "picture",
  // HTML: Responsive images
  "use"
  // SVG: Reuse shapes from other documents
];
var trixEditorTag = "trix-editor";
var trixAttachmentTag = "action-text-attachment";
var mediaTags = tagsWithHrefAttribute.concat(tagsWithSrcAttribute);
function isImage(url) {
  return !!Object.values(imageMediaTypes).find((t) => t === getMediaType(url));
}
function getMediaType(value) {
  let url;
  url = createURLObject(value);
  if (!url)
    return null;
  const index = url.pathname.lastIndexOf(".");
  if (!index)
    return null;
  const extension = url.pathname.substring(index + 1);
  return mediaTypes[extension];
}

// app/javascript/guard.js
var protectedForms = {};
function protectionKey(form) {
  return `${form == null ? void 0 : form.method}:${form == null ? void 0 : form.action}`.trim().toLowerCase();
}
function protect(event) {
  const submittingForm = event.target.closest("form");
  const key = protectionKey(submittingForm);
  const protectedForms2 = [...protectedForms2[key]];
  if (!protectedForms2.length)
    return;
  const form = protectedForms2.find((f) => f === submittingForm);
  if (form == null ? void 0 : form.pasting)
    event.preventDefault();
  if (form)
    return;
  const protectedInputs = protectedForms2.reduce((memo, form2) => {
    const editor = form2.closest(trixEditorTag);
    const input = form2.querySelector(`#${editor.getAttribute("input")}`);
    if (input)
      memo.push(input);
    return memo;
  }, []);
  protectedInputs.forEach((protectedInput) => {
    const submittingInput = submittingForm.querySlector(`[name="${protectedInput.name}"]`) || submittingForm.querySlector(`#${protectedInput.id}`);
    if (submittingInput)
      return event.preventDefault();
  });
}
document.addEventListener("submit", protect, true);
var Guard = class {
  constructor(controller) {
    this.controller = controller;
  }
  preventAttachments() {
    var _a, _b, _c, _d, _e;
    (_a = this.editor) == null ? void 0 : _a.removeAttribute("data-direct-upload-url");
    (_b = this.editor) == null ? void 0 : _b.removeAttribute("data-blob-url-template");
    (_c = this.editor) == null ? void 0 : _c.addEventListener("trix-file-accept", (event) => event.preventDefault(), true);
    (_e = (_d = this.toolbar) == null ? void 0 : _d.querySelector('[data-trix-button-group="file-tools"]')) == null ? void 0 : _e.remove();
  }
  async preventLinks() {
    var _a, _b;
    const allowed = await this.controller.allowedLinkHosts;
    const blocked = await this.controller.blockedLinkHosts;
    if (!blocked.length && allowed.includes("*"))
      return;
    (_b = (_a = this.toolbar) == null ? void 0 : _a.querySelector('[data-trix-action="link"]')) == null ? void 0 : _b.remove();
  }
  protect(attempt = 0) {
    if (!this.toolbar && attempt < 10)
      return setTimeout(() => this.protect(attempt + 1), 25);
    this.preventAttachments();
    this.preventLinks();
    if (!this.form)
      return;
    const key = protectionKey(this.form);
    protectedForms[key] = protectedForms[key] || /* @__PURE__ */ new Set();
    protectedForms[key].add(this.form);
  }
  get editor() {
    return this.controller.element;
  }
  get toolbar() {
    return this.controller.toolbarElement;
  }
  get form() {
    return this.controller.formElement;
  }
};

// app/javascript/store.js
var Store = class {
  constructor(controller) {
    var _a;
    this.controller = controller;
    this.base = this.obfuscate([location.pathname, (_a = this.controller.element.closest("[id]")) == null ? void 0 : _a.id].join("/"));
  }
  split(list) {
    const index = Math.ceil(list.length / 2);
    return [list.slice(0, index), list.slice(index)];
  }
  obfuscate(value) {
    var _a;
    const chars = [...value].map((char) => char.charCodeAt(0));
    const parts = this.split(chars);
    return [(_a = parts[1]) == null ? void 0 : _a.reverse(), chars[0]].flat().join("");
  }
  read(key) {
    return sessionStorage.getItem(this.generateStorageKey(key));
  }
  write(key, value) {
    return sessionStorage.setItem(this.generateStorageKey(key), value);
  }
  remove(key) {
    return sessionStorage.removeItem(this.generateStorageKey(key));
  }
  generateStorageKey(value) {
    const chars = [...this.obfuscate(value)];
    const [prefix, suffix] = this.split(chars);
    return btoa(`${prefix}/${this.base}/${suffix}`);
  }
};

// app/javascript/templates.js
var templates_default = {
  // inline templates ........................................................................................
  link: `<a href='{{url}}'>{{label}}</a>`,
  embedded: `
    <span>
      <strong>{{label}}</strong>
      <small>{{description}}</small>
      <del>{{url}}</del>
    </span>
  `,
  prohibited: `
    <span>
      <strong>{{label}}</strong>
      <del>{{url}}</del>
    </span>
  `,
  // attachment templates ....................................................................................
  error: `
    <div data-trix-embed data-trix-embed-error>
      <h1>{{header}}</h1>
      <pre><code>{{error.stack}}</code></pre>
    </div>
  `,
  iframe: `
    <div data-trix-embed>
      <iframe src='{{src}}' loading='lazy' referrerpolicy='no-referrer' scrolling='no'></iframe>
    </div>
  `,
  image: `
    <div data-trix-embed>
      <img src='{{src}}' loading='lazy'></img>
    </div>
  `,
  warning: `
    <div data-trix-embed data-trix-embed-warning>
      <h1>{{header}}</h1>
      <h3>{{subheader}}</h3>

      <h2>{{prohibited.header}}</h2>
      <ul>{{prohibited.hosts}}</ul>

      <h2>{{allowed.header}}</h2>
      <ul>{{allowed.hosts}}</ul>
    </div>
  `
};

// app/javascript/renderer.js
var ALLOWED_TAGS = [
  trixAttachmentTag,
  "a",
  "abbr",
  "acronym",
  "address",
  "b",
  "big",
  "blockquote",
  "br",
  "cite",
  "code",
  "dd",
  "del",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "iframe",
  "img",
  "ins",
  "kbd",
  "li",
  "ol",
  "p",
  "pre",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "tt",
  "ul",
  "var"
];
var ALLOWED_ATTRIBUTES = [
  "abbr",
  "allow",
  "allowfullscreen",
  "allowpaymentrequest",
  "alt",
  "caption",
  "cite",
  "content-type",
  "credentialless",
  "csp",
  "data-trix-embed",
  "data-trix-embed-error",
  "data-trix-embed-prohibited",
  "data-trix-embed-warning",
  "datetime",
  "filename",
  "filesize",
  "height",
  "href",
  "lang",
  "loading",
  "name",
  "presentation",
  "previewable",
  "referrerpolicy",
  "sandbox",
  "sgid",
  "src",
  "srcdoc",
  "title",
  "url",
  "width",
  "xml:lang"
];
var Renderer = class {
  // Constructs a new Renderer instance
  //
  // @param {Controller} controller - a Stimulus Controller instance
  constructor(controller) {
    this.controller = controller;
    this.initializeTempates();
  }
  sanitize(html) {
    const template = document.createElement("template");
    template.innerHTML = `<div>${html}</div>`;
    const element = template.content.firstElementChild;
    const all = [element].concat([...element.querySelectorAll("*")]);
    all.forEach((el) => {
      if (ALLOWED_TAGS.includes(el.tagName.toLowerCase())) {
        ;
        [...el.attributes].forEach((attr) => {
          if (!ALLOWED_ATTRIBUTES.includes(attr.name.toLowerCase()))
            el.removeAttribute(attr.name);
        });
      } else {
        el.remove();
      }
    });
    return element.innerHTML;
  }
  initializeTempates() {
    this.templates = templates_default;
    Object.keys(templates_default).forEach((name) => this.initializeTemplate(name));
  }
  initializeTemplate(name) {
    var _a, _b;
    const property = `${name}TemplateValue`;
    const id = this.controller[property];
    const template = id ? (_b = (_a = document.getElementById(id)) == null ? void 0 : _a.innerHTML) == null ? void 0 : _b.trim() : null;
    this.controller[property] = null;
    if (template)
      this.templates[name] = template;
    return this.templates[name];
  }
  render(templateName, params = {}) {
    const template = this.templates[templateName];
    return template.replace(/{{(.*?)}}/g, (_, key) => key.split(".").reduce((obj, k) => obj[k], params));
  }
  // TOOO: add support for audio and video
  // Renders a URL as an HTML embed i.e. an iframe or media tag (img, video, audio etc.)
  //
  // @param {String} url - URL
  // @returns {String} HTML
  //
  renderEmbed(url = "https://example.com") {
    const html = isImage(url) ? this.render("image", { src: url }) : this.render("iframe", { src: url });
    return this.sanitize(html);
  }
  // Renders a list of URLs as HTML embeds i.e. iframes or media tags (img, video, audio etc.)
  //
  // @param {String[]} urls - list of URLs
  // @returns {String[]} list of individual HTML embeds
  //
  renderEmbeds(urls = ["https://example.com", "https://test.com"]) {
    if (!(urls == null ? void 0 : urls.length))
      return;
    return urls.map((url) => this.renderEmbed(url));
  }
  // Renders embed errors
  //
  // @param {String[]} urls - list of URLs
  // @param {String[]} allowedHosts - list of allowed hosts
  // @returns {String} HTML
  //
  renderWarnings(urls = ["https://example.com", "https://test.com"], allowedHosts = [], blockedHosts = []) {
    if (!(urls == null ? void 0 : urls.length))
      return;
    allowedHosts = [...allowedHosts].sort();
    if (allowedHosts.includes("*"))
      allowedHosts.splice(allowedHosts.indexOf("*"), 1);
    blockedHosts = [...blockedHosts];
    if (blockedHosts.includes("*"))
      blockedHosts.splice(blockedHosts.indexOf("*"), 1);
    const hosts = [.../* @__PURE__ */ new Set([...blockedHosts, ...extractURLHosts(urls)])].sort();
    return this.render("warning", {
      header: "Copy/Paste Warning",
      subheader: "Content includes URLs or media from prohibited hosts or restricted protocols.",
      prohibited: {
        header: "Prohibited Hosts",
        hosts: hosts.length ? hosts.map((host) => `<li>${host}</li>`).join("") : "<li>URLs and media are restricted to allowed hosts and standard protocols.</li>"
      },
      allowed: {
        header: "Allowed Hosts",
        hosts: allowedHosts.length ? allowedHosts.map((host) => `<li>${host}</li>`).join("") : "<li>Allowed hosts not configured.</li>"
      }
    });
  }
  // Renders a JavaScript error
  //
  // @param {Error} error - The error or exception
  // @returns {String} HTML
  //
  renderError(error) {
    return this.render("error", {
      header: "Unhandled Exception!",
      subheader: "Report this problem to a software engineer.",
      error
    });
  }
};

// app/javascript/controller.js
function getTrixEmbedControllerClass(options2 = { Controller: null, Trix: null }) {
  var _a;
  const { Controller, Trix } = options2;
  return _a = class extends Controller {
    connect() {
      this.onpaste = this.paste.bind(this);
      this.element.addEventListener("trix-paste", this.onpaste, true);
      this.store = new Store(this);
      this.guard = new Guard(this);
      this.rememberConfig().then(() => {
        if (this.paranoid)
          this.guard.protect();
      });
    }
    disconnect() {
      this.element.removeEventListener("trix-paste", this.onpaste, true);
      this.forgetConfig();
    }
    async paste(event) {
      if (this.formElement)
        this.formElement.pasting = true;
      try {
        const { html, string, range } = event.paste;
        let content = html || string || "";
        const pastedElement = this.createTemplateElement(content);
        const pastedURLs = extractURLs(pastedElement);
        if (!pastedURLs.length)
          return;
        event.preventDefault();
        this.editor.setSelectedRange(range);
        try {
          const renderer2 = new Renderer(this);
          const allowedMediaHosts = await this.allowedMediaHosts;
          const blockedMediaHosts = await this.blockedMediaHosts;
          let mediaURLs = new Set(pastedURLs.filter((url) => getMediaType(url)));
          const iframes = [...pastedElement.querySelectorAll("iframe")];
          iframes.forEach((frame) => mediaURLs.add(frame.src));
          mediaURLs = [...mediaURLs];
          const validMediaURLs = mediaURLs.filter(
            (url) => validateURL(url, allowedMediaHosts, blockedMediaHosts)
          );
          const invalidMediaURLs = mediaURLs.filter((url) => !validMediaURLs.includes(url));
          const allowedLinkHosts = await this.allowedLinkHosts;
          const blockedLinkHosts = await this.blockedLinkHosts;
          const linkURLs = pastedURLs.filter((url) => !mediaURLs.includes(url));
          const validLinkURLs = linkURLs.filter((url) => validateURL(url, allowedLinkHosts, blockedLinkHosts));
          const invalidLinkURLs = linkURLs.filter((url) => !validLinkURLs.includes(url));
          if (invalidMediaURLs.length || invalidLinkURLs.length) {
            const invalidURLs = [.../* @__PURE__ */ new Set([...invalidMediaURLs, ...invalidLinkURLs])];
            const allowedHosts = [.../* @__PURE__ */ new Set([...allowedMediaHosts, ...allowedLinkHosts])].filter(
              (host) => !this.reservedDomains.includes(host)
            );
            const blockedHosts = [.../* @__PURE__ */ new Set([...blockedMediaHosts, ...blockedLinkHosts])].filter(
              (host) => !this.reservedDomains.includes(host)
            );
            await this.insert(renderer2.renderWarnings(invalidURLs, allowedHosts, blockedHosts));
          }
          if (validMediaURLs.length)
            await this.insert(renderer2.renderEmbeds(validMediaURLs));
          if (pastedURLs.length === 1 && validMediaURLs.length === 1)
            return;
          const sanitizedPastedElement = this.sanitizePastedElement(pastedElement, {
            renderer: renderer2,
            validMediaURLs,
            validLinkURLs
          });
          const sanitizedPastedContent = sanitizedPastedElement.innerHTML.trim();
          if (sanitizedPastedContent.length)
            await this.insert(sanitizedPastedContent, { disposition: "inline" });
        } catch (e) {
          this.insert(renderer.renderError(e));
        }
      } finally {
        if (this.formElement)
          delete this.formElement.pasting;
      }
    }
    createTemplateElement(content) {
      const template = document.createElement("template");
      template.innerHTML = `<div>${content.trim()}</div>`;
      return template.content.firstElementChild;
    }
    extractLabelFromElement(el, options3 = { default: null }) {
      let value = el.title;
      if (value && value.length)
        return value;
      value = el.textContent.trim();
      if (value && value.length)
        return value;
      return options3.default;
    }
    sanitizePastedElement(element, options3 = { renderer: null, validMediaURLs: [], validLinkURLs: [] }) {
      const { renderer: renderer2, validMediaURLs, validLinkURLs } = options3;
      element = element.cloneNode(true);
      const walker = createURLTextNodeTreeWalker(element);
      const textNodes = [];
      let textNode;
      while (textNode = walker.nextNode()) {
        textNode.replacements = textNode.replacements || /* @__PURE__ */ new Set();
        textNodes.push(textNode);
        const words = textNode.nodeValue.split(/\s+/);
        const matches = words.filter((word) => word.startsWith("http"));
        matches.forEach((match) => {
          var _a2;
          const url = (_a2 = createURLObject(match)) == null ? void 0 : _a2.href;
          const replacement = validLinkURLs.includes(url) || validLinkURLs.includes(url) ? renderer2.render("link", { url, label: url }) : renderer2.render("prohibited", { url, label: "Prohibited URL" });
          textNode.replacements.add({ match, replacement });
        });
      }
      textNodes.forEach((node) => {
        if (!node.replacements.size)
          return;
        let content = node.nodeValue;
        const replacements = [...node.replacements].sort((a, b) => b.match.length - a.match.length);
        replacements.forEach((entry) => content = content.replaceAll(entry.match, entry.replacement));
        node.replaceWith(this.createTemplateElement(content));
      });
      element.querySelectorAll("a").forEach((el) => {
        const url = extractURLFromElement(el);
        const label = this.extractLabelFromElement(el, { default: url });
        const replacement = validLinkURLs.includes(url) ? renderer2.render("link", { url, label }) : renderer2.render("prohibited", { url, label: "Prohibited link" });
        el.replaceWith(this.createTemplateElement(replacement));
      });
      element.querySelectorAll(mediaTags.join(", ")).forEach((el) => {
        const url = extractURLFromElement(el);
        const label = this.extractLabelFromElement(el, { default: url });
        const replacement = validMediaURLs.includes(url) ? renderer2.render("embedded", { url, label: "Allowed Media", description: "(embedded above)" }) : renderer2.render("prohibited", { url, label: "Prohibited media" });
        el.replaceWith(this.createTemplateElement(replacement));
      });
      element.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g, "<br>");
      return element;
    }
    createAttachment(content) {
      return new Trix.Attachment({ content, contentType: trixEmbedMediaTypes.attachment });
    }
    insertNewlines(count = 1, options3 = { delay: 1 }) {
      const { delay } = options3;
      return new Promise((resolve) => {
        setTimeout(() => {
          for (let i = 0; i < count; i++)
            this.editor.insertLineBreak();
          resolve();
        }, delay);
      });
    }
    insertAttachment(content, options3 = { delay: 1 }) {
      const { delay } = options3;
      return new Promise((resolve) => {
        setTimeout(() => {
          this.editor.insertAttachment(this.createAttachment(content));
          this.insertNewlines(1, { delay }).finally(resolve);
        }, delay);
      });
    }
    insertHTML(content, options3 = { delay: 1 }) {
      const { delay } = options3;
      return new Promise((resolve) => {
        setTimeout(() => {
          this.editor.insertHTML(content);
          this.insertNewlines(1, { delay }).finally(resolve);
        }, delay);
      });
    }
    insert(content, options3 = { delay: 1, disposition: "attachment" }) {
      let { delay, disposition } = options3;
      if (content == null ? void 0 : content.length) {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (typeof content === "string") {
              return disposition === "inline" ? this.insertHTML(content, { delay }).catch((e) => this.renderError(e)).finally(resolve) : this.insertAttachment(content, { delay }).catch((e) => this.renderError(e)).finally(resolve);
            }
            if (Array.isArray(content)) {
              const promises = disposition === "inline" ? content.map((c) => this.insertHTML(c, { delay: delay + 1 })) : content.map((c) => this.insertAttachment(c, { delay: delay + 1 }));
              return Promise.all(promises).catch((e) => this.renderError(e)).finally(resolve);
            }
            resolve();
          });
        });
      }
      return Promise.resolve();
    }
    get editor() {
      return this.element.editor;
    }
    get toolbarElement() {
      const id = this.element.getAttribute("toolbar");
      let toolbar = id ? document.getElementById(id) : null;
      if (!toolbar) {
        const sibling = this.element.previousElementSibling;
        toolbar = (sibling == null ? void 0 : sibling.tagName.match(/trix-toolbar/i)) ? sibling : null;
      }
      return toolbar;
    }
    get formElement() {
      return this.element.closest("form");
    }
    get inputElement() {
      var _a2;
      const id = this.element.getAttribute("input");
      return id ? (_a2 = this.formElement) == null ? void 0 : _a2.querySelector(`#${id}`) : null;
    }
    get paranoid() {
      return !!this.store.read("paranoid");
    }
    get key() {
      try {
        return JSON.parse(this.store.read("key"))[2];
      } catch (e) {
      }
    }
    get hostsValueDescriptors() {
      return Object.values(this.valueDescriptorMap).filter(
        (descriptor) => descriptor.name.endsWith("HostsValue")
      );
    }
    get reservedDomains() {
      return [
        "embed.example",
        "embed.invalid",
        "embed.local",
        "embed.localhost",
        "embed.test",
        "trix.embed.example",
        "trix.embed.invalid",
        "trix.embed.local",
        "trix.embed.localhost",
        "trix.embed.test",
        "trix.example",
        "trix.invalid",
        "trix.local",
        "trix.localhost",
        "trix.test",
        "www.embed.example",
        "www.embed.invalid",
        "www.embed.local",
        "www.embed.localhost",
        "www.embed.test",
        "www.trix.example",
        "www.trix.invalid",
        "www.trix.local",
        "www.trix.localhost",
        "www.trix.test"
      ];
    }
    rememberConfig() {
      return new Promise(async (resolve) => {
        let fakes;
        const key = await generateKey();
        fakes = await encryptValues(key, sample(this.reservedDomains, 3));
        this.store.write("key", JSON.stringify([fakes[0], fakes[1], key, fakes[2]]));
        if (this.paranoidValue !== false) {
          fakes = await encryptValues(key, sample(this.reservedDomains, 4));
          this.store.write("paranoid", JSON.stringify(fakes));
        }
        this.element.removeAttribute("data-trix-embed-paranoid-value");
        this.hostsValueDescriptors.forEach(async (descriptor) => {
          const { name } = descriptor;
          const property = name.slice(0, name.lastIndexOf("Value"));
          let value = this[name];
          if (value.length < 4)
            value = value.concat(sample(this.reservedDomains, 4 - value.length));
          this.store.write(property, JSON.stringify(await encryptValues(key, value)));
          Object.defineProperty(this, property, {
            get: async () => {
              try {
                const hosts = await decryptValues(this.key, JSON.parse(this.store.read(property)));
                return hosts.filter((host) => !this.reservedDomains.includes(host));
              } catch (error) {
                console.error(`Failed to get '${property}'!`, error);
                return [];
              }
            }
          });
          this.element.removeAttribute(`data-trix-embed-${descriptor.key}`);
        });
        fakes = await encryptValues(key, sample(this.reservedDomains, 4));
        this.store.write("securityHosts", fakes);
        fakes = await encryptValues(key, sample(this.reservedDomains, 4));
        this.store.write("obscurityHosts", fakes);
        resolve();
      });
    }
    forgetConfig() {
      var _a2, _b, _c, _d;
      (_a2 = this.store) == null ? void 0 : _a2.remove("key");
      (_b = this.store) == null ? void 0 : _b.remove("paranoid");
      this.hostsValueDescriptors.forEach(async (descriptor) => {
        var _a3;
        const { name } = descriptor;
        const property = name.slice(0, name.lastIndexOf("Value"));
        (_a3 = this.store) == null ? void 0 : _a3.remove("securityHosts");
      });
      (_c = this.store) == null ? void 0 : _c.remove("securityHosts");
      (_d = this.store) == null ? void 0 : _d.remove("obscurityHosts");
    }
  }, __publicField(_a, "values", {
    // templates
    embeddedTemplate: String,
    // dom id of template to use for EMBEDDED MEDIA info
    errorTemplate: String,
    // dom id of template to use for UNEXPECTED ERRORS
    iframeTemplate: String,
    // dom id of template to use for IFRAME EMBEDS
    imageTemplate: String,
    // dom id of template to use for IMAGE EMBEDS
    linkTemplate: String,
    // dom id of template to use for ALLOWED LINKS
    prohibitedTemplate: String,
    // dom id of template to use for PROHIBITED URLS
    warningTemplate: String,
    // dom id of template to use when invalid embeds are detected
    // security related values
    allowedLinkHosts: Array,
    // list of hosts/domains that links are allowed from
    blockedLinkHosts: Array,
    // list of hosts/domains that links are NOT allowed from
    allowedMediaHosts: Array,
    // list of hosts/domains that media is allowed from
    blockedMediaHosts: Array,
    // list of hosts/domains that media is NOT allowed from
    paranoid: { type: Boolean, default: true }
    // guard against attacks
  }), _a;
}

// app/javascript/index.js
var initialized = false;
var defaultOptions = {
  application: null,
  Controller: null,
  Trix: null
};
function initialize(options2 = defaultOptions) {
  if (initialized)
    return;
  const { application, Controller, Trix } = options2;
  application.register("trix-embed", getTrixEmbedControllerClass({ Controller, Trix }));
  initialized = true;
}
self.TrixEmbed = __spreadProps(__spreadValues({}, metadata_default), {
  encryptValues,
  generateKey,
  generateKeyAndEncryptValues,
  initialize
});
var javascript_default = self.TrixEmbed;
export {
  javascript_default as default
};
