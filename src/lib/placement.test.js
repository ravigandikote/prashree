import { describe, it, expect } from 'vitest'
import { isMoneyLine, eligibleForPlacement, buildDirectionMap, emptyDirections } from './placement'
import { fallbackArtworks } from '../data/artworks'
import { DIRECTIONS } from '../data/vastu'

const mk = (over) => ({
  name: 'X', slug: 'x', form: 'Mandala Art', series: 'S', is_available: true,
  direction: 'North', secondary_direction: null, ...over,
})

describe('money-line exclusion', () => {
  it('recognises the line by art form or series, case-insensitively', () => {
    expect(isMoneyLine(mk({ form: 'Money Manifestation Art' }))).toBe(true)
    expect(isMoneyLine(mk({ series: 'Money Manifestation Series' }))).toBe(true)
    expect(isMoneyLine(mk({ series: 'money manifestation' }))).toBe(true)
    expect(isMoneyLine(mk({ form: 'Mandala Art', series: 'Wealth & Growth Series' }))).toBe(false)
    expect(isMoneyLine({})).toBe(false)
  })

  it('drops exactly Kubera and Lakshmi from the live catalogue', () => {
    const dropped = fallbackArtworks.filter(isMoneyLine).map((a) => a.slug).sort()
    expect(dropped).toEqual(['kubera', 'lakshmi'])
  })
})

describe('eligibility', () => {
  it('needs an art form, listed status, and not money-line', () => {
    expect(eligibleForPlacement(mk())).toBe(true)
    expect(eligibleForPlacement(mk({ form: null }))).toBe(false)
    expect(eligibleForPlacement(mk({ is_available: false }))).toBe(false)
    expect(eligibleForPlacement(mk({ form: 'Money Manifestation Art' }))).toBe(false)
  })

  it('keeps sold originals, matching the catalogue', () => {
    expect(eligibleForPlacement(mk({ is_sold: true }))).toBe(true)
  })
})

describe('buildDirectionMap', () => {
  it('has a key for every direction, even when empty', () => {
    const map = buildDirectionMap([])
    expect(Object.keys(map)).toEqual(DIRECTIONS)
    for (const d of DIRECTIONS) expect(map[d]).toEqual([])
  })

  it('lists primary matches first (A–Z), then secondary matches (A–Z)', () => {
    const map = buildDirectionMap([
      mk({ name: 'Zeta', slug: 'z', direction: 'East' }),
      mk({ name: 'Alpha', slug: 'a', direction: 'East' }),
      mk({ name: 'Mid', slug: 'm', direction: 'North', secondary_direction: 'East' }),
      mk({ name: 'Beta', slug: 'b', direction: 'West', secondary_direction: 'East' }),
      mk({ name: 'Other', slug: 'o', direction: 'South' }),
    ])
    expect(map.East.map((p) => `${p.slug}:${p.match}`)).toEqual([
      'a:primary', 'z:primary', 'b:secondary', 'm:secondary',
    ])
    expect(map.North.map((p) => p.slug)).toEqual(['m'])
    expect(map.West.map((p) => p.slug)).toEqual(['b'])
  })

  it('never lists a piece twice in one direction', () => {
    const map = buildDirectionMap([mk({ direction: 'East', secondary_direction: 'East' })])
    expect(map.East).toHaveLength(1)
  })

  it('does not mutate its input', () => {
    const p = mk()
    buildDirectionMap([p])
    expect(p.match).toBeUndefined()
  })

  it('the money line is absent from every direction of the live catalogue', () => {
    const map = buildDirectionMap(fallbackArtworks)
    for (const d of DIRECTIONS) {
      expect(map[d].some((p) => p.slug === 'kubera' || p.slug === 'lakshmi'), d).toBe(false)
    }
  })

  it('applies the Appendix B secondaries to the live catalogue', () => {
    const map = buildDirectionMap(fallbackArtworks)
    const slugs = (d) => map[d].map((p) => p.slug)
    expect(slugs('South-West')).toContain('kavach')
    expect(slugs('West')).toEqual(['svadhisthana'])
    expect(slugs('North')).toContain('mahadeva')
    expect(slugs('North-West')).toContain('ananda')
    expect(map['North-West'].find((p) => p.slug === 'ananda').match).toBe('secondary')
  })

  it('no wheel sector is empty with the current catalogue', () => {
    expect(emptyDirections(buildDirectionMap(fallbackArtworks))).toEqual([])
  })

  it('payload for the whole map stays far under 150 KB', () => {
    const bytes = JSON.stringify(buildDirectionMap(fallbackArtworks)).length
    expect(bytes).toBeLessThan(150 * 1024)
  })
})
