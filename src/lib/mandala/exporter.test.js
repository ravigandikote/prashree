import { describe, it, expect } from 'vitest'
import { buildSvgMarkup, exportFilename } from './exporter'
import { mmToPt } from './geometry'
import { initialStudioState } from './state'

describe('export SVG builder', () => {
  const state = initialStudioState('a4p')

  it('emits a true-size A4 document (210×297 mm viewBox)', () => {
    const svg = buildSvgMarkup(state)
    expect(svg).toContain('width="210mm"')
    expect(svg).toContain('height="297mm"')
    expect(svg).toContain('viewBox="0 0 210 297"')
  })

  it('draws guide circles at their exact mm radii', () => {
    const svg = buildSvgMarkup(state)
    for (const r of state.rings.radii) {
      expect(svg).toContain(`r="${r}"`)
    }
  })

  it('a 50 mm radius maps to 141.73 pt in PDF space', () => {
    expect(mmToPt(50)).toBeCloseTo(141.732, 2)
  })

  it('can strip all construction guides for a clean artwork export', () => {
    const svg = buildSvgMarkup(state, { includeGuides: false })
    expect(svg).not.toContain('stroke="#c9c9c9"')
    // white paper rect only
    expect((svg.match(/<circle/g) || []).length).toBe(0)
  })

  it('honours individual guide toggles', () => {
    const s = { ...state, guides: { ...state.guides, circles: false } }
    const svg = buildSvgMarkup(s)
    expect((svg.match(/<circle cx/g) || []).length).toBe(1) // centre dot only
    expect((svg.match(/<line/g) || []).length).toBeGreaterThan(0)
  })

  it('builds a safe filename', () => {
    expect(exportFilename({ name: 'My 12-Sector A4!' }, 'pdf')).toMatch(
      /^prashree-mandala-my-12-sector-a4-\d{4}-\d{2}-\d{2}\.pdf$/
    )
    expect(exportFilename({ name: null }, 'svg')).toMatch(/^prashree-mandala-untitled-.*\.svg$/)
  })
})
