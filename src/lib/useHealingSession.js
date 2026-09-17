import { useCallback, useEffect, useRef, useState } from 'react'
import { useSound } from '../context/SoundContext'
import { buildSession, defaultSoundUrl } from '../data/soundHealing'
import { getSiteAudio } from './supabase'
import { resolveAudioUrl } from './audio/urls'

/**
 * Drives a Sound Healing session on the shared engine: resolves each sound
 * (a site_audio row with the slug wins, else the bundled stand-in), then
 * fires the planned events on timers. Begin must be called from a gesture —
 * it switches sound on (the visitor asked for sound by pressing it) and
 * unlocks the context. Leaving the page stops every layer.
 *
 * `tempo` > 1 compresses the timeline (dev/testing only).
 */
export function useHealingSession({ tempo = 1 } = {}) {
  const sound = useSound()
  const [stage, setStage] = useState('idle')       // idle | starting | playing | done | blocked
  const [elapsed, setElapsed] = useState(0)        // seconds, real time
  const [entered, setEntered] = useState({})       // id → 'entering' | 'playing' | 'struck' | 'resting'
  const [total, setTotal] = useState(0)
  const timers = useRef([])
  const tick = useRef(null)
  const startedAt = useRef(0)

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; if (tick.current) clearInterval(tick.current); tick.current = null }
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }

  const stop = useCallback(({ fadeOut = 2 } = {}) => {
    clear()
    sound.engine.stopAllLayers({ fadeOut })
    setStage('idle')
    setEntered({})
    setElapsed(0)
  }, [sound.engine])

  const begin = useCallback(async (selection, minutes) => {
    setStage('starting')
    const ok = await sound.setEnabled(true)
    if (!ok) { setStage('blocked'); return false }
    // prefer recordings uploaded at /admin/sounds; fall back to the stand-ins
    let rows = null
    try { rows = await Promise.race([getSiteAudio(), new Promise((r) => setTimeout(() => r(null), 2500))]) } catch { rows = null }
    const urlFor = (slug) => resolveAudioUrl(rows?.find((r) => r.slug === slug)?.audio_url) || defaultSoundUrl(slug)

    const events = buildSession(selection, minutes)
    const totalSeconds = Math.max(180, minutes * 60)
    setTotal(totalSeconds)
    setEntered({})
    setElapsed(0)
    startedAt.current = performance.now()
    setStage('playing')
    tick.current = setInterval(() => setElapsed(Math.min(totalSeconds, ((performance.now() - startedAt.current) / 1000) * tempo)), 500)

    for (const e of events) {
      later(async () => {
        if (e.type === 'layer') {
          setEntered((m) => ({ ...m, [e.id]: 'entering' }))
          const started = await sound.engine.playLayer(e.id, urlFor(e.slug), { level: e.level, fadeIn: e.fadeIn / tempo })
          setEntered((m) => ({ ...m, [e.id]: started ? 'playing' : 'missing' }))
        } else if (e.type === 'level') {
          sound.engine.setLayerLevel(e.id, e.level, e.fadeIn / tempo)
          setEntered((m) => ({ ...m, [e.id]: 'resting' }))
        } else if (e.type === 'once') {
          setEntered((m) => ({ ...m, [e.id]: 'struck' }))
          sound.engine.playOnce(urlFor(e.slug), { level: e.level })
        } else if (e.type === 'stop-all') {
          sound.engine.stopAllLayers({ fadeOut: e.fadeOut / tempo })
          setEntered((m) => Object.fromEntries(Object.keys(m).map((k) => [k, k.startsWith('gong') ? m[k] : 'fading'])))
        }
      }, (e.at * 1000) / tempo)
    }
    later(() => { setStage('done'); if (tick.current) clearInterval(tick.current); setElapsed(totalSeconds) }, (totalSeconds * 1000) / tempo)
    return true
  }, [sound, tempo])

  // leaving the page (unmount) silences everything
  useEffect(() => () => { clear(); sound.engine.stopAllLayers({ fadeOut: 1.5 }) }, [sound.engine])

  return { stage, elapsed, total, entered, begin, stop, unlocked: sound.unlocked }
}
