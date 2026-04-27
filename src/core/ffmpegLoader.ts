import { FFmpeg } from '@ffmpeg/ffmpeg'

let instance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

export async function getFFmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return instance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()

    // Use new URL() to construct absolute URLs pointing to public/wasm/
    // This bypasses Vite's module resolver — public/ files must be
    // referenced via URL, never imported through the module graph.
    const base = new URL('/wasm/', window.location.origin)

    await ffmpeg.load({
      coreURL: new URL('ffmpeg-core.js',   base).href,
      wasmURL: new URL('ffmpeg-core.wasm', base).href,
    })

    instance = ffmpeg
    return ffmpeg
  })()

  return loadPromise
}
