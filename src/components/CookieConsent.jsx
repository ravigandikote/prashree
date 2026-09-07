import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsent } from '../context/ConsentContext'
import { analyticsConfigured } from '../lib/analytics'

/**
 * Cookie banner — shown until the visitor chooses. Deliberately quiet: it sits
 * at the foot of the page, is dismissable either way, and never blocks reading.
 * Skipped entirely when no analytics ID is configured, because then the site
 * genuinely sets no cookies and asking would be noise.
 */
export default function CookieConsent() {
  const { consent, accept, decline } = useConsent()

  if (!analyticsConfigured || consent !== null) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        role="dialog"
        aria-label="Cookie preferences"
        className="fixed bottom-0 inset-x-0 z-50 bg-ink text-white border-t border-white/15"
      >
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <p className="text-small text-mist/90 flex-1">
            We use Google Analytics to understand which artworks and workshops
            people look at. Nothing is sold or shared, and the site works exactly
            the same if you say no.{' '}
            <Link to="/privacy" className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
              Privacy policy
            </Link>
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={accept}
              className="px-5 py-2 bg-white text-ink text-small uppercase tracking-label border-0 cursor-pointer hover:bg-mist transition-colors"
            >
              Accept
            </button>
            <button
              onClick={decline}
              className="px-5 py-2 bg-transparent text-mist text-small uppercase tracking-label border border-white/30 cursor-pointer hover:text-white hover:border-white transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
