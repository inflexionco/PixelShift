import type { ConversionResult } from '../core/converter'
import { triggerDownload, formatBytes } from '../core/fileUtils'

interface Props {
  results: ConversionResult[]
}

export default function DownloadList({ results }: Props) {
  if (!results.length) return null

  return (
    <ul className="download-list">
      {results.map((r, i) => (
        <li key={i} className="download-item">
          <span className="file-name">{r.originalName} → {r.fileName}</span>
          <span className="file-size">{formatBytes(r.sizeBytes)}</span>
          <button onClick={() => triggerDownload(r.blobURL, r.fileName)}>
            Download
          </button>
        </li>
      ))}
    </ul>
  )
}
