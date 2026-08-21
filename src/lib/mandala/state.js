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
      return {
        ...state,
        rings: { ...state.rings, count, radii },
        lines: clampLineRings({ ...state.lines, outerRing: count - 1 }, count),
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
