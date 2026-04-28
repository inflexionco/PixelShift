import type { ConversionResult } from '../core/converter'
import { triggerDownload, formatBytes } from '../core/fileUtils'

interface Props {
  results: ConversionResult[]
  onRemove: (index: number) => void
}

export default function DownloadList({ results, onRemove }: Props) {
  if (!results.length) return null

  return (
    <ul className="download-list">
      {results.map((r, i) => (
        <li key={i} className="download-item">
          <div className="file-info">
            <span className="file-name">{r.originalName} → {r.fileName}</span>
            <span className="file-size">{formatBytes(r.sizeBytes)}</span>
          </div>
          <span className="size-badge">{r.format.toUpperCase()}</span>
          <div className="item-actions">
            <button
              className="btn-download"
              onClick={() => triggerDownload(r.blobURL, r.fileName)}
              title="Download converted file"
            >
              Download
            </button>
            <button
              className="btn-delete"
              onClick={() => onRemove(i)}
              title="Delete converted file from memory"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
