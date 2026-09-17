import { describe, it, expect } from 'vitest'
import { CHAKRAS, INTENTIONS, INSTRUMENTS, buildSession, sessionSlugs, defaultSoundUrl } from './soundHealing'

const CLAIMS = /\b(cure|cures|heal(s|ing)?\s+(your|the|any)|treat(s|ment)?|relieve|reduces? (anxiety|stress|pain)|guarantee|clinically|therapy for)\b/i

describe('sound healing content', () => {
  it('has seven chakras with rising, distinct bowl pitches from root to crown', () => {
    expect(CHAKRAS).toHaveLength(7)
    for (let i = 1; i < CHAKRAS.length; i++) expect(CHAKRAS[i].hz).toBeGreaterThan(CHAKRAS[i - 1].hz)
    expect(new Set(CHAKRAS.map((c) => c.slug)).size).toBe(7)
    expect(CHAKRAS[0]).toMatchObject({ key: 'root', note: 'C', hz: 256 })
    expect(CHAKRAS[6]).toMatchObject({ key: 'crown', note: 'B', hz: 480 })
  })

  it('every intention maps to one or two known chakras', () => {
    for (const i of INTENTIONS) {
      expect(i.chakras.length).toBeGreaterThanOrEqual(1)
      expect(i.chakras.length).toBeLessThanOrEqual(2)
      for (const k of i.chakras) expect(CHAKRAS.some((c) => c.key === k), `${i.key} → ${k}`).toBe(true)
    }
  })

  it('reads as practice, not treatment', () => {
    for (const c of CHAKRAS) expect(c.line, c.key).not.toMatch(CLAIMS)
    for (const i of INTENTIONS) { expect(i.label).not.toMatch(CLAIMS); expect(i.line, i.key).not.toMatch(CLAIMS) }
    for (const i of INSTRUMENTS) expect(i.line).not.toMatch(CLAIMS)
  })

  it('instruments enter in the asked order: bowls, rain stick, ocean drum, gong, then raga alaap', () => {
    expect(INSTRUMENTS.map((i) => i.key)).toEqual(['bowl', 'rain-stick', 'ocean-drum', 'gong', 'raga-alaap'])
  })
})

describe('buildSession', () => {
  it('starts with the chosen bowl(s), layers the rest in order, gong before the alaap, and closes with a gong', () => {
    const ev = buildSession({ chakras: ['root', 'crown'] }, 10)
    const firstOf = (id) => ev.find((e) => e.id === id)
    expect(ev[0]).toMatchObject({ at: 0, type: 'layer', id: 'bowl-root', slug: 'bowl-root' })
    expect(firstOf('bowl-crown').at).toBe(20)
    expect(firstOf('rain-stick').at).toBeLessThan(firstOf('ocean-drum').at)
    expect(firstOf('ocean-drum').at).toBeLessThan(firstOf('gong').at)
    expect(firstOf('gong').at).toBeLessThan(firstOf('raga-alaap').at)
    expect(firstOf('raga-alaap').fadeIn).toBeGreaterThanOrEqual(20)   // "slowly fade in"
    expect(ev.at(-1)).toMatchObject({ type: 'once', id: 'gong-close', at: 600 - 8 })
    expect(ev.find((e) => e.type === 'stop-all').at).toBe(600 - 30)
    for (let i = 1; i < ev.length; i++) expect(ev[i].at).toBeGreaterThanOrEqual(ev[i - 1].at)
  })

  it('never uses more than two bowls and falls back to the heart bowl', () => {
    expect(buildSession({ chakras: ['root', 'sacral', 'heart'] }, 5).filter((e) => e.type === 'layer' && e.id.startsWith('bowl-'))).toHaveLength(2)
    expect(buildSession({ chakras: [] }, 5)[0].id).toBe('bowl-heart')
    expect(buildSession(null, 5)[0].id).toBe('bowl-heart')
  })

  it('a 5-minute session still fits every instrument before the wind-down', () => {
    const ev = buildSession({ chakras: ['heart'] }, 5)
    const windDown = ev.find((e) => e.type === 'stop-all').at
    expect(ev.find((e) => e.id === 'raga-alaap').at).toBeLessThan(windDown)
    expect(sessionSlugs(ev)).toEqual(['bowl-heart', 'rain-stick', 'ocean-drum', 'gong-healing', 'raga-alaap'])
  })

  it('default sound files live under /sounds', () => {
    expect(defaultSoundUrl('bowl-root')).toBe('/sounds/bowl-root.wav')
  })
})
