import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { useSound } from '../context/SoundContext'
import { resolveAudioUrl, isPlayableAudioUrl } from '../lib/audio/urls'

/*
 * The paired tone on an artwork page. Renders nothing at all when the piece
 * has no audio. With sound on, the tone fades in about a second after the
 * page has settled (not on mount), crossfading from whatever the previous
 * artwork was playing. Below the picture: the title and credit as a quiet
 * line, and a local play/pause that controls only this piece. Stops on
 * navigation away (provider grace), on tab hide (provider), and when
 * stillness mode opens (Phase 4).
 */
const SETTLE_MS = 1000

export default function ArtworkTone({ product }) {
  const sound = useSound()
  const url = resolveAudioUrl(product?.audio_url)
  const playable = url && isPlayableAudioUrl(url)
  const [paused, setPaused] = useState(false)     // local intent for this piece only
  const isThis = playable && sound.playing === url

  // Claim the engine as soon as this page mounts so a tone from the previous
  // artwork is not cut before we can crossfade into ours.
  useEffect(() => { if (playable) sound.holdTone() }, [playable, sound])

  useEffect(() => {
    if (!playable) return undefined
    if (!sound.enabled || !sound.unlocked || !sound.visible || paused) return undefined
    const t = setTimeout(() => { sound.crossfadeTo(url) }, SETTLE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playable, url, sound.enabled, sound.unlocked, sound.visible, paused])

  // If this piece had a tone and the visitor pauses it, it must not fade back in on its own.
  useEffect(() => {
    if (paused && isThis) sound.stopTone({ fadeOut: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  if (!playable) return null

  const onToggle = async () => {
    if (!sound.enabled || !sound.unlocked) {
      // Explicit gesture on this piece: switch sound on (site-wide preference) and play it.
      const ok = await sound.setEnabled(true)
      if (ok) { setPaused(false); sound.crossfadeTo(url, { fadeIn: 1.5 }) }
      return
    }
    if (isThis) { setPaused(true); return }
    setPaused(false)
    sound.crossfadeTo(url, { fadeIn: 1.5 })
  }

  const label = !sound.enabled || !sound.unlocked
    ? 'Turn sound on to listen'
    : isThis ? 'Pause this tone' : 'Play this tone'

  return (
    <div className="mt-5 flex items-start gap-3 text-[15px] text-graphite">
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-pressed={isThis}
        title={label}
        className="shrink-0 w-11 h-11 inline-flex items-center justify-center border border-mist hover:border-ink text-ink bg-white cursor-pointer transition-colors"
      >
        {isThis ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
      </button>
      <div className="min-w-0 pt-2 leading-snug">
        {product.audio_title && <p className="text-charcoal m-0">{product.audio_title}</p>}
        {product.audio_credit && <p className="m-0 mt-0.5">{product.audio_credit}</p>}
        {!product.audio_title && !product.audio_credit && <p className="m-0">A tone from Monica's sound sessions</p>}
      </div>
    </div>
  )
}
