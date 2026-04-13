import { motion } from 'framer-motion'
import { Palette, Heart, Star, Award, Users, Leaf } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading, MandalaHeroBg } from '../components/UI'

const credentials = [
  { icon: Palette, title: 'Mandala Art Therapist', desc: 'Certified practitioner using mandala creation for mental wellness and stress relief.' },
  { icon: Leaf, title: 'Janur Art Specialist', desc: 'Expert in Coconut Leaf Art — a traditional craft form preserved through modern artistry.' },
  { icon: Star, title: '20+ Art Forms', desc: 'Skilled in mandala, warli, abstract, doodle, ceramic, bamboo, and many more art disciplines.' },
  { icon: Award, title: 'Creative Director', desc: 'Leading creative vision at NeeRav Arts Village for workshops and events.' },
  { icon: Users, title: 'Workshop Facilitator', desc: 'Conducts residential workshops and events at NeeRav Arts Village for all skill levels.' },
  { icon: Heart, title: 'Therapeutic Approach', desc: 'Art as therapy — each piece is designed to promote calm, balance, and inner clarity.' },
]

const artForms = [
  'Mandala Art', 'Janur Art (Coconut Leaf Art)', 'DIY – Best Out of Waste',
  'Thread Work', 'Wall Arts (Mandala & Warli)', 'Home Décor',
  'Abstract Paintings', 'Mandalas on Abstract', 'Doodle Art',
  'Ceramic Wall Décor', 'Frame Works', 'Glue Gun Art',
  'Dry Flower / Leaf Arrangements', 'Event Background Decoration',
  'Table Arrangements', 'Customized Drawings & Gifts',
  'T-Shirt Printing', 'Bamboo Art', 'Coconut Shell Art', 'Jewellery Making',
]

export default function About() {
  return (
    <>
      <SEO
        title="About Monica Prakash"
        description="Learn about Monica Prakash, Mandala Art Therapist and founder of PraShree Arts. Discover her journey, philosophy, and expertise across 20+ art forms."
        path="/about"
      />

      {/* ── Hero ── */}
      <section className="relative py-24 bg-white overflow-hidden">
        <MandalaHeroBg />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[3/4] bg-lighter rounded-sm overflow-hidden">
                <img
                  src="/images/artwork-2.jpg"
                  alt="Monica Prakash – Mandala Art Therapist"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-muted text-sm tracking-[0.3em] uppercase mb-2">
                The Artist
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">
                Monica Prakash
              </h1>
              <p className="mt-2 font-display text-xl text-accent">
                Mandala Art Therapist & Founder of PraShree Arts
              </p>

              <div className="mt-8 space-y-4 text-muted leading-relaxed">
                <p>
                  Monica Prakash is a dedicated Mandala Art Therapist who believes
                  in the transformative power of art. Through PraShree Arts, she
                  brings together ancient artistic traditions and modern therapeutic
                  practices to create art that heals.
                </p>
                <p>
                  Her specialty lies in creating monochrome mandala compositions that
                  are intentionally left uncolored. This deliberate choice is rooted
                  in therapy — colored art can sometimes create mental conflict for
                  clients. By keeping mandalas in black and white, the focus remains
                  on the meditative process of creation and the calming symmetry of
                  sacred geometry.
                </p>
                <p>
                  As a specialist in Janur Art (Coconut Leaf Art), Monica preserves
                  and elevates this traditional craft from South India, transforming
                  coconut leaves into intricate art pieces that celebrate nature&apos;s
                  beauty.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Philosophy"
            subtitle="Art as a path to inner peace"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-12 border border-border"
          >
            <blockquote className="font-display text-xl md:text-2xl text-primary leading-relaxed text-center italic">
              "Art is not just about beauty — it is about balance, clarity, and
              the journey inward. Every mandala is a meditation, every stroke a
              step toward calm."
            </blockquote>
            <p className="text-center text-muted mt-6">— Monica Prakash</p>
          </motion.div>

          {/* Mandala artwork close-up */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 aspect-[16/9] overflow-hidden rounded-sm"
          >
            <img
              src="/images/artwork-3.jpg"
              alt="Intricate mandala artwork in progress by Monica Prakash"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Credentials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Expertise & Credentials"
            subtitle="A versatile artist with deep knowledge across multiple disciplines"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {credentials.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-6 border border-border hover:border-primary transition-colors group"
              >
                <item.icon
                  size={24}
                  className="text-accent group-hover:text-primary transition-colors"
                />
                <h3 className="font-display text-lg font-semibold text-primary mt-4">
                  {item.title}
                </h3>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Art Forms ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Art Forms"
            subtitle="Monica's expertise spans traditional and contemporary art disciplines"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {artForms.map((form, i) => (
              <motion.span
                key={form}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="px-4 py-2 border border-border text-sm text-secondary hover:border-primary hover:text-primary transition-colors cursor-default"
              >
                {form}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NeeRav Arts Village ── */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/60 text-sm tracking-[0.2em] uppercase mb-4">
              Creative Director
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              NeeRav Arts Village
            </h2>
            <p className="mt-6 text-white/70 leading-relaxed max-w-2xl mx-auto">
              Monica serves as the Creative Director at NeeRav Arts Village, a
              space dedicated to nurturing creativity through residential workshops
              and events. The village offers immersive art experiences in a
              serene, natural setting — perfect for those seeking artistic growth
              and therapeutic creativity.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
