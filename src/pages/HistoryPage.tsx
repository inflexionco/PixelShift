import { useState, useEffect } from 'react'
import { loadHistory, clearHistory } from '../core/history'
import type { HistoryEntry } from '../core/history'
import { formatBytes } from '../core/fileUtils'

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60)  return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function sizeDelta(original: number, output: number): string {
  if (!original) return ''
  const pct = ((output - original) / original) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(0)}%`
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(loadHistory())
  }, [])

  const handleClear = () => {
    clearHistory()
    setEntries([])
  }

  // Aggregate stats
  const totalFiles     = entries.length
  const totalSaved     = entries.reduce((acc, e) => acc + Math.max(0, e.originalSize - e.outputSize), 0)
  const formatsUsed    = [...new Set(entries.map(e => e.format.toUpperCase()))]

  return (
    <div className="page">
      <div className="converter-card">

        {/* Stats bar */}
        <div className="history-stats">
          <div className="history-stat">
            <span className="history-stat-label">FILES CONVERTED</span>
            <span className="history-stat-value">{totalFiles}</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-label">SPACE SAVED</span>
            <span className="history-stat-value">{totalSaved > 0 ? formatBytes(totalSaved) : '—'}</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-label">FORMATS USED</span>
            <span className="history-stat-value">
              {formatsUsed.length > 0 ? formatsUsed.join(' · ') : '—'}
            </span>
          </div>
        </div>

        {/* Header row */}
        <div className="history-header">
          <span className="history-title">SESSION LOG</span>
          {entries.length > 0 && (
            <button className="batch-clear-btn" onClick={handleClear}>CLEAR</button>
          )}
        </div>

        {/* Log entries */}
        {entries.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty-icon">◎</span>
            <span className="history-empty-label">No conversions yet this session</span>
            <span className="history-empty-hint">Files you convert will appear here</span>
          </div>
        ) : (
          <ul className="history-list">
            {entries.map(entry => {
              const delta = sizeDelta(entry.originalSize, entry.outputSize)
              const saved = entry.originalSize > entry.outputSize
              return (
                <li key={entry.id} className="history-item">
                  <div className="history-item-names">
                    <span className="history-item-original">{entry.originalName}</span>
                    <span className="history-item-arrow">→</span>
                    <span className="history-item-output">{entry.outputName}</span>
                  </div>
                  <div className="history-item-meta">
                    <span className="history-item-sizes">
                      {formatBytes(entry.originalSize)} → {formatBytes(entry.outputSize)}
                    </span>
                    {delta && (
                      <span className={`history-item-delta ${saved ? 'saved' : 'grew'}`}>
                        {delta}
                      </span>
                    )}
                    <span className="history-item-source">{entry.source.toUpperCase()}</span>
                    <span className="history-item-time">{relativeTime(entry.timestamp)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

      </div>
    </div>
  )
}
