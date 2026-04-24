import { FFmpeg } from '@ffmpeg/ffmpeg'

let instance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

export async function getFFmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return instance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()

    // Load from self-hosted /wasm/ — no CDN, no CORP issues, fully private
    await ffmpeg.load({
      coreURL: '/wasm/ffmpeg-core.js',
      wasmURL: '/wasm/ffmpeg-core.wasm',
    })

    instance = ffmpeg
    return ffmpeg
  })()

  return loadPromise
}
