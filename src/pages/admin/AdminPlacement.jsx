import { useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getDirectionProfiles, updateDirectionProfile, createDirectionProfile,
} from '../../lib/supabase'
import { fallbackDirectionProfiles, DIRECTIONS, directionToSlug } from '../../data/vastu'
import { inputClasses } from './adminUi'
import toast from 'react-hot-toast'

/*
 * Edit the compass's own copy: one row per direction (label, Sanskrit name,
 * guardian, element, rim essence, reading-panel description, order, and
 * whether the direction lists artworks — Centre/Brahmasthana does not).
 * The nine directions are fixed by the database, so there is no add/delete;
 * a direction missing from the table can be created from its bundled draft.
 * Saving stamps edited_at so re-running the seed never overwrites the row.
 */
const FIELDS = (p) => ({
  label: p.label || '',
  sanskrit_name: p.sanskrit_name || '',
  guardian: p.guardian || '',
  element: p.element || '',
  essence: p.essence || '',
  description: p.description || '',
  sort_order: String(p.sort_order ?? 0),
  shows_artworks: p.shows_artworks !== false,
})

export default function AdminPlacement() {
  const [profiles, setProfiles] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () =>
    getDirectionProfiles().then((data) => setProfiles(data || [])).catch(() => setProfiles([]))
  useEffect(() => { load() }, [])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const openEdit = (p) => { setEditing(p); setForm(FIELDS(p)) }
  const close = () => { setEditing(null); setForm(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateDirectionProfile(editing.id, {
        label: form.label.trim(),
        sanskrit_name: form.sanskrit_name.trim() || null,
        guardian: form.guardian.trim() || null,
        element: form.element.trim() || null,
        essence: form.essence.trim(),
        description: form.description.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        shows_artworks: form.shows_artworks,
      })
      toast.success(`${form.label} saved`)
      close()
      load()
    } catch (err) {
      toast.error(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const restore = async (direction) => {
    const draft = fallbackDirectionProfiles.find((p) => p.direction === direction)
    if (!draft) return
    try {
      await createDirectionProfile(draft)
      toast.success(`${draft.label} created from the bundled draft`)
      load()
    } catch (err) {
      toast.error(err.message || 'Could not create')
    }
  }

  const missing = profiles ? DIRECTIONS.filter((d) => !profiles.some((p) => p.direction === d)) : []
  const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-h2 text-ink">Placement compass</h1>
          <p className="text-small text-graphite mt-1">
            The wheel's own copy, one row per direction. Artwork ↔ direction mappings live on each piece under{' '}
            <Link to="/admin/products" className="text-ink">Products</Link>. Preview at{' '}
            <Link to="/placement" className="text-ink" target="_blank" rel="noreferrer">/placement</Link>.
          </p>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="border border-mist bg-paper p-4 mb-6 text-small">
          <p className="text-charcoal">Not yet in the database: {missing.join(', ')}.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {missing.map((d) => (
              <button key={d} onClick={() => restore(d)} className="border border-ink px-3 py-1 text-[12px] uppercase tracking-label bg-white cursor-pointer">
                Create {d} from draft
              </button>
            ))}
          </div>
        </div>
      )}

      {profiles === null ? (
        <p className="text-graphite">Loading…</p>
      ) : (
        <div className="border border-mist divide-y divide-mist">
          {profiles.map((p) => (
            <div key={p.id} className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-[11px] text-ash w-4">{p.sort_order}</span>
                  <span className="font-display text-h3 text-ink">{p.label}</span>
                  {p.sanskrit_name && <span className="font-script text-2xl text-graphite">{p.sanskrit_name}</span>}
                  {!p.shows_artworks && (
                    <span className="border border-mist px-2 py-0.5 text-[10px] uppercase tracking-label text-graphite">no artworks</span>
                  )}
                  {p.edited_at && (
                    <span className="text-[10px] uppercase tracking-label text-ash">edited</span>
                  )}
                </div>
                <p className="text-small text-graphite mt-1">
                  {[p.guardian && `Guardian ${p.guardian}`, p.element && `Element ${p.element}`, p.essence].filter(Boolean).join(' · ')}
                </p>
                <p className="text-small text-charcoal mt-2 max-w-[70ch]">{p.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/placement?direction=${directionToSlug(p.direction)}`} target="_blank" rel="noreferrer"
                  className="text-[11px] uppercase tracking-label text-graphite hover:text-ink px-2 py-1"
                >
                  View
                </a>
                <button onClick={() => openEdit(p)} aria-label={`Edit ${p.label}`} className="p-2 text-graphite hover:text-ink bg-transparent border-0 cursor-pointer">
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && form && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={close} role="dialog" aria-modal="true" aria-label={`Edit ${editing.label}`}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-h3 text-ink">{editing.direction}</h2>
              <button type="button" onClick={close} aria-label="Close" className="p-1 text-graphite hover:text-ink bg-transparent border-0 cursor-pointer"><X size={18} /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Label" hint="On the wheel rim — keep it to one or two words so it fits at 390 px.">
                <input required value={form.label} onChange={(e) => set({ label: e.target.value })} className={inputClasses} />
              </Field>
              <Field label="Sanskrit name" hint="Set in Great Vibes on the reading panel.">
                <input value={form.sanskrit_name} onChange={(e) => set({ sanskrit_name: e.target.value })} className={inputClasses} />
              </Field>
              <Field label="Guardian" hint="Traditional presiding figure.">
                <input value={form.guardian} onChange={(e) => set({ guardian: e.target.value })} className={inputClasses} />
              </Field>
              <Field label="Element">
                <input value={form.element} onChange={(e) => set({ element: e.target.value })} className={inputClasses} />
              </Field>
            </div>

            <Field label={`Essence · ${wordCount(form.essence)} words`} hint="Three to five words; shown beside the label once a direction is chosen.">
              <input required value={form.essence} onChange={(e) => set({ essence: e.target.value })} className={inputClasses} />
            </Field>
            <Field label={`Description · ${form.description.length} characters`} hint="Two or three sentences for the reading panel. Say how the space feels and what tradition holds — no promises about outcomes.">
              <textarea required rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} className={`${inputClasses} resize-none`} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <Field label="Order" hint="Clockwise from North = 1; Centre last.">
                <input type="number" min="0" value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} className={inputClasses} />
              </Field>
              <label className="flex items-center gap-2 text-small text-charcoal pb-6">
                <input type="checkbox" checked={form.shows_artworks} onChange={(e) => set({ shows_artworks: e.target.checked })} />
                Lists artworks (untick for the Centre, which tradition keeps clear)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={close} className="px-4 py-2 text-small text-graphite bg-transparent border-0 cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-ink text-white text-small uppercase tracking-label border-0 cursor-pointer disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs text-graphite mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-ash mt-1">{hint}</p>}
    </div>
  )
}
