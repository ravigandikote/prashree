import { Link } from 'react-router-dom'

const variants = {
  solid:
    'bg-ink text-white hover:bg-charcoal border border-ink hover:border-charcoal',
  outline:
    'border border-ink text-ink hover:bg-ink hover:text-white bg-transparent',
  link:
    'border-0 bg-transparent text-ink underline decoration-transparent underline-offset-4 hover:decoration-ink p-0',
}

/**
 * Monochrome button. Renders a <Link> when `to` is set, an <a> when `href`
 * is set, otherwise a <button>.
 */
export default function Button({
  variant = 'solid',
  to,
  href,
  className = '',
  children,
  ...rest
}) {
  const base =
    variant === 'link'
      ? 'inline-flex items-center gap-2 font-medium tracking-wide transition-all duration-200 cursor-pointer no-underline'
      : 'inline-flex items-center justify-center gap-2 px-8 py-3 text-small font-medium uppercase tracking-label transition-colors duration-200 cursor-pointer no-underline'
  const cls = `${base} ${variants[variant]} ${className}`

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button className={cls} {...rest}>{children}</button>
}
