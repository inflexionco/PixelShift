import { useConverter } from './hooks/useConverter'
import DropZone from './components/DropZone'
import QualitySlider from './components/QualitySlider'
import DownloadList from './components/DownloadList'
import { useState } from 'react'
import type { ConvertOptions } from './core/converter'

export default function App() {
  const { convert, reset, status, results, error } = useConverter()
  const [opts, setOpts] = useState<ConvertOptions>({
    quality: 80,
    lossless: false,
    preserveAnimation: true,
  })

  const handleFiles = (files: File[]) => {
    reset()
    convert(files, opts)
  }

  return (
    <div className="app">
      <header>
        <h1>PixelShift</h1>
        <p className="tagline">100% private · no uploads · WebAssembly powered</p>
      </header>

      <main>
        <QualitySlider opts={opts} onChange={setOpts} />
        <DropZone onFiles={handleFiles} disabled={status === 'loading'} />

        {status === 'loading' && <p className="status">Converting...</p>}
        {status === 'error'   && <p className="status error">{error}</p>}

        <DownloadList results={results} />
      </main>
    </div>
  )
}
