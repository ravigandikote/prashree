import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import Button from '../components/Button'
import { MandalaOrnament } from '../components/UI'

const SUGGESTIONS = [
  { to: '/products', label: 'The collection', note: 'Every original, filterable by form, size and Vastu direction' },
  { to: '/learn', label: 'Learn with Monica', note: 'Mandala, meditation and Janur sessions' },
  { to: '/workshops', label: 'Upcoming workshops', note: 'What is running this month' },
  { to: '/studio', label: 'Mandala Studio', note: 'Draw a mandala in your browser' },
  { to: '/contact', label: 'Contact', note: 'Write to the studio' },
]

export default function NotFound() {
  return (
    <>
      {/* The SPA rewrite serves every unknown URL with HTTP 200, so tell
          crawlers not to index this page rather than leave a soft 404. */}
      <SEO
        title="Page not found"
        description="This page doesn't exist. Browse the collection of hand-drawn mandala artworks, workshops and classes at PraShree Arts."
        path="/404"
        noindex
      />
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-center"><MandalaOrnament /></div>
            <p className="text-small uppercase tracking-label text-ash mt-6">Error 404</p>
            <h1 className="font-display text-display-sm md:text-display text-ink mt-3">
              This page has wandered off
            </h1>
            <p className="text-graphite mt-4 max-w-lg mx-auto">
              The link may be old, or the address slightly off. Nothing is lost —
              here is the way back in.
            </p>

            <ul className="mt-12 list-none p-0 text-left divide-y divide-mist border-y border-mist">
              {SUGGESTIONS.map((s) => (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="flex items-baseline justify-between gap-6 py-4 no-underline group"
                  >
                    <span className="font-display text-h3 text-ink group-hover:underline decoration-1 underline-offset-4">
                      {s.label}
                    </span>
                    <span className="text-small text-graphite text-right hidden sm:block">
                      {s.note}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Button to="/" className="mt-12">Back to the home page</Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
