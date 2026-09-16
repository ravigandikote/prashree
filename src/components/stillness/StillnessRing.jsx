/*
 * The breathing ring: concentric hairline strokes in paper on ink, drawn
 * with the same restraint as the compass — not a plain circle. The whole
 * group scales with the breath (CSS transition set by the overlay per
 * phase); under reduced motion it does not scale and the stroke weight
 * shifts between phases instead. A thin progress arc runs around the
 * outside across the full session.
 */
const S = 400, C = 200
const R_ARC = 186

export default function StillnessRing({ phaseKey, scale, transition, progress, progressTransition, reduced, weight }) {
  const circ = 2 * Math.PI * R_ARC
  const ringStyle = reduced
    ? { transformOrigin: `${C}px ${C}px` }
    : { transform: `scale(${scale})`, transformOrigin: `${C}px ${C}px`, transition }
  const w = weight  // base stroke weight; reduced-motion shifts this per phase

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="block w-full h-auto" aria-hidden="true" focusable="false">
      {/* session progress: a hairline arc filling clockwise from the top */}
      <circle cx={C} cy={C} r={R_ARC} fill="none" className="stroke-paper/20" strokeWidth="0.6" />
      <circle
        cx={C} cy={C} r={R_ARC} fill="none" className="stroke-paper/80" strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - progress)}
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${C}px ${C}px`, transition: progressTransition }}
      />

      {/* the breathing ring */}
      <g className={`stillness-ring stillness-${phaseKey}`} style={ringStyle}>
        <circle cx={C} cy={C} r={126} fill="none" className="stroke-paper" strokeWidth={w * 1.6} />
        <circle cx={C} cy={C} r={119} fill="none" className="stroke-paper/70" strokeWidth={w * 0.55} />
        <circle cx={C} cy={C} r={108} fill="none" className="stroke-paper/45" strokeWidth={w * 0.45} strokeDasharray="1.2 3.4" />
        <circle cx={C} cy={C} r={96} fill="none" className="stroke-paper/80" strokeWidth={w * 0.8} />
        {/* fine radial ticks between the inner rings, like the compass band */}
        {Array.from({ length: 72 }, (_, k) => {
          const a = (k * 5 * Math.PI) / 180
          const r0 = 98.5, r1 = k % 6 === 0 ? 105 : 102.5
          return (
            <line
              key={k}
              x1={C + r0 * Math.sin(a)} y1={C - r0 * Math.cos(a)}
              x2={C + r1 * Math.sin(a)} y2={C - r1 * Math.cos(a)}
              className="stroke-paper/60" strokeWidth={w * 0.4}
            />
          )
        })}
        <circle cx={C} cy={C} r={70} fill="none" className="stroke-paper/50" strokeWidth={w * 0.45} />
        <circle cx={C} cy={C} r={46} fill="none" className="stroke-paper/35" strokeWidth={w * 0.4} />
        <circle cx={C} cy={C} r={2.2} className="fill-paper/80" />
      </g>
    </svg>
  )
}
