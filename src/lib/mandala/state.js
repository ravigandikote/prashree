/**
 * Studio document state + reducer. The state is fully serialisable —
 * the same JSON drives rendering, autosave, templates, and export.
 * (View state like zoom/pan lives outside this reducer.)
 */
import { PAPERS, paperCentre, uniformRadii, sectorsFromStep, clamp } from './geometry'

export const STUDIO_VERSION = 1

export function initialStudioState(paperId = 'a4p') {
  const paper = PAPERS.find((p) => p.id === paperId) || PAPERS[0]
  const centre = paperCentre(paper)
  const count = 8
  const gap = 12
  return {
    version: STUDIO_VERSION,
    name: null,
    paper: { preset: paper.id, w: paper.w, h: paper.h },
    margin: 10,
    centre,
    rings: { mode: 'uniform', count, gap, radii: uniformRadii(count, gap) },
    lines: { step: 30, sectors: sectorsFromStep(30), innerRing: 0, outerRing: count - 1, offset: 0 },
    guides: { circles: true, lines: true, centre: true, margin: true },
    fills: {},
  }
}

/** Keep line ring endpoints valid after ring count changes. */
function clampLineRings(lines, ringCount) {
  const last = Math.max(0, ringCount - 1)
  const innerRing = clamp(lines.innerRing, 0, last)
  const outerRing = clamp(lines.outerRing, 0, last)
  return { ...lines, innerRing: Math.min(innerRing, outerRing), outerRing: Math.max(innerRing, outerRing) }
}

export function studioReducer(state, action) {
  switch (action.type) {
    case 'SET_PAPER': {
      const paper = PAPERS.find((p) => p.id === action.id)
      if (!paper) return state
      return {
        ...state,
        paper: { preset: paper.id, w: paper.w, h: paper.h },
        centre: paperCentre(paper),
      }
    }
    case 'SET_CUSTOM_PAPER': {
      const w = clamp(action.w, 50, 2000)
      const h = clamp(action.h, 50, 2000)
      return { ...state, paper: { preset: 'custom', w, h }, centre: { x: w / 2, y: h / 2 } }
    }
    case 'SET_MARGIN':
      return { ...state, margin: clamp(action.margin, 0, 50) }
    case 'SET_CENTRE':
      return {
        ...state,
        centre: {
          x: clamp(+action.x.toFixed(1), 0, state.paper.w),
          y: clamp(+action.y.toFixed(1), 0, state.paper.h),
        },
      }
    case 'RESET_CENTRE':
      return { ...state, centre: { x: state.paper.w / 2, y: state.paper.h / 2 } }
    case 'SET_RING_COUNT': {
      const count = clamp(Math.round(action.count), 1, 24)
      const radii =
        state.rings.mode === 'uniform'
          ? uniformRadii(count, state.rings.gap)
          : resizeCustomRadii(state.rings.radii, count, state.rings.gap)
      const fills = Object.fromEntries(
        Object.entries(state.fills).filter(([k]) => +k < count)
      )
      return {
        ...state,
        rings: { ...state.rings, count, radii },
        lines: clampLineRings({ ...state.lines, outerRing: count - 1 }, count),
        fills,
      }
    }
    case 'SET_RING_GAP': {
      const gap = clamp(action.gap, 1, 200)
      const radii = state.rings.mode === 'uniform' ? uniformRadii(state.rings.count, gap) : state.rings.radii
      return { ...state, rings: { ...state.rings, gap, radii } }
    }
    case 'SET_SPACING_MODE': {
      const mode = action.mode === 'custom' ? 'custom' : 'uniform'
      const radii = mode === 'uniform' ? uniformRadii(state.rings.count, state.rings.gap) : state.rings.radii
      return { ...state, rings: { ...state.rings, mode, radii } }
    }
    case 'SET_RING_RADIUS': {
      const radii = state.rings.radii.map((r, i) => (i === action.index ? clamp(action.radius, 0.5, 2000) : r))
      return { ...state, rings: { ...state.rings, mode: 'custom', radii } }
    }
    case 'SET_ANGLE_STEP': {
      const step = clamp(action.step, 1, 180)
      return { ...state, lines: { ...state.lines, step, sectors: sectorsFromStep(step) } }
    }
    case 'SET_SECTORS': {
      const sectors = clamp(Math.round(action.sectors), 2, 360)
      return { ...state, lines: { ...state.lines, sectors, step: 360 / sectors } }
    }
    case 'SET_LINE_RING': {
      const lines = { ...state.lines, [action.which === 'inner' ? 'innerRing' : 'outerRing']: action.index }
      return { ...state, lines: clampLineRings(lines, state.rings.count) }
    }
    case 'SET_ROTATION_OFFSET':
      return { ...state, lines: { ...state.lines, offset: clamp(action.offset, -180, 180) } }
    case 'TOGGLE_GUIDE':
      return { ...state, guides: { ...state.guides, [action.guide]: !state.guides[action.guide] } }
    case 'SET_RING_FILL': {
      const prev = state.fills[action.index] || {}
      return {
        ...state,
        fills: {
          ...state.fills,
          [action.index]: { weight: 'medium', ...prev, patternId: action.patternId },
        },
      }
    }
    case 'SET_RING_FILL_B': {
      const prev = state.fills[action.index]
      if (!prev) return state
      return {
        ...state,
        fills: { ...state.fills, [action.index]: { ...prev, patternB: action.patternId || null } },
      }
    }
    case 'SET_RING_WEIGHT': {
      const prev = state.fills[action.index]
      if (!prev) return state
      return {
        ...state,
        fills: { ...state.fills, [action.index]: { ...prev, weight: action.weight } },
      }
    }
    case 'CLEAR_RING_FILL': {
      const fills = { ...state.fills }
      delete fills[action.index]
      return { ...state, fills }
    }
    case 'COPY_RING_STYLE': {
      const src = state.fills[action.from]
      if (!src) return state
      return { ...state, fills: { ...state.fills, [action.to]: { ...src } } }
    }
    case 'SET_NAME':
      return { ...state, name: action.name || null }
    case 'LOAD_STATE':
      return action.state
    default:
      return state
  }
}

