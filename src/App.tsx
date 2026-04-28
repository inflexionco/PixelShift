import { useConverter } from './hooks/useConverter'
import DropZone from './components/DropZone'
import QualitySlider from './components/QualitySlider'
import DownloadList from './components/DownloadList'
import { useState } from 'react'
import type { ConvertOptions } from './core/converter'

export default function App() {
  const { convert, removeResult, status, results, error } = useConverter()
  const [opts, setOpts] = useState<ConvertOptions>({
    format: 'webp',
    quality: 80,
    lossless: false,
    preserveAnimation: true,
  })

  // convert() clears previous results internally before starting
  const handleFiles = (files: File[]) => convert(files, opts)

  return (
    <div className="app">
      <header>
        <h1>PixelShift</h1>
        <p className="tagline">
          <span>100% private</span>
          <span>no uploads</span>
          <span>WebAssembly powered</span>
        </p>
      </header>

      <main style={{ display: 'contents' }}>
        <QualitySlider opts={opts} onChange={setOpts} />
        <DropZone onFiles={handleFiles} disabled={status === 'loading'} />

        {status === 'loading' && (
          <p className="status">
            <span className="spinner" />
            Converting…
          </p>
        )}
        {status === 'error' && (
          <p className="status error">{error}</p>
        )}

        <DownloadList results={results} onRemove={removeResult} />
      </main>
    </div>
  )
}
