/**
 * Pattern registry: tileable vector motifs recreated from the vocabulary of
 * Monica's reference artworks (petals, hatching, coils, nested geometry,
 * dots, scallops) — clean SVG paths, never traced photos.
 *
 * Every pattern exposes ringPaths(cell) → [{d|cx..., type, fill, stroke,
 * strokeWidth}] where the cell is an annulus slice config:
 *   { cx, cy, r0, r1, sectors, offset, weight }
 * Motifs are generated per sector from the same function of the sector's
 * angular range, so rotating a filled ring by one sector reproduces the
 * identical geometry (verified in tests).
 */

const INK = '#0a0a0a'
const f = (n) => +n.toFixed(3)

/** Point at radius r, angle a (deg, 0° = 12 o'clock, clockwise). */
function pt(cx, cy, r, a) {
  const rad = ((a - 90) * Math.PI) / 180
  return [f(cx + r * Math.cos(rad)), f(cy + r * Math.sin(rad))]
}

function sectorRanges(sectors, offset) {
  const step = 360 / sectors
  return Array.from({ length: Math.floor(sectors) }, (_, k) => {
    const a0 = offset + k * step
    return [a0, a0 + step]
  })
}

const stroke = (d, w) => ({ type: 'path', d, fill: 'none', stroke: INK, strokeWidth: w })
const solid = (d) => ({ type: 'path', d, fill: INK, stroke: 'none', strokeWidth: 0 })
const dot = (cx, cy, r) => ({ type: 'circle', cx, cy, r: f(r), fill: INK, stroke: 'none', strokeWidth: 0 })

/* ── shared shapes ── */

function petalPath(cx, cy, r0, r1, a0, a1) {
  const mid = (a0 + a1) / 2
  const w = a1 - a0
  const rm = r0 + (r1 - r0) * 0.45
  const rt = r0 + (r1 - r0) * 0.78
  const [bx, by] = pt(cx, cy, r0, mid)
  const [tx, ty] = pt(cx, cy, r1, mid)
  const [l1x, l1y] = pt(cx, cy, rm, a0 + w * 0.1)
  const [l2x, l2y] = pt(cx, cy, rt, a0 + w * 0.26)
  const [q1x, q1y] = pt(cx, cy, rt, a1 - w * 0.26)
  const [q2x, q2y] = pt(cx, cy, rm, a1 - w * 0.1)
  return `M ${bx} ${by} C ${l1x} ${l1y} ${l2x} ${l2y} ${tx} ${ty} C ${q1x} ${q1y} ${q2x} ${q2y} ${bx} ${by} Z`
}

function diamondPath(cx, cy, r0, r1, a0, a1, inset = 0) {
  const mid = (a0 + a1) / 2
  const rm = (r0 + r1) / 2
  const dr = ((r1 - r0) / 2) * (1 - inset)
  const da = ((a1 - a0) / 2) * (1 - inset)
  const [top] = [pt(cx, cy, rm + dr, mid)]
  const [right] = [pt(cx, cy, rm, mid + da)]
  const [bottom] = [pt(cx, cy, rm - dr, mid)]
  const [left] = [pt(cx, cy, rm, mid - da)]
  return `M ${top[0]} ${top[1]} L ${right[0]} ${right[1]} L ${bottom[0]} ${bottom[1]} L ${left[0]} ${left[1]} Z`
}

function spiralPath(cx, cy, r0, r1, a0, a1) {
  const mid = (a0 + a1) / 2
  const rm = (r0 + r1) / 2
  const [ccx, ccy] = pt(cx, cy, rm, mid)
  const rMax = Math.min((r1 - r0) * 0.38, ((a1 - a0) / 360) * Math.PI * rm * 0.8)
  const turns = 2.5
  const steps = 36
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const ang = t * turns * 360 + mid
    const rr = rMax * t
    const rad = ((ang - 90) * Math.PI) / 180
    pts.push(`${f(ccx + rr * Math.cos(rad))} ${f(ccy + rr * Math.sin(rad))}`)
  }
  return `M ${pts[0]} L ${pts.join(' L ')}`
}

/* ── the registry ── */