/** Grow/shrink a custom radii list, extending by the uniform gap. */
function resizeCustomRadii(radii, count, gap) {
  if (count <= radii.length) return radii.slice(0, count)
  const out = [...radii]
  while (out.length < count) {
    const last = out[out.length - 1] || 0
    out.push(+(last + gap).toFixed(2))
  }
  return out
}


/* ── Undo/redo history (50 steps). Continuous tweaks of the same control
      coalesce so a slider drag is one undo step. ── */

const COALESCE = new Set([
  'SET_CENTRE', 'SET_RING_RADIUS', 'SET_RING_GAP', 'SET_ROTATION_OFFSET',
  'SET_MARGIN', 'SET_ANGLE_STEP', 'SET_SECTORS', 'SET_RING_COUNT', 'SET_CUSTOM_PAPER',
])
const HISTORY_LIMIT = 50

export function initialHistory(state) {
  return { past: [], present: state, future: [], lastType: null }
}

export function historyReducer(h, action) {
  if (action.type === 'UNDO') {
    if (!h.past.length) return h
    return {
      past: h.past.slice(0, -1),
      present: h.past[h.past.length - 1],
      future: [h.present, ...h.future].slice(0, HISTORY_LIMIT),
      lastType: null,
    }
  }
  if (action.type === 'REDO') {
    if (!h.future.length) return h
    return {
      past: [...h.past, h.present].slice(-HISTORY_LIMIT),
      present: h.future[0],
      future: h.future.slice(1),
      lastType: null,
    }
  }
  const present = studioReducer(h.present, action)
  if (present === h.present) return h
  const coalesce = action.type === h.lastType && COALESCE.has(action.type)
  return {
    past: coalesce ? h.past : [...h.past, h.present].slice(-HISTORY_LIMIT),
    present,
    future: [],
    lastType: action.type,
  }
}
