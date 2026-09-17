import { useState } from 'react'
import { useSound } from '../../context/SoundContext'

/*
 * DEV ONLY (route exists only under `vite dev`): exercises every engine
 * method before any real UI touches it. No recordings exist yet and audio
 * never lives in the repo, so the tones here are synthesised in the browser
 * from the live AudioContext — a decaying sine to stand in for a bowl, a
 * lower one for the gong — and one button fetches+decodes a WAV built on
 * the fly (blob URL) so the network → decode → loop path is exercised too.
 */
function synthBuffer(ctx, { hz = 220, seconds = 2, decay = 1.6 }) {
  const rate = ctx.sampleRate
  const buf = ctx.createBuffer(1, Math.floor(rate * seconds), rate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) {
    const t = i / rate
    // fundamental + a soft octave, exponential decay, gentle fade at both ends for seamless looping
    const env = Math.exp(-t * decay) * Math.min(1, t * 40) * Math.min(1, (seconds - t) * 8)
    d[i] = (Math.sin(2 * Math.PI * hz * t) * 0.7 + Math.sin(2 * Math.PI * hz * 2 * t) * 0.2) * env * 0.5
  }
  return buf
}

/** Encode an AudioBuffer as 16-bit PCM WAV and return a blob: URL. */
function wavUrl(buf) {
  const n = buf.length, rate = buf.sampleRate
  const out = new DataView(new ArrayBuffer(44 + n * 2))
  const str = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ')
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true)
  out.setUint32(24, rate, true); out.setUint32(28, rate * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true)
  str(36, 'data'); out.setUint32(40, n * 2, true)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i])) * 32767, true)
  return URL.createObjectURL(new Blob([out], { type: 'audio/wav' }))
}

function Btn({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="min-h-11 px-4 border border-ink bg-white text-ink text-body disabled:opacity-40 cursor-pointer">
      {children}
    </button>
  )
}

export default function SoundLab() {
  const sound = useSound()
  const [url, setUrl] = useState('')
  const [log, setLog] = useState([])
  const say = (m) => setLog((l) => [`${new Date().toLocaleTimeString()} ${m}`, ...l].slice(0, 12))
  const ctx = () => sound.engine.context()

  const enable = async () => { const ok = await sound.setEnabled(true); say(`setEnabled(true) → unlocked=${ok}`) }
  const disable = async () => { await sound.setEnabled(false); say('setEnabled(false)') }
  const toneA = async () => { const ok = await sound.playTone(synthBuffer(ctx(), { hz: 220 })); say(`playTone(A 220 Hz) → ${ok}`) }
  const toneB = async () => { const ok = await sound.crossfadeTo(synthBuffer(ctx(), { hz: 330 })); say(`crossfadeTo(B 330 Hz) → ${ok}`) }
  const fromUrl = async () => {
    const u = url || wavUrl(synthBuffer(ctx(), { hz: 261.6, seconds: 3, decay: 1.2 }))
    const ok = await sound.playTone(u); say(`playTone(${u.slice(0, 40)}…) → ${ok}`)
  }
  const stop = () => { sound.stopTone(); say('stopTone()') }
  const gong = async () => { const s = await sound.playOnce(synthBuffer(ctx(), { hz: 110, seconds: 5, decay: 0.7 })); say(`playOnce(gong) → ${s.toFixed(1)} s`) }
  const duck = () => { sound.duck(); say('duck()') }
  const unduck = () => { sound.unduck(); say('unduck()') }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-12">
      <p className="text-small uppercase tracking-label text-graphite">Dev only</p>
      <h1 className="font-display text-display-sm text-ink mb-6">Sound engine lab</h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-body mb-8 max-w-md">
        <dt className="text-graphite">enabled</dt><dd>{String(sound.enabled)}</dd>
        <dt className="text-graphite">unlocked</dt><dd>{String(sound.unlocked)}</dd>
        <dt className="text-graphite">context</dt><dd>{ctx()?.state || 'none'}</dd>
        <dt className="text-graphite">playing</dt><dd className="break-all">{sound.playing || '—'}</dd>
        <dt className="text-graphite">ducked</dt><dd>{String(sound.ducked)}</dd>
        <dt className="text-graphite">large files</dt><dd>{sound.largeFiles.length ? sound.largeFiles.join(', ') : 'none'}</dd>
      </dl>

      <div className="flex flex-wrap gap-3 mb-4">
        <Btn onClick={enable}>1 · Enable (gesture → unlock)</Btn>
        <Btn onClick={disable}>Disable</Btn>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <Btn onClick={toneA} disabled={!sound.unlocked}>playTone A (loop, 2.5 s in)</Btn>
        <Btn onClick={toneB} disabled={!sound.unlocked}>crossfadeTo B</Btn>
        <Btn onClick={stop} disabled={!sound.unlocked}>stopTone (1.5 s out)</Btn>
      </div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL of a .m4a (blank = generated WAV via blob URL)" className="min-h-11 px-3 border border-mist flex-1 min-w-[16rem]" />
        <Btn onClick={fromUrl} disabled={!sound.unlocked}>playTone from URL (fetch → decode)</Btn>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <Btn onClick={gong} disabled={!sound.unlocked}>playOnce gong</Btn>
        <Btn onClick={duck} disabled={!sound.unlocked}>duck</Btn>
        <Btn onClick={unduck} disabled={!sound.unlocked}>unduck</Btn>
      </div>

      <ol className="text-small text-graphite space-y-1 font-mono" aria-label="Log">
        {log.map((l, i) => <li key={i}>{l}</li>)}
      </ol>
    </div>
  )
}
