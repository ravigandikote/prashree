/** INR price display; a zero/absent price means "on request" (placeholder seeds). */
export function formatPrice(value) {
  const n = Number(value)
  if (!n) return 'Price on request'
  return `₹${n.toLocaleString('en-IN')}`
}

/** Long-form date for editorial contexts. */
export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
