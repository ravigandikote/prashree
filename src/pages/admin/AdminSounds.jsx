import { useEffect, useState } from 'react'
import { getSiteAudio, updateSiteAudio, uploadFile } from '../../lib/supabase'
import { audioStoragePath, isPlayableAudioUrl } from '../../lib/audio/urls'
import { inputClasses } from './adminUi'
import toast from 'react-hot-toast'

/*
 * The shared sounds: the gong that opens and closes "Two minutes of
 * stillness" (and a reserved fallback tone). The rows exist from the
 * migration; this page fills them. Files upload to products/audio/<slug>.
 * Per-artwork tones are edited on each piece under Products → Sound.
 */
export default function AdminSounds() {
  const [rows, setRows] = useState(null)
  const [busy, setBusy] = useState(null)

  const load = () => getSiteAudio().then((d) => setRows(d || [])).catch(() => setRows([]))
  useEffect(() => { load() }, [])

  const save = async (row, patch) => {
    setBusy(row.id)
    try {
      await updateSiteAudio(row.id, patch)
      toast.success(`${row.label} saved`)
      load()
    } catch (err) {
      toast.error(err.message || 'Could not save')
    } finally {
      setBusy(null)
    }
  }

  const upload = async (row, file) => {
    if (!file) return
    setBusy(row.id)
    try {
      const url = await uploadFile('products', audioStoragePath(row.slug, file.name), file, { upsert: true })
      const probe = document.createElement('audio')
      probe.preload = 'metadata'
      const seconds = await new Promise((resolve) => {
        probe.onloadedmetadata = () => resolve(Number(probe.duration.toFixed(2)))
        probe.onerror = () => resolve(null)
        probe.src = URL.createObjectURL(file)
      })
      await updateSiteAudio(row.id, { audio_url: url, audio_loop_seconds: seconds })
      toast.success(`${row.label}: file uploaded`)
      load()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-h2 text-ink">Sounds</h1>
      <p className="text-small text-graphite mt-1 mb-6 max-w-[70ch]">
        Shared recordings for the site. Compress with <code>npm run audio:compress -- file.wav --gong</code> before
        uploading (see README, "Sound layer"). Per-artwork tones live on each piece under Products → Sound.
      </p>

      {rows === null ? <p className="text-graphite">Loading…</p> : rows.length === 0 ? (
        <p className="text-graphite">No rows yet — run <code>supabase/migrations/20260916_sound_layer.sql</code>.</p>
      ) : (
        <div className="border border-mist divide-y divide-mist">
          {rows.map((r) => <SoundRow key={r.id} row={r} busy={busy === r.id} onSave={save} onUpload={upload} />)}
        </div>
      )}
    </div>
  )
}

function SoundRow({ row, busy, onSave, onUpload }) {
  const [title, setTitle] = useState(row.audio_title || '')
  const [credit, setCredit] = useState(row.audio_credit || '')
  const dirty = title !== (row.audio_title || '') || credit !== (row.audio_credit || '')
  const file = row.audio_url ? row.audio_url.split('/').pop() : null

  return (
    <div className="p-4 grid gap-3 lg:grid-cols-[14rem_1fr] items-start">
      <div>
        <p className="font-display text-h3 text-ink leading-tight">{row.label}</p>
        <p className="text-[11px] text-ash mt-1">{row.slug}</p>
        {row.purpose && <p className="text-small text-graphite mt-2">{row.purpose}</p>}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-small">
          {file ? (
            <>
              <span className="text-charcoal truncate max-w-[18rem]">{file}</span>
              {row.audio_loop_seconds != null && <span className="text-graphite">{row.audio_loop_seconds} s</span>}
              {!isPlayableAudioUrl(row.audio_url) && <span className="text-ink">⚠ unusual file type</span>}
              <button type="button" disabled={busy} onClick={() => onSave(row, { audio_url: null, audio_loop_seconds: null })} className="text-ink underline bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50">Remove file</button>
            </>
          ) : (
            <span className="text-ash">No file yet — the site stays silent here.</span>
          )}
          <label className="inline-flex items-center gap-2 min-h-11 px-3 border border-ink text-ink cursor-pointer">
            <span>{file ? 'Replace file' : 'Upload file'}</span>
            <input type="file" accept=".m4a,.mp4,.aac,.mp3,audio/*" className="sr-only" disabled={busy} onChange={(e) => { onUpload(row, e.target.files?.[0]); e.target.value = '' }} />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-graphite mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gong, Monica Prakash" className={inputClasses} />
          </div>
          <div>
            <label className="block text-xs text-graphite mb-1">Credit</label>
            <input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="Instrument, where and when recorded" className={inputClasses} />
          </div>
        </div>
        {dirty && (
          <button type="button" disabled={busy} onClick={() => onSave(row, { audio_title: title.trim() || null, audio_credit: credit.trim() || null })} className="min-h-11 px-5 bg-ink text-white text-small uppercase tracking-label border-0 cursor-pointer disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}
