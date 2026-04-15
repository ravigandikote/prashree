import SEO from '../components/SEO'
import { MandalaHeroBg } from '../components/UI'
import SacredGeometryInfoSection from '../components/SacredGeometryInfoSection'
import PatternGenerator from '../components/PatternGenerator'
import { motion } from 'framer-motion'

export default function SacredGeometry() {
    return (
        <>
            <SEO
                title="Sacred Geometry & Mandala Practice"
                description="Explore the meditative art of sacred geometry. Learn how mandala patterns promote mindfulness, reduce stress, and create inner balance. Try our interactive mandala pattern generator."
                path="/sacred-geometry"
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
                        <p className="text-muted text-sm tracking-[0.3em] uppercase mb-4">
                            Mandala Art Therapy
                        </p>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
                            Sacred Geometry
                        </h1>
                        <p className="text-secondary leading-relaxed max-w-xl mx-auto">
                            Discover how ancient geometric patterns cultivate stillness,
                            focus, and emotional balance — then create your own mandala
                            using sacred proportions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Educational content ── */}
            <SacredGeometryInfoSection />

            {/* ── Interactive pattern generator ── */}
            <PatternGenerator />

            {/* ── Closing call-to-action ── */}
            <section className="py-16 bg-white">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-display text-2xl font-bold text-primary mb-4">
                            Continue Your Practice
                        </h2>
                        <p className="text-muted leading-relaxed mb-6">
                            Sacred geometry is not just art — it is a path to inner clarity.
                            Explore our mandala art collection or join a therapeutic workshop
                            to deepen your practice with guided instruction.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/categories/mandala-art"
                                className="px-6 py-3 bg-primary text-white font-medium tracking-wide rounded-sm
                           hover:bg-secondary transition-colors no-underline"
                            >
                                Browse Mandala Art
                            </a>
                            <a
                                href="/workshops"
                                className="px-6 py-3 border border-primary text-primary font-medium tracking-wide
                           rounded-sm hover:bg-primary hover:text-white transition-colors no-underline"
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
