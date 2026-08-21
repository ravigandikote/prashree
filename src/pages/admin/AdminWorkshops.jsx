import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import {
  getAllWorkshops, createWorkshop, updateWorkshop, deleteWorkshop, uploadImage,
} from '../../lib/supabase'
import { inputClasses } from './adminUi'
import toast from 'react-hot-toast'

const EMPTY = { title: '', description: '', schedule: '', venue: 'Eco Cottage, Kalyan Nagar, Bengaluru', display_order: '0', is_active: true }

/** Announce and manage upcoming workshops (shown on /workshops). */
export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [flyerFile, setFlyerFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => getAllWorkshops().then((data) => setWorkshops(data || [])).catch(() => {})
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm(EMPTY)
    setFlyerFile(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (w) => {
    setEditing(w)
    setForm({
      title: w.title,
      description: w.description || '',
      schedule: w.schedule,
      venue: w.venue || '',
      display_order: String(w.display_order ?? 0),
      is_active: w.is_active,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let flyer_url = editing?.flyer_url || null
      if (flyerFile) {
        const path = `workshops/${Date.now()}-${flyerFile.name}`
        flyer_url = await uploadImage('artworks', path, flyerFile)
      }
      const data = {
        title: form.title,
        description: form.description || null,
        schedule: form.schedule,
        venue: form.venue || null,
        display_order: parseInt(form.display_order) || 0,
        is_active: form.is_active,
        flyer_url,
      }
      if (editing) {
        await updateWorkshop(editing.id, data)
        toast.success('Workshop updated')
      } else {
        await createWorkshop(data)
        toast.success('Workshop announced')
      }
      resetForm()
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (w) => {
    if (!window.confirm(`Delete "${w.title}"?`)) return
    try {
      await deleteWorkshop(w.id)
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-h2 text-ink">Upcoming workshops</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-small hover:bg-charcoal transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> Announce workshop
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-start justify-center pt-12 overflow-y-auto">
          <div className="bg-white w-full max-w-xl mx-4 border border-mist mb-12">
            <div className="flex items-center justify-between p-4 border-b border-mist">
              <h2 className="font-display text-h3 text-ink">
                {editing ? 'Edit workshop' : 'Announce a workshop'}
              </h2>
              <button onClick={resetForm} className="text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-graphite mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClasses} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-graphite mb-1">
                    Schedule * (e.g. &ldquo;Every Sunday · 3 – 5 pm&rdquo; or &ldquo;Sat 14 Sep · 10 am&rdquo;)
                  </label>
                  <input required value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs text-graphite mb-1">Venue</label>
                  <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inputClasses} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-graphite mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClasses} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs text-graphite mb-1">
                    Flyer image {editing?.flyer_url && '(replaces the current one)'}
                  </label>
                  <input type="file" accept="image/*" onChange={(e) => setFlyerFile(e.target.files[0])} className="text-small" />
                </div>
                <div>
                  <label className="block text-xs text-graphite mb-1">Display order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={inputClasses} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-small cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Visible on the website
              </label>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-ink text-white text-small hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer border-0">
                {saving ? 'Saving…' : editing ? 'Update' : 'Announce'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-mist divide-y divide-mist">
        {workshops.length > 0 ? (
          workshops.map((w) => (
            <div key={w.id} className="p-4 flex items-center gap-4">
              {w.flyer_url ? (
                <img src={w.flyer_url} alt="" className="w-14 h-18 object-cover border border-mist shrink-0" />
              ) : (
                <div className="w-14 h-18 bg-paper border border-mist shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{w.title}</p>
                <p className="text-small text-graphite">{w.schedule}{w.venue ? ` · ${w.venue}` : ''}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs uppercase tracking-wider border ${w.is_active ? 'bg-ink text-white border-ink' : 'text-ash border-mist'}`}>
                {w.is_active ? 'Live' : 'Hidden'}
              </span>
              <button onClick={() => openEdit(w)} className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label={`Edit ${w.title}`}>
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(w)} className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label={`Delete ${w.title}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-graphite text-small">
            No workshops yet. Click &ldquo;Announce workshop&rdquo; to add the first one.
          </div>
        )}
      </div>
    </div>
  )
}
