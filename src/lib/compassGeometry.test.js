import { describe, it, expect } from 'vitest'
import { polar, rotationTo, annularSectorPath, stepIndex, sectorAngle } from './compassGeometry'

describe('compass geometry', () => {
  it('polar puts 0° at the top and 90° to the right', () => {
    expect(polar(0, 0, 10, 0)).toEqual({ x: 0, y: -10 })
    const e = polar(0, 0, 10, 90)
    expect(e.x).toBeCloseTo(10)
    expect(e.y).toBeCloseTo(0)
  })

  it('sector i sits at i × 45°', () => {
    expect(sectorAngle(0)).toBe(0)
    expect(sectorAngle(3)).toBe(135)
    expect(sectorAngle(7)).toBe(315)
  })

  it('rotates the shorter way round and accumulates', () => {
    expect(rotationTo(0, 45)).toBe(-45)     // East-ish: turn anticlockwise 45
    expect(rotationTo(0, 315)).toBe(45)     // North-West: clockwise 45, not -315
    expect(rotationTo(-45, 315)).toBe(45)   // from NE to NW: +90
    expect(rotationTo(45, 45)).toBe(-45)    // NW → NE: -90
    expect(rotationTo(720, 0)).toBe(720)    // already there, whatever the winding
    expect(rotationTo(-135, 135)).toBe(-135)
  })

  it('a 180° hop is exactly 180 (never longer)', () => {
    expect(Math.abs(rotationTo(0, 180))).toBe(180)
  })

  it('annular sector path closes with two arcs', () => {
    const d = annularSectorPath(200, 200, 50, 188, -22.5, 22.5)
    expect(d.startsWith('M ')).toBe(true)
    expect(d.match(/ A /g)).toHaveLength(2)
    expect(d.endsWith('Z')).toBe(true)
  })

  it('stepIndex wraps both ways', () => {
    expect(stepIndex(8, 1, 9)).toBe(0)
    expect(stepIndex(0, -1, 9)).toBe(8)
    expect(stepIndex(4, 1, 9)).toBe(5)
  })
})
