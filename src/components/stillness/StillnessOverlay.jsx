import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import StillnessRing from './StillnessRing'
import { useSound } from '../../context/SoundContext'
import { PHASES, SESSION_SECONDS, schedule } from '../../lib/stillness'
import { getSiteAudio } from '../../lib/supabase'
import { resolveAudioUrl } from '../../lib/audio/urls'

/*
 * Two minutes of stillness. Full-screen ink, fades in over 800 ms, and
 * everything behind it goes inert (#root gets `inert`, scroll is locked,
 * focus is trapped, aria-modal). A brief card first — the 4-7-8 caution is
 * part of the practice, not a disclaimer — then six cycles of a ring that
 * expands, holds and contracts, one word per phase, a progress arc, and a
 * gong at the start and the end. Escape, the close control, or a tap outside
 * the ring exits (600 ms fade, no confirmation). On completion the ring holds
 * for a beat, then "Two minutes." — and nothing else. Works in silence.
 */

// Inhale: fastest at the start, settling at the top. Exhale: slower, smoother.
const EASE = {
  inhale: 'transform 4s cubic-bezier(0.16, 0.84, 0.3, 1)',
  hold: 'transform 7s linear',
  exhale: 'transform 8s cubic-bezier(0.42, 0.02, 0.36, 1)',
}
const SCALE = { inhale: 1, hold: 1.004, exhale: 0.74 }      // hold: the faintest drift
const WEIGHT = { inhale: 1.35, hold: 1.1, exhale: 0.8 }     // reduced motion: weight shifts instead
const FADE_IN_MS = 800, FADE_OUT_MS = 600, HOLD_BEAT_MS = 1800, DONE_LINGER_MS = 12000

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function StillnessOverlay({ open, onClose, returnFocusTo }) {
  const sound = useSound()
  const [stage, setStage] = useState('card')       // card | practice | done
  const [visible, setVisible] = useState(false)    // drives the 800/600 ms fades
  const [step, setStep] = useState(null)           // { cycle, phase } from the schedule
  const [progressOn, setProgressOn] = useState(false)
  const reduced = useMemo(reducedMotion, [open])
  const rootRef = useRef(null)
  const timersRef = useRef([])
  const gongRef = useRef({ open: null, close: null })

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timersRef.current.push(t); return t }

  // ── open / close lifecycle: fade, inert, scroll lock, focus ──
  useEffect(() => {
    if (!open) return undefined
    const root = document.getElementById('root')
    const scrollY = window.scrollY
    const returnTo = returnFocusTo?.current
    root?.setAttribute('inert', '')
    document.body.style.overflow = 'hidden'
    setStage('card'); setStep(null); setProgressOn(false)
    const raf = requestAnimationFrame(() => setVisible(true))

    // Nothing else may sound underneath: duck fast, then let the tone go.
    sound.duck(0.1, 400)
    sound.stopTone({ fadeOut: 1 })

    // Fetch the shared gong rows only now, only if sound is on (bandwidth rule).
    if (sound.enabled) {
      Promise.race([getSiteAudio(), new Promise((r) => setTimeout(() => r(null), 3000))])
        .then((rows) => {
          const by = (slug) => resolveAudioUrl(rows?.find((r) => r.slug === slug)?.audio_url)
          gongRef.current = { open: by('gong-open'), close: by('gong-close') || by('gong-open') }
        })
        .catch(() => {})
    }

    later(() => rootRef.current?.querySelector('[data-autofocus]')?.focus(), FADE_IN_MS)

    return () => {
      cancelAnimationFrame(raf)
      clearTimers()
      root?.removeAttribute('inert')
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
      sound.unduck(900)
      returnTo?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = useCallback(() => {
    setVisible(false)
    clearTimers()
    later(onClose, FADE_OUT_MS)
  }, [onClose])

  // ── the practice ──
  const begin = () => {
    setStage('practice')
    const plan = schedule()
    const t0 = performance.now()
    // arm the progress arc one frame after mount so its transition runs from 0
    requestAnimationFrame(() => requestAnimationFrame(() => setProgressOn(true)))
    if (gongRef.current.open) sound.playOnce(gongRef.current.open, { level: 0.9 })
    for (const s of plan) {
      later(() => {
        if (s.end) {
          if (gongRef.current.close) sound.playOnce(gongRef.current.close, { level: 0.7 })
          later(() => setStage('done'), HOLD_BEAT_MS)
          later(close, HOLD_BEAT_MS + DONE_LINGER_MS)
        } else {
          setStep({ cycle: s.cycle, phase: s.phase })
        }
      }, Math.max(0, s.at - (performance.now() - t0)))
    }
  }

  // ── keyboard: Escape exits; Tab stays inside ──
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab' || !rootRef.current) return
      const focusables = [...rootRef.current.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null)
      if (!focusables.length) { e.preventDefault(); return }
      const first = focusables[0], last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, close])

  if (!open) return null

  const phaseKey = step?.phase.key || 'exhale'
  const word = step?.phase.label || ''
  const live = stage === 'done' ? 'Two minutes.' : stage === 'practice' && step ? `${word}. Breath ${step.cycle} of 6.` : ''

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Two minutes of stillness"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
      className="fixed inset-0 z-[70] bg-ink text-paper flex items-center justify-center px-4"
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${visible ? FADE_IN_MS : FADE_OUT_MS}ms ease` }}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Leave stillness"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 w-11 h-11 inline-flex items-center justify-center text-paper/70 hover:text-paper bg-transparent border-0 cursor-pointer"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {/* polite live region for the phase words */}
      <p aria-live="polite" className="sr-only">{live}</p>

      {stage === 'card' && (
        <div className="max-w-[26rem] text-center" onClick={(e) => e.stopPropagation()}>
          <p className="font-display text-h3 leading-snug text-paper">
            Sit comfortably. Breathe in for four, hold for seven, out for eight.
          </p>
          <p className="text-body text-paper/70 mt-4">
            Stop if you feel lightheaded, and breathe normally.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              type="button"
              data-autofocus
              onClick={begin}
              className="min-h-11 px-7 bg-paper text-ink text-[15px] uppercase tracking-label border-0 cursor-pointer"
            >
              Begin
            </button>
            <button
              type="button"
              onClick={close}
              className="min-h-11 px-6 bg-transparent text-paper/80 hover:text-paper text-[15px] uppercase tracking-label border border-paper/30 cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {stage !== 'card' && (
        <div className="w-[min(78vw,26rem)] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <StillnessRing
            phaseKey={phaseKey}
            scale={stage === 'done' ? SCALE.exhale : SCALE[phaseKey]}
            transition={EASE[phaseKey]}
            progress={progressOn ? 1 : 0}
            progressTransition={progressOn ? `stroke-dashoffset ${SESSION_SECONDS}s linear` : 'none'}
            reduced={reduced}
            weight={reduced ? WEIGHT[phaseKey] : 1}
          />
          {/* phase words crossfade in place; nothing slides */}
          <div className="relative h-8 mt-2 w-full">
            {stage === 'done' ? (
              <p className="absolute inset-0 text-center font-display text-h3 text-paper" style={{ transition: 'opacity 900ms ease' }}>Two minutes.</p>
            ) : (
              PHASES.map((p) => (
                <p
                  key={p.key}
                  aria-hidden="true"
                  className="absolute inset-0 text-center font-display text-h3 text-paper/90"
                  style={{ opacity: p.key === phaseKey ? 1 : 0, transition: 'opacity 700ms ease' }}
                >
                  {p.label}
                </p>
              ))
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
