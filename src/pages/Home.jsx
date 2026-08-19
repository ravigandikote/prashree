import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import Button from '../components/Button'
import Photo from '../components/Photo'
import { getPublishedPosts } from '../lib/supabase'
import { formatDate } from '../lib/format'
import logo from '../assets/logo.png'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getPublishedPosts({ limit: 3 })
      .then((data) => setPosts(data || []))
      .catch(() => {})
  }, [])

  return (
    <>
      <SEO />

      {/* ── Hero ── */}
      <section className="bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <img
                src={logo}
                alt="PraShree Arts mandala logo"
                className="w-20 h-20 object-contain mb-8"
              />
              <p className="text-small uppercase tracking-label text-graphite mb-4">
                Handcrafted Art · Bengaluru
              </p>
              <h1 className="font-display text-display md:text-display-xl text-ink">
                PraShree Arts
              </h1>
              <p className="mt-6 font-display text-h3 text-charcoal italic">
                One roof for Monica Prakash&apos;s art — made by hand, in black and white.
              </p>
              <p className="mt-6 text-graphite max-w-md">
                Mandala Art Therapy, Janur (coconut-leaf) art, natural décor, and
                bespoke commissions. Every piece is a journey toward balance,
                clarity, and calm.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button to="/products">
                  View Artworks <ArrowRight size={14} />
                </Button>
                <Button to="/learn" variant="outline">
                  Learn with Monica
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Photo
                base="/images/monica/portraits/20250620-IMG_2199"
                alt="Monica Prakash smiling, holding a hand-drawn black-and-white mandala on white card"
                treatment="duotone"
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What PraShree Arts is ── */}
      <section className="bg-paper border-y border-mist">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-20 text-center">
          <motion.p {...fadeUp} className="font-display text-h3 md:text-h2 text-ink leading-snug">
            PraShree Arts is the heart of Monica&apos;s art world — one roof under
            which she creates art for herself and takes bespoke orders shaped by
            each customer&apos;s own story. She believes in black and white; so
            does everything here.
          </motion.p>
        </div>
      </section>

      {/* ── Artworks & Products ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <Photo
                base="/images/monica/portraits/20250620-IMG_2208"
                alt="A hand-drawn monochrome mandala card held forward in sharp focus, Monica in soft focus behind it"
                treatment="duotone"
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </motion.div>
            <motion.div {...fadeUp}>
              <SectionHeading
                align="left"
                eyebrow="Artworks & Products"
                title="Made by hand, made to order"
                className="mb-6"
              />
              <p className="text-graphite">
                From intricate mandala compositions to Janur pieces woven from
                coconut leaves — each artwork is handcrafted by Monica. Bespoke
                commissions are shaped around your requirements: a size, a story,
                a space.
              </p>
              <Button to="/products" variant="link" className="mt-8">
                Browse the collection <ArrowRight size={14} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Full-bleed banner ── */}
      <Photo
        base="/images/monica/portraits/20250620-IMG_1958"
        alt="Monica seated by a railing amid greenery, looking into the distance"
        treatment="duotone"
        aspect="aspect-[2/1] md:aspect-[3/1]"
        sizes="100vw"
        className="w-full"
      />

      {/* ── Learn with Monica ── */}
      <section className="bg-paper py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp} className="md:order-2">
              <Photo
                base="/images/monica/teaching/20251227-IMG_7529"
                alt="Monica demonstrating a mandala sketch to a seated workshop group outdoors under fairy lights, singing bowls on the table"
                treatment="duotone"
                aspect="aspect-[3/4]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </motion.div>
            <motion.div {...fadeUp} className="md:order-1">
              <SectionHeading
                align="left"
                eyebrow="Learn with Monica"
                title="Classes, workshops & practice"
                className="mb-6"
              />
              <ul className="space-y-5 list-none p-0">
                <li>
                  <h3 className="font-display text-h3 text-ink">Mandala Art</h3>
                  <p className="text-graphite text-small mt-1">
                    Therapeutic mandala drawing — sacred geometry as a meditative practice.
                  </p>
                </li>
                <li>
                  <h3 className="font-display text-h3 text-ink">Janur Art</h3>
                  <p className="text-graphite text-small mt-1">
                    The traditional craft of coconut-leaf art, taught hands-on.
                  </p>
                </li>
                <li>
                  <h3 className="font-display text-h3 text-ink">Meditation</h3>
                  <p className="text-graphite text-small mt-1">
                    Guided practice for stillness and clarity, woven through every session.
                  </p>
                </li>
              </ul>
              <Button to="/learn" variant="link" className="mt-8">
                See all offerings <ArrowRight size={14} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Natural Décor & Bespoke Orders ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Natural Décor & Bespoke Orders"
            title="Occasions, dressed by hand"
            subtitle="Backdrops, table arrangements, and event décor built from natural materials — dried palm, leaves, and flowers — designed for your occasion."
          />
          <motion.div {...fadeUp}>
            <Photo
              base="/images/monica/decor/20250828-IMG_4718"
              alt="Monica behind a dressed anniversary table with a dramatic dried palm-leaf backdrop, cake stand, and marquee letters"
              treatment="duotone"
              aspect="aspect-[2/1]"
              sizes="(min-width: 1200px) 1200px, 100vw"
            />
          </motion.div>
          <div className="text-center mt-10">
            <Button to="/contact" variant="outline">
              Plan an occasion <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="bg-paper border-y border-mist py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <Photo
                base="/images/monica/portraits/20250620-IMG_1998"
                alt="Monica Prakash in a black-and-white Warli-print saree, leaning on a rustic wooden rail by a carved door"
                treatment="grayscale"
                aspect="aspect-[4/5]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </motion.div>
            <motion.div {...fadeUp}>
              <SectionHeading
                align="left"
                eyebrow="The Founder"
                title="Monica Prakash"
                className="mb-6"
              />
              <p className="text-graphite">
                Mandala Art Therapist, Janur Art practitioner, and Creative
                Director at NeeRav Arts Village. Monica&apos;s monochrome mandalas
                are intentionally left uncolored — designed to quiet the mind and
                make room for balance and clarity.
              </p>
              <Button to="/about" variant="link" className="mt-8">
                Read her story <ArrowRight size={14} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Community & Connections ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp} className="md:order-2">
              <Photo
                base="/images/monica/teaching/20251227-IMG_7546"
                alt="Monica leaning over workshop participants, guiding their mandala drawing"
                treatment="grayscale"
                aspect="aspect-[3/4]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </motion.div>
            <motion.div {...fadeUp} className="md:order-1">
              <SectionHeading
                align="left"
                eyebrow="Community & Connections"
                title="Art that gathers people"
                className="mb-6"
              />
              <p className="text-graphite">
                Monica&apos;s practice reaches beyond the studio — as Creative
                Director at NeeRav Arts Village and through community and
                social-service partnerships around Bengaluru.
              </p>
              <Button to="/connections" variant="link" className="mt-8">
                See her connections <ArrowRight size={14} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Latest from the blog (hidden until posts exist) ── */}
      {posts.length > 0 && (
        <section className="bg-paper border-t border-mist py-20 md:py-28">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Blog"
              title="Notes from the studio"
            />
            <div className="grid md:grid-cols-3 gap-10">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="no-underline group">
                  {post.cover_image && (
                    <div className="aspect-[3/2] overflow-hidden bg-white mb-4">
                      <img
                        src={post.cover_image}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover treat-grayscale"
                      />
                    </div>
                  )}
                  <p className="text-small text-ash">{formatDate(post.published_at)}</p>
                  <h3 className="font-display text-h3 text-ink mt-1 group-hover:underline decoration-1 underline-offset-4">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-graphite text-small mt-2">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button to="/blog" variant="link">
                All posts <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Enquiry CTA ── */}
      <section className="bg-ink text-white py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <p className="text-small uppercase tracking-label text-white/60 mb-4">
              Bespoke Orders & Enquiries
            </p>
            <h2 className="font-display text-display-sm md:text-display text-white">
              Have something in mind?
            </h2>
            <p className="mt-6 text-white/70 max-w-lg mx-auto">
              A commission, a workshop, an occasion to dress — tell Monica what
              you&apos;re imagining.
            </p>
            <div className="mt-10">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 text-small font-medium uppercase tracking-label border border-white text-white hover:bg-white hover:text-ink transition-colors no-underline"
              >
                Get in touch <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
