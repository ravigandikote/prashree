/**
 * Pure geometry for the Vastu compass SVG. Angles are degrees clockwise from
 * the top (North = 0), matching how a compass rose is read.
 */

export const SECTOR_DEG = 45

/** Polar → SVG point around centre (cx, cy). */
export function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

/** Rim angle of the sector at index i (0 = North, clockwise). */
export const sectorAngle = (i) => i * SECTOR_DEG

/**
 * Wheel rotation that brings `targetDeg` to the top marker, reached from the
 * current accumulated rotation by the shorter way round. The accumulator is
 * never normalised, so CSS keeps transitioning smoothly across the 0/360 seam.
 */
export function rotationTo(current, targetDeg) {
  const want = -targetDeg
  const delta = ((((want - current) % 360) + 540) % 360) - 180
  return current + delta
}

/** SVG path for an annular sector spanning [fromDeg, toDeg] between radii r0 < r1. */
export function annularSectorPath(cx, cy, r0, r1, fromDeg, toDeg) {
  const a = polar(cx, cy, r1, fromDeg)
  const b = polar(cx, cy, r1, toDeg)
  const c = polar(cx, cy, r0, toDeg)
  const d = polar(cx, cy, r0, fromDeg)
  const large = toDeg - fromDeg > 180 ? 1 : 0
  const f = (n) => Number(n.toFixed(3))
  return [
    `M ${f(a.x)} ${f(a.y)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${f(b.x)} ${f(b.y)}`,
    `L ${f(c.x)} ${f(c.y)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${f(d.x)} ${f(d.y)}`,
    'Z',
  ].join(' ')
}

/** Next index stepping `delta` around a ring of `n` stops (wraps both ways). */
export const stepIndex = (i, delta, n) => (((i + delta) % n) + n) % n
