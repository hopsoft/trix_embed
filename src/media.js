const audioMediaTypes = {
  mp3: 'audio/mpeg', // MP3 audio format
  ogg: 'audio/ogg', // OGG audio format
  wav: 'audio/wav' // WAV audio format
}

const imageMediaTypes = {
  avif: 'image/avif', // AVIF image format
  bmp: 'image/bmp', // BMP image format
  gif: 'image/gif', // GIF image format
  heic: 'image/heic', // HEIC image format
  heif: 'image/heif', // HEIF image format
  ico: 'image/x-icon', // ICO image format
  jp2: 'image/jp2', // JPEG 2000 image format
  jpeg: 'image/jpeg', // JPEG image format
  jpg: 'image/jpeg', // JPEG image format (alternative extension)
  jxr: 'image/vnd.ms-photo', // JPEG XR image format
  png: 'image/png', // PNG image format
  svg: 'image/svg+xml', // SVG image format
  tif: 'image/tiff', // TIFF image format
  tiff: 'image/tiff', // TIFF image format (alternative extension)
  webp: 'image/webp' // WebP image format
}

const videoMediaTypes = {
  mp4: 'video/mp4', // MP4 video format
  ogv: 'video/ogg', // OGG video format
  webm: 'video/webm' // WebM video format
}

// TODO: Expand to all media types once proper templates are implemented
const mediaTypes = imageMediaTypes

const tagsWithHrefAttribute = [
  'animate', // SVG: Animation
  'animateMotion', // SVG: Animation
  'animateTransform', // SVG: Animation
  'area', // HTML: Image map area
  'audio', // HTML: Audio content
  'base', // HTML: Base URL
  'embed', // HTML: Embedded content
  'feDisplacementMap', // SVG: Filter primitive
  'feImage', // SVG: Filter primitive
  'feTile', // SVG: Filter primitive
  'filter', // SVG: Filter container
  'font-face-uri', // SVG: Font reference
  'iframe', // HTML: Inline frame
  'image', // SVG: Image
  'link', // HTML: External resources (e.g., stylesheets)
  'object', // HTML: Embedded content (fallback for non-HTML5 browsers)
  'script', // HTML: External scripts
  'source', // HTML: Media source
  'track', // HTML: Text tracks for media elements
  'use', // SVG: Reuse shapes from other documents
  'video' // HTML: Video content
]

const tagsWithSrcAttribute = [
  'audio', // HTML: Audio content
  'embed', // HTML: Embedded content
  'iframe', // HTML: Inline frame
  'img', // HTML: Images
  'input', // HTML: Input elements with type="image"
  'script', // HTML: External scripts
  'source', // HTML: Media source
  'track', // HTML: Text tracks for media elements
  'video', // HTML: Video content
  'frame', // HTML: Deprecated (use iframe instead)
  'frameset', // HTML: Deprecated (use iframe instead)
  'object', // HTML: Embedded content
  'picture', // HTML: Responsive images
  'use' // SVG: Reuse shapes from other documents
]

export const mediaTags = tagsWithHrefAttribute.concat(tagsWithSrcAttribute)

export function getMediaType(url) {
  try {
    url = new URL(url)

    const index = url.pathname.lastIndexOf('.')
    if (!index) return null

    const extension = url.pathname.substring(index + 1)
    return mediaTypes[extension]
  } catch (error) {
    console.error('Failed to detect media type!', url, error)
  }
}
