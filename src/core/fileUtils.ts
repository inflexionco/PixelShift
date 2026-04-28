export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/tiff',
  'image/bmp',
  'image/avif',
  'image/heic',
]

export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/mpeg',
  'video/ogg',
]

export const SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_IMAGE_MIME_TYPES,
  ...SUPPORTED_VIDEO_MIME_TYPES,
]

export function isSupportedFile(file: File): boolean {
  return SUPPORTED_MIME_TYPES.includes(file.type) ||
    /\.(jpe?g|png|gif|tiff?|bmp|avif|heic|mp4|mov|avi|mkv|webm|mpg|mpeg|ogv)$/i.test(file.name)
}

export function isVideoFile(file: File): boolean {
  return SUPPORTED_VIDEO_MIME_TYPES.includes(file.type) ||
    /\.(mp4|mov|avi|mkv|webm|mpg|mpeg|ogv)$/i.test(file.name)
}

/**
 * Returns the output formats a given file can be converted to.
 * Images → image formats only. Videos → video formats only.
 * This drives the format selector in the UI dynamically.
 */
export function getAvailableFormats(file: File): import('./converter').OutputFormat[] {
  if (isVideoFile(file)) return ['webm', 'mp4']
  return ['webp', 'png', 'jpg', 'gif']
}

/**
 * When a batch of files is selected, returns the intersection of
 * available formats across all files (only formats every file supports).
 */
export function getAvailableFormatsForBatch(files: File[]): import('./converter').OutputFormat[] {
  if (!files.length) return []
  const sets = files.map(f => getAvailableFormats(f))
  return sets[0].filter(fmt => sets.every(s => s.includes(fmt)))
}

export function triggerDownload(blobURL: string, fileName: string): void {
  const a = Object.assign(document.createElement('a'), {
    href: blobURL,
    download: fileName,
    style: 'display:none',
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(blobURL), 10_000)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`
}
