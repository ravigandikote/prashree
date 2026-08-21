/**
 * Pure geometry for the Mandala Studio. Everything is authored in
 * MILLIMETRES — the SVG viewBox matches the paper, so exports are
 * true-to-size by construction.
 */

export const PAPERS = [
  { id: 'a4p', label: 'A4 portrait', w: 210, h: 297 },
  { id: 'a4l', label: 'A4 landscape', w: 297, h: 210 },
  { id: 'a3p', label: 'A3 portrait', w: 297, h: 420 },
  { id: 'a3l', label: 'A3 landscape', w: 420, h: 297 },
  { id: 'a5', label: 'A5 portrait', w: 148, h: 210 },
  { id: 'square', label: 'Square 30 × 30 cm', w: 300, h: 300 },
]

export const ANGLE_PRESETS = [15, 22.5, 30, 45, 60, 90]

export const MM_TO_PT = 72 / 25.4

export function paperById(id) {
  return PAPERS.find((p) => p.id === id) || null
}

export function paperCentre(paper) {
  return { x: paper.w / 2, y: paper.h / 2 }
}

/** Evenly spaced ring radii: gap, 2·gap, … count·gap (mm). */
export function uniformRadii(count, gap) {
  return Array.from({ length: count }, (_, i) => +(gap * (i + 1)).toFixed(2))
}

/** Sectors implied by an angle step; 30° → 12. */
export function sectorsFromStep(step) {
  if (!step || step <= 0) return 0
  return Math.round((360 / step) * 1000) / 1000
}

export function stepFromSectors(sectors) {
  if (!sectors || sectors <= 0) return 0
  return 360 / sectors
}

/** Largest radius that stays inside the printable area from `centre`. */
export function maxUsableRadius(paper, centre, margin) {
  return Math.min(
    centre.x - margin,
    centre.y - margin,
    paper.w - margin - centre.x,
    paper.h - margin - centre.y
  )
}

/** Ring indices whose radius exceeds the printable area (warn, don't block). */
export function ringsOutOfBounds(radii, paper, centre, margin) {
  const max = maxUsableRadius(paper, centre, margin)
  return radii.reduce((out, r, i) => (r > max ? [...out, i] : out), [])
}

/** Point on a circle around `centre` at `angleDeg` (0° = 12 o'clock, clockwise). */
export function pointAt(centre, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: +(centre.x + radius * Math.cos(rad)).toFixed(3),
    y: +(centre.y + radius * Math.sin(rad)).toFixed(3),
  }
}

/** Angles (deg) for `sectors` radial lines starting at `offset`. */
export function sectorAngles(sectors, offset = 0) {
  const n = Math.max(0, Math.floor(sectors))
  const step = 360 / sectors
  return Array.from({ length: n }, (_, i) => +(offset + i * step).toFixed(4))
}

export function mmToPt(mm) {
  return mm * MM_TO_PT
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}