export const PATTERNS = [
  /* Petals & leaves */
  {
    id: 'petal-solid', name: 'Solid petal', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) =>
      solid(petalPath(c.cx, c.cy, c.r0, c.r1, a0, a1))),
  },
  {
    id: 'petal-outline', name: 'Outlined petal', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) =>
      stroke(petalPath(c.cx, c.cy, c.r0, c.r1, a0, a1), c.weight)),
  },
  {
    id: 'petal-vein', name: 'Feather petal', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const out = [stroke(petalPath(c.cx, c.cy, c.r0, c.r1, a0, a1), c.weight)]
      const [bx, by] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.05, mid)
      const [tx, ty] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.9, mid)
      out.push(stroke(`M ${bx} ${by} L ${tx} ${ty}`, c.weight))
      for (const t of [0.3, 0.5, 0.7]) {
        const rv = c.r0 + (c.r1 - c.r0) * t
        const spread = (a1 - a0) * 0.16 * (1 - t * 0.5)
        const [vx, vy] = pt(c.cx, c.cy, rv, mid)
        const [lx, ly] = pt(c.cx, c.cy, rv + (c.r1 - c.r0) * 0.12, mid - spread)
        const [rx, ry] = pt(c.cx, c.cy, rv + (c.r1 - c.r0) * 0.12, mid + spread)
        out.push(stroke(`M ${lx} ${ly} L ${vx} ${vy} L ${rx} ${ry}`, c.weight))
      }
      return out
    }),
  },

  /* Line work */
  {
    id: 'hatch-radial', name: 'Radial hatching', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const lines = []
      for (let i = 1; i <= 4; i++) {
        const a = a0 + ((a1 - a0) * i) / 5
        const [x1, y1] = pt(c.cx, c.cy, c.r0, a)
        const [x2, y2] = pt(c.cx, c.cy, c.r1, a)
        lines.push(stroke(`M ${x1} ${y1} L ${x2} ${y2}`, c.weight))
      }
      return lines
    }),
  },
  {
    id: 'spiral-coil', name: 'Spiral coil', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) =>
      stroke(spiralPath(c.cx, c.cy, c.r0, c.r1, a0, a1), c.weight)),
  },
  {
    id: 'ray-band', name: 'Sun rays', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const [b1x, b1y] = pt(c.cx, c.cy, c.r0, a0 + (a1 - a0) * 0.2)
      const [b2x, b2y] = pt(c.cx, c.cy, c.r0, a1 - (a1 - a0) * 0.2)
      const [tx, ty] = pt(c.cx, c.cy, c.r1, mid)
      return [solid(`M ${b1x} ${b1y} L ${tx} ${ty} L ${b2x} ${b2y} Z`)]
    }),
  },

  /* Geometry */
  {
    id: 'diamond-nest', name: 'Nested diamonds', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => [
      stroke(diamondPath(c.cx, c.cy, c.r0, c.r1, a0, a1, 0.08), c.weight),
      stroke(diamondPath(c.cx, c.cy, c.r0, c.r1, a0, a1, 0.42), c.weight),
      stroke(diamondPath(c.cx, c.cy, c.r0, c.r1, a0, a1, 0.72), c.weight),
    ]),
  },
  {
    id: 'triangle-dot', name: 'Triangle & dot', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const e = (a1 - a0) * 0.14
      const rt = c.r0 + (c.r1 - c.r0) * 0.68
      const [x1, y1] = pt(c.cx, c.cy, c.r0, a0 + e)
      const [x2, y2] = pt(c.cx, c.cy, c.r0, a1 - e)
      const [x3, y3] = pt(c.cx, c.cy, rt, mid)
      const [dx, dy] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.86, mid)
      return [
        stroke(`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`, c.weight),
        dot(dx, dy, Math.min(1.2, (c.r1 - c.r0) * 0.07)),
      ]
    }),
  },
  {
    id: 'chevron', name: 'Chevrons', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const [x1, y1] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.15, a0)
      const [x2, y2] = pt(c.cx, c.cy, c.r1 - (c.r1 - c.r0) * 0.15, mid)
      const [x3, y3] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.15, a1)
      return stroke(`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`, c.weight)
    }),
  },

  /* Dots & pebbles */
  {
    id: 'dot-border', name: 'Dot border', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const [x, y] = pt(c.cx, c.cy, (c.r0 + c.r1) / 2, (a0 + a1) / 2)
      return dot(x, y, Math.min(1.6, (c.r1 - c.r0) * 0.22))
    }),
  },
  {
    id: 'dot-gradient', name: 'Graduated dots', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      return [0.25, 0.55, 0.85].map((t, i) => {
        const [x, y] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * t, mid)
        return dot(x, y, Math.min(1.6, (c.r1 - c.r0) * (0.16 - i * 0.045)))
      })
    }),
  },

  /* Scallops & arches */
  {
    id: 'scallop', name: 'Scallops', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const rBase = c.r0 + (c.r1 - c.r0) * 0.25
      const [x1, y1] = pt(c.cx, c.cy, rBase, a0)
      const [x2, y2] = pt(c.cx, c.cy, rBase, a1)
      const chord = Math.hypot(x2 - x1, y2 - y1)
      return stroke(`M ${x1} ${y1} A ${f(chord / 2)} ${f(chord / 2)} 0 0 1 ${x2} ${y2}`, c.weight)
    }),
  },
  {
    id: 'arch-teardrop', name: 'Arch & teardrop', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const e = w * 0.18
      const rTop = c.r0 + (c.r1 - c.r0) * 0.72
      const [x1, y1] = pt(c.cx, c.cy, c.r0, a0 + e)
      const [x2, y2] = pt(c.cx, c.cy, rTop, a0 + e)
      const [x3, y3] = pt(c.cx, c.cy, rTop, a1 - e)
      const [x4, y4] = pt(c.cx, c.cy, c.r0, a1 - e)
      const chord = Math.hypot(x3 - x2, y3 - y2)
      const arch = `M ${x1} ${y1} L ${x2} ${y2} A ${f(chord / 2)} ${f(chord / 2)} 0 0 1 ${x3} ${y3} L ${x4} ${y4}`
      return [
        stroke(arch, c.weight),
        solid(petalPath(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.12, c.r0 + (c.r1 - c.r0) * 0.58, a0 + w * 0.28, a1 - w * 0.28)),
      ]
    }),
  },
]

