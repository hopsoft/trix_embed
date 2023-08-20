const defaults = {
  iframe: `<div><iframe></iframe></div>`,
  image: `<div><img></img></div>`,

  warning: `
    <div>
      <h1>Copy/Paste Warning</h1>
      <hr>
      <h3>The pasted content includes media from unsupported hosts.</h3>
      <h2>Prohibited Hosts</h2>
      <ul data-list="prohibited-hosts">
        <li>Media is only supported from allowed hosts.</li>
      </ul>
      <h2>Allowed Hosts</h2>
      <ul data-list="allowed-hosts">
        <li>Allowed hosts not configured.</li>
      </ul>
    </div>
  `,

  error: `
    <div style='background-color:lightyellow; color:red; border:solid 1px red; padding:20px;'>
      <h1>Unhandled Exception!</h1>
      <p>Show a programmer the message below.</p>
      <pre style="background-color:darkslategray; color:whitesmoke; padding:10px;"><code></code></pre>
    </div>
  `
}

export function getTemplate(name) {
  const template = document.createElement('template')
  template.innerHTML = defaults[name]
  return template
}
