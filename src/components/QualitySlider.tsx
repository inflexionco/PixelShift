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
  const isWebP    = opts.format === 'webp'
  const isPNG     = opts.format === 'png'
  const isVideo   = VIDEO_FORMATS.includes(opts.format)
  const noFormats = availableFormats.length === 0

  // Compute CRF label for display
  const crfLabel = isVideo
    ? opts.format === 'mp4'
      ? `CRF ${Math.round(51 - (opts.quality / 100) * 51)}`
      : `CRF ${Math.round(63 - (opts.quality / 100) * 63)}`
    : `${opts.lossless && isWebP ? '100' : opts.quality}%`

  return (
    <div className="options-panel">

      {/* TARGET FORMAT */}
      <div className="opt-group">
        <span className="opt-label">Target Format</span>
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
        {isVideo && (
          <p className="format-note">
            {opts.format === 'mp4' ? 'H.264 + AAC' : 'VP9 + Opus'}
          </p>
        )}
        {isPNG && (
          <p className="format-note">Lossless — no quality setting</p>
        )}
      </div>

      {/* OUTPUT QUALITY */}
      <div className="opt-group">
        <div className="opt-label-row">
          <span className="opt-label">Output Quality</span>
          <span className="opt-value">{crfLabel}</span>
        </div>

        {!isPNG && !noFormats ? (
          <>
            <input
              type="range"
              className="quality-slider"
              min={1}
              max={100}
              value={opts.quality}
              disabled={isWebP && opts.lossless}
              onChange={e => onChange({ ...opts, quality: Number(e.target.value) })}
            />
            <div className="slider-labels">
              <span className="slider-label">{isVideo ? 'Fast / Low' : 'Low'}</span>
              <span className="slider-label">{isVideo ? 'Slow / Lossless' : 'High'}</span>
            </div>
          </>
        ) : (
          <div style={{ height: '2px', background: 'var(--border)', borderRadius: '1px', opacity: 0.3 }} />
        )}

        {isWebP && (
          <div className="opt-checks">
            <label className="opt-check">
              <input
                type="checkbox"
                checked={opts.lossless}
                onChange={e => onChange({ ...opts, lossless: e.target.checked })}
              />
              Lossless
            </label>
            <label className="opt-check">
              <input
                type="checkbox"
                checked={opts.preserveAnimation}
                onChange={e => onChange({ ...opts, preserveAnimation: e.target.checked })}
              />
              Preserve animation
            </label>
          </div>
        )}
      </div>

    </div>
  )
}
