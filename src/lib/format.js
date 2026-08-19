/** INR price display; a zero/absent price means "on request" (placeholder seeds). */
export function formatPrice(value) {
  const n = Number(value)
  if (!n) return 'Price on request'
  return `₹${n.toLocaleString('en-IN')}`
}
