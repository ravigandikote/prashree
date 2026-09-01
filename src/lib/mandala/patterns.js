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

/* ── helpers for cell-centred motifs (flowers, stipple, scales) ── */

/** Mid radius, angular arc length (mm) and radial thickness of a cell. */
function cellMetrics(c, a0, a1) {
  const rm = (c.r0 + c.r1) / 2
  const arc = (2 * Math.PI * rm * (a1 - a0)) / 360
  return { rm, arc, thick: c.r1 - c.r0 }
}

/** Absolute point from a local origin: `along` the axis, `across` it. */
function localPoint(fx, fy, angDeg, along, across) {
  const rad = ((angDeg - 90) * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  return [f(fx + ux * along - uy * across), f(fy + uy * along + ux * across)]
}

/** Petal growing from a local point outward along angDeg. */
function localPetal(fx, fy, len, wid, angDeg) {
  const [tx, ty] = localPoint(fx, fy, angDeg, len, 0)
  const [c1x, c1y] = localPoint(fx, fy, angDeg, len * 0.3, wid)
  const [c2x, c2y] = localPoint(fx, fy, angDeg, len * 0.78, wid * 0.7)
  const [d1x, d1y] = localPoint(fx, fy, angDeg, len * 0.78, -wid * 0.7)
  const [d2x, d2y] = localPoint(fx, fy, angDeg, len * 0.3, -wid)
  return `M ${f(fx)} ${f(fy)} C ${c1x} ${c1y} ${c2x} ${c2y} ${tx} ${ty} C ${d1x} ${d1y} ${d2x} ${d2y} ${f(fx)} ${f(fy)} Z`
}

/** Quad following the cell's own edges, inset by a fraction. */
function cellQuad(c, a0, a1, inset) {
  const dr = (c.r1 - c.r0) * inset
  const da = (a1 - a0) * inset
  const [x1, y1] = pt(c.cx, c.cy, c.r0 + dr, a0 + da)
  const [x2, y2] = pt(c.cx, c.cy, c.r1 - dr, a0 + da)
  const [x3, y3] = pt(c.cx, c.cy, c.r1 - dr, a1 - da)
  const [x4, y4] = pt(c.cx, c.cy, c.r0 + dr, a1 - da)
  return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`
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

  /* ── Extended library (phase 5) ── */

  /* Petals & leaves */
  {
    id: 'lotus-layered', name: 'Layered lotus', family: 'Petals & leaves',
    ringPaths: (c) => {
      const rSplit = c.r0 + (c.r1 - c.r0) * 0.55
      return [
        ...sectorRanges(c.sectors, c.offset).map(([a0, a1]) =>
          stroke(petalPath(c.cx, c.cy, c.r0, c.r1, a0, a1), c.weight)),
        ...sectorRanges(c.sectors, c.offset + 180 / c.sectors).map(([a0, a1]) =>
          solid(petalPath(c.cx, c.cy, c.r0, rSplit, a0, a1))),
      ]
    },
  },
  {
    id: 'petal-hatched', name: 'Hatched petal', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const out = [stroke(petalPath(c.cx, c.cy, c.r0, c.r1, a0, a1), c.weight)]
      const w = a1 - a0
      const mid = (a0 + a1) / 2
      for (const t of [0.25, 0.4, 0.55, 0.7]) {
        const rr = c.r0 + (c.r1 - c.r0) * t
        const spread = w * (0.3 - t * 0.22)
        const [x1, y1] = pt(c.cx, c.cy, rr, mid - spread)
        const [x2, y2] = pt(c.cx, c.cy, rr, mid + spread)
        out.push(stroke(`M ${x1} ${y1} L ${x2} ${y2}`, c.weight * 0.8))
      }
      return out
    }),
  },
  {
    id: 'teardrop-hang', name: 'Hanging teardrops', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const w = a1 - a0
      return solid(petalPath(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.35, c.r1, a0 + w * 0.3, a1 - w * 0.3))
    }),
  },
  {
    id: 'leaf-blade', name: 'Leaf blades', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const mid = (a0 + a1) / 2
      const blade = petalPath(c.cx, c.cy, c.r0, c.r1, a0 + w * 0.22, a1 - w * 0.22)
      const [bx, by] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.06, mid)
      const [tx, ty] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.92, mid)
      return [stroke(blade, c.weight), stroke(`M ${bx} ${by} L ${tx} ${ty}`, c.weight * 0.8)]
    }),
  },

  /* Line work */
  {
    id: 'hatch-cross', name: 'Cross-hatch', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const lines = []
      const w = a1 - a0
      for (let i = 0; i <= 3; i++) {
        const t = i / 3
        const [x1, y1] = pt(c.cx, c.cy, c.r0, a0 + w * t * 0.7)
        const [x2, y2] = pt(c.cx, c.cy, c.r1, a0 + w * (0.3 + t * 0.7))
        lines.push(stroke(`M ${x1} ${y1} L ${x2} ${y2}`, c.weight * 0.8))
        const [x3, y3] = pt(c.cx, c.cy, c.r0, a1 - w * t * 0.7)
        const [x4, y4] = pt(c.cx, c.cy, c.r1, a1 - w * (0.3 + t * 0.7))
        lines.push(stroke(`M ${x3} ${y3} L ${x4} ${y4}`, c.weight * 0.8))
      }
      return lines
    }),
  },
  {
    id: 'rope-braid', name: 'Rope braid', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const rm = (c.r0 + c.r1) / 2
      const bulge = (c.r1 - c.r0) * 0.42
      const [x1, y1] = pt(c.cx, c.cy, rm - bulge, a0)
      const [x2, y2] = pt(c.cx, c.cy, rm + bulge, a1)
      const [cx1, cy1] = pt(c.cx, c.cy, rm + bulge, a0 + (a1 - a0) * 0.35)
      const [cx2, cy2] = pt(c.cx, c.cy, rm - bulge, a1 - (a1 - a0) * 0.35)
      return stroke(`M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`, c.weight)
    }),
  },
  {
    id: 'parallel-bands', name: 'Parallel bands', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) =>
      [0.25, 0.5, 0.75].map((t) => {
        const rr = c.r0 + (c.r1 - c.r0) * t
        const [x1, y1] = pt(c.cx, c.cy, rr, a0)
        const [x2, y2] = pt(c.cx, c.cy, rr, a1)
        const large = a1 - a0 > 180 ? 1 : 0
        return stroke(`M ${x1} ${y1} A ${f(rr)} ${f(rr)} 0 ${large} 1 ${x2} ${y2}`, c.weight)
      })),
  },
  {
    id: 'zigzag-fine', name: 'Fine zigzag', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const w = a1 - a0
      const rLo = c.r0 + (c.r1 - c.r0) * 0.3
      const rHi = c.r1 - (c.r1 - c.r0) * 0.3
      const pts = []
      for (let i = 0; i <= 4; i++) {
        const a = a0 + (w * i) / 4
        const [x, y] = pt(c.cx, c.cy, i % 2 === 0 ? rLo : rHi, a)
        pts.push(`${x} ${y}`)
      }
      return stroke(`M ${pts[0]} L ${pts.slice(1).join(' L ')}`, c.weight)
    }),
  },

  /* Geometry */
  {
    id: 'checker-blocks', name: 'Checker blocks', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const rm = (c.r0 + c.r1) / 2
      const cell = (aa0, aa1, rr0, rr1) => {
        const [x1, y1] = pt(c.cx, c.cy, rr0, aa0)
        const [x2, y2] = pt(c.cx, c.cy, rr1, aa0)
        const [x3, y3] = pt(c.cx, c.cy, rr1, aa1)
        const [x4, y4] = pt(c.cx, c.cy, rr0, aa1)
        return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`
      }
      return [solid(cell(a0, mid, c.r0, rm)), solid(cell(mid, a1, rm, c.r1))]
    }),
  },
  {
    id: 'triangle-band', name: 'Triangle teeth', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const [x1, y1] = pt(c.cx, c.cy, c.r0, a0)
      const [x2, y2] = pt(c.cx, c.cy, c.r1, mid)
      const [x3, y3] = pt(c.cx, c.cy, c.r0, a1)
      return solid(`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`)
    }),
  },
  {
    id: 'diamond-dot', name: 'Diamond & dot', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const rm = (c.r0 + c.r1) / 2
      const [dx, dy] = pt(c.cx, c.cy, rm, mid)
      return [
        stroke(diamondPath(c.cx, c.cy, c.r0, c.r1, a0, a1, 0.15), c.weight),
        dot(dx, dy, Math.min(1, (c.r1 - c.r0) * 0.09)),
      ]
    }),
  },
  {
    id: 'square-spiral', name: 'Square & spiral', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => [
      stroke(diamondPath(c.cx, c.cy, c.r0, c.r1, a0, a1, 0.1), c.weight),
      stroke(spiralPath(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * 0.2, c.r1 - (c.r1 - c.r0) * 0.2, a0, a1), c.weight * 0.8),
    ]),
  },

  /* Dots & pebbles */
  {
    id: 'pebble-field', name: 'Pebble field', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const spots = [
        [0.28, 0.3, 0.14], [0.68, 0.24, 0.1], [0.5, 0.58, 0.16], [0.24, 0.78, 0.09], [0.74, 0.76, 0.12],
      ]
      return spots.map(([ta, tr, ts]) => {
        const [x, y] = pt(c.cx, c.cy, c.r0 + (c.r1 - c.r0) * tr, a0 + w * ta)
        return {
          type: 'circle', cx: x, cy: y, r: f((c.r1 - c.r0) * ts),
          fill: 'none', stroke: INK, strokeWidth: c.weight * 0.8,
        }
      })
    }),
  },
  {
    id: 'dot-pairs', name: 'Dot pairs', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const rm = (c.r0 + c.r1) / 2
      const rDot = Math.min(1.3, (c.r1 - c.r0) * 0.14)
      const [x1, y1] = pt(c.cx, c.cy, rm, a0 + w * 0.32)
      const [x2, y2] = pt(c.cx, c.cy, rm, a1 - w * 0.32)
      return [dot(x1, y1, rDot), dot(x2, y2, rDot)]
    }),
  },
  {
    id: 'dot-rail', name: 'Dots on rails', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const out = []
      for (const t of [0.2, 0.8]) {
        const rr = c.r0 + (c.r1 - c.r0) * t
        const [x1, y1] = pt(c.cx, c.cy, rr, a0)
        const [x2, y2] = pt(c.cx, c.cy, rr, a1)
        const large = a1 - a0 > 180 ? 1 : 0
        out.push(stroke(`M ${x1} ${y1} A ${f(rr)} ${f(rr)} 0 ${large} 1 ${x2} ${y2}`, c.weight))
      }
      const [dx, dy] = pt(c.cx, c.cy, (c.r0 + c.r1) / 2, (a0 + a1) / 2)
      out.push(dot(dx, dy, Math.min(1.4, (c.r1 - c.r0) * 0.16)))
      return out
    }),
  },

  /* Scallops & arches */
  {
    id: 'scallop-double', name: 'Double scallops', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) =>
      [0.2, 0.45].map((t) => {
        const rBase = c.r0 + (c.r1 - c.r0) * t
        const [x1, y1] = pt(c.cx, c.cy, rBase, a0)
        const [x2, y2] = pt(c.cx, c.cy, rBase, a1)
        const chord = Math.hypot(x2 - x1, y2 - y1)
        return stroke(`M ${x1} ${y1} A ${f(chord / 2)} ${f(chord / 2)} 0 0 1 ${x2} ${y2}`, c.weight)
      })),
  },
  {
    id: 'arch-window', name: 'Arched windows', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const arch = (e, rTopT) => {
        const rTop = c.r0 + (c.r1 - c.r0) * rTopT
        const [x1, y1] = pt(c.cx, c.cy, c.r0, a0 + w * e)
        const [x2, y2] = pt(c.cx, c.cy, rTop, a0 + w * e)
        const [x3, y3] = pt(c.cx, c.cy, rTop, a1 - w * e)
        const [x4, y4] = pt(c.cx, c.cy, c.r0, a1 - w * e)
        const chord = Math.hypot(x3 - x2, y3 - y2)
        return `M ${x1} ${y1} L ${x2} ${y2} A ${f(chord / 2)} ${f(chord / 2)} 0 0 1 ${x3} ${y3} L ${x4} ${y4}`
      }
      return [stroke(arch(0.16, 0.68), c.weight), stroke(arch(0.3, 0.52), c.weight * 0.8)]
    }),
  },
  {
    id: 'fan-rays', name: 'Fans with rays', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const rBase = c.r0 + (c.r1 - c.r0) * 0.2
      const [x1, y1] = pt(c.cx, c.cy, rBase, a0)
      const [x2, y2] = pt(c.cx, c.cy, rBase, a1)
      const chord = Math.hypot(x2 - x1, y2 - y1)
      const out = [stroke(`M ${x1} ${y1} A ${f(chord / 2)} ${f(chord / 2)} 0 0 1 ${x2} ${y2}`, c.weight)]
      const mid = (a0 + a1) / 2
      const [hx, hy] = pt(c.cx, c.cy, rBase, mid)
      for (let i = 1; i <= 3; i++) {
        const a = a0 + (w * i) / 4
        const [tx, ty] = pt(c.cx, c.cy, c.r1 - (c.r1 - c.r0) * 0.12, a)
        out.push(stroke(`M ${hx} ${hy} L ${tx} ${ty}`, c.weight * 0.8))
      }
      return out
    }),
  },

  /* ── Studied from Monica's reference mandalas (2026-09) ── */

  /* Petals & leaves */
  {
    id: 'petal-swept', name: 'Swept lotus', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      // tip leans a sector-width sideways: the pinwheel lotus of the references
      const w = a1 - a0
      return stroke(petalPath(c.cx, c.cy, c.r0, c.r1, a0 + w * 0.5, a1 + w * 0.5), c.weight)
    }),
  },
  {
    id: 'petal-swept-solid', name: 'Swept lotus, filled', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const w = a1 - a0
      return solid(petalPath(c.cx, c.cy, c.r0, c.r1, a0 + w * 0.5, a1 + w * 0.5))
    }),
  },
  {
    id: 'petal-contour', name: 'Contour petal', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      // nested outlines echo the petal edge, like fine pen contour shading
      const w = a1 - a0
      const h = c.r1 - c.r0
      return [0, 0.14, 0.28].map((k) =>
        stroke(
          petalPath(c.cx, c.cy, c.r0 + h * k * 0.5, c.r1 - h * k, a0 + w * k, a1 - w * k),
          c.weight * (k === 0 ? 1 : 0.75)
        )
      )
    }),
  },
  {
    id: 'leaf-serrated', name: 'Serrated frond', family: 'Petals & leaves',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      // palm frond: saw-toothed on one edge, smooth on the other
      const w = a1 - a0
      const h = c.r1 - c.r0
      const spine = (a0 + a1) / 2
      const half = w * 0.3
      const teeth = 6
      const [bx, by] = pt(c.cx, c.cy, c.r0, spine)
      const parts = [`M ${bx} ${by}`]
      for (let i = 1; i <= teeth; i++) {
        const t = i / teeth
        const taper = 1 - t * 0.85
        const [vx, vy] = pt(c.cx, c.cy, c.r0 + h * (t - 0.5 / teeth), spine - half * taper)
        const [nx, ny] = pt(c.cx, c.cy, c.r0 + h * t, spine - half * taper * 0.55)
        parts.push(`L ${vx} ${vy} L ${nx} ${ny}`)
      }
      const [tx, ty] = pt(c.cx, c.cy, c.r1, spine)
      const [c1x, c1y] = pt(c.cx, c.cy, c.r0 + h * 0.72, spine + half * 0.6)
      const [c2x, c2y] = pt(c.cx, c.cy, c.r0 + h * 0.28, spine + half * 0.95)
      parts.push(`L ${tx} ${ty} C ${c1x} ${c1y} ${c2x} ${c2y} ${bx} ${by} Z`)
      return stroke(parts.join(' '), c.weight)
    }),
  },

  /* Florals */
  {
    id: 'flower-daisy', name: 'Daisy', family: 'Florals',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const { rm, arc, thick } = cellMetrics(c, a0, a1)
      const mid = (a0 + a1) / 2
      const [fx, fy] = pt(c.cx, c.cy, rm, mid)
      const size = Math.min(thick, arc) * 0.46
      const out = []
      for (let k = 0; k < 8; k++) {
        out.push(stroke(localPetal(fx, fy, size, size * 0.3, mid + k * 45), c.weight))
      }
      out.push({ type: 'circle', cx: fx, cy: fy, r: f(size * 0.22), fill: '#ffffff', stroke: INK, strokeWidth: c.weight })
      return out
    }),
  },
  {
    id: 'flower-solid', name: 'Filled bloom', family: 'Florals',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const { rm, arc, thick } = cellMetrics(c, a0, a1)
      const mid = (a0 + a1) / 2
      const [fx, fy] = pt(c.cx, c.cy, rm, mid)
      const size = Math.min(thick, arc) * 0.46
      const out = []
      for (let k = 0; k < 6; k++) {
        out.push(solid(localPetal(fx, fy, size, size * 0.34, mid + k * 60)))
      }
      out.push({ type: 'circle', cx: fx, cy: fy, r: f(size * 0.2), fill: '#ffffff', stroke: INK, strokeWidth: c.weight })
      return out
    }),
  },
  {
    id: 'flower-lined', name: 'Line-drawn bloom', family: 'Florals',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const { rm, arc, thick } = cellMetrics(c, a0, a1)
      const mid = (a0 + a1) / 2
      const [fx, fy] = pt(c.cx, c.cy, rm, mid)
      const size = Math.min(thick, arc) * 0.46
      const out = []
      for (let k = 0; k < 6; k++) {
        const a = mid + k * 60
        out.push(stroke(localPetal(fx, fy, size, size * 0.34, a), c.weight))
        out.push(stroke(localPetal(fx, fy, size * 0.72, size * 0.18, a), c.weight * 0.7))
      }
      out.push({ type: 'circle', cx: fx, cy: fy, r: f(size * 0.18), fill: '#ffffff', stroke: INK, strokeWidth: c.weight })
      return out
    }),
  },

  /* Weave & lattice */
  {
    id: 'vesica-lattice', name: 'Vesica lattice', family: 'Weave & lattice',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      // pointed ovals meeting tip to tip — the overlapping-circle lattice
      const mid = (a0 + a1) / 2
      const [x0, y0] = pt(c.cx, c.cy, c.r0, mid)
      const [x1, y1] = pt(c.cx, c.cy, c.r1, mid)
      const span = Math.hypot(x1 - x0, y1 - y0)
      // fat lens (radius just over half the span) so neighbours interlock
      const rr = f(span * 0.54)
      return stroke(`M ${x0} ${y0} A ${rr} ${rr} 0 0 1 ${x1} ${y1} A ${rr} ${rr} 0 0 1 ${x0} ${y0}`, c.weight)
    }),
  },
  {
    id: 'guilloche-net', name: 'Rosette net', family: 'Weave & lattice',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const { rm, arc, thick } = cellMetrics(c, a0, a1)
      const [x, y] = pt(c.cx, c.cy, rm, (a0 + a1) / 2)
      return {
        type: 'circle', cx: x, cy: y,
        r: f(Math.min(thick, arc) * 0.66),
        fill: 'none', stroke: INK, strokeWidth: c.weight * 0.7,
      }
    }),
  },
  {
    id: 'basket-weave', name: 'Basket weave', family: 'Weave & lattice',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const h = c.r1 - c.r0
      const w = a1 - a0
      const out = []
      // radial pair
      for (const t of [0.3, 0.7]) {
        const [x1, y1] = pt(c.cx, c.cy, c.r0 + h * 0.1, a0 + w * t)
        const [x2, y2] = pt(c.cx, c.cy, c.r0 + h * 0.48, a0 + w * t)
        out.push(stroke(`M ${x1} ${y1} L ${x2} ${y2}`, c.weight))
      }
      // tangential pair, offset outward — reads as over-under weaving
      for (const t of [0.62, 0.86]) {
        const rr = c.r0 + h * t
        const [x1, y1] = pt(c.cx, c.cy, rr, a0 + w * 0.12)
        const [x2, y2] = pt(c.cx, c.cy, rr, a1 - w * 0.12)
        out.push(stroke(`M ${x1} ${y1} A ${f(rr)} ${f(rr)} 0 0 1 ${x2} ${y2}`, c.weight))
      }
      return out
    }),
  },

  /* Scallops & arches */
  {
    id: 'scale-ribbed', name: 'Ribbed scale', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      // fish-scale fan with inner ribs — the layered bands of the references
      const w = a1 - a0
      const rBase = c.r0 + (c.r1 - c.r0) * 0.12
      return [0, 0.18, 0.36].map((inset, i) => {
        const [x1, y1] = pt(c.cx, c.cy, rBase, a0 + w * inset)
        const [x2, y2] = pt(c.cx, c.cy, rBase, a1 - w * inset)
        const chord = Math.hypot(x2 - x1, y2 - y1)
        const rr = f(chord / 2)
        return stroke(`M ${x1} ${y1} A ${rr} ${rr} 0 0 1 ${x2} ${y2}`, c.weight * (i === 0 ? 1 : 0.75))
      })
    }),
  },
  {
    id: 'arch-onion', name: 'Onion arch', family: 'Scallops & arches',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const w = a1 - a0
      const h = c.r1 - c.r0
      const mid = (a0 + a1) / 2
      const [bl, blY] = pt(c.cx, c.cy, c.r0, a0 + w * 0.2)
      const [br, brY] = pt(c.cx, c.cy, c.r0, a1 - w * 0.2)
      const [c1x, c1y] = pt(c.cx, c.cy, c.r0 + h * 0.55, a0 + w * 0.02)
      const [c2x, c2y] = pt(c.cx, c.cy, c.r0 + h * 0.9, a0 + w * 0.34)
      const [tx, ty] = pt(c.cx, c.cy, c.r1, mid)
      const [c3x, c3y] = pt(c.cx, c.cy, c.r0 + h * 0.9, a1 - w * 0.34)
      const [c4x, c4y] = pt(c.cx, c.cy, c.r0 + h * 0.55, a1 - w * 0.02)
      return stroke(
        `M ${bl} ${blY} C ${c1x} ${c1y} ${c2x} ${c2y} ${tx} ${ty} C ${c3x} ${c3y} ${c4x} ${c4y} ${br} ${brY}`,
        c.weight
      )
    }),
  },

  /* Line work */
  {
    id: 'feather-rays', name: 'Feather rays', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const h = c.r1 - c.r0
      const out = []
      for (let i = 1; i <= 4; i++) {
        const a = a0 + (w * i) / 5
        const [x1, y1] = pt(c.cx, c.cy, c.r0 + h * 0.08, a)
        const [x2, y2] = pt(c.cx, c.cy, c.r1 - h * 0.16, a)
        out.push(stroke(`M ${x1} ${y1} L ${x2} ${y2}`, c.weight * 0.7))
      }
      const rTip = c.r1 - h * 0.16
      const [ax, ay] = pt(c.cx, c.cy, rTip, a0 + w * 0.2)
      const [bx, by] = pt(c.cx, c.cy, rTip, a1 - w * 0.2)
      const chord = Math.hypot(bx - ax, by - ay)
      out.push(stroke(`M ${ax} ${ay} A ${f(chord / 2)} ${f(chord / 2)} 0 0 1 ${bx} ${by}`, c.weight))
      return out
    }),
  },
  {
    id: 'coil-cluster', name: 'Coil cluster', family: 'Line work',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const mid = (a0 + a1) / 2
      const rm = (c.r0 + c.r1) / 2
      return [
        stroke(spiralPath(c.cx, c.cy, c.r0, rm, a0, mid), c.weight * 0.8),
        stroke(spiralPath(c.cx, c.cy, c.r0, rm, mid, a1), c.weight * 0.8),
        stroke(spiralPath(c.cx, c.cy, rm, c.r1, a0, a1), c.weight * 0.8),
      ]
    }),
  },

  /* Geometry */
  {
    id: 'square-nest', name: 'Nested squares', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) =>
      [0.06, 0.24, 0.42].map((inset) => stroke(cellQuad(c, a0, a1, inset), c.weight))
    ),
  },
  {
    id: 'triangle-hatch', name: 'Hatched triangle', family: 'Geometry',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const w = a1 - a0
      const h = c.r1 - c.r0
      const mid = (a0 + a1) / 2
      const [x1, y1] = pt(c.cx, c.cy, c.r0, a0 + w * 0.08)
      const [x2, y2] = pt(c.cx, c.cy, c.r0, a1 - w * 0.08)
      const [x3, y3] = pt(c.cx, c.cy, c.r1, mid)
      const out = [stroke(`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`, c.weight)]
      for (const t of [0.25, 0.45, 0.65]) {
        const half = w * 0.42 * (1 - t)
        const [hx1, hy1] = pt(c.cx, c.cy, c.r0 + h * t, mid - half)
        const [hx2, hy2] = pt(c.cx, c.cy, c.r0 + h * t, mid + half)
        out.push(stroke(`M ${hx1} ${hy1} L ${hx2} ${hy2}`, c.weight * 0.7))
      }
      return out
    }),
  },

  /* Dots & pebbles */
  {
    id: 'bead-chain', name: 'Bead chain', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).map(([a0, a1]) => {
      const { rm, arc, thick } = cellMetrics(c, a0, a1)
      const [x, y] = pt(c.cx, c.cy, rm, (a0 + a1) / 2)
      return {
        type: 'circle', cx: x, cy: y,
        r: f(Math.min(thick, arc) * 0.42),
        fill: 'none', stroke: INK, strokeWidth: c.weight,
      }
    }),
  },
  {
    id: 'cell-stipple', name: 'Stippled cell', family: 'Dots & pebbles',
    ringPaths: (c) => sectorRanges(c.sectors, c.offset).flatMap(([a0, a1]) => {
      const { rm, arc, thick } = cellMetrics(c, a0, a1)
      const mid = (a0 + a1) / 2
      const [fx, fy] = pt(c.cx, c.cy, rm, mid)
      const size = Math.min(thick, arc) * 0.44
      const out = [{
        type: 'circle', cx: fx, cy: fy, r: f(size),
        fill: 'none', stroke: INK, strokeWidth: c.weight,
      }]
      for (let k = 0; k < 6; k++) {
        const [dx, dy] = localPoint(fx, fy, mid + k * 60, size * 0.5, 0)
        out.push(dot(dx, dy, Math.min(0.5, size * 0.12)))
      }
      out.push(dot(fx, fy, Math.min(0.5, size * 0.12)))
      return out
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

/**
 * How many motif repeats a ring should carry. One repeat per sector looks
 * right near the centre, but sector cells get angularly wider with radius
 * (arc = radius × angle) and motifs stretch fat. Keep each motif cell
 * roughly square (arc ≈ ring thickness) by subdividing every sector into
 * m repeats — always an exact multiple of the sector count, so motifs stay
 * aligned with the radial guides and the mandala's symmetry.
 */
export function repeatsForCell(r0, r1, sectors) {
  if (!sectors || r1 <= r0) return sectors
  const rMid = (r0 + r1) / 2
  const arcPerSector = (2 * Math.PI * rMid) / sectors
  const thickness = Math.max(r1 - r0, 0.001)
  const m = Math.max(1, Math.min(8, Math.round(arcPerSector / thickness)))
  return sectors * m
}

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
  const base = ringCell(state, i)
  const cell = { ...base, weight, sectors: repeatsForCell(base.r0, base.r1, base.sectors) }

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
        parts.push(
          `<circle cx="${prim.cx}" cy="${prim.cy}" r="${prim.r}" fill="${prim.fill}" stroke="${prim.stroke}" stroke-width="${prim.strokeWidth}"/>`
        )
      } else {
        parts.push(
          `<path d="${prim.d}" fill="${prim.fill}" stroke="${prim.stroke}" stroke-width="${prim.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
        )
      }
    }
  }
  return parts.join('')
}
