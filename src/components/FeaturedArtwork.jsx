import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getProducts } from '../lib/supabase'
import { fallbackArtworks } from '../data/artworks'
import { formatPrice } from '../lib/format'

/**
 * Home-page spotlight on one artwork. Whatever Monica ticks as "Featured" at
 * /admin/products wins; until something is ticked it falls back to the piece
 * named below, read from the bundled catalogue so the band never renders empty.
 *
 * The pitch is Monica's own words from the catalogue plate for pieces we have
 * written copy for; anything else falls back to a line built from its data, so
 * featuring a new artwork can never put invented claims on the home page.
 */

const DEFAULT_SLUG = 'drishti'

const FEATURE_COPY = {
  drishti: {
    eyebrow: 'Featured artwork',
    hook: 'One eye. Two hundred hours. Look for a second and it looks back.',
    body: `Ring after ring of petals, beads and hatching fill the iris, and hundreds
      of feathered rays stream out to every corner of the paper — so the gaze fills
      the whole frame. Hung facing the door, it meets whoever walks in: the old
      guard against nazar.`,
    cta: 'Look closer',
  },
}

function fallbackCopy(art) {
  return {
    eyebrow: 'Featured artwork',
    hook: art.intent,
    body: [
      art.hours && `${art.hours} of hand-inked line`,
      art.size,
      art.series,
    ].filter(Boolean).join(' · '),
    cta: 'Look closer',
  }
}

export default function FeaturedArtwork({ to = '/products' }) {
  const [art, setArt] = useState(null)
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fallback = fallbackArtworks.find((a) => a.slug === DEFAULT_SLUG)
    getProducts({ featured: true, limit: 1 })
      .then((rows) => (rows?.[0] ? rows[0] : fallback))
      .catch(() => fallback)
      .then((chosen) => { if (!cancelled) setArt(chosen) })
    return () => { cancelled = true }
  }, [])

  if (!art) return null

  const copy = FEATURE_COPY[art.slug] || fallbackCopy(art)
  // an admin upload wins; otherwise the committed thumb, if one has been added
  const image = art.images?.[0] || `/images/products/thumbs/${art.slug}.jpg`

  return (
    <section className="bg-ink text-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Link to={to} className="block group no-underline" aria-label={`${art.name} — ${copy.cta}`}>
              <div className="border border-white/15 group-hover:border-white/40 transition-colors p-3 sm:p-4">
                {imageBroken ? (
                  <div className="aspect-[4/3] bg-charcoal flex flex-col items-center justify-center gap-1 text-center px-6">
                    <span className="text-small uppercase tracking-label text-ash">
                      Photograph coming soon
                    </span>
                    {art.size && <span className="text-small text-ash">{art.size}</span>}
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={art.name}
                    onError={() => setImageBroken(true)}
                    className="w-full treat-grayscale"
                  />
                )}
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <p className="text-small uppercase tracking-label text-ash">{copy.eyebrow}</p>
            <h2 className="font-display text-display-sm md:text-display text-white mt-3 leading-tight">
              {art.name}
            </h2>
            <p className="font-display text-h3 text-mist italic mt-4">{copy.hook}</p>
            <p className="text-mist/80 mt-5">{copy.body}</p>

            <dl className="flex flex-wrap gap-x-8 gap-y-3 mt-8 pt-8 border-t border-white/15">
              {art.size && (
                <div>
                  <dt className="text-[10px] uppercase tracking-label text-ash">Size</dt>
                  <dd className="text-mist text-small mt-1">{art.size}</dd>
                </div>
              )}
              {art.hours && (
                <div>
                  <dt className="text-[10px] uppercase tracking-label text-ash">Hand-drawn</dt>
                  <dd className="text-mist text-small mt-1">{art.hours}</dd>
                </div>
              )}
              {art.price && (
                <div>
                  <dt className="text-[10px] uppercase tracking-label text-ash">
                    {art.is_sold ? 'Original · sold' : 'Original'}
                  </dt>
                  <dd className={`text-small mt-1 ${art.is_sold ? 'text-ash line-through' : 'text-mist'}`}>
                    {formatPrice(art.sale_price || art.price)}
                  </dd>
                </div>
              )}
            </dl>

            <Link
              to={to}
              className="inline-flex items-center gap-2 mt-8 text-white no-underline border-b border-white/40 hover:border-white pb-1 transition-colors"
            >
              {copy.cta} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
