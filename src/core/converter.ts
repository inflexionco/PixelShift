import { fetchFile } from '@ffmpeg/util'
import { getFFmpeg } from './ffmpegLoader'

export type OutputFormat = 'webp' | 'webm'

export interface ConvertOptions {
  format: OutputFormat
  quality: number         // 0–100
  lossless: boolean
  preserveAnimation: boolean
}

export interface ConversionResult {
  blobURL: string
  fileName: string
  originalName: string
  sizeBytes: number
  format: OutputFormat
  cleanup: () => void
}

const FORMAT_MIME: Record<OutputFormat, string> = {
  webp: 'image/webp',
  webm: 'video/webm',
}

export async function convertFile(
  file: File,
  opts: ConvertOptions = { format: 'webp', quality: 80, lossless: false, preserveAnimation: true }
): Promise<ConversionResult> {
  const ffmpeg = await getFFmpeg()
  const ts = Date.now()
  const ext = file.name.split('.').pop() ?? 'bin'
  const inputName  = `in_${ts}.${ext}`
  const outputName = `out_${ts}.${opts.format}`

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file))
    await ffmpeg.exec(buildArgs(inputName, outputName, opts))

    const data = await ffmpeg.readFile(outputName) as Uint8Array
    const blob = new Blob([data], { type: FORMAT_MIME[opts.format] })
    const blobURL = URL.createObjectURL(blob)

    return {
      blobURL,
      fileName: file.name.replace(/\.[^.]+$/, `.${opts.format}`),
      originalName: file.name,
      sizeBytes: blob.size,
      format: opts.format,
      cleanup: () => URL.revokeObjectURL(blobURL),
    }
  } finally {
    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile(outputName).catch(() => {})
  }
}

function buildArgs(input: string, output: string, opts: ConvertOptions): string[] {
  const args = ['-i', input]

  if (opts.format === 'webp') {
    if (opts.preserveAnimation) args.push('-loop', '0')
    if (opts.lossless) {
      args.push('-lossless', '1')
    } else {
      args.push('-q:v', String(opts.quality))
    }
    args.push('-pix_fmt', 'yuva420p')
  } else {
    // WebM: VP9 video codec + Opus audio
    // CRF range 0–63; map quality 0–100 → CRF 63–0 (inverted)
    const crf = Math.round(63 - (opts.quality / 100) * 63)
    args.push(
      '-c:v', 'libvpx-vp9',
      '-crf', String(crf),
      '-b:v', '0',          // constant quality mode (CRF-only, no bitrate cap)
      '-c:a', 'libopus',
      '-b:a', '128k',
    )
  }

  args.push(output)
  return args
}
