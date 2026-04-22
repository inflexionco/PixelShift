import { useState, useCallback } from 'react'
import { convertToWebP, ConvertOptions, ConversionResult } from '../core/converter'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function useConverter() {
  const [status, setStatus]   = useState<Status>('idle')
  const [results, setResults] = useState<ConversionResult[]>([])
  const [error, setError]     = useState<string | null>(null)

  const convert = useCallback(async (files: File[], opts: ConvertOptions) => {
    setStatus('loading')
    setError(null)

    try {
      // Sequential processing — bounds peak memory to O(max single file size)
      for (const file of files) {
        const result = await convertToWebP(file, opts)
        setResults(prev => [...prev, result])
      }
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setResults(prev => { prev.forEach(r => r.cleanup()); return [] })
    setStatus('idle')
    setError(null)
  }, [])

  return { convert, reset, status, results, error }
}
