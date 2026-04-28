import { useCallback, useState } from 'react'
import { isSupportedFile } from '../core/fileUtils'

interface Props {
  files: File[]
  onFiles: (files: File[]) => void
  disabled: boolean
}

export default function DropZone({ files, onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false)

  const handle = useCallback((list: FileList | null) => {
    if (!list) return
    const valid = Array.from(list).filter(isSupportedFile)
    if (valid.length) onFiles(valid)
  }, [onFiles])

  const triggerPicker = () => {
    if (!disabled) document.getElementById('file-input')?.click()
  }

  const hasFiles = files.length > 0

  return (
    <div
      className={`dropzone ${dragging ? 'drag-over' : ''} ${disabled ? 'disabled' : ''} ${hasFiles ? 'has-files' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files) }}
      onClick={hasFiles ? undefined : triggerPicker}
      role="button"
      tabIndex={0}
      aria-label="Drop files here or click to select"
      onKeyDown={e => e.key === 'Enter' && triggerPicker()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/tiff,image/bmp,image/avif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/mpeg,video/ogg"
        multiple
        hidden
        onChange={e => handle(e.target.files)}
      />

      {hasFiles ? (
        <>
          <div className="drop-files-list">
            <span className="drop-file-name">
              {files.length === 1 ? files[0].name : `${files[0].name} +${files.length - 1} more`}
            </span>
            <span className="drop-file-count">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
          </div>
          <button className="drop-change" onClick={triggerPicker} type="button">
            Change
          </button>
        </>
      ) : (
        <>
          <span className="drop-plus">+</span>
          <span className="drop-label">Drop files to convert</span>
          <span className="drop-hint">or click to browse</span>
        </>
      )}
    </div>
  )
}
