import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { SectionHeading, MandalaHeroBg } from '../components/UI'

const workshops = [
  {
    title: 'Mandala Art Therapy — Beginner',
    description: 'Discover the meditative power of mandala creation. Learn basic patterns, symmetry, and the therapeutic approach to sacred geometry.',
    duration: '2 Days',
    type: 'Residential',
    capacity: '15 participants',
    highlights: ['Basic mandala patterns', 'Therapeutic techniques', 'Materials provided', 'Certificate of completion'],
  },
  {
    title: 'Advanced Mandala Workshop',
    description: 'Deepen your mandala practice with complex patterns, layering techniques, and large-format compositions for experienced artists.',
    duration: '3 Days',
    type: 'Residential',
    capacity: '10 participants',
    highlights: ['Complex patterns', 'Large format work', 'Mixed media mandala', 'Portfolio review'],
  },
  {
    title: 'Janur Art (Coconut Leaf Art)',
    description: 'Learn the traditional art of weaving and crafting with coconut leaves. Create functional and decorative pieces from nature.',
    duration: '2 Days',
    type: 'Residential',
    capacity: '12 participants',
    highlights: ['Leaf selection & prep', 'Weaving techniques', 'Functional art pieces', 'Sustainability focus'],
  },
  {
    title: 'Mixed Media Art Retreat',
    description: 'A comprehensive art retreat covering multiple art forms — warli, abstract, doodle, and mixed media on various surfaces.',
    duration: '5 Days',
    type: 'Residential',
    capacity: '8 participants',
    highlights: ['Multiple art forms', 'Various surfaces', 'Personal mentoring', 'Art exhibition'],
  },
  {
    title: 'Corporate Team Art Workshop',
    description: 'Custom-designed workshops for corporate teams. Use art as a tool for team building, stress relief, and creative thinking.',
    duration: 'Customizable',
    type: 'On-site / Residential',
    capacity: '20-50 participants',
    highlights: ['Team building', 'Stress management', 'Custom themes', 'Group art project'],
  },
  {
    title: 'Kids & Family Art Workshop',
    description: 'Fun, age-appropriate art activities for children and families. Explore DIY crafts, doodles, and simple mandala patterns.',
    duration: '1 Day',
    type: 'At NeeRav Arts Village',
    capacity: '20 participants',
    highlights: ['Age-appropriate activities', 'Family bonding', 'DIY crafts', 'Take-home creations'],
  },
]

export default function Workshops() {
  return (
    <>
      <SEO
        title="Workshops & Events"
        description="Join residential art workshops at NeeRav Arts Village. Mandala Art Therapy, Janur Art, corporate team workshops, and creative retreats by Monica Prakash."
        path="/workshops"
      />

      {/* ── Hero ── */}
      <section className="relative py-24 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/artwork-1.jpg"
            alt="Workshop at NeeRav Arts Village"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4">
              NeeRav Arts Village
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold">
              Workshops &amp; Events
            </h1>
            <p className="mt-6 text-white/70 max-w-2xl mx-auto leading-relaxed">
              Immerse yourself in art at NeeRav Arts Village. Our residential
              workshops offer hands-on learning in Mandala Art Therapy, Janur Art,
              and more — guided by Monica Prakash in a serene, natural setting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Venue Info ── */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'NeeRav Arts Village', desc: 'A serene creative space surrounded by nature, designed for immersive art experiences.' },
              { icon: Users, title: 'Expert-Led Sessions', desc: 'All workshops are conducted by Monica Prakash with personalized attention to each participant.' },
              { icon: Calendar, title: 'Year-Round Availability', desc: 'Workshops are available throughout the year. Contact us to check dates and book your spot.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center p-6"
              >
                <item.icon size={28} className="mx-auto text-accent" />
                <h3 className="font-display text-lg font-semibold text-primary mt-4">
                  {item.title}
                </h3>
                <p className="text-muted text-sm mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workshop Listings ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Available Workshops"
            subtitle="Choose from a range of art workshops tailored for different skill levels"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((ws, i) => (
              <motion.div
                key={ws.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-border p-6 hover:border-primary transition-colors group flex flex-col"
              >
                <h3 className="font-display text-xl font-semibold text-primary group-hover:text-accent transition-colors">
                  {ws.title}
                </h3>
                <p className="text-muted text-sm mt-3 leading-relaxed flex-1">
                  {ws.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 text-xs text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {ws.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {ws.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {ws.capacity}
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {ws.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-muted">
                      <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-primary text-sm font-medium hover:text-accent transition-colors no-underline"
                >
                  Enquire Now <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
            Custom Workshops Available
          </h2>
          <p className="text-muted mt-4 leading-relaxed">
            Looking for a custom workshop for your organization, school, or
            private group? Monica designs bespoke art experiences tailored to
            your team&apos;s needs and interests.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium tracking-wide hover:bg-secondary transition-colors no-underline"
          >
            Get in Touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
