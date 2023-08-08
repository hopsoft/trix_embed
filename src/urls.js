// Creates a URL object from a value and yields the result
//
// @param {String} value - Value to convert to a URL (coerced to a string)
// @param {Function} callback - Function to be called with the URL object
// @returns {URL, null} URL object
//
export function createURL(value, callback = url => {}) {
  try {
    const url = new URL(String(value).trim())
    if (callback) callback(url)
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
function createURLHost(value, callback = host => {}) {
  let host = null
  createURL(value, url => (host = url.host))
  if (host && callback) callback(host)
  return host
}

function extractURLsFromTextNodes(element) {
  const urls = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, node => {
    const value = node.nodeValue
    if (!value.includes('http')) return NodeFilter.FILTER_REJECT
    return NodeFilter.FILTER_ACCEPT
  })

  let node
  while ((node = walker.nextNode()))
    node.nodeValue
      .split(/\s+/)
      .filter(val => val.startsWith('http'))
      .forEach(match =>
        createURL(match, url => {
          if (!urls.includes(url.href)) urls.push(url.href)
        })
      )

  return urls
}

function extractURLsFromElements(element) {
  const urls = []

  if (element.src) createURL(element.src, url => urls.push(url.href))
  if (element.href)
    createURL(element.href, url => {
      if (!urls.includes(url.href)) urls.push(url.href)
    })

  const elements = element.querySelectorAll('[src], [href]')
  elements.forEach(el => {
    createURL(el.src || el.href, url => {
      if (!urls.includes(url.href)) urls.push(url.href)
    })
  })

  return urls
}

export function validateURL(value, allowedHosts = []) {
  let valid = false
  createURLHost(value, host => (valid = !!allowedHosts.find(allowedHost => host.includes(allowedHost))))
  return valid
}

export function extractURLHosts(values) {
  return values.reduce((hosts, value) => {
    createURLHost(value, host => {
      if (!hosts.includes(host)) hosts.push(host)
    })
    return hosts
  }, [])
}

// Extracts all URLs from an HTML element (all inclusive i.e. elements and text nodes)
//
// @param {HTMLElement} element - HTML element
// @returns {String[]} list of unique URLs
//
export function extractURLsFromElement(element) {
  const elementURLs = extractURLsFromElements(element)
  const textNodeURLs = extractURLsFromTextNodes(element)
  const uniqueURLs = new Set([...elementURLs, ...textNodeURLs])
  return [...uniqueURLs]
}
