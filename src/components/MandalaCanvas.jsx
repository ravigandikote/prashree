import { useMemo } from 'react'

/* ── Golden Ratio constant used throughout the pattern ── */
const PHI = 1.618033988749895

/**
 * MandalaCanvas renders a single mandala pattern as an SVG.
 *
 * Pattern math:
 * - The base radius starts at `baseRadius` and each successive circle
 *   is scaled by 1/PHI (golden ratio) relative to the viewBox.
 * - Radial symmetry lines are drawn at equal angular intervals (360/symmetry).
 * - Petal ellipses are placed at golden-ratio-scaled distances from center.
 * - Decorative dots sit on the outermost ring at symmetry points.
 *
 * All coordinates are relative to a 400×400 viewBox for resolution independence.
 */
export default function MandalaCanvas({
    circleCount = 5,
    symmetry = 12,
    size = 400,
}) {
    const cx = size / 2
    const cy = size / 2
    const maxRadius = size * 0.44 // leave a small margin

    /* ── Compute radii using golden ratio spacing ── */
    const radii = useMemo(() => {
        if (circleCount <= 0) return []
        if (circleCount === 1) return [maxRadius * 0.5]

        // Distribute circles from smallest to largest using φ-based spacing
        const arr = []
        const minR = maxRadius * 0.08
        for (let i = 0; i < circleCount; i++) {
            // Exponential interpolation so inner circles are closer together
            const t = i / (circleCount - 1)
            const r = minR + (maxRadius - minR) * Math.pow(t, 1 / PHI)
            arr.push(r)
        }
        return arr
    }, [circleCount, maxRadius])

    /* ── Symmetry angles ── */
    const angles = useMemo(
        () => Array.from({ length: symmetry }, (_, i) => (i * 2 * Math.PI) / symmetry),
        [symmetry],
    )

    /* ── Petal radii — placed at every other concentric ring ── */
    const petalRings = useMemo(
        () => radii.filter((_, i) => i > 0 && i % 2 === 0),
        [radii],
    )

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full text-primary"
            fill="none"
            role="img"
            aria-label={`Mandala pattern with ${circleCount} circles and ${symmetry}-fold symmetry`}
        >
            {/* Background circle (outermost boundary) */}
            <circle
                cx={cx}
                cy={cy}
                r={maxRadius}
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.15"
            />

            {/* ── Concentric circles ── */}
            {radii.map((r, i) => (
                <circle
                    key={`ring-${i}`}
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke="currentColor"
                    strokeWidth={i === radii.length - 1 ? 1.2 : 0.6}
                    opacity={0.3 + 0.7 * (i / Math.max(radii.length - 1, 1))}
                />
            ))}

            {/* ── Radial symmetry lines ── */}
            {angles.map((angle, i) => (
                <line
                    key={`ray-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={cx + maxRadius * Math.cos(angle)}
                    y2={cy + maxRadius * Math.sin(angle)}
                    stroke="currentColor"
                    strokeWidth="0.3"
                    opacity="0.25"
                />
            ))}

            {/* ── Petal ellipses at selected rings ── */}
            {petalRings.map((r, ri) => (
                <g key={`petal-group-${ri}`}>
                    {angles.map((angle, ai) => {
                        // Petal dimensions scale with ring radius
                        const rx = r * 0.18
                        const ry = r * 0.35
                        const angleDeg = (angle * 180) / Math.PI
                        return (
                            <ellipse
                                key={`petal-${ri}-${ai}`}
                                cx={cx}
                                cy={cy - r}
                                rx={rx}
                                ry={ry}
                                stroke="currentColor"
                                strokeWidth="0.4"
                                opacity={0.35 + ri * 0.15}
                                transform={`rotate(${angleDeg} ${cx} ${cy})`}
                            />
                        )
                    })}
                </g>
            ))}

            {/* ── Flower of Life overlay on inner ring ── */}
            {radii.length >= 3 && (
                <g opacity="0.2">
                    {angles.slice(0, 6).map((angle, i) => {
                        const r = radii[1]
                        return (
                            <circle
                                key={`fol-${i}`}
                                cx={cx + r * Math.cos(angle)}
                                cy={cy + r * Math.sin(angle)}
                                r={r}
                                stroke="currentColor"
                                strokeWidth="0.35"
                                strokeDasharray="2 3"
                            />
                        )
                    })}
                </g>
            )}

            {/* ── Decorative dots on outermost ring ── */}
            {radii.length > 0 &&
                angles.map((angle, i) => {
                    const outerR = radii[radii.length - 1]
                    return (
                        <circle
                            key={`dot-${i}`}
                            cx={cx + outerR * Math.cos(angle)}
                            cy={cy + outerR * Math.sin(angle)}
                            r="2"
                            fill="currentColor"
                            opacity="0.5"
                        />
                    )
                })}

            {/* ── Center dot ── */}
            <circle cx={cx} cy={cy} r="3" fill="currentColor" opacity="0.6" />
        </svg>
    )
}
