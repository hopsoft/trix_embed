const defaults = {
  header: `<h1></h1>`,
  iframe: `<iframe></iframe>`,
  image: `<img></img>`,

  error: `
    <div>
      <h1>Copy / Paste</h1>
      <h3>The pasted content includes media from unsupported hosts / domains.</h3>

      <h2>Prohibited Hosts / Domains</h2>
      <ul data-list="hosts"></ul>

      <h2>Allowed Hosts / Domains</h2>
      <ul data-list="allowed-hosts"></ul>
    </div>
  `
}

export function getTemplate(name) {
  const template = document.createElement('template')
  template.innerHTML = defaults[name]
  return template
}
