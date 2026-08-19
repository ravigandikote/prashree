/**
 * Underline-style form controls fitting the gallery-catalogue aesthetic.
 * All monochrome: mist underline at rest, ink on focus.
 */
const fieldBase =
  'w-full bg-transparent border-0 border-b border-mist px-0 py-2.5 text-body text-charcoal placeholder:text-ash focus:outline-none focus:border-ink transition-colors duration-200 rounded-none'

export function Label({ children, htmlFor, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-small uppercase tracking-label text-graphite mb-1"
    >
      {children}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  )
}

export function Input({ className = '', ...rest }) {
  return <input className={`${fieldBase} ${className}`} {...rest} />
}

export function Textarea({ className = '', rows = 5, ...rest }) {
  return <textarea rows={rows} className={`${fieldBase} resize-none ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`${fieldBase} cursor-pointer ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Field({ label, htmlFor, required, children, hint }) {
  return (
    <div>
      {label && <Label htmlFor={htmlFor} required={required}>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-small text-ash">{hint}</p>}
    </div>
  )
}
