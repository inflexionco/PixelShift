import { fetchFile } from '@ffmpeg/util'
import { getFFmpeg } from './ffmpegLoader'

export type OutputFormat = 'webp' | 'webm' | 'mp4' | 'gif' | 'png' | 'jpg'

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
  mp4:  'video/mp4',
  gif:  'image/gif',
  png:  'image/png',
  jpg:  'image/jpeg',
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

  switch (opts.format) {
    case 'webp':
      if (opts.preserveAnimation) args.push('-loop', '0')
      if (opts.lossless) {
        args.push('-lossless', '1')
      } else {
        args.push('-q:v', String(opts.quality))
      }
      args.push('-pix_fmt', 'yuva420p')
      break

    case 'webm': {
      // VP9 + Opus; CRF 0–63 inverted from quality 0–100
      const crf = Math.round(63 - (opts.quality / 100) * 63)
      args.push('-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0', '-c:a', 'libopus', '-b:a', '128k')
      break
    }

    case 'mp4': {
      // H.264 + AAC; CRF 0–51 inverted from quality 0–100
      const crf = Math.round(51 - (opts.quality / 100) * 51)
      args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast', '-c:a', 'aac', '-b:a', '128k')
      break
    }

    case 'gif':
      // Palette-based GIF for better quality
      args.push('-vf', 'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', '-loop', '0')
      break

    case 'png':
      // PNG is lossless; compression level 0–9 inverted from quality
      args.push('-compression_level', String(Math.round(9 - (opts.quality / 100) * 9)))
      break

    case 'jpg':
      // JPEG quality 1–31 in ffmpeg is inverted (1=best); map 0–100 → 31–1
      args.push('-q:v', String(Math.max(1, Math.round(31 - (opts.quality / 100) * 30))))
      break
  }

  args.push(output)
  return args
}
