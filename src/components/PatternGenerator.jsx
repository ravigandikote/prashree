import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MandalaCanvas from './MandalaCanvas'

/* ── Symmetry presets tied to sacred geometry traditions ── */
const SYMMETRY_OPTIONS = [
    { value: 6, label: '6-fold', note: 'Flower of Life' },
    { value: 8, label: '8-fold', note: 'Dharma Wheel' },
    { value: 12, label: '12-fold', note: 'Zodiac / Clock' },
    { value: 16, label: '16-fold', note: 'Sri Yantra' },
]

const MIN_CIRCLES = 1
const MAX_CIRCLES = 20

export default function PatternGenerator() {
    const [inputValue, setInputValue] = useState('5')
    const [symmetry, setSymmetry] = useState(12)
    const [generated, setGenerated] = useState(null) // { circleCount, symmetry }

    /* ── Generate handler — validates then renders ── */
    const handleGenerate = useCallback(() => {
        const num = parseInt(inputValue, 10)
        if (isNaN(num) || num < MIN_CIRCLES || num > MAX_CIRCLES) return
        setGenerated({ circleCount: num, symmetry })
    }, [inputValue, symmetry])

    /* ── Keyboard shortcut: Enter to generate ── */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleGenerate()
    }

    const isValid =
        !isNaN(parseInt(inputValue, 10)) &&
        parseInt(inputValue, 10) >= MIN_CIRCLES &&
        parseInt(inputValue, 10) <= MAX_CIRCLES

    return (
        <section className="py-20 bg-surface">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ── Heading ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <p className="text-muted text-sm tracking-[0.3em] uppercase mb-3">
                        Create Your Own
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                        Mandala Pattern Generator
                    </h2>
                    <p className="text-muted max-w-xl mx-auto">
                        Enter the number of concentric circles and choose a symmetry fold.
                        Watch sacred geometry come to life in real time.
                    </p>
                </motion.div>

                {/* ── Controls ── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-lg mx-auto mb-12"
                >
                    {/* Circle count input */}
                    <div className="mb-6">
                        <label
                            htmlFor="circle-count"
                            className="block text-sm font-medium text-secondary mb-2"
                        >
                            Number of Circles
                            <span className="text-muted ml-1 font-normal">
                                ({MIN_CIRCLES}–{MAX_CIRCLES})
                            </span>
                        </label>
                        <input
                            id="circle-count"
                            type="number"
                            min={MIN_CIRCLES}
                            max={MAX_CIRCLES}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-3 border border-border rounded-sm bg-white text-primary
                         font-body text-base focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. 5"
                        />
                        {inputValue && !isValid && (
                            <p className="text-sm text-muted mt-1">
                                Please enter a number between {MIN_CIRCLES} and {MAX_CIRCLES}.
                            </p>
                        )}
                    </div>

                    {/* Symmetry selector */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Symmetry Fold
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {SYMMETRY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSymmetry(opt.value)}
                                    className={`px-3 py-2 border rounded-sm text-sm transition-all duration-200
                    ${symmetry === opt.value
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-border bg-white text-secondary hover:border-accent'
                                        }`}
                                >
                                    <span className="font-medium">{opt.label}</span>
                                    <br />
                                    <span className="text-[11px] opacity-70">{opt.note}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!isValid}
                        className="w-full py-3 bg-primary text-white font-medium tracking-wide rounded-sm
                       hover:bg-secondary transition-colors duration-200 disabled:opacity-40
                       disabled:cursor-not-allowed"
                    >
                        Generate Pattern
                    </button>
                </motion.div>

                {/* ── Output area ── */}
                <AnimatePresence mode="wait">
                    {generated && (
                        <motion.div
                            key={`${generated.circleCount}-${generated.symmetry}`}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="max-w-lg mx-auto"
                        >
                            {/* Pattern card */}
                            <div className="bg-white border border-border rounded-sm p-6 sm:p-8">
                                <MandalaCanvas
                                    circleCount={generated.circleCount}
                                    symmetry={generated.symmetry}
                                />

                                {/* Pattern info */}
                                <div className="mt-6 pt-4 border-t border-light text-center">
                                    <p className="text-xs tracking-[0.15em] uppercase text-muted mb-1">
                                        Pattern Details
                                    </p>
                                    <p className="text-sm text-secondary">
                                        {generated.circleCount} concentric ring
                                        {generated.circleCount !== 1 ? 's' : ''} &middot;{' '}
                                        {generated.symmetry}-fold radial symmetry &middot; Golden
                                        Ratio (φ) spacing
                                    </p>
                                </div>
                            </div>

                            {/* Reflection prompt */}
                            <p className="text-center text-muted text-sm mt-6 italic">
                                "Observe the pattern. Let your eyes trace from the centre
                                outward. Notice the rhythm. Breathe."
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
