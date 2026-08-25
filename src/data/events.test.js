import { describe, it, expect } from 'vitest'
import { eventsContent, whatsappLink } from './events'

describe('events content', () => {
  it('every occasion has a name and one-line description', () => {
    expect(eventsContent.occasions.length).toBeGreaterThanOrEqual(6)
    for (const o of eventsContent.occasions) {
      expect(o.name).toBeTruthy()
      expect(o.line).toBeTruthy()
    }
  })

  it('meta description fits search snippets (≤160 chars)', () => {
    expect(eventsContent.meta.description.length).toBeLessThanOrEqual(160)
  })

  it('process is a real three-step sequence', () => {
    expect(eventsContent.process).toHaveLength(3)
  })

  it('whatsapp links are wa.me with encoded text', () => {
    const link = whatsappLink('Hi PraShree Events, décor for a Mehandi')
    expect(link.startsWith('https://wa.me/91')).toBe(true)
    expect(link).toContain('d%C3%A9cor')
  })
})
