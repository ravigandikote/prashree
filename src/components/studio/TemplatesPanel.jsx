import { useEffect, useRef, useState } from 'react'
import { Save, Upload, Download, Trash2, FolderOpen } from 'lucide-react'
import {
  listTemplates, saveTemplate, deleteTemplate,
  exportTemplateFile, parseTemplateFile, normaliseConfig,
} from '../../lib/mandala/templates'
import { getStarterTemplates } from '../../lib/supabase'

const inputCls =
  'w-full bg-white border border-mist px-2 py-1.5 text-small text-charcoal focus:outline-none focus:border-ink'

/** Save/load reusable base templates — structured JSON, never flattened SVG. */
export default function TemplatesPanel({ state, dispatch }) {
  const [templates, setTemplates] = useState(listTemplates)
  const [starters, setStarters] = useState([])
  const [tab, setTab] = useState('mine')
  const [name, setName] = useState(state.name || '')
  const [note, setNote] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    getStarterTemplates()
      .then((rows) => setStarters(rows || []))
      .catch(() => setStarters([]))
  }, [])

  const refresh = () => setTemplates(listTemplates())

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) { setNote('Give the template a name first.'); return }
    saveTemplate(trimmed, state)
    dispatch({ type: 'SET_NAME', name: trimmed })
    refresh()
    setNote(`Saved “${trimmed}”.`)
  }

  const handleLoad = (t) => {
    dispatch({ type: 'LOAD_STATE', state: t.config })
    setName(t.name)
    setNote(`Loaded “${t.name}”.`)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const config = parseTemplateFile(await file.text())
    if (config) {
      dispatch({ type: 'LOAD_STATE', state: config })
      setName(config.name || '')
      setNote('Template imported.')
    } else {
      setNote("That file doesn't look like a studio template.")
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] uppercase tracking-label text-graphite mb-1" htmlFor="tpl-name">
          Template name
        </label>
        <input
          id="tpl-name"
          className={inputCls}
          placeholder="e.g. 12-sector A4, 8 rings"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-ink text-white text-small border-0 cursor-pointer hover:bg-charcoal transition-colors"
          >
            <Save size={13} aria-hidden="true" /> Save base
          </button>
          <button
            onClick={() => exportTemplateFile({ ...state, name: name.trim() || state.name })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-mist bg-white text-small text-graphite hover:text-ink hover:border-ink cursor-pointer transition-colors"
            title="Export as a JSON file"
          >
            <Download size={13} aria-hidden="true" /> Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-mist bg-white text-small text-graphite hover:text-ink hover:border-ink cursor-pointer transition-colors"
            title="Import a JSON template file"
          >
            <Upload size={13} aria-hidden="true" /> Import
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
        </div>
        {note && <p className="text-small text-ash mt-2" aria-live="polite">{note}</p>}
      </div>

      <div>
        <div className="flex gap-1 mb-2" role="tablist" aria-label="Template source">
          {[['mine', 'Saved on this device'], ['starters', 'PraShree starters']].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-label border transition-colors cursor-pointer ${
                tab === id ? 'bg-ink text-white border-ink' : 'bg-white text-graphite border-mist hover:border-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'starters' ? (
          starters.length === 0 ? (
            <p className="text-small text-ash">No starter templates available right now.</p>
          ) : (
            <ul className="space-y-1.5 list-none p-0 max-h-56 overflow-y-auto">
              {starters.map((t) => (
                <li key={t.id} className="flex items-center gap-2 border border-mist px-2.5 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-small text-ink truncate">{t.name}</p>
                    <p className="text-[11px] text-ash">
                      {t.config_json?.paper?.w}×{t.config_json?.paper?.h} mm ·{' '}
                      {t.config_json?.rings?.radii?.length} rings
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const config = normaliseConfig(t.config_json)
                      if (config) {
                        dispatch({ type: 'LOAD_STATE', state: config })
                        setName(config.name || t.name)
                        setNote(`Loaded starter “${t.name}”.`)
                      }
                    }}
                    className="p-1.5 text-graphite hover:text-ink bg-transparent border-0 cursor-pointer"
                    aria-label={`Load starter ${t.name}`}
                    title="Load"
                  >
                    <FolderOpen size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : templates.length === 0 ? (
          <p className="text-small text-ash">No saved templates yet.</p>
        ) : (
          <ul className="space-y-1.5 list-none p-0 max-h-56 overflow-y-auto">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center gap-2 border border-mist px-2.5 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-small text-ink truncate">{t.name}</p>
                  <p className="text-[11px] text-ash">
                    {t.config.paper.w}×{t.config.paper.h} mm · {t.config.rings.radii.length} rings ·{' '}
                    {Math.round(t.config.lines.sectors)} sectors
                  </p>
                </div>
                <button
                  onClick={() => handleLoad(t)}
                  className="p-1.5 text-graphite hover:text-ink bg-transparent border-0 cursor-pointer"
                  aria-label={`Load ${t.name}`}
                  title="Load"
                >
                  <FolderOpen size={14} />
                </button>
                <button
                  onClick={() => { deleteTemplate(t.id); refresh() }}
                  className="p-1.5 text-graphite hover:text-ink bg-transparent border-0 cursor-pointer"
                  aria-label={`Delete ${t.name}`}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
