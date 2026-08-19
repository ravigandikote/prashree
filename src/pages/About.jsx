import { motion } from 'framer-motion'
import { Palette, Heart, Star, Award, Users, Leaf } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import Photo from '../components/Photo'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.3, ease: 'easeOut' },
}

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
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Photo
                base="/images/monica/portraits/20250620-IMG_1984"
                alt="Monica Prakash in a black-and-white Warli-print saree beside a vintage lantern"
                treatment="duotone"
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <p className="text-small uppercase tracking-label text-graphite mb-3">
                The Artist
              </p>
              <h1 className="font-display text-display md:text-display-xl text-ink">
                Monica Prakash
              </h1>
              <p className="mt-3 font-display text-h3 text-charcoal italic">
                Mandala Art Therapist &amp; Founder of PraShree Arts
              </p>

              <div className="mt-8 space-y-4 text-graphite">
                <p>
                  Monica Prakash is a dedicated Mandala Art Therapist who believes
                  in the transformative power of art. Through PraShree Arts, she
                  brings together ancient artistic traditions and modern therapeutic
                  practices to create art that heals.
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

      {/* ── Why black and white ── */}
      <section className="bg-paper border-y border-mist py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <motion.div {...fadeUp} className="md:col-span-3">
              <SectionHeading
                align="left"
                eyebrow="Philosophy"
                title="Why black and white"
                className="mb-6"
              />
              <div className="space-y-4 text-graphite">
                <p>
                  Monica&apos;s monochrome mandala compositions are intentionally
                  left uncolored. This deliberate choice is rooted in therapy —
                  colored art can sometimes create mental conflict for clients. By
                  keeping mandalas in black and white, the focus remains on the
                  meditative process of creation and the calming symmetry of
                  sacred geometry.
                </p>
                <blockquote className="border-l-2 border-ink pl-6 py-1 font-display text-h3 text-ink italic">
                  &ldquo;Art is not just about beauty — it is about balance,
                  clarity, and the journey inward. Every mandala is a meditation,
                  every stroke a step toward calm.&rdquo;
                </blockquote>
                <p className="text-small text-ash">— Monica Prakash</p>
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="md:col-span-2">
              <Photo
                base="/images/monica/portraits/20250831-IMG_1132"
                alt="Monica in an ikat saree, looking upward in soft natural light"
                treatment="grayscale"
                aspect="aspect-[3/4]"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Her practice ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Her Practice"
            title="Expertise & credentials"
            subtitle="A versatile artist with deep knowledge across multiple disciplines"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-mist border border-mist">
            {credentials.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white p-8"
              >
                <item.icon size={22} className="text-graphite" aria-hidden="true" />
                <h3 className="font-display text-h3 text-ink mt-4">{item.title}</h3>
                <p className="text-graphite text-small mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching ── */}
      <section className="bg-paper border-y border-mist py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <Photo
                base="/images/monica/teaching/20251227-IMG_7546"
                alt="Monica guiding workshop participants through a mandala drawing"
                treatment="grayscale"
                aspect="aspect-[3/4]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </motion.div>
            <motion.div {...fadeUp}>
              <SectionHeading
                align="left"
                eyebrow="Teaching"
                title="Passing the practice on"
                className="mb-6"
              />
              <p className="text-graphite">
                Monica teaches Mandala Art, Janur Art, and other DIY art forms —
                and guides meditation practice alongside them. Her workshops at
                NeeRav Arts Village bring participants of all skill levels into a
                calm, hands-on rhythm of making.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Décor & occasions ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Natural Décor"
            title="Occasions & installations"
            subtitle="Monica designs natural décor for celebrations — dried palm backdrops, table arrangements, and bespoke installations."
          />
          <motion.div {...fadeUp}>
            <Photo
              base="/images/monica/decor/20250828-IMG_4718"
              alt="An anniversary décor installation by Monica — dried palm-leaf backdrop, dressed table, and marquee letters"
              treatment="duotone"
              aspect="aspect-[2/1]"
              position="center 20%"
              sizes="(min-width: 1200px) 1200px, 100vw"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Beyond the studio ── */}
      <section className="bg-paper border-y border-mist py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Beyond the Studio"
            title="Model & actor"
            subtitle="Monica's creative life extends in front of the camera as well."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { base: '/images/monica/portraits/20250828-IMG_0812', alt: 'Monica in a white jumpsuit and sunglasses in a garden' },
              { base: '/images/monica/portraits/20250918-IMG_1516', alt: 'Monica seated on a log in a black dress, garden behind her' },
              { base: '/images/monica/portraits/20251118-IMG_1862-2', alt: 'Night portrait of Monica in a dark green dress with warm rim light' },
            ].map((img, i) => (
              <motion.div
                key={img.base}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <Photo
                  base={img.base}
                  alt={img.alt}
                  treatment="grayscale"
                  aspect="aspect-[3/4]"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Art forms ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Range"
            title="Art forms"
            subtitle="Monica's expertise spans traditional and contemporary art disciplines"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {artForms.map((form) => (
              <span
                key={form}
                className="px-4 py-2 border border-mist text-small text-charcoal hover:border-ink transition-colors cursor-default"
              >
                {form}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NeeRav Arts Village ── */}
      <section className="bg-ink text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <p className="text-small uppercase tracking-label text-white/60 mb-4">
              Creative Director
            </p>
            <h2 className="font-display text-display-sm md:text-display text-white">
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
