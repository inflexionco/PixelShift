import type { ConvertOptions, OutputFormat } from '../core/converter'

interface Props {
  opts: ConvertOptions
  onChange: (opts: ConvertOptions) => void
  availableFormats: OutputFormat[]
}

const FORMAT_LABELS: Record<OutputFormat, string> = {
  webp: 'WebP', png: 'PNG', jpg: 'JPG', gif: 'GIF',
  webm: 'WebM', mp4: 'MP4',
}

const VIDEO_FORMATS: OutputFormat[] = ['webm', 'mp4']

export default function QualitySlider({ opts, onChange, availableFormats }: Props) {
  const isWebP     = opts.format === 'webp'
  const isPNG      = opts.format === 'png'
  const isVideo    = VIDEO_FORMATS.includes(opts.format)
  const noFormats  = availableFormats.length === 0

  return (
    <div className="options">

      <div className="format-group">
        <span className="format-group-label">Convert to</span>
        <div className="format-buttons">
          {noFormats ? (
            <span className="format-placeholder">Select a file first</span>
          ) : (
            availableFormats.map(f => (
              <button
                key={f}
                type="button"
                className={`format-btn ${opts.format === f ? 'active' : ''}`}
                onClick={() => onChange({ ...opts, format: f })}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))
          )}
        </div>
      </div>

      {!isPNG && !noFormats && (
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

      {isPNG && (
        <p className="format-note">PNG is lossless — no quality setting needed</p>
      )}

    </div>
  )
}
