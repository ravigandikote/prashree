import { describe, it, expect } from 'vitest'
import { fallbackDirectionProfiles, DIRECTIONS, directionToSlug, slugToDirection } from './vastu'
import { fallbackArtworks } from './artworks'

const CLOCKWISE = [
  'North', 'North-East', 'East', 'South-East',
  'South', 'South-West', 'West', 'North-West', 'Centre',
]

/** The money manifestation line is a separate product line and never surfaces on the compass. */
const isMoneyLine = (a) => /money manifestation/i.test(`${a.form} ${a.series}`)

describe('Vastu direction profiles (Appendix A)', () => {
  it('has exactly the nine directions, clockwise from North with Centre last', () => {
    expect(DIRECTIONS).toEqual(CLOCKWISE)
    expect(fallbackDirectionProfiles.map((p) => p.sort_order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('every profile carries the fields the wheel and reading panel render', () => {
    for (const p of fallbackDirectionProfiles) {
      expect(p.label).toBeTruthy()
      expect(p.sanskrit_name).toBeTruthy()
      expect(p.guardian).toBeTruthy()
      expect(p.element).toBeTruthy()
      expect(p.description.length).toBeGreaterThan(80)
    }
  })

  it('essences are three to five words for the rim', () => {
    for (const p of fallbackDirectionProfiles) {
      const words = p.essence.split(/\s+/).length
      expect(words, p.direction).toBeGreaterThanOrEqual(3)
      expect(words, p.direction).toBeLessThanOrEqual(5)
    }
  })

  it('only the Centre (Brahmasthana) carries no artwork recommendation', () => {
    const hidden = fallbackDirectionProfiles.filter((p) => !p.shows_artworks)
    expect(hidden.map((p) => p.direction)).toEqual(['Centre'])
    expect(hidden[0].sanskrit_name).toBe('Brahmasthana')
  })

  it('copy is experiential, not medicinal — no outcome claims', () => {
    const banned = /\b(cure|heal(s|ing)?|guarantee|luck|wealthy|will bring|attracts? (money|wealth))\b/i
    for (const p of fallbackDirectionProfiles) {
      expect(p.description, p.direction).not.toMatch(banned)
      expect(p.essence, p.direction).not.toMatch(banned)
    }
  })

  it('round-trips direction ⇄ URL slug', () => {
    for (const d of DIRECTIONS) expect(slugToDirection(directionToSlug(d))).toBe(d)
    expect(directionToSlug('North-East')).toBe('north-east')
    expect(slugToDirection('NORTH-EAST')).toBe('North-East')
    expect(slugToDirection('sideways')).toBeNull()
    expect(slugToDirection(undefined)).toBeNull()
  })
})

describe('Artwork placement mappings (Appendix B)', () => {
  it('every direction value on an artwork is one of the nine', () => {
    for (const a of fallbackArtworks) {
      expect(DIRECTIONS, `${a.slug} direction`).toContain(a.direction)
      if (a.secondary_direction) {
        expect(DIRECTIONS, `${a.slug} secondary`).toContain(a.secondary_direction)
        expect(a.secondary_direction, `${a.slug} secondary equals primary`).not.toBe(a.direction)
      }
    }
  })

  it('placement notes fit the 140-character cap enforced at the DB', () => {
    for (const a of fallbackArtworks) {
      if (a.placement_note) expect(a.placement_note.length, a.slug).toBeLessThanOrEqual(140)
    }
  })

  it('the six draft mappings are present (Kubera excluded as money-line)', () => {
    const mapped = fallbackArtworks.filter((a) => a.placement_note).map((a) => a.slug).sort()
    expect(mapped).toEqual(['ananda', 'dhyana', 'kavach', 'mahadeva', 'sarasvati', 'svadhisthana'])
  })

  it('money manifestation pieces carry no placement mapping', () => {
    const money = fallbackArtworks.filter(isMoneyLine)
    expect(money.map((a) => a.slug).sort()).toEqual(['kubera', 'lakshmi'])
    for (const a of money) {
      expect(a.placement_note, a.slug).toBeNull()
      expect(a.secondary_direction, a.slug).toBeNull()
    }
  })

  it('reports which wheel sectors would be empty (flag, do not reassign)', () => {
    const eligible = fallbackArtworks.filter((a) => !isMoneyLine(a))
    const empty = DIRECTIONS.filter((d) => d !== 'Centre').filter(
      (d) => !eligible.some((a) => a.direction === d || a.secondary_direction === d)
    )
    // Nothing is empty with the current catalogue; if a piece is retagged
    // this test names the sector rather than silently letting the wheel go blank.
    expect(empty).toEqual([])
  })
})
