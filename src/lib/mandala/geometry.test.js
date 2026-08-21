import { describe, it, expect } from 'vitest'
import {
  uniformRadii, sectorsFromStep, stepFromSectors, maxUsableRadius,
  ringsOutOfBounds, pointAt, sectorAngles, mmToPt, paperCentre,
} from './geometry'
import { initialStudioState, studioReducer } from './state'

describe('geometry', () => {
  it('computes the paper centre', () => {
    expect(paperCentre({ w: 210, h: 297 })).toEqual({ x: 105, y: 148.5 })
  })

  it('uniform radii are gap multiples', () => {
    expect(uniformRadii(4, 12)).toEqual([12, 24, 36, 48])
  })

  it('sector count from angle step (30° → 12, 22.5° → 16)', () => {
    expect(sectorsFromStep(30)).toBe(12)
    expect(sectorsFromStep(22.5)).toBe(16)
    expect(stepFromSectors(12)).toBe(30)
  })

  it('flags rings outside the printable area without blocking', () => {
    const paper = { w: 210, h: 297 }
    const centre = { x: 105, y: 148.5 }
    // usable radius = 105 - 10 margin = 95
    expect(maxUsableRadius(paper, centre, 10)).toBe(95)
    expect(ringsOutOfBounds([50, 94, 96, 120], paper, centre, 10)).toEqual([2, 3])
  })

  it('places 0° at 12 o’clock and 90° at 3 o’clock', () => {
    const c = { x: 100, y: 100 }
    expect(pointAt(c, 50, 0)).toEqual({ x: 100, y: 50 })
    expect(pointAt(c, 50, 90)).toEqual({ x: 150, y: 100 })
  })

  it('sector angles honour the rotation offset', () => {
    expect(sectorAngles(4, 0)).toEqual([0, 90, 180, 270])
    expect(sectorAngles(4, 15)).toEqual([15, 105, 195, 285])
  })

  it('mm→pt uses 72/25.4 (50 mm = 141.732 pt)', () => {
    expect(mmToPt(50)).toBeCloseTo(141.732, 3)
  })
})

describe('studio reducer', () => {
  it('changing paper recentres', () => {
    const s = studioReducer(initialStudioState('a4p'), { type: 'SET_PAPER', id: 'square' })
    expect(s.paper).toEqual({ preset: 'square', w: 300, h: 300 })
    expect(s.centre).toEqual({ x: 150, y: 150 })
  })

  it('ring count keeps line endpoints valid', () => {
    let s = initialStudioState()
    s = studioReducer(s, { type: 'SET_RING_COUNT', count: 3 })
    expect(s.rings.radii).toHaveLength(3)
    expect(s.lines.outerRing).toBe(2)
  })

  it('editing one radius switches to custom mode without touching others', () => {
    let s = initialStudioState()
    s = studioReducer(s, { type: 'SET_RING_RADIUS', index: 2, radius: 40 })
    expect(s.rings.mode).toBe('custom')
    expect(s.rings.radii[2]).toBe(40)
    expect(s.rings.radii[0]).toBe(12)
  })

  it('custom sector count round-trips to a step', () => {
    const s = studioReducer(initialStudioState(), { type: 'SET_SECTORS', sectors: 16 })
    expect(s.lines.step).toBe(22.5)
    expect(s.lines.sectors).toBe(16)
  })
})

describe('fills + history', async () => {
  const { historyReducer, initialHistory } = await import('./state')

  it('undo/redo restores ring fills', () => {
    let h = initialHistory(initialStudioState())
    h = historyReducer(h, { type: 'SET_RING_FILL', index: 2, patternId: 'petal-solid' })
    expect(h.present.fills[2].patternId).toBe('petal-solid')
    h = historyReducer(h, { type: 'UNDO' })
    expect(h.present.fills[2]).toBeUndefined()
    h = historyReducer(h, { type: 'REDO' })
    expect(h.present.fills[2].patternId).toBe('petal-solid')
  })

  it('coalesces continuous tweaks into one undo step', () => {
    let h = initialHistory(initialStudioState())
    h = historyReducer(h, { type: 'SET_RING_GAP', gap: 13 })
    h = historyReducer(h, { type: 'SET_RING_GAP', gap: 14 })
    h = historyReducer(h, { type: 'SET_RING_GAP', gap: 15 })
    expect(h.past).toHaveLength(1)
    h = historyReducer(h, { type: 'UNDO' })
    expect(h.present.rings.gap).toBe(12)
  })

  it('shrinking the ring count drops orphaned fills', () => {
    let h = initialHistory(initialStudioState())
    h = historyReducer(h, { type: 'SET_RING_FILL', index: 7, patternId: 'chevron' })
    h = historyReducer(h, { type: 'SET_RING_COUNT', count: 4 })
    expect(h.present.fills[7]).toBeUndefined()
  })
})
