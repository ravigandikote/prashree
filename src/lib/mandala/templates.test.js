import { describe, it, expect } from 'vitest'
import { normaliseConfig, parseTemplateFile } from './templates'
import { initialStudioState } from './state'

describe('template config round-trip', () => {
  it('normalises a saved state back into a valid studio state', () => {
    const state = initialStudioState('square')
    const out = normaliseConfig(JSON.parse(JSON.stringify(state)))
    expect(out.paper).toEqual({ preset: 'square', w: 300, h: 300 })
    expect(out.rings.radii).toEqual(state.rings.radii)
    expect(out.lines.sectors).toBe(12)
  })

  it('rejects garbage', () => {
    expect(normaliseConfig(null)).toBeNull()
    expect(normaliseConfig({ hello: 1 })).toBeNull()
    expect(parseTemplateFile('not json')).toBeNull()
  })

  it('clamps line ring indices to the ring count', () => {
    const state = JSON.parse(JSON.stringify(initialStudioState()))
    state.lines.outerRing = 99
    const out = normaliseConfig(state)
    expect(out.lines.outerRing).toBe(state.rings.radii.length - 1)
  })

  it('parses an exported template file wrapper', () => {
    const state = initialStudioState()
    const file = JSON.stringify({ app: 'prashree-mandala-studio', version: 1, config: state })
    const out = parseTemplateFile(file)
    expect(out.paper.w).toBe(210)
  })
})
