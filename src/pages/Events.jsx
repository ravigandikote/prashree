import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MessageCircle, X } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import Button from '../components/Button'
import EventEnquiryForm from '../components/EventEnquiryForm'
import { supabase } from '../lib/supabase'
import { eventsContent as C, whatsappLink } from '../data/events'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.3, ease: 'easeOut' },
}

/** Setup photos curated by Monica: files under events/ in the artworks bucket. */
function useEventGallery() {
  const [images, setImages] = useState([])
  useEffect(() => {
    let cancelled = false
    supabase.storage
      .from('artworks')
      .list('events', { limit: 60, sortBy: { column: 'created_at', order: 'desc' } })
      .then(({ data }) => {
        if (cancelled || !data) return
        const files = data.filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name))
        setImages(
          files.map((f) => supabase.storage.from('artworks').getPublicUrl(`events/${f.name}`).data.publicUrl)
        )
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  return images
}

export default function Events() {
  const gallery = useEventGallery()
  const [lightbox, setLightbox] = useState(null)

  return (
    <>
      <SEO
        title="PraShree Events — Natural & Sustainable Event Décor, Bengaluru"
        description={C.meta.description}
        path="/events"
        image="/images/events-banner-2400.jpg"
        keywords={[
          'natural event decor Bengaluru', 'sustainable event decor', 'eco friendly birthday decoration',
          'mehandi decoration Bengaluru', 'baby shower decoration natural', 'wedding backdrop natural materials',
          'jute decor', 'janur decoration',
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'PraShree Events',
          serviceType: 'Event décor',
          description: C.meta.description,
          provider: { '@id': 'https://www.prashreearts.com/#org' },
          areaServed: { '@type': 'City', name: 'Bengaluru' },
        }}
      />

      {/* ── Hero: the sub-brand banner (title baked in), HTML text for mobile + SEO ── */}
      <section className="bg-[#111]">
        <h1 className="sr-only">{C.hero.title} — natural & sustainable event décor, Bengaluru</h1>
        <img
          src="/images/events-banner-2400.jpg"
          srcSet="/images/events-banner-1600.jpg 1600w, /images/events-banner-2400.jpg 2400w, /images/events-banner-3200.jpg 3200w"
          sizes="100vw"
          alt="PraShree Events — natural, sustainable event décor. Stories told in leaf and jute: birthdays, anniversaries, mehandi, housewarming, baby showers, weddings — janur, gunny, bamboo, flowers, clay — Bengaluru."
          fetchPriority="high"
          className="hidden md:block w-full h-auto"
        />
        {/* Mobile: same composition, rendered as text for legibility */}
        <div className="md:hidden px-6 py-16 text-center">
          <p className="text-[11px] uppercase tracking-label text-white/60">{C.hero.eyebrow}</p>
          <p className="font-display text-display text-paper mt-3" aria-hidden="true">
            PraShree <em>Events</em>
          </p>
          <p className="font-display italic text-h3 text-white/80 mt-2">{C.hero.script}</p>
          <p className="text-small text-white/70 mt-4 max-w-xs mx-auto">{C.hero.sub}</p>
        </div>
        <div className="pb-10 md:pb-12 pt-2 md:pt-8 text-center px-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              href={whatsappLink("Hi PraShree Events, I'd like décor for a [occasion] on [date] at [venue].")}
              target="_blank" rel="noopener noreferrer"
              className="!bg-white !text-ink !border-white hover:!bg-paper"
            >
              <MessageCircle size={14} aria-hidden="true" /> Enquire on WhatsApp
            </Button>
            <a
              href="#gallery"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-small font-medium uppercase tracking-label border border-white/60 text-white hover:bg-white hover:text-ink transition-colors no-underline"
            >
              See our work
            </a>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[68ch] mx-auto px-4 text-center space-y-5">
          {C.intro.map((p, i) => (
            <motion.p key={i} {...fadeUp} className={i === 0 ? 'font-display text-h3 text-ink' : 'text-graphite'}>
              {p}
            </motion.p>
          ))}
        </div>
      </section>

      {/* ── Occasions ── */}
      <section className="bg-paper border-y border-mist py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Occasions" title="What we dress" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {C.occasions.map((o, i) => (
              <motion.div
                key={o.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.25) }}
                className="group bg-white border border-mist p-6"
              >
                <div className="h-px w-8 bg-ink group-hover:w-16 transition-all duration-300 mb-4" aria-hidden="true" />
                <h3 className="font-display text-h3 text-ink">{o.name}</h3>
                <p className="text-small text-graphite mt-2">{o.line}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="bg-white py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Work" title="Recent setups" />
          {gallery.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
              {gallery.map((src) => (
                <button
                  key={src}
                  onClick={() => setLightbox(src)}
                  className="block w-full mb-4 border-0 p-0 bg-transparent cursor-pointer break-inside-avoid"
                >
                  <img src={src} alt="Event décor setup by PraShree Events" loading="lazy" className="w-full treat-grayscale" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-graphite">
              Gallery coming soon — ask for photos of recent setups when you enquire.
            </p>
          )}
        </div>
      </section>

      {/* ── How we work ── */}
      <section className="bg-paper border-y border-mist py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How We Work" title="Three steps to the day" />
          <ol className="grid md:grid-cols-3 gap-8 list-none p-0 relative">
            {C.process.map((step, i) => (
              <motion.li key={step.title} {...fadeUp} className="relative">
                <span className="font-display text-display text-mist leading-none select-none" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="font-display text-h3 text-ink -mt-4">{step.title}</h3>
                <p className="text-small text-graphite mt-2 max-w-xs">{step.line}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Materials note ── */}
      <section className="bg-ink text-white py-14 relative overflow-hidden">
        {/* jute-texture cross-hatch, pure CSS */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 7px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 7px)',
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-small uppercase tracking-label text-white/60 mb-3">Materials</p>
          <p className="font-display text-h3 text-paper">{C.materialsNote}</p>
        </div>
      </section>

      {/* ── Enquiry ── */}
      <section id="enquire" className="bg-white py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Enquire"
            title="Tell us about the day"
            subtitle="Your enquiry reaches Monica directly — she'll call to talk it through, or continue on WhatsApp right away."
          />
          <EventEnquiryForm />
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="bg-paper border-t border-mist py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <motion.p {...fadeUp} className="font-display text-h2 text-ink italic">
            {C.closing}
          </motion.p>
          <div className="mt-8">
            <Button
              href={whatsappLink("Hi PraShree Events, I'd like décor for a [occasion] on [date] at [venue].")}
              target="_blank" rel="noopener noreferrer"
            >
              <MessageCircle size={14} aria-hidden="true" /> Enquire on WhatsApp <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            role="dialog" aria-modal="true" aria-label="Event photo"
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer bg-transparent border-0"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <img src={lightbox} alt="Event décor setup by PraShree Events" className="max-w-full max-h-[88vh] object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
