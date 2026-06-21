// ══════════════════════════════════════════════════════
// LisanIQ — Shared formatting utilities (UI layer)
// ══════════════════════════════════════════════════════

/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Format ISO date string to readable date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/** Format ISO date string to relative time */
export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)   return 'just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 30)  return `${days}d ago`
  return formatDate(iso)
}

/** Format KPI value with type suffix */
export function fv(v: number | null | undefined, type: string): string {
  if (v == null || isNaN(v)) return '—'
  const n = v
  switch (type) {
    case '%':  return n.toFixed(2) + '%'
    case '$':  return '$' + n.toFixed(2)
    case 'x':  return n.toFixed(2) + 'x'
    case '$k':
      return n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M'
           : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K'
           : '$' + n.toFixed(0)
    default:   return n.toFixed(2)
  }
}

/** Truncate string with ellipsis */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}
