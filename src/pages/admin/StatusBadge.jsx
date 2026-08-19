/** Monochrome status badge: hierarchy via fill/border, never colour. */
export default function StatusBadge({ value, labels = [] }) {
  const label = labels.find((l) => l.value === value)?.label || value
  const style =
    value === 'new'
      ? 'bg-ink text-white border-ink'
      : value === 'closed'
        ? 'text-ash border-mist'
        : 'text-charcoal border-graphite'
  return (
    <span className={`px-2 py-0.5 text-xs uppercase tracking-wider border ${style}`}>
      {label}
    </span>
  )
}