export const FAMILIES = [...new Set(PATTERNS.map((p) => p.family))]

export function patternById(id) {
  return PATTERNS.find((p) => p.id === id) || null
}

export const WEIGHTS = [
  { id: 'fine', label: 'Fine', mm: 0.2 },
  { id: 'medium', label: 'Medium', mm: 0.35 },
  { id: 'bold', label: 'Bold', mm: 0.5 },
]

/** Annulus cell for ring index i (ring 0 = centre disc). */
export function ringCell(state, i) {
  const radii = state.rings.radii
  return {
    cx: state.centre.x,
    cy: state.centre.y,
    r0: i === 0 ? 0 : Math.min(radii[i - 1], radii[i]),
    r1: Math.max(radii[i - 1] ?? 0, radii[i]),
    sectors: state.lines.sectors,
    offset: state.lines.offset,
  }
}

/**
 * All primitives for a ring's fill. Supports A/B alternation (patternB on
 * odd sectors) by splitting the sector set — Phase 5 exposes the UI.
 */
export function ringFillPrimitives(state, i) {
  const fill = state.fills?.[i]
  if (!fill?.patternId) return []
  const pattern = patternById(fill.patternId)
  if (!pattern) return []
  const weight = WEIGHTS.find((w) => w.id === fill.weight)?.mm ?? 0.35
  const cell = { ...ringCell(state, i), weight }

  if (!fill.patternB) return pattern.ringPaths(cell)

  const patternB = patternById(fill.patternB) || pattern
  const step = 360 / cell.sectors
  const half = { ...cell, sectors: cell.sectors / 2 }
  // even sectors → A, odd sectors → B (requires an even sector count)
  if (cell.sectors % 2 !== 0) return pattern.ringPaths(cell)
  return [
    ...pattern.ringPaths({ ...half, offset: cell.offset }),
    ...patternB.ringPaths({ ...half, offset: cell.offset + step }),
  ]
}

/** SVG markup for every filled ring — shared by canvas thumbnails and export. */
export function fillsMarkup(state) {
  const parts = []
  for (const key of Object.keys(state.fills || {})) {
    for (const prim of ringFillPrimitives(state, +key)) {
      if (prim.type === 'circle') {
        parts.push(`<circle cx="${prim.cx}" cy="${prim.cy}" r="${prim.r}" fill="${prim.fill}"/>`)
      } else {
        parts.push(
          `<path d="${prim.d}" fill="${prim.fill}" stroke="${prim.stroke}" stroke-width="${prim.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
        )
      }
    }
  }
  return parts.join('')
}
