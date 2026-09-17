import { describe, it, expect } from 'vitest'
import { PHASES, CYCLE_SECONDS, CYCLES, SESSION_SECONDS, phaseAt, schedule } from './stillness'

describe('stillness timing', () => {
  it('is 4-7-8 over six cycles = 114 s, not a hard 120', () => {
    expect(PHASES.map((p) => p.seconds)).toEqual([4, 7, 8])
    expect(CYCLE_SECONDS).toBe(19)
    expect(CYCLES).toBe(6)
    expect(SESSION_SECONDS).toBe(114)
  })

  it('maps elapsed time to the right phase, cycle and progress', () => {
    expect(phaseAt(0)).toMatchObject({ done: false, cycle: 1, phase: { key: 'inhale' }, phaseElapsedMs: 0, progress: 0 })
    expect(phaseAt(3999)).toMatchObject({ cycle: 1, phase: { key: 'inhale' } })
    expect(phaseAt(4000)).toMatchObject({ cycle: 1, phase: { key: 'hold' }, phaseElapsedMs: 0 })
    expect(phaseAt(10999)).toMatchObject({ cycle: 1, phase: { key: 'hold' } })
    expect(phaseAt(11000)).toMatchObject({ cycle: 1, phase: { key: 'exhale' } })
    expect(phaseAt(19000)).toMatchObject({ cycle: 2, phase: { key: 'inhale' }, phaseElapsedMs: 0 })
    expect(phaseAt(57000).progress).toBeCloseTo(0.5)
    expect(phaseAt(113999)).toMatchObject({ done: false, cycle: 6, phase: { key: 'exhale' } })
  })

  it('ends exactly on the last exhale, never mid-breath', () => {
    expect(phaseAt(114000)).toMatchObject({ done: true, cycle: 6, progress: 1 })
    expect(phaseAt(200000).done).toBe(true)
    expect(phaseAt(-5)).toMatchObject({ cycle: 1, phase: { key: 'inhale' } })
  })

  it('schedules 18 phase starts and one end, contiguous', () => {
    const s = schedule()
    expect(s).toHaveLength(19)
    expect(s[0]).toMatchObject({ at: 0, cycle: 1, phase: { key: 'inhale' } })
    expect(s[1].at).toBe(4000)
    expect(s[2].at).toBe(11000)
    expect(s[3]).toMatchObject({ at: 19000, cycle: 2 })
    expect(s.at(-1)).toMatchObject({ at: 114000, end: true })
    for (let i = 1; i < s.length; i++) expect(s[i].at).toBeGreaterThan(s[i - 1].at)
  })

  it('phase words are practice, not claims', () => {
    for (const p of PHASES) expect(p.label).not.toMatch(/heal|cure|calm you|reduce|relieve/i)
  })
})
