import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import {
  getAllMandalaTemplates, createMandalaTemplate,
  updateMandalaTemplate, deleteMandalaTemplate,
} from '../../lib/supabase'
import { normaliseConfig } from '../../lib/mandala/templates'
import { inputClasses } from './adminUi'
import toast from 'react-hot-toast'

/**
 * Curate Mandala Studio starter templates. Paste the JSON exported from the
 * studio's Templates panel; starters appear for every visitor.
 */
export default function AdminTemplates() {
  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', json: '' })
  const [saving, setSaving] = useState(false)

  const load = () =>
    getAllMandalaTemplates().then((data) => setTemplates(data || [])).catch(() => {})
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    let parsed
    try {
      parsed = JSON.parse(form.json)
    } catch {
      toast.error('That JSON does not parse')
      return
    }
    const config = normaliseConfig(parsed.config || parsed)
    if (!config) {
      toast.error('Not a valid studio template — export one from the studio first')
      return
    }
    setSaving(true)
    try {
      await createMandalaTemplate({
        name: form.name || config.name || 'Untitled base',
        config_json: config,
        is_starter: true,
      })
      toast.success('Starter template added')
      setForm({ name: '', json: '' })
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const toggleStarter = async (t) => {
    try {
      await updateMandalaTemplate(t.id, { is_starter: !t.is_starter })
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return
    try {
      await deleteMandalaTemplate(t.id)
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-h2 text-ink">Studio templates</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-small hover:bg-charcoal transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> Add starter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-start justify-center pt-12 overflow-y-auto">
          <div className="bg-white w-full max-w-xl mx-4 border border-mist mb-12">
            <div className="flex items-center justify-between p-4 border-b border-mist">
              <h2 className="font-display text-h3 text-ink">New starter template</h2>
              <button onClick={() => setShowForm(false)} className="text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-graphite mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClasses} placeholder="e.g. 16-sector A3, 12 rings" />
              </div>
              <div>
                <label className="block text-xs text-graphite mb-1">
                  Template JSON (use Export in the studio&apos;s Base templates panel)
                </label>
                <textarea
                  rows={10}
                  required
                  value={form.json}
                  onChange={(e) => setForm({ ...form, json: e.target.value })}
                  className={`${inputClasses} font-mono resize-y`}
                  placeholder='{"app":"prashree-mandala-studio", ...}'
                />
              </div>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-ink text-white text-small hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer border-0">
                {saving ? 'Saving…' : 'Add starter'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-mist divide-y divide-mist">
        {templates.length > 0 ? (
          templates.map((t) => (
            <div key={t.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{t.name}</p>
                <p className="text-small text-ash">
                  {t.config_json?.paper?.w}×{t.config_json?.paper?.h} mm ·{' '}
                  {t.config_json?.rings?.radii?.length} rings ·{' '}
                  {Math.round(t.config_json?.lines?.sectors || 0)} sectors
                </p>
              </div>
              <button
                onClick={() => toggleStarter(t)}
                className={`px-2 py-0.5 text-xs uppercase tracking-wider border cursor-pointer ${
                  t.is_starter ? 'bg-ink text-white border-ink' : 'text-ash border-mist bg-white'
                }`}
              >
                {t.is_starter ? 'Starter' : 'Hidden'}
              </button>
              <button
                onClick={() => handleDelete(t)}
                className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0"
                aria-label={`Delete ${t.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-graphite text-small">
            No templates yet. Build a base in the studio, Export its JSON, and add it here as a starter.
          </div>
        )}
      </div>
    </div>
  )
}
