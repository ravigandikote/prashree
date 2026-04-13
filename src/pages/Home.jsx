import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Palette, Heart, Star } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading, MandalaHeroBg } from '../components/UI'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../lib/supabase'
import logo from '../assets/logo.png'

/* ── Fallback data when Supabase is not yet configured ── */
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Mandala Art', slug: 'mandala-art', description: 'Sacred geometry and meditative patterns' },
  { id: '2', name: 'Janur Art', slug: 'janur-art', description: 'Coconut leaf art — traditional craft reimagined' },
  { id: '3', name: 'Wall Arts', slug: 'wall-arts', description: 'Mandala and Warli wall décor' },
  { id: '4', name: 'Home Décor', slug: 'home-decor', description: 'Handcrafted pieces for your space' },
  { id: '5', name: 'Abstract Paintings', slug: 'abstract-paintings', description: 'Expressive abstract art on canvas' },
  { id: '6', name: 'Doodle Art', slug: 'doodle-art', description: 'Intricate hand-drawn doodle compositions' },
]

const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Mandala Wall Frame', slug: 'mandala-wall-frame', price: 2500, images: [], categories: { name: 'Mandala Art', slug: 'mandala-art' } },
  { id: '2', name: 'Janur Table Runner', slug: 'janur-table-runner', price: 1800, images: [], categories: { name: 'Janur Art', slug: 'janur-art' } },
  { id: '3', name: 'Warli Wall Art', slug: 'warli-wall-art', price: 3200, sale_price: 2800, images: [], categories: { name: 'Wall Arts', slug: 'wall-arts' } },
  { id: '4', name: 'Abstract Canvas', slug: 'abstract-canvas', price: 4500, images: [], categories: { name: 'Abstract Paintings', slug: 'abstract-paintings' } },
]

export default function Home() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [featuredProducts, setFeaturedProducts] = useState(FALLBACK_PRODUCTS)

  useEffect(() => {
    getCategories()
      .then((data) => { if (data?.length) setCategories(data.slice(0, 6)) })
      .catch(() => { })
    getProducts({ featured: true, limit: 4 })
      .then((data) => { if (data?.length) setFeaturedProducts(data) })
      .catch(() => { })
  }, [])

  return (
    <>
      <SEO />

      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
        <MandalaHeroBg />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-muted text-sm tracking-[0.3em] uppercase mb-4">
              Art . Therapy . Balance
            </p>
            <img
              src={logo}
              alt="PraShree Arts Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto mb-4"
            />
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary leading-tight">
              PraShree Arts
            </h1>
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <p className="mt-8 text-lg md:text-xl text-secondary font-display max-w-2xl mx-auto">
              Monica Prakash — Mandala Art Therapist &amp; Founder
            </p>
            <p className="mt-4 text-muted max-w-xl mx-auto leading-relaxed">
              Discover handcrafted art that brings balance, clarity, and calm.
              From intricate mandalas to traditional Janur art, every piece is a
              journey toward inner peace.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium tracking-wide hover:bg-secondary transition-colors no-underline"
              >
                Explore Art <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary font-medium tracking-wide hover:bg-primary hover:text-white transition-colors no-underline"
              >
                About Monica
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Categories ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Art Categories"
            subtitle="Explore our diverse collection of handcrafted art forms"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors no-underline"
            >
              View All Categories <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Founder Introduction ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[3/4] bg-lighter rounded-sm overflow-hidden">
                <img
                  src="/images/artwork-2.jpg"
                  alt="Monica Prakash drawing mandala art"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-muted text-sm tracking-[0.2em] uppercase mb-2">
                Meet the Artist
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                Monica Prakash
              </h2>
              <p className="mt-2 font-display text-lg text-accent">
                Mandala Art Therapist & Founder
              </p>
              <p className="mt-6 text-muted leading-relaxed">
                With a deep passion for art and healing, Monica specializes in
                Mandala Art Therapy and Janur Art (Coconut Leaf Art). As the
                Creative Director at NeeRav Arts Village, she brings together
                traditional artistry and modern therapeutic practices.
              </p>
              <p className="mt-4 text-muted leading-relaxed">
                Her monochrome mandala creations are intentionally left uncolored —
                designed to avoid mental conflict and promote stress relief,
                balance, and clarity for her clients.
              </p>
              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { icon: Palette, label: 'Mandala Therapy' },
                  { icon: Heart, label: 'Stress Relief' },
                  { icon: Star, label: '20+ Art Forms' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-secondary">
                    <item.icon size={16} className="text-accent" />
                    {item.label}
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors no-underline"
              >
                Read Full Story <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured Artworks"
            subtitle="Curated pieces available for purchase"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA: Workshops ── */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/artwork-1.jpg"
            alt="Workshop at NeeRav Arts Village"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/60 text-sm tracking-[0.2em] uppercase mb-4">
              NeeRav Arts Village
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Workshops &amp; Events
            </h2>
            <p className="mt-6 text-white/70 leading-relaxed max-w-xl mx-auto">
              Join residential workshops at NeeRav Arts Village. Learn Mandala
              Art Therapy, Janur Art, and other art forms in a calming, natural
              environment.
            </p>
            <Link
              to="/workshops"
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 border border-white text-white font-medium tracking-wide hover:bg-white hover:text-primary transition-colors no-underline"
            >
              Explore Workshops <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
