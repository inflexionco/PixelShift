import type { ConvertOptions } from '../core/converter'

interface Props {
  opts: ConvertOptions
  onChange: (opts: ConvertOptions) => void
}

export default function QualitySlider({ opts, onChange }: Props) {
  return (
    <div className="options">
      <label>
        Quality: <strong>{opts.lossless ? 'Lossless' : opts.quality}</strong>
        <input
          type="range"
          min={1}
          max={100}
          value={opts.quality}
          disabled={opts.lossless}
          onChange={e => onChange({ ...opts, quality: Number(e.target.value) })}
        />
      </label>
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
    </div>
  )
}
