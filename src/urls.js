function createURL(value, callback) {
  try {
    callback(new URL(String(value).trim()))
  } catch (error) {
    console.error(`Error parsing URL!`, value, error)
  }
}

function createURLHost(value, callback) {
  createURL(value, url => callback(url.host))
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

export function extractURLs(element) {
  const elementURLs = extractURLsFromElements(element)
  const textNodeURLs = extractURLsFromTextNodes(element)
  const uniqueURLs = new Set([...elementURLs, ...textNodeURLs])
  return [...uniqueURLs]
}
