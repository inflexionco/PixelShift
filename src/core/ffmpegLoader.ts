import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let instance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

const BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

export async function getFFmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return instance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()

    await ffmpeg.load({
      coreURL:   await toBlobURL(`${BASE_URL}/ffmpeg-core.js`,        'text/javascript'),
      wasmURL:   await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`,      'application/wasm'),
      workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript'),
    })

    instance = ffmpeg
    return ffmpeg
  })()

  return loadPromise
}
