import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading, LoadingSpinner, MandalaOrnament } from '../components/UI'
import Button from '../components/Button'
import { EnquiryModal } from '../components/EnquiryForm'
import { getActiveWorkshops } from '../lib/supabase'
import { fallbackWorkshops } from '../data/workshopEvents'

export default function WorkshopEvents() {
  const [workshops, setWorkshops] = useState(null)
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    let cancelled = false
    // don't leave visitors on a spinner if the network hangs — the two
    // recurring workshops are bundled as a fallback
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 4000))
    Promise.race([getActiveWorkshops(), timeout])
      .then((data) => { if (!cancelled) setWorkshops(data?.length ? data : fallbackWorkshops) })
      .catch(() => { if (!cancelled) setWorkshops(fallbackWorkshops) })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <SEO
        title="Upcoming Workshops — Mandala & Janur Art, Bengaluru"
        description="Join Monica Prakash's recurring workshops at Eco Cottage, Kalyan Nagar, Bengaluru: Janur (coconut-leaf) art every Sunday 10 am–12 pm and Mandala Art Therapy every Sunday 3–5 pm. All materials provided."
        path="/workshops"
        keywords={[
          'mandala workshop Bengaluru', 'janur art workshop', 'art workshop Kalyan Nagar',
          'sunday art workshop Bengaluru', 'weekend art class Bengaluru', 'art therapy workshop',
        ]}
        jsonLd={
          workshops?.length
            ? {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                itemListElement: workshops.map((w, i) => ({
                  '@type': 'Event',
                  position: i + 1,
                  name: w.title,
                  description: w.description || undefined,
                  eventSchedule: { '@type': 'Schedule', description: w.schedule },
                  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                  location: {
                    '@type': 'Place',
                    name: w.venue || 'Eco Cottage, Kalyan Nagar',
                    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
                  },
                  organizer: { '@id': 'https://www.prashreearts.com/#org' },
                  image: w.flyer_url
                    ? (w.flyer_url.startsWith('http') ? w.flyer_url : `https://www.prashreearts.com${w.flyer_url}`)
                    : undefined,
                })),
              }
            : undefined
        }
      />

      {/* ── Header ── */}
      <section className="bg-white pt-16 md:pt-24 pb-10">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Upcoming Workshops"
            title="Come draw with us"
            subtitle="Recurring sessions with Monica — small groups, all materials provided, every level welcome. Reserve a spot with a quick enquiry and she'll confirm personally."
            className="mb-0"
          />
        </div>
      </section>

      {/* ── Workshops ── */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          {!workshops ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-16">
              {workshops.map((w, i) => (
                <motion.article
                  key={w.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.06, 0.2) }}
                  className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center border-t border-mist pt-12 first:border-t-0 first:pt-0"
                >
                  {/* Flyer */}
                  <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                    {w.flyer_url ? (
                      <img
                        src={w.flyer_url}
                        alt={`${w.title} flyer — ${w.schedule}, ${w.venue}`}
                        loading="lazy"
                        className="w-full max-w-md mx-auto border border-mist shadow-[0_2px_24px_rgba(10,10,10,0.10)]"
                      />
                    ) : (
                      <div className="w-full max-w-md mx-auto aspect-[3/4] bg-paper border border-mist flex flex-col items-center justify-center gap-3">
                        <MandalaOrnament className="text-ash" />
                        <p className="text-small uppercase tracking-label text-ash">
                          Flyer coming soon
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                    <h2 className="font-display text-h2 md:text-display-sm text-ink">
                      {w.title}
                    </h2>
                    <dl className="mt-5 space-y-2.5">
                      <div className="flex items-center gap-3 text-charcoal">
                        <dt className="sr-only">Schedule</dt>
                        <CalendarDays size={17} className="text-graphite shrink-0" aria-hidden="true" />
                        <dd className="font-medium">{w.schedule}</dd>
                      </div>
                      {w.venue && (
                        <div className="flex items-center gap-3 text-charcoal">
                          <dt className="sr-only">Venue</dt>
                          <MapPin size={17} className="text-graphite shrink-0" aria-hidden="true" />
                          <dd>{w.venue}</dd>
                        </div>
                      )}
                    </dl>
                    {w.description && (
                      <p className="mt-5 text-graphite max-w-md">{w.description}</p>
                    )}
                    <div className="mt-8">
                      <Button onClick={() => setBooking(w.title)}>
                        Reserve a spot <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          <p className="text-small text-ash mt-16 border-t border-mist pt-6">
            Dates can shift around festivals — your enquiry is always confirmed
            personally before you travel. For classes, courses, and sessions at
            your own venue, see{' '}
            <a href="/learn" className="text-ink underline underline-offset-4">
              Learn with Monica
            </a>.
          </p>
        </div>
      </section>

      <EnquiryModal
        open={!!booking}
        onClose={() => setBooking(null)}
        kind="booking"
        subject={booking ? `Workshop: ${booking}` : undefined}
        title="Reserve a spot"
      />
    </>
  )
}
