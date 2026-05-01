export interface HistoryEntry {
  id: string
  timestamp: number          // ms since epoch
  originalName: string
  outputName: string
  originalSize: number
  outputSize: number
  format: string
  source: 'convert' | 'batch'
}

const STORAGE_KEY = 'pixelshift_history'

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {}
}

export function appendEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const entries = loadHistory()
  entries.unshift({
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  })
  // Keep only the last 200 entries
  saveHistory(entries.slice(0, 200))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
