const defaults = {
  header: `<div><h1></h1><hr></div>`,
  iframe: `<div><iframe></iframe></div>`,
  image: `<div><img></img></div>`,

  error: `
    <div>
      <h1>Copy/Paste Info</h1>
      <hr>
      <br>
      <h3>The pasted content includes media from unsupported hosts.</h3>
      <br>
      <h2>Prohibited Hosts / Domains</h2>
      <ul data-list="prohibited-hosts">
        <li>Media is only supported from allowed hosts.</li>
      </ul>
      <br>
      <h2>Allowed Hosts / Domains</h2>
      <ul data-list="allowed-hosts">
        <li>Allowed hosts not configured.</li>
      </ul>
    </div>
  `,

  exception: `
    <div style='background-color:lightyellow; color:red; border:solid 1px red; padding:20px;'>
      <h1>Unhandled Exception!</h1>
      <br>
      <p>Show a programmer the message below.</p>
      <br>
      <pre style="background-color:darkslategray; color:whitesmoke; padding:10px;"><code></code></pre>
    </div>
  `
}

export function getTemplate(name) {
  const template = document.createElement('template')
  template.innerHTML = defaults[name]
  return template
}
