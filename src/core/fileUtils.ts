export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/tiff',
  'image/bmp',
  'image/avif',
  'image/heic',
]

export function isSupportedFile(file: File): boolean {
  return SUPPORTED_MIME_TYPES.includes(file.type) ||
    /\.(jpe?g|png|gif|tiff?|bmp|avif|heic)$/i.test(file.name)
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
