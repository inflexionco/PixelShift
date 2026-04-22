import { useCallback, useState } from 'react'
import { isSupportedFile } from '../core/fileUtils'

interface Props {
  onFiles: (files: File[]) => void
  disabled: boolean
}

export default function DropZone({ onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false)

  const handle = useCallback((files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(isSupportedFile)
    if (valid.length) onFiles(valid)
  }, [onFiles])

  return (
    <div
      className={`dropzone ${dragging ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files) }}
      onClick={() => { if (!disabled) document.getElementById('file-input')?.click() }}
      role="button"
      tabIndex={0}
      aria-label="Drop images here or click to select"
      onKeyDown={e => e.key === 'Enter' && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/tiff,image/bmp,image/avif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/mpeg,video/ogg"
        multiple
        hidden
        onChange={e => handle(e.target.files)}
      />
      <div className="drop-icon">🖼️</div>
      <p>Drop files here or <span className="link">click to select</span></p>
      <small>Images: JPEG · PNG · GIF · TIFF · BMP · AVIF</small>
      <small>Videos: MP4 · MOV · AVI · MKV · WebM · MPEG</small>
    </div>
  )
}
