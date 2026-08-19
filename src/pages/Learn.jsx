import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Users, Backpack, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import Button from '../components/Button'
import Photo from '../components/Photo'
import { EnquiryModal } from '../components/EnquiryForm'
import { offerings, workshops } from '../data/learn'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export default function Learn() {
  const [booking, setBooking] = useState(null) // offering/workshop title

  return (
    <>
      <SEO
        title="Learn with Monica"
        description="Mandala Art classes, meditation practice, and Janur & DIY workshops with Monica Prakash — online and in person at NeeRav Arts Village."
        path="/learn"
      />

      {/* ── Hero ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <p className="text-small uppercase tracking-label text-graphite mb-4">
                Learn with Monica
              </p>
              <h1 className="font-display text-display md:text-display-xl text-ink">
                A practice, taught by hand
              </h1>
              <p className="mt-6 text-graphite max-w-md">
                Mandala Art classes, meditation practice, and Janur &amp; DIY
                workshops — online and in person. Every session moves at a calm,
                deliberate pace, whatever your starting point.
              </p>
              <div className="mt-10">
                <Button onClick={() => setBooking('General enquiry — classes & workshops')}>
                  Enquire about joining <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Photo
                base="/images/monica/teaching/20251227-IMG_7529"
                alt="Monica demonstrating a mandala sketch to a seated workshop group under fairy lights, singing bowls on the table"
                treatment="duotone"
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Offerings ── */}
      <section className="bg-paper border-y border-mist py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Offerings"
            title="Ways to learn"
          />
          <div className="grid md:grid-cols-3 gap-px bg-mist border border-mist">
            {offerings.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="bg-paper p-8 flex flex-col"
              >
                <h3 className="font-display text-h3 text-ink">{o.title}</h3>
                <p className="text-small uppercase tracking-label text-ash mt-1">
                  {o.format}
                </p>
                <p className="text-graphite text-small mt-4 flex-1">{o.description}</p>
                <dl className="mt-6 space-y-2 text-small text-graphite">
                  <div className="flex gap-2">
                    <dt className="sr-only">Duration</dt>
                    <Clock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <dd>{o.duration}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="sr-only">What you'll need</dt>
                    <Backpack size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <dd>{o.needs}</dd>
                  </div>
                </dl>
                <Button
                  variant="link"
                  className="mt-6"
                  onClick={() => setBooking(o.title)}
                >
                  How to join <ArrowRight size={14} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workshops at NeeRav ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="NeeRav Arts Village"
            title="Residential workshops"
            subtitle="Immersive, hands-on programmes guided by Monica in a serene natural setting — for individuals, families, and teams."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((ws, i) => (
              <motion.div
                key={ws.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.25) }}
                className="border border-mist p-6 hover:border-ink transition-colors flex flex-col"
              >
                <h3 className="font-display text-h3 text-ink">{ws.title}</h3>
                <p className="text-graphite text-small mt-3 flex-1">{ws.description}</p>

                <div className="flex flex-wrap gap-4 mt-4 text-small text-charcoal">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} aria-hidden="true" /> {ws.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} aria-hidden="true" /> {ws.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} aria-hidden="true" /> {ws.capacity}
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5 list-none p-0">
                  {ws.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-small text-graphite">
                      <span className="w-1 h-1 rounded-full bg-graphite shrink-0" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="link"
                  className="mt-6"
                  onClick={() => setBooking(ws.title)}
                >
                  Enquire now <ArrowRight size={14} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community strip ── */}
      <section className="bg-paper border-y border-mist py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <Photo
                base="/images/monica/teaching/20251227-IMG_7546"
                alt="Monica leaning over participants, guiding their mandala drawing"
                treatment="grayscale"
                aspect="aspect-[3/4]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </motion.div>
            <motion.div {...fadeUp}>
              <SectionHeading
                align="left"
                eyebrow="The Experience"
                title="Slow, guided, together"
                className="mb-6"
              />
              <p className="text-graphite">
                Sessions blend drawing with meditation — singing bowls, quiet
                focus, and personal guidance at every table. Custom workshops are
                available for organisations, schools, and private groups.
              </p>
              <Button
                variant="link"
                className="mt-8"
                onClick={() => setBooking('Custom workshop')}
              >
                Plan a custom workshop <ArrowRight size={14} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <EnquiryModal
        open={!!booking}
        onClose={() => setBooking(null)}
        kind="booking"
        subject={booking || undefined}
        title="Booking enquiry"
      />
    </>
  )
}
