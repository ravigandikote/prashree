/**
 * Template + autosave persistence (localStorage, no login needed).
 * Templates are structured JSON — never flattened SVG — so they stay
 * fully editable. JSON file import/export moves them between devices.
 */
import { STUDIO_VERSION } from './state'

const TEMPLATES_KEY = 'prashree_studio_templates'
const AUTOSAVE_KEY = 'prashree_studio_autosave'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/* ── Named templates ── */

export function listTemplates() {
  const list = readJson(TEMPLATES_KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveTemplate(name, state) {
  const templates = listTemplates().filter((t) => t.name !== name)
  const entry = {
    id: `t-${Date.now().toString(36)}`,
    name,
    savedAt: new Date().toISOString(),
    config: { ...state, name },
  }
  templates.unshift(entry)
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates.slice(0, 50)))
  return entry
}

export function deleteTemplate(id) {
  localStorage.setItem(
    TEMPLATES_KEY,
    JSON.stringify(listTemplates().filter((t) => t.id !== id))
  )
}

/** Validate an imported/loaded config into a usable studio state. */
export function normaliseConfig(config) {
  if (!config || typeof config !== 'object') return null
  const { paper, centre, rings, lines } = config
  if (!paper || !centre || !rings?.radii || !lines) return null
  return {
    version: STUDIO_VERSION,
    name: config.name || null,
    paper: { preset: paper.preset || 'custom', w: +paper.w, h: +paper.h },
    margin: +config.margin || 0,
    centre: { x: +centre.x, y: +centre.y },
    rings: {
      mode: rings.mode === 'custom' ? 'custom' : 'uniform',
      count: rings.radii.length,
      gap: +rings.gap || 10,
      radii: rings.radii.map(Number),
    },
    lines: {
      step: +lines.step || 30,
      sectors: +lines.sectors || 12,
      innerRing: Math.min(+lines.innerRing || 0, rings.radii.length - 1),
      outerRing: Math.min(
        Number.isFinite(+lines.outerRing) ? +lines.outerRing : rings.radii.length - 1,
        rings.radii.length - 1
      ),
      offset: +lines.offset || 0,
    },
    guides: {
      circles: config.guides?.circles !== false,
      lines: config.guides?.lines !== false,
      centre: config.guides?.centre !== false,
      margin: config.guides?.margin !== false,
    },
    fills: config.fills && typeof config.fills === 'object' ? config.fills : {},
  }
}

/* ── JSON file import/export ── */

export function exportTemplateFile(state) {
  const blob = new Blob(
    [JSON.stringify({ app: 'prashree-mandala-studio', version: STUDIO_VERSION, config: state }, null, 2)],
    { type: 'application/json' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prashree-mandala-template-${(state.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function parseTemplateFile(text) {
  try {
    const data = JSON.parse(text)
    return normaliseConfig(data.config || data)
  } catch {
    return null
  }
}

/* ── Autosave ── */

export function autosave(state) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ at: Date.now(), config: state }))
  } catch { /* storage full/unavailable — autosave is best-effort */ }
}

export function readAutosave() {
  const saved = readJson(AUTOSAVE_KEY, null)
  if (!saved?.config) return null
  const config = normaliseConfig(saved.config)
  return config ? { at: saved.at, config } : null
}

export function clearAutosave() {
  localStorage.removeItem(AUTOSAVE_KEY)
}
