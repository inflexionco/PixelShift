import { useState, useCallback } from 'react'
import { convertFile, ConvertOptions, ConversionResult } from '../core/converter'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function useConverter() {
  const [status, setStatus]   = useState<Status>('idle')
  const [results, setResults] = useState<ConversionResult[]>([])
  const [error, setError]     = useState<string | null>(null)

  const convert = useCallback(async (files: File[], opts: ConvertOptions) => {
    // Clear previous results immediately before starting new conversion
    setResults(prev => { prev.forEach(r => r.cleanup()); return [] })
    setStatus('loading')
    setError(null)

    try {
      for (const file of files) {
        const result = await convertFile(file, opts)
        setResults(prev => [...prev, result])
      }
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
      setStatus('error')
    }
  }, [])

  // Remove a single result by index and revoke its blob URL
  const removeResult = useCallback((index: number) => {
    setResults(prev => {
      const next = [...prev]
      next[index]?.cleanup()
      next.splice(index, 1)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setResults(prev => { prev.forEach(r => r.cleanup()); return [] })
    setStatus('idle')
    setError(null)
  }, [])

  return { convert, reset, removeResult, status, results, error }
}
