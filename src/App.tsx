import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SysFooter from './components/SysFooter'
import PageFooter from './components/PageFooter'
import DropZone from './components/DropZone'
import QualitySlider from './components/QualitySlider'
import DownloadList from './components/DownloadList'
import BatchPage from './pages/BatchPage'
import HistoryPage from './pages/HistoryPage'
import { useConverter } from './hooks/useConverter'
import type { ConvertOptions } from './core/converter'
import { getAvailableFormatsForBatch } from './core/fileUtils'
import { appendEntry } from './core/history'

function ConvertPage() {
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
    const nextFormat = formats.includes(opts.format) ? opts.format : formats[0]
    setOpts(prev => ({ ...prev, format: nextFormat }))
  }

  const handleConvert = () => {
    if (!pendingFiles.length || status === 'loading') return
    convert(pendingFiles, opts)
  }

  // Log to history once when a batch of conversions finishes
  const loggedRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (status !== 'done') return
    results.forEach(r => {
      if (loggedRef.current.has(r.blobURL)) return
      loggedRef.current.add(r.blobURL)
      appendEntry({
        originalName: r.originalName,
        outputName: r.fileName,
        originalSize: pendingFiles.find(f => f.name === r.originalName)?.size ?? 0,
        outputSize: r.sizeBytes,
        format: r.format,
        source: 'convert',
      })
    })
  }, [status, results, pendingFiles])

  return (
    <div className="page">
      <div className="converter-card">
        <DropZone
          files={pendingFiles}
          onFiles={handleFiles}
          disabled={status === 'loading'}
        />

        <QualitySlider
          opts={opts}
          onChange={setOpts}
          availableFormats={availableFormats}
        />

        <div className="convert-btn-wrap">
          <button
            className="convert-btn"
            onClick={handleConvert}
            disabled={!pendingFiles.length || status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <span className="spinner" />
                CONVERTING…
              </>
            ) : (
              'EXECUTE CONVERSION'
            )}
          </button>
        </div>

        <SysFooter />

        {status === 'error' && error && (
          <div className="status-bar error">
            <span className="status-bar-dot" />
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="results-wrap">
            <div className="results-header">
              <span className="results-label">OUTPUT</span>
              <span className="results-count">{results.length} FILE{results.length > 1 ? 'S' : ''}</span>
            </div>
            <DownloadList results={results} onRemove={removeResult} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<ConvertPage />} />
        <Route path="/batch" element={<BatchPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
      <PageFooter />
    </div>
  )
}
