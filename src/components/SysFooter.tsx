import { useEffect, useState } from 'react'

interface SysInfo {
  engine: string
  threads: string
  buffer: string
}

export default function SysFooter() {
  const [info, setInfo] = useState<SysInfo>({
    engine: 'FFMPEG-CORE',
    threads: `AUTO (${navigator.hardwareConcurrency ?? '—'})`,
    buffer: 'ENCRYPTED',
  })

  // Read the ffmpeg-core version from the JS file header comment
  useEffect(() => {
    fetch('/wasm/ffmpeg-core.js')
      .then(r => r.text())
      .then(src => {
        const match = src.match(/ffmpeg[- ]core[/ ]?v?([\d.]+)/i)
        if (match) setInfo(prev => ({ ...prev, engine: `FFMPEG-CORE ${match[1]}` }))
      })
      .catch(() => {})
  }, [])

  return (
    <footer className="sys-footer">
      <div className="sys-stat">
        <span className="sys-stat-label">Engine</span>
        <span className="sys-stat-value">{info.engine}</span>
      </div>
      <div className="sys-stat">
        <span className="sys-stat-label">Threads</span>
        <span className="sys-stat-value">{info.threads}</span>
      </div>
      <div className="sys-stat">
        <span className="sys-stat-label">Buffer</span>
        <span className="sys-stat-value">{info.buffer}</span>
      </div>
    </footer>
  )
}
