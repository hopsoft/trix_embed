function createURL(value, callback) {
  try {
    const url = new URL(String(value).trim())
    callback(url.href)
  } catch (error) {
    console.error(`Error parsing URL!`, value, error)
  }
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
          if (!urls.includes(url)) urls.push(url)
        })
      )

  return urls
}

function extractURLsFromElements(element) {
  const urls = []

  if (element.src) createURL(element.src, url => urls.push(url))
  if (element.href)
    createURL(element.href, url => {
      if (!urls.includes(url)) urls.push(url)
    })

  const elements = element.querySelectorAll('[src], [href]')
  elements.forEach(el => {
    createURL(el.src || el.href, url => {
      if (!urls.includes(url)) urls.push(url)
    })
  })

  return urls
}

export function extractURLs(element) {
  const elementURLs = extractURLsFromElements(element)
  const textNodeURLs = extractURLsFromTextNodes(element)
  const uniqueURLs = new Set([...elementURLs, ...textNodeURLs])
  return [...uniqueURLs]
}
