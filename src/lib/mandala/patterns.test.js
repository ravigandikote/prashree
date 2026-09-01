import { describe, it, expect } from 'vitest'
import { PATTERNS, ringFillPrimitives, ringCell, fillsMarkup } from './patterns'
import { initialStudioState } from './state'

const CELL = { cx: 100, cy: 100, r0: 30, r1: 45, sectors: 8, offset: 0, weight: 0.35 }

/** Rotate a point around the cell centre by `deg`. */
function rotate([x, y], deg) {
  const rad = (deg * Math.PI) / 180
  const dx = x - CELL.cx, dy = y - CELL.cy
  return [
    CELL.cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    CELL.cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  ]
}

/** Coordinate points of a primitive; arc flags/radii are skipped (rotation-invariant). */
function numbers(prim) {
  if (prim.type === 'circle') return [prim.cx, prim.cy]
  const out = []
  const re = /([MLCA])([^MLCAZ]+)/g
  let m
  while ((m = re.exec(prim.d))) {
    const nums = (m[2].match(/-?\d+\.?\d*/g) || []).map(Number)
    if (m[1] === 'A') {
      // rx ry rot largeArc sweep x y — keep only the endpoint
      for (let i = 5; i + 1 < nums.length; i += 7) out.push(nums[i], nums[i + 1])
    } else {
      out.push(...nums)
    }
  }
  return out
}

describe('pattern registry', () => {
  it('ships a broad library, every motif filed under a family', () => {
    expect(PATTERNS.length).toBeGreaterThanOrEqual(45)
    const families = new Set(PATTERNS.map((p) => p.family))
    for (const core of ['Petals & leaves', 'Line work', 'Geometry', 'Dots & pebbles', 'Scallops & arches']) {
      expect(families.has(core)).toBe(true)
    }
    expect(families.size).toBeGreaterThanOrEqual(5)
    expect(PATTERNS.every((p) => p.id && p.name && p.family)).toBe(true)
  })

  it('has no duplicate motif ids', () => {
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length)
  })

  it('every motif produces one primitive set per sector, symmetric under one-sector rotation', () => {
    const step = 360 / CELL.sectors
    for (const pattern of PATTERNS) {
      const base = pattern.ringPaths(CELL)
      const shifted = pattern.ringPaths({ ...CELL, offset: step })
      expect(shifted.length).toBe(base.length)

      const pointsOf = (prim) => {
        const nums = numbers(prim)
        const pts = []
        for (let i = 0; i + 1 < nums.length; i += 2) {
          if (Math.abs(nums[i] - CELL.cx) < 200 && Math.abs(nums[i + 1] - CELL.cy) < 200) {
            pts.push([nums[i], nums[i + 1]])
          }
        }
        return pts
      }
      const rotated = base.map((prim) => pointsOf(prim).map((pt) => rotate(pt, step)))
      const targets = shifted.map(pointsOf)

      // every rotated base primitive must match one shifted primitive within 0.05 mm
      const used = new Set()
      for (const r of rotated) {
        const match = targets.findIndex(
          (t, idx) =>
            !used.has(idx) &&
            t.length === r.length &&
            r.every((pt, i) => Math.hypot(pt[0] - t[i][0], pt[1] - t[i][1]) < 0.05)
        )
        expect(match, `${pattern.id}: rotated primitive should reappear one sector over`).toBeGreaterThanOrEqual(0)
        used.add(match)
      }
    }
  })
})

describe('ring fills', () => {
  it('ring 0 is the centre disc, ring i spans radii[i-1]..radii[i]', () => {
    const state = initialStudioState()
    expect(ringCell(state, 0).r0).toBe(0)
    expect(ringCell(state, 0).r1).toBe(12)
    expect(ringCell(state, 3).r0).toBe(36)
    expect(ringCell(state, 3).r1).toBe(48)
  })

  it('fillsMarkup renders only filled rings, in black', () => {
    const state = { ...initialStudioState(), fills: { 2: { patternId: 'petal-solid', weight: 'medium' } } }
    const svg = fillsMarkup(state)
    expect(svg).toContain('#0a0a0a')
    expect(svg).not.toContain('#c9c9c9')
    expect((svg.match(/<path/g) || []).length).toBe(12) // one petal per sector
  })

  it('A/B alternation splits sectors between two motifs', () => {
    const state = {
      ...initialStudioState(),
      fills: { 1: { patternId: 'petal-solid', patternB: 'dot-border', weight: 'fine' } },
    }
    const prims = ringFillPrimitives(state, 1)
    const petals = prims.filter((p) => p.type !== 'circle')
    const dots = prims.filter((p) => p.type === 'circle')
    expect(petals.length).toBe(6)
    expect(dots.length).toBe(6)
  })
})

describe('repeat density scales with radius', async () => {
  const { repeatsForCell } = await import('./patterns')

  it('inner rings keep one repeat per sector', () => {
    // centre disc: arc ≈ 0.26·r < thickness → no subdivision
    expect(repeatsForCell(0, 12, 12)).toBe(12)
  })

  it('outer rings subdivide, always as an exact multiple of the sector count', () => {
    // ring at 84–96 mm, 12 sectors: arc ≈ 47 mm vs 12 mm thickness → ~4 repeats/sector
    const reps = repeatsForCell(84, 96, 12)
    expect(reps).toBeGreaterThan(12)
    expect(reps % 12).toBe(0)
  })

  it('an outer petal ring gets more petals than sectors', () => {
    const state = {
      ...initialStudioState(),
      fills: { 7: { patternId: 'petal-solid', weight: 'medium' } }, // 84–96 mm ring
    }
    const petals = ringFillPrimitives(state, 7)
    expect(petals.length).toBeGreaterThan(12)
    expect(petals.length % 12).toBe(0)
  })
})
