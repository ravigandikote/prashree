import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading, MandalaOrnament } from '../components/UI'
import { getConnections } from '../lib/supabase'
import { fallbackConnections } from '../data/connections'

export default function Connections() {
  const [connections, setConnections] = useState(fallbackConnections)

  useEffect(() => {
    getConnections()
      .then((data) => { if (data?.length) setConnections(data) })
      .catch(() => {})
  }, [])

  return (
    <>
      <SEO
        title="Connections & Community"
        description="Monica Prakash's community roles and partnerships — Creative Director at NeeRav Arts Village, Secretary of the HEF community, and social-service collaborations."
        path="/connections"
      />

      {/* ── Header ── */}
      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Connections & Community"
            title="Art that reaches outward"
            subtitle="Monica's practice is woven into a wider community — creative spaces, collectives, and social-service partnerships around Bengaluru."
            className="mb-0"
          />
        </div>
      </section>

      {/* ── Entries ── */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-mist">
            {connections.map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.2) }}
                className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 border-b border-mist"
              >
                {/* Logo / photo slot */}
                <div className="md:col-span-2">
                  {c.logo_url ? (
                    <img
                      src={c.logo_url}
                      alt={`${c.name} logo`}
                      className="w-20 h-20 object-contain grayscale"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 border border-mist flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <MandalaOrnament className="text-ash" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-3">
                  <h2 className="font-display text-h3 text-ink">{c.name}</h2>
                  <p className="text-small uppercase tracking-label text-graphite mt-1">
                    {c.role}
                  </p>
                </div>

                <div className="md:col-span-7">
                  <p className="text-graphite">{c.description}</p>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-small text-ink underline decoration-transparent hover:decoration-ink underline-offset-4 transition-all no-underline"
                    >
                      Visit <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
          <p className="text-small text-ash mt-8">
            Know a community that should be here? These entries grow — new
            connections are added from the studio.
          </p>
        </div>
      </section>
    </>
  )
}
