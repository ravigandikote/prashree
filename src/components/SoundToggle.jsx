import { useEffect, useState } from 'react'
import { Volume2, VolumeX, X } from 'lucide-react'
import { useSound } from '../context/SoundContext'

/*
 * The header's sound control — the visitor's first gesture, on every page.
 * Two explicit states with labels that say what a press will do. "On" is
 * shown only when the AudioContext is actually running; after a reload the
 * preference may be on while the browser has re-blocked, and in that gap
 * the control shows "off" (pressing it unlocks) rather than lying.
 * When a tone is playing, a small filled ring marks it — no equaliser bars.
 * The first time sound is switched on, one quiet line explains what it is
 * for; once dismissed it never returns (localStorage).
 */
const HINT_KEY = 'prashree-sound-hint'
const hintSeen = () => { try { return localStorage.getItem(HINT_KEY) === 'seen' } catch { return true } }
const markHintSeen = () => { try { localStorage.setItem(HINT_KEY, 'seen') } catch { /* ignore */ } }

export default function SoundToggle({ className = '' }) {
  const { enabled, unlocked, playing, setEnabled } = useSound()
  const on = enabled && unlocked
  const [hint, setHint] = useState(false)

  const toggle = async () => {
    if (on) { await setEnabled(false); return }
    const ok = await setEnabled(true)
    if (ok && !hintSeen()) setHint(true)
  }
  const dismissHint = () => { markHintSeen(); setHint(false) }

  useEffect(() => {
    if (!hint) return undefined
    const t = setTimeout(dismissHint, 12000)
    return () => clearTimeout(t)
  }, [hint])

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'Turn sound off' : 'Turn sound on'}
        title={on ? 'Turn sound off' : 'Turn sound on'}
        className={`inline-flex items-center gap-2 min-h-11 min-w-11 px-2.5 text-[15px] tracking-wide whitespace-nowrap bg-transparent border-0 cursor-pointer transition-colors ${
          on ? 'text-ink' : 'text-graphite hover:text-ink'
        }`}
      >
        {on ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
        <span className="hidden sm:inline whitespace-nowrap">{on ? 'Sound on' : 'Sound off'}</span>
        {on && playing && (
          <span
            className="inline-block w-2 h-2 rounded-full bg-ink"
            aria-hidden="true"
            title="A tone is playing"
          />
        )}
        {on && playing && <span className="sr-only">A tone is playing.</span>}
      </button>

      {hint && (
        <div
          role="status"
          className="absolute right-0 top-full mt-1 w-[min(20rem,calc(100vw-2rem))] bg-white border border-mist px-3 py-2.5 flex items-start gap-2 text-[15px] text-charcoal shadow-[0_8px_24px_rgba(10,10,10,0.08)] z-50"
        >
          <span className="flex-1">Some artworks carry a tone from Monica's sound sessions.</span>
          <button
            type="button"
            onClick={dismissHint}
            aria-label="Dismiss"
            className="shrink-0 -m-1 p-1 min-h-11 min-w-11 inline-flex items-center justify-center text-graphite hover:text-ink bg-transparent border-0 cursor-pointer"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
