import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, AtSign } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import Photo from '../components/Photo'
import EnquiryForm from '../components/EnquiryForm'

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with PraShree Arts — enquire about artworks, classes, custom orders, or event décor by Monica Prakash. Bengaluru."
        path="/contact"
      />

      {/* ── Header ── */}
      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Contact"
            title="Write to the studio"
            subtitle="A commission, a class, an occasion to dress — every message reaches Monica directly."
            className="mb-0"
          />
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16">
            {/* Info + portrait */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-5 space-y-8"
            >
              <Photo
                base="/images/monica/portraits/20251227-IMG_7387"
                alt="Monica Prakash seated before a wall with a faint mandala mural"
                treatment="duotone"
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 40vw, 100vw"
                priority
              />

              <ul className="space-y-4 list-none p-0">
                <li>
                  <a
                    href="tel:+919353464363"
                    className="flex items-center gap-4 text-charcoal hover:text-ink transition-colors no-underline group"
                  >
                    <span className="w-10 h-10 border border-mist group-hover:border-ink flex items-center justify-center transition-colors">
                      <Phone size={16} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-small uppercase tracking-label text-ash">Phone</span>
                      +91 93534 64363
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@prashreearts.com"
                    className="flex items-center gap-4 text-charcoal hover:text-ink transition-colors no-underline group"
                  >
                    <span className="w-10 h-10 border border-mist group-hover:border-ink flex items-center justify-center transition-colors">
                      <Mail size={16} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-small uppercase tracking-label text-ash">Email</span>
                      info@prashreearts.com
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="[[INSTAGRAM_URL]]"
                    className="flex items-center gap-4 text-charcoal hover:text-ink transition-colors no-underline group"
                  >
                    <span className="w-10 h-10 border border-mist group-hover:border-ink flex items-center justify-center transition-colors">
                      <AtSign size={16} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-small uppercase tracking-label text-ash">Instagram</span>
                      [[@instagram-handle]]
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-4 text-charcoal">
                  <span className="w-10 h-10 border border-mist flex items-center justify-center">
                    <MapPin size={16} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-small uppercase tracking-label text-ash">Location</span>
                    Bengaluru · NeeRav Arts Village
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-7"
            >
              <EnquiryForm kind="contact" />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
