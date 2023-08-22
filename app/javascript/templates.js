export default {
  // inline templates ........................................................................................
  anchor: `<a href='{{url}}'>{{label}}</a>`,

  embedded: `<span>{{label}}</span>`,

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
}
