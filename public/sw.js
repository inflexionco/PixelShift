// Service Worker — caches Wasm binary after first load for offline use
// User images are NEVER cached here

const CACHE_NAME = 'pixelshift-wasm-v1'
const WASM_URLS = [
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(WASM_URLS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', (event) => {
  // Only intercept Wasm CDN requests — never intercept blob: or local requests
  if (WASM_URLS.some((url) => event.request.url.startsWith(url.split('/esm/')[0]))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
  }
})
