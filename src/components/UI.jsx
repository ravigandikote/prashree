import { motion } from 'framer-motion'

/**
 * Section heading with an uppercase eyebrow label above a serif title.
 * `align="left"` for editorial layouts, default centered.
 */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className = '' }) {
  const alignCls = align === 'left' ? 'text-left' : 'text-center'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${alignCls} mb-12 ${className}`}
    >
      {eyebrow && (
        <p className="text-small uppercase tracking-label text-graphite mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-display-sm md:text-display text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-graphite ${align === 'left' ? 'max-w-2xl' : 'max-w-2xl mx-auto'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

export function MandalaOrnament({ className = '' }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`text-ink ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="3"
          x2="12"
          y2="6"
          stroke="currentColor"
          strokeWidth="0.5"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}

export function MandalaHeroBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none text-ink"
      viewBox="0 0 800 800"
      fill="none"
      aria-hidden="true"
    >
      {[50, 100, 150, 200, 250, 300, 350].map((r) => (
        <circle
          key={r}
          cx="400"
          cy="400"
          r={r}
          stroke="currentColor"
          strokeWidth={r % 100 === 0 ? 1.5 : 0.5}
          strokeDasharray={r % 50 === 0 ? 'none' : '4 4'}
        />
      ))}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180
        return (
          <line
            key={i}
            x1="400"
            y1="400"
            x2={400 + 350 * Math.cos(angle)}
            y2={400 + 350 * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth="0.3"
          />
        )
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={`p${i}`}
          cx="400"
          cy="250"
          rx="30"
          ry="60"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          transform={`rotate(${i * 45} 400 400)`}
        />
      ))}
    </svg>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Loading">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-mist rounded-full" />
        <div className="absolute inset-0 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export function EmptyState({ title, message }) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center">
        <MandalaOrnament />
      </div>
      <h3 className="font-display text-h3 text-ink mt-4">{title}</h3>
      <p className="text-graphite mt-2">{message}</p>
    </div>
  )
}
