import { motion } from 'framer-motion'
import { Circle, Triangle, Grid3X3, Flower2 } from 'lucide-react'

/* ── Sacred Geometry shapes and their mindfulness properties ── */
const shapes = [
    {
        icon: Circle,
        name: 'Circles',
        meaning: 'Wholeness & Unity',
        description:
            'The circle has no beginning or end — it represents eternity, the cycles of nature, and the wholeness of self. Drawing concentric circles calms the mind by anchoring it to a single, continuous motion.',
    },
    {
        icon: Triangle,
        name: 'Triangles',
        meaning: 'Stability & Direction',
        description:
            'Triangles embody strength and balance. In sacred geometry, the upward triangle represents aspiration; the downward, grounding. Repeating triangular patterns helps cultivate focus and intentional thought.',
    },
    {
        icon: Flower2,
        name: 'Petals',
        meaning: 'Growth & Unfolding',
        description:
            'Petal forms echo the Flower of Life, one of sacred geometry\'s oldest patterns. Creating petal arcs engages bilateral brain activity, promoting emotional release and creative flow.',
    },
    {
        icon: Grid3X3,
        name: 'Grids',
        meaning: 'Order & Interconnection',
        description:
            'Grid-based sacred geometry — like the Sri Yantra — maps the interconnection of all things. Working with grids instils a sense of order, reducing anxiety and encouraging systematic thinking.',
    },
]

/* ── Benefits of mandala practice ── */
const benefits = [
    'Reduces stress by activating the parasympathetic nervous system',
    'Improves concentration through repetitive, rhythmic mark-making',
    'Supports emotional processing and self-expression without words',
    'Promotes mindfulness by anchoring attention to the present moment',
    'Enhances fine motor skills and hand-eye coordination',
    'Creates a meditative state similar to focused breathing exercises',
]

/* ── Animation variants ── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SacredGeometryInfoSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ── Introduction ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center mb-16"
                >
                    <p className="text-muted text-sm tracking-[0.3em] uppercase mb-3">
                        The Art of Stillness
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
                        Sacred Geometry &amp; Mandala Practice
                    </h2>
                    <p className="text-secondary leading-relaxed">
                        Sacred geometry is the study of patterns, shapes, and proportions that
                        recur throughout nature — from the spiral of a seashell to the
                        symmetry of a snowflake. For thousands of years, cultures across the
                        world have used these geometric principles to create mandalas:
                        circular designs that serve as tools for meditation, healing, and
                        self-discovery.
                    </p>
                    <p className="text-muted leading-relaxed mt-4">
                        When we draw a mandala, we engage the mind in a gentle, repetitive
                        rhythm. Each circle, each line, each petal becomes an anchor — pulling
                        our attention away from scattered thoughts and into the present
                        moment. This is the essence of mandala therapy.
                    </p>
                </motion.div>

                {/* ── Mandala divider ── */}
                <div className="flex items-center justify-center gap-3 mb-16">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
                    <svg width="20" height="20" viewBox="0 0 20 20" className="text-primary">
                        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
                        <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
                    </svg>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
                </div>

                {/* ── Shape cards ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
                >
                    {shapes.map((shape) => (
                        <motion.div
                            key={shape.name}
                            variants={itemVariants}
                            className="group p-6 border border-border rounded-sm hover:border-primary transition-colors duration-300"
                        >
                            <shape.icon
                                size={28}
                                strokeWidth={1.2}
                                className="text-muted group-hover:text-primary transition-colors duration-300 mb-4"
                            />
                            <h3 className="font-display text-lg font-semibold text-primary mb-1">
                                {shape.name}
                            </h3>
                            <p className="text-xs tracking-[0.15em] uppercase text-muted mb-3">
                                {shape.meaning}
                            </p>
                            <p className="text-sm text-secondary leading-relaxed">
                                {shape.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Geometric Harmony section ── */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
                    {/* Decorative mandala SVG */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center justify-center"
                    >
                        <svg
                            viewBox="0 0 400 400"
                            className="w-full max-w-sm text-primary"
                            fill="none"
                        >
                            {/* Concentric circles using golden ratio scaling */}
                            {[40, 64.7, 104.7, 169.4, 274.1].map((r, i) => (
                                <circle
                                    key={`c-${i}`}
                                    cx="200"
                                    cy="200"
                                    r={r}
                                    stroke="currentColor"
                                    strokeWidth={i === 0 ? 1.5 : 0.6}
                                    opacity={1 - i * 0.15}
                                />
                            ))}
                            {/* 12-fold radial lines */}
                            {Array.from({ length: 12 }, (_, i) => {
                                const angle = (i * 30 * Math.PI) / 180
                                return (
                                    <line
                                        key={`l-${i}`}
                                        x1="200"
                                        y1="200"
                                        x2={200 + 180 * Math.cos(angle)}
                                        y2={200 + 180 * Math.sin(angle)}
                                        stroke="currentColor"
                                        strokeWidth="0.3"
                                    />
                                )
                            })}
                            {/* Petal arcs — 6-fold */}
                            {Array.from({ length: 6 }, (_, i) => (
                                <ellipse
                                    key={`p-${i}`}
                                    cx="200"
                                    cy="130"
                                    rx="22"
                                    ry="50"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    transform={`rotate(${i * 60} 200 200)`}
                                />
                            ))}
                            {/* Inner Flower of Life hint — 6 overlapping circles */}
                            {Array.from({ length: 6 }, (_, i) => {
                                const a = (i * 60 * Math.PI) / 180
                                return (
                                    <circle
                                        key={`fl-${i}`}
                                        cx={200 + 40 * Math.cos(a)}
                                        cy={200 + 40 * Math.sin(a)}
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="0.4"
                                        strokeDasharray="3 3"
                                    />
                                )
                            })}
                        </svg>
                    </motion.div>

                    {/* Text content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3 className="font-display text-2xl font-bold text-primary mb-4">
                            How Geometric Repetition Heals
                        </h3>
                        <p className="text-secondary leading-relaxed mb-4">
                            Repeating geometric forms follows the same principle as a mantra in
                            meditation. The mind latches onto the rhythm of drawing identical
                            shapes — circle after circle, petal after petal — and gradually
                            releases its grip on worry and distraction.
                        </p>
                        <p className="text-muted leading-relaxed mb-6">
                            Sacred geometry ratios, like the Golden Ratio (φ ≈ 1.618), appear
                            throughout nature and inherently feel balanced to the human eye.
                            When these proportions guide a mandala's structure, the resulting
                            pattern resonates with our innate sense of harmony, deepening the
                            meditative effect.
                        </p>

                        {/* Benefits list */}
                        <h4 className="font-display text-sm tracking-[0.15em] uppercase text-muted mb-3">
                            Benefits of Mandala Practice
                        </h4>
                        <ul className="space-y-2">
                            {benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
