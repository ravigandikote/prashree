import SEO from '../components/SEO'
import { MandalaHeroBg } from '../components/UI'
import SacredGeometryInfoSection from '../components/SacredGeometryInfoSection'
import { motion } from 'framer-motion'

export default function SacredGeometry() {
    return (
        <>
            <SEO
                title="Sacred Geometry & Mandala Practice"
                description="Explore the meditative art of sacred geometry. Learn how mandala patterns promote mindfulness, reduce stress, and create inner balance — and draw your own with our interactive mandala pattern generator."
                path="/sacred-geometry"
                keywords={[
                  'sacred geometry meaning', 'mandala meditation', 'flower of life',
                  'golden ratio art', 'mandala pattern generator', 'mindfulness art',
                ]}
            />

            {/* ── Hero banner ── */}
            <section className="relative py-24 bg-white overflow-hidden">
                <MandalaHeroBg />
                <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-graphite text-sm tracking-[0.3em] uppercase mb-4">
                            Mandala Art Therapy
                        </p>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-6">
                            Sacred Geometry
                        </h1>
                        <p className="text-charcoal leading-relaxed max-w-xl mx-auto">
                            Discover how ancient geometric patterns cultivate stillness,
                            focus, and emotional balance — then create your own mandala
                            using sacred proportions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Educational content ── */}
            <SacredGeometryInfoSection />

            {/* ── Try it yourself: the Mandala Studio ── */}
            <section className="py-20 bg-ink text-white">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <p className="text-small uppercase tracking-label text-white/60 mb-3">
                        Try it yourself
                    </p>
                    <h2 className="font-display text-display-sm text-white">
                        The Mandala Studio
                    </h2>
                    <p className="mt-4 text-white/70">
                        Construct a mandala the way it's taught on paper — centre,
                        circles, radial guides, patterns — and download a true-size
                        PDF to print and fill by hand.
                    </p>
                    <div className="mt-8">
                        <a
                            href="/studio"
                            className="inline-flex items-center gap-2 px-8 py-3 text-small font-medium uppercase tracking-label border border-white text-white hover:bg-white hover:text-ink transition-colors no-underline"
                        >
                            Open the Studio
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Closing call-to-action ── */}
            <section className="py-16 bg-white">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-display text-2xl font-bold text-ink mb-4">
                            Continue Your Practice
                        </h2>
                        <p className="text-graphite leading-relaxed mb-6">
                            Sacred geometry is not just art — it is a path to inner clarity.
                            Explore our mandala art collection or join a therapeutic workshop
                            to deepen your practice with guided instruction.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/products"
                                className="px-6 py-3 bg-ink text-white font-medium tracking-wide rounded-sm
                           hover:bg-charcoal transition-colors no-underline"
                            >
                                Browse Mandala Art
                            </a>
                            <a
                                href="/learn"
                                className="px-6 py-3 border border-ink text-ink font-medium tracking-wide
                           rounded-sm hover:bg-ink hover:text-white transition-colors no-underline"
                            >
                                View Workshops
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
