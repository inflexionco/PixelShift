import { useState, useCallback } from 'react'
import DropZone from '../components/DropZone'
import SysFooter from '../components/SysFooter'
import type { ConvertOptions, OutputFormat } from '../core/converter'
import { getAvailableFormats, formatBytes, triggerDownload } from '../core/fileUtils'
import { convertFile } from '../core/converter'
import { appendEntry } from '../core/history'

interface QueueItem {
  file: File
  format: OutputFormat
  status: 'pending' | 'running' | 'done' | 'error'
  outputURL?: string
  outputName?: string
  outputSize?: number
  error?: string
}

const FORMAT_LABELS: Record<OutputFormat, string> = {
  webp: 'WebP', png: 'PNG', jpg: 'JPG', gif: 'GIF', webm: 'WebM', mp4: 'MP4',
}

export default function BatchPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [running, setRunning] = useState(false)

  const handleFiles = useCallback((files: File[]) => {
    const incoming: QueueItem[] = files.map(file => ({
      file,
      format: getAvailableFormats(file)[0],
      status: 'pending',
    }))
    setQueue(prev => [...prev, ...incoming])
  }, [])

  const setFormat = (index: number, format: OutputFormat) => {
    setQueue(prev => prev.map((item, i) => i === index ? { ...item, format } : item))
  }

  const removeItem = (index: number) => {
    setQueue(prev => {
      const next = [...prev]
      const item = next[index]
      if (item.outputURL) URL.revokeObjectURL(item.outputURL)
      next.splice(index, 1)
      return next
    })
  }

  const clearAll = () => {
    queue.forEach(item => { if (item.outputURL) URL.revokeObjectURL(item.outputURL) })
    setQueue([])
  }

  const executeBatch = async () => {
    if (running) return
    setRunning(true)

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]
      if (item.status === 'done') continue

      setQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'running', error: undefined } : q))

      const opts: ConvertOptions = {
        format: item.format,
        quality: 80,
        lossless: false,
        preserveAnimation: true,
      }

      try {
        const result = await convertFile(item.file, opts)
        setQueue(prev => prev.map((q, idx) => idx === i ? {
          ...q,
          status: 'done',
          outputURL: result.blobURL,
          outputName: result.fileName,
          outputSize: result.sizeBytes,
        } : q))
        appendEntry({
          originalName: item.file.name,
          outputName: result.fileName,
          originalSize: item.file.size,
          outputSize: result.sizeBytes,
          format: item.format,
          source: 'batch',
        })
      } catch (e) {
        setQueue(prev => prev.map((q, idx) => idx === i ? {
          ...q,
          status: 'error',
          error: e instanceof Error ? e.message : 'Failed',
        } : q))
      }
    }

    setRunning(false)
  }

  const pendingCount  = queue.filter(q => q.status === 'pending').length
  const doneCount     = queue.filter(q => q.status === 'done').length
  const errorCount    = queue.filter(q => q.status === 'error').length
  const hasQueue      = queue.length > 0
  const allDone       = hasQueue && queue.every(q => q.status === 'done' || q.status === 'error')

  return (
    <div className="page">
      <div className="converter-card">

        {/* Drop zone — stays available to add more files */}
        <DropZone files={[]} onFiles={handleFiles} disabled={running} />

        {/* Queue table */}
        {hasQueue && (
          <>
            <div className="batch-header">
              <div className="batch-header-left">
                <span className="batch-label">QUEUE</span>
                <span className="batch-count">{queue.length} FILE{queue.length > 1 ? 'S' : ''}</span>
              </div>
              <div className="batch-header-right">
                {doneCount > 0 && (
                  <span className="batch-stat done">{doneCount} DONE</span>
                )}
                {errorCount > 0 && (
                  <span className="batch-stat error">{errorCount} FAILED</span>
                )}
                {!running && (
                  <button className="batch-clear-btn" onClick={clearAll}>CLEAR ALL</button>
                )}
              </div>
            </div>

            <ul className="batch-list">
              {queue.map((item, i) => {
                const availableFormats = getAvailableFormats(item.file)
                return (
                  <li key={i} className={`batch-item batch-item--${item.status}`}>
                    <div className="batch-item-info">
                      <span className="batch-item-name">{item.file.name}</span>
                      <span className="batch-item-size">{formatBytes(item.file.size)}</span>
                    </div>

                    <div className="batch-item-formats">
                      {availableFormats.map(f => (
                        <button
                          key={f}
                          type="button"
                          className={`format-btn ${item.format === f ? 'active' : ''}`}
                          onClick={() => setFormat(i, f)}
                          disabled={running || item.status === 'done'}
                        >
                          {FORMAT_LABELS[f]}
                        </button>
                      ))}
                    </div>

                    <div className="batch-item-status">
                      {item.status === 'pending' && (
                        <span className="batch-badge pending">PENDING</span>
                      )}
                      {item.status === 'running' && (
                        <span className="batch-badge running">
                          <span className="spinner" />
                          PROCESSING
                        </span>
                      )}
                      {item.status === 'done' && item.outputURL && (
                        <button
                          className="btn-download"
                          onClick={() => triggerDownload(item.outputURL!, item.outputName!)}
                        >
                          ↓ {formatBytes(item.outputSize!)}
                        </button>
                      )}
                      {item.status === 'error' && (
                        <span className="batch-badge error" title={item.error}>FAILED</span>
                      )}
                    </div>

                    <button
                      className="batch-item-remove"
                      onClick={() => removeItem(i)}
                      disabled={running}
                      title="Remove"
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {/* Execute button */}
        <div className="convert-btn-wrap">
          <button
            className="convert-btn"
            onClick={executeBatch}
            disabled={!hasQueue || running || allDone}
          >
            {running ? (
              <>
                <span className="spinner" />
                PROCESSING {queue.findIndex(q => q.status === 'running') + 1} OF {queue.length}…
              </>
            ) : allDone ? (
              'ALL CONVERSIONS COMPLETE'
            ) : (
              `EXECUTE BATCH${hasQueue ? ` (${pendingCount} FILE${pendingCount !== 1 ? 'S' : ''})` : ''}`
            )}
          </button>
        </div>

        <SysFooter />

      </div>
    </div>
  )
}
