import type { ConvertOptions, OutputFormat } from '../core/converter'
import { IMAGE_FORMATS, VIDEO_FORMATS } from '../core/converter'

interface Props {
  opts: ConvertOptions
  onChange: (opts: ConvertOptions) => void
}

const FORMAT_LABELS: Record<OutputFormat, string> = {
  webp: 'WebP', png: 'PNG', jpg: 'JPG', gif: 'GIF',
  webm: 'WebM', mp4: 'MP4',
}

export default function QualitySlider({ opts, onChange }: Props) {
  const isWebP    = opts.format === 'webp'
  const isLossless = opts.format === 'png'  // PNG is always lossless
  const isVideo   = VIDEO_FORMATS.includes(opts.format)

  return (
    <div className="options">

      <div className="format-group">
        <span className="format-group-label">Image</span>
        <div className="format-buttons">
          {IMAGE_FORMATS.map(f => (
            <button
              key={f}
              type="button"
              className={`format-btn ${opts.format === f ? 'active' : ''}`}
              onClick={() => onChange({ ...opts, format: f })}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="format-group">
        <span className="format-group-label">Video</span>
        <div className="format-buttons">
          {VIDEO_FORMATS.map(f => (
            <button
              key={f}
              type="button"
              className={`format-btn ${opts.format === f ? 'active' : ''}`}
              onClick={() => onChange({ ...opts, format: f })}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {!isLossless && (
        <label>
          Quality: <strong>{isWebP && opts.lossless ? 'Lossless' : opts.quality}</strong>
          <input
            type="range"
            min={1}
            max={100}
            value={opts.quality}
            disabled={isWebP && opts.lossless}
            onChange={e => onChange({ ...opts, quality: Number(e.target.value) })}
          />
        </label>
      )}

      {isWebP && (
        <>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={opts.lossless}
              onChange={e => onChange({ ...opts, lossless: e.target.checked })}
            />
            Lossless
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={opts.preserveAnimation}
              onChange={e => onChange({ ...opts, preserveAnimation: e.target.checked })}
            />
            Preserve animation
          </label>
        </>
      )}

      {isVideo && (
        <p className="format-note">
          {opts.format === 'mp4' ? 'H.264 + AAC' : 'VP9 + Opus'} · Quality controls bitrate via CRF
        </p>
      )}

    </div>
  )
}
