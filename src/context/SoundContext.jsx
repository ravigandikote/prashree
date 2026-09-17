import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { createSoundEngine } from '../lib/audio/engine'

/**
 * The single sound engine for the whole app, as a React context.
 *
 *  enabled   — the visitor's intent, persisted in localStorage. Off by default
 *              on every device. Turning it on must happen inside a user
 *              gesture (the header toggle's click): that is what unlocks the
 *              AudioContext. Nothing is fetched while it is off.
 *  unlocked  — whether the context is actually running. After a hard reload
 *              the browser may re-block: `enabled` stays true (intent) while
 *              `unlocked` is false until the visitor's next gesture, which we
 *              listen for once. The toggle should show "off" in that gap
 *              rather than claim sound is playing.
 *  playing   — URL of the looping tone, or null. Intent, not output: iOS's
 *              silent switch is invisible to us and left alone.
 *
 * Route changes schedule a stop with a short grace period so a page that
 * wants a crossfade can claim the engine first; anything else lets the tone
 * fade out. Unmount disposes the context.
 */

const STORAGE_KEY = 'prashree-sound'

const SoundContext = createContext(null)

function readEnabled() {
  try { return localStorage.getItem(STORAGE_KEY) === 'on' } catch { return false }
}
function writeEnabled(on) {
  try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off') } catch { /* private mode: does not persist */ }
}

const GESTURES = ['pointerdown', 'keydown', 'touchend']

export function SoundProvider({ children, engine: injected }) {
  // one engine for the provider's lifetime (lazy state init, never re-created)
  const [engine] = useState(() => injected || createSoundEngine())

  const [enabled, setEnabledState] = useState(readEnabled)
  // the play wrappers read this, not the state, so a gesture that switches
  // sound on can start a tone in the same tick (before React re-renders)
  const enabledRef = useRef(enabled)
  const [engineState, setEngineState] = useState(engine.getState)
  const location = useLocation()

  useEffect(() => engine.subscribe(setEngineState), [engine])

  // The preference survived a reload but the browser needs a gesture again:
  // unlock quietly on the first one, and give up quietly if it is refused.
  useEffect(() => {
    if (!enabled || engineState.unlocked) return undefined
    let done = false
    const tryUnlock = () => {
      if (done) return
      done = true
      for (const g of GESTURES) window.removeEventListener(g, tryUnlock, true)
      engine.unlock()
    }
    for (const g of GESTURES) window.addEventListener(g, tryUnlock, { capture: true, passive: true })
    return () => { for (const g of GESTURES) window.removeEventListener(g, tryUnlock, true) }
  }, [enabled, engineState.unlocked, engine])

  const setEnabled = useCallback(async (on) => {
    writeEnabled(on)
    enabledRef.current = on
    setEnabledState(on)
    if (on) return engine.unlock()       // we are inside the toggle's click handler
    engine.stopTone({ fadeOut: 0.6 })
    return false
  }, [engine])

  // Leaving a route: fade out unless the next page claims the engine within the grace period.
  useEffect(() => {
    return () => engine.stopTone({ delay: 800 })
  }, [location.pathname, engine])

  // A tone from a backgrounded tab is the fastest way to get the toggle switched
  // off forever: stop on hide. Pages that want to resume watch `visible`.
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'))
  useEffect(() => {
    const onChange = () => {
      const v = document.visibilityState !== 'hidden'
      setVisible(v)
      if (!v) engine.stopTone({ fadeOut: 0.5 })
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [engine])

  useEffect(() => () => engine.dispose(), [engine])

  const value = useMemo(() => ({
    enabled,
    setEnabled,
    visible,
    unlocked: engineState.unlocked,
    playing: engineState.playing,
    ducked: engineState.ducked,
    largeFiles: engineState.largeFiles,
    /** Only these touch audio; every one is a no-op while locked. */
    playTone: (src, o) => (enabledRef.current ? engine.playTone(src, o) : Promise.resolve(false)),
    crossfadeTo: (src, o) => (enabledRef.current ? engine.crossfadeTo(src, o) : Promise.resolve(false)),
    stopTone: (o) => engine.stopTone(o),
    holdTone: () => engine.holdTone(),
    playOnce: (src, o) => (enabledRef.current ? engine.playOnce(src, o) : Promise.resolve(0)),
    duck: (l, ms) => engine.duck(l, ms),
    unduck: (ms) => engine.unduck(ms),
    unlock: () => engine.unlock(),
    engine,
  }), [enabled, setEnabled, visible, engineState, engine])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used inside <SoundProvider>')
  return ctx
}
