import { fetchFile } from '@ffmpeg/util'
import { getFFmpeg } from './ffmpegLoader'

export interface ConvertOptions {
  quality: number         // 0–100
  lossless: boolean
  preserveAnimation: boolean
}

export interface ConversionResult {
  blobURL: string
  fileName: string
  originalName: string
  sizeBytes: number
  cleanup: () => void
}

export async function convertToWebP(
  file: File,
  opts: ConvertOptions = { quality: 80, lossless: false, preserveAnimation: true }
): Promise<ConversionResult> {
  const ffmpeg = await getFFmpeg()
  const ts = Date.now()
  const ext = file.name.split('.').pop() ?? 'img'
  const inputName  = `in_${ts}.${ext}`
  const outputName = `out_${ts}.webp`

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file))
    await ffmpeg.exec(buildArgs(inputName, outputName, opts))

    const data = await ffmpeg.readFile(outputName) as Uint8Array
    const blob = new Blob([data], { type: 'image/webp' })
    const blobURL = URL.createObjectURL(blob)

    return {
      blobURL,
      fileName: file.name.replace(/\.[^.]+$/, '.webp'),
      originalName: file.name,
      sizeBytes: blob.size,
      cleanup: () => URL.revokeObjectURL(blobURL),
    }
  } finally {
    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile(outputName).catch(() => {})
  }
}

function buildArgs(input: string, output: string, opts: ConvertOptions): string[] {
  const args = ['-i', input]

  if (opts.preserveAnimation) args.push('-loop', '0')
  if (opts.lossless) {
    args.push('-lossless', '1')
  } else {
    args.push('-q:v', String(opts.quality))
  }

  args.push('-pix_fmt', 'yuva420p', output)
  return args
}
