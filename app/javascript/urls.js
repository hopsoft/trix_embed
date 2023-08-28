// Creates a URL object from a value and yields the result
//
// @param {String} value - Value to convert to a URL (coerced to a string)
// @param {Function} callback - Function to be called with the URL object
// @returns {URL, null} URL object
//
export function createURLObject(value, callback = url => {}) {
  try {
    const url = new URL(String(value).trim())
    if (url && callback) callback(url)
    return url
  } catch (_error) {
    console.info(`Failed to parse URL! value='${value}']`)
  }
  return null
}

// Creates a URL host from a value and yields the result
//
// @param {String} value - Value to convert to a URL host (coerced to a string)
// @param {Function} callback - Function to be called with the URL host
// @returns {String, null} URL host
//
function extractURLHost(value, callback = host => {}) {
  let host = createURLObject(value)?.host
  if (host && callback) callback(host)
  return host
}

export function createURLTextNodeTreeWalker(element) {
  return document.createTreeWalker(element, NodeFilter.SHOW_TEXT, node => {
    return node.nodeValue.match(/http/gi) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  })
}

function extractURLsFromTextNodes(element) {
  const urls = new Set()
  const walker = createURLTextNodeTreeWalker(element)

  let node
  while ((node = walker.nextNode()))
    node.nodeValue
      .split(/\s+/)
      .filter(val => val.startsWith('http'))
      .forEach(match => createURLObject(match, url => urls.add(url.href)))

  return [...urls]
}

export function extractURLFromElement(element) {
  if (element.src) {
    const url = element.src.trim()
    if (url.length) return url
  }

  if (element.href) {
    const url = element.href.trim()
    if (url.length) return url
  }

  return ''
}

function extractURLsFromElementNodes(element) {
  const urls = new Set()

  if (element.src) createURLObject(element.src, url => urls.add(url.href))
  if (element.href) createURLObject(element.href, url => urls.add(url.href))

  const elements = element.querySelectorAll('[src], [href]')
  elements.forEach(el => createURLObject(extractURLFromElement(el), u => urls.add(u.href)))

  return [...urls]
}

export function validateURL(value, allowedHosts = [], blockedHosts = []) {
  const host = extractURLHost(value)

  if (blockedHosts.includes('*')) return false
  if (blockedHosts.find(blockedHosts => host.endsWith(blockedHosts))) return false
  if (allowedHosts.find(allowedHosts => host.endsWith(allowedHosts))) return true

  if (allowedHosts.includes('*')) {
    if (host) return true
    if (value.startsWith('data:')) return true
    if (value.startsWith('news:')) return true
    if (value.startsWith('tel:')) return true
  }

  return false
}

export function extractURLHosts(values) {
  return [
    ...values.reduce((hosts, value) => {
      extractURLHost(value, host => hosts.add(host))
      return hosts
    }, new Set())
  ]
}

// Extracts all URLs from an HTML element (all inclusive i.e. elements and text nodes)
//
// @param {HTMLElement} element - HTML element
// @returns {String[]} list of unique URLs
//
export function extractURLs(element) {
  const elementURLs = extractURLsFromElementNodes(element)
  const textNodeURLs = extractURLsFromTextNodes(element)
  const uniqueURLs = new Set([...elementURLs, ...textNodeURLs])
  return [...uniqueURLs]
}
