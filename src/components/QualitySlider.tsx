import type { ConvertOptions, OutputFormat } from '../core/converter'

interface Props {
  opts: ConvertOptions
  onChange: (opts: ConvertOptions) => void
}

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'webp', label: 'WebP' },
  { value: 'webm', label: 'WebM' },
]

export default function QualitySlider({ opts, onChange }: Props) {
  const isWebP = opts.format === 'webp'

  return (
    <div className="options">
      <label className="format-toggle">
        Output:
        <div className="format-buttons">
          {FORMATS.map(f => (
            <button
              key={f.value}
              className={`format-btn ${opts.format === f.value ? 'active' : ''}`}
              onClick={() => onChange({ ...opts, format: f.value })}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </label>

      <label>
        Quality: <strong>{opts.lossless ? 'Lossless' : opts.quality}</strong>
        <input
          type="range"
          min={1}
          max={100}
          value={opts.quality}
          disabled={opts.lossless && isWebP}
          onChange={e => onChange({ ...opts, quality: Number(e.target.value) })}
        />
      </label>

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
    </div>
  )
}
