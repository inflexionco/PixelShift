// Service Worker — caches self-hosted Wasm binary after first load for offline use
// User images are NEVER cached here

const CACHE_NAME = 'pixelshift-wasm-v2'
const WASM_FILES = [
  '/wasm/ffmpeg-core.js',
  '/wasm/ffmpeg-core.wasm',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(WASM_FILES))
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
  if (WASM_FILES.some((path) => event.request.url.endsWith(path))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
  }
})
