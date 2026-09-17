/**
 * Timing for "Two minutes of stillness": 4-7-8 breathing, six cycles.
 * One cycle is 19 s (4 in, 7 hold, 8 out); six cycles are 114 s — rounded to
 * whole breaths rather than a hard 120 s so the session never cuts a breath.
 * Pure: the overlay drives it with timers, tests drive it with numbers.
 */

export const PHASES = Object.freeze([
  { key: 'inhale', label: 'Breathe in', seconds: 4 },
  { key: 'hold', label: 'Hold', seconds: 7 },
  { key: 'exhale', label: 'Breathe out', seconds: 8 },
])
export const CYCLE_SECONDS = PHASES.reduce((s, p) => s + p.seconds, 0)   // 19
export const CYCLES = 6
export const SESSION_SECONDS = CYCLE_SECONDS * CYCLES                    // 114

/**
 * Where the session is at `elapsedMs`.
 * @returns {{ done: boolean, cycle: number, phase: typeof PHASES[number], phaseElapsedMs: number, progress: number }}
 *   cycle is 1-based; progress is 0..1 across the whole session.
 */
export function phaseAt(elapsedMs) {
  const total = SESSION_SECONDS * 1000
  if (elapsedMs >= total) {
    return { done: true, cycle: CYCLES, phase: PHASES[PHASES.length - 1], phaseElapsedMs: PHASES[PHASES.length - 1].seconds * 1000, progress: 1 }
  }
  const clamped = Math.max(0, elapsedMs)
  const cycle = Math.floor(clamped / (CYCLE_SECONDS * 1000)) + 1
  let within = clamped % (CYCLE_SECONDS * 1000)
  for (const phase of PHASES) {
    const ms = phase.seconds * 1000
    if (within < ms) return { done: false, cycle, phase, phaseElapsedMs: within, progress: clamped / total }
    within -= ms
  }
  /* istanbul ignore next — unreachable: the loop covers the whole cycle */
  return { done: false, cycle, phase: PHASES[0], phaseElapsedMs: 0, progress: clamped / total }
}

/** Absolute times (ms from start) at which each phase begins, in order, plus the end. */
export function schedule() {
  const out = []
  let t = 0
  for (let c = 1; c <= CYCLES; c++) {
    for (const phase of PHASES) {
      out.push({ at: t, cycle: c, phase })
      t += phase.seconds * 1000
    }
  }
  out.push({ at: t, cycle: CYCLES, phase: null, end: true })
  return out
}
