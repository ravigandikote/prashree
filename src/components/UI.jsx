import { motion } from 'framer-motion'

export function SectionHeading({ title, subtitle, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`text-center mb-12 ${className}`}
    >
      <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted max-w-2xl mx-auto">{subtitle}</p>
      )}
      {/* Mandala-inspired divider */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
        <MandalaOrnament />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
      </div>
    </motion.div>
  )
}

function MandalaOrnament() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Petals */}
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
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
      viewBox="0 0 800 800"
      fill="none"
    >
      {/* Concentric circles */}
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
      {/* Radial lines */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180
        const x2 = 400 + 350 * Math.cos(angle)
        const y2 = 400 + 350 * Math.sin(angle)
        return (
          <line
            key={i}
            x1="400"
            y1="400"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.3"
          />
        )
      })}
      {/* Petal arcs */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = i * 45
        return (
          <ellipse
            key={`p${i}`}
            cx="400"
            cy="250"
            rx="30"
            ry="60"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            transform={`rotate(${angle} 400 400)`}
          />
        )
      })}
    </svg>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-light rounded-full" />
        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export function EmptyState({ title, message }) {
  return (
    <div className="text-center py-16">
      <MandalaOrnament />
      <h3 className="font-display text-xl font-semibold text-primary mt-4">
        {title}
      </h3>
      <p className="text-muted mt-2">{message}</p>
    </div>
  )
}
