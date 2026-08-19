import { useEffect, useState } from 'react'

/**
 * True when `url` actually serves a PDF. The SPA rewrite returns index.html
 * (HTTP 200) for missing files, so a status check alone is not enough —
 * verify the content type. null = still checking.
 */
export function usePdfAvailable(url) {
  const [available, setAvailable] = useState(url ? null : false)
  useEffect(() => {
    if (!url) return undefined
    let cancelled = false
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || ''
        if (!cancelled) setAvailable(r.ok && type.includes('pdf'))
      })
      .catch(() => { if (!cancelled) setAvailable(false) })
    return () => { cancelled = true }
  }, [url])
  return available
}
