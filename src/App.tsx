import { useConverter } from './hooks/useConverter'
import DropZone from './components/DropZone'
import QualitySlider from './components/QualitySlider'
import DownloadList from './components/DownloadList'
import { useState } from 'react'
import type { ConvertOptions } from './core/converter'
import { getAvailableFormatsForBatch } from './core/fileUtils'

export default function App() {
  const { convert, removeResult, status, results, error } = useConverter()

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [opts, setOpts] = useState<ConvertOptions>({
    format: 'webp',
    quality: 80,
    lossless: false,
    preserveAnimation: true,
  })

  const availableFormats = getAvailableFormatsForBatch(pendingFiles)

  const handleFiles = (files: File[]) => {
    const formats = getAvailableFormatsForBatch(files)
    setPendingFiles(files)

    // If the currently selected format isn't valid for the new files, switch to first available
    const nextFormat = formats.includes(opts.format) ? opts.format : formats[0]
    const nextOpts = { ...opts, format: nextFormat }
    setOpts(nextOpts)
    convert(files, nextOpts)
  }

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
        <QualitySlider
          opts={opts}
          onChange={setOpts}
          availableFormats={availableFormats}
        />
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
