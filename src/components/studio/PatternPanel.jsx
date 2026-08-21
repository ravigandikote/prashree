import { useMemo, useState } from 'react'
import { Search, Eraser, Copy } from 'lucide-react'
import { PATTERNS, FAMILIES, WEIGHTS, patternById } from '../../lib/mandala/patterns'

/** Small swatch: the motif tiled in a token annulus. */
function Swatch({ pattern }) {
  const prims = useMemo(
    () => pattern.ringPaths({ cx: 0, cy: 0, r0: 9, r1: 20, sectors: 8, offset: 0, weight: 0.6 }),
    [pattern]
  )
  return (
    <svg viewBox="-22 -22 44 44" className="w-full h-auto bg-white" aria-hidden="true">
      {prims.map((p, i) =>
        p.type === 'circle' ? (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} />
        ) : (
          <path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth}
            strokeLinecap="round" strokeLinejoin="round" />
        )
      )}
    </svg>
  )
}

/**
 * The pattern library: pick a ring (canvas click or the keyboard list here),
 * pick a motif, and the ring fills across every sector.
 */
export default function PatternPanel({ state, dispatch, selectedRing, onSelectRing }) {
  const [query, setQuery] = useState('')
  const [slot, setSlot] = useState('A')
  const fill = selectedRing != null ? state.fills[selectedRing] : null
  const evenSectors = state.lines.sectors % 2 === 0

  const visible = PATTERNS.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.family.toLowerCase().includes(query.toLowerCase())
  )

  const applyPattern = (patternId) => {
    if (selectedRing == null) return
    if (slot === 'B' && fill) {
      dispatch({ type: 'SET_RING_FILL_B', index: selectedRing, patternId })
    } else {
      dispatch({ type: 'SET_RING_FILL', index: selectedRing, patternId })
    }
  }

  return (
    <div className="space-y-5">
      {/* Ring list — keyboard-operable alternative to canvas clicks */}
      <div>
        <p className="text-[10px] uppercase tracking-label text-graphite mb-2">Rings</p>
        <div className="flex flex-wrap gap-1" role="listbox" aria-label="Select a ring to fill">
          {state.rings.radii.map((r, i) => {
            const filled = !!state.fills[i]
            const selected = selectedRing === i
            return (
              <button
                key={i}
                role="option"
                aria-selected={selected}
                onClick={() => onSelectRing(selected ? null : i)}
                title={`Ring ${i + 1}${filled ? ` — ${patternById(state.fills[i].patternId)?.name}` : ''}`}
                className={`w-9 h-9 text-small border transition-colors cursor-pointer ${
                  selected
                    ? 'bg-ink text-white border-ink'
                    : filled
                      ? 'bg-paper text-ink border-graphite'
                      : 'bg-white text-graphite border-mist hover:border-ink'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <p className="text-small text-ash mt-2" aria-live="polite">
          {selectedRing == null
            ? 'Select a ring, then choose a pattern.'
            : `Ring ${selectedRing + 1}${fill ? ` — ${patternById(fill.patternId)?.name}` : ' — empty'}`}
        </p>
      </div>

      {/* Selected-ring actions */}
      {selectedRing != null && fill && (
        <div className="space-y-3 border border-mist p-3">
          {/* A/B alternation: even sector counts alternate two motifs */}
          <div>
            <p className="text-[10px] uppercase tracking-label text-graphite mb-1.5">
              Sector fill
            </p>
            <div className="flex gap-1" role="radiogroup" aria-label="Pattern slot">
              {['A', 'B'].map((sl) => (
                <button
                  key={sl}
                  role="radio"
                  aria-checked={slot === sl}
                  disabled={sl === 'B' && !evenSectors}
                  onClick={() => setSlot(sl)}
                  title={sl === 'B' && !evenSectors ? 'Alternation needs an even sector count' : undefined}
                  className={`flex-1 px-2 py-1.5 text-small border transition-colors ${
                    sl === 'B' && !evenSectors
                      ? 'border-mist text-ash cursor-not-allowed'
                      : slot === sl
                        ? 'bg-ink text-white border-ink cursor-pointer'
                        : 'bg-white text-graphite border-mist hover:border-ink cursor-pointer'
                  }`}
                >
                  {sl === 'A'
                    ? `A · ${patternById(fill.patternId)?.name || '—'}`
                    : `B · ${fill.patternB ? patternById(fill.patternB)?.name : 'same as A'}`}
                </button>
              ))}
            </div>
            {fill.patternB && (
              <button
                onClick={() => { dispatch({ type: 'SET_RING_FILL_B', index: selectedRing, patternId: null }); setSlot('A') }}
                className="mt-1.5 text-small text-graphite hover:text-ink bg-transparent border-0 cursor-pointer p-0 underline underline-offset-4 decoration-transparent hover:decoration-ink transition-all"
              >
                Remove alternation
              </button>
            )}
          </div>

          <div className="flex gap-1" role="radiogroup" aria-label="Stroke weight">
            {WEIGHTS.map((w) => (
              <button
                key={w.id}
                role="radio"
                aria-checked={fill.weight === w.id}
                onClick={() => dispatch({ type: 'SET_RING_WEIGHT', index: selectedRing, weight: w.id })}
                className={`flex-1 px-2 py-1.5 text-small border transition-colors cursor-pointer ${
                  fill.weight === w.id
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-graphite border-mist hover:border-ink'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'CLEAR_RING_FILL', index: selectedRing })}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 border border-mist bg-white text-small text-graphite hover:text-ink hover:border-ink cursor-pointer transition-colors"
            >
              <Eraser size={13} aria-hidden="true" /> Clear ring
            </button>
            <CopyRingButton state={state} dispatch={dispatch} from={selectedRing} />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ash" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patterns…"
          aria-label="Search patterns"
          className="w-full bg-white border border-mist pl-7 pr-2 py-1.5 text-small text-charcoal focus:outline-none focus:border-ink"
        />
      </div>

      {/* Swatch grid by family */}
      {FAMILIES.map((family) => {
        const members = visible.filter((p) => p.family === family)
        if (!members.length) return null
        return (
          <div key={family}>
            <p className="text-[10px] uppercase tracking-label text-graphite mb-2">{family}</p>
            <div className="grid grid-cols-3 gap-2">
              {members.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPattern(p.id)}
                  disabled={selectedRing == null}
                  aria-label={`Fill ring with ${p.name}`}
                  title={p.name}
                  className={`border p-1 transition-colors ${
                    selectedRing == null
                      ? 'border-mist opacity-50 cursor-not-allowed'
                      : fill?.patternId === p.id
                        ? 'border-ink cursor-pointer'
                        : 'border-mist hover:border-ink cursor-pointer'
                  } bg-white`}
                >
                  <Swatch pattern={p} />
                  <span className="block text-[10px] text-graphite truncate mt-1">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CopyRingButton({ state, dispatch, from }) {
  const [open, setOpen] = useState(false)
  const targets = state.rings.radii.map((_, i) => i).filter((i) => i !== from)
  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 border border-mist bg-white text-small text-graphite hover:text-ink hover:border-ink cursor-pointer transition-colors"
      >
        <Copy size={13} aria-hidden="true" /> Copy to…
      </button>
      {open && (
        <div className="absolute z-10 mt-1 left-0 right-0 bg-white border border-mist max-h-40 overflow-y-auto">
          {targets.map((i) => (
            <button
              key={i}
              onClick={() => { dispatch({ type: 'COPY_RING_STYLE', from, to: i }); setOpen(false) }}
              className="block w-full text-left px-3 py-1.5 text-small text-charcoal hover:bg-paper cursor-pointer bg-transparent border-0"
            >
              Ring {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
