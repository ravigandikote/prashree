import { PAPERS, ANGLE_PRESETS, maxUsableRadius } from '../../lib/mandala/geometry'

const inputCls =
  'w-full bg-white border border-mist px-2 py-1.5 text-small text-charcoal focus:outline-none focus:border-ink'
const labelCls = 'block text-[10px] uppercase tracking-label text-graphite mb-1'
const rowCls = 'space-y-4'

export function PaperPanel({ state, dispatch }) {
  const isCustom = state.paper.preset === 'custom'
  return (
    <div className={rowCls}>
      <div>
        <label className={labelCls} htmlFor="st-paper">Paper size</label>
        <select
          id="st-paper"
          className={inputCls}
          value={state.paper.preset}
          onChange={(e) =>
            e.target.value === 'custom'
              ? dispatch({ type: 'SET_CUSTOM_PAPER', w: state.paper.w, h: state.paper.h })
              : dispatch({ type: 'SET_PAPER', id: e.target.value })
          }
        >
          {PAPERS.map((p) => (
            <option key={p.id} value={p.id}>{p.label} — {p.w} × {p.h} mm</option>
          ))}
          <option value="custom">Custom…</option>
        </select>
      </div>
      {isCustom && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="st-w">Width (cm)</label>
            <input
              id="st-w" type="number" min="5" max="200" step="0.5" className={inputCls}
              value={state.paper.w / 10}
              onChange={(e) => dispatch({ type: 'SET_CUSTOM_PAPER', w: +e.target.value * 10, h: state.paper.h })}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="st-h">Height (cm)</label>
            <input
              id="st-h" type="number" min="5" max="200" step="0.5" className={inputCls}
              value={state.paper.h / 10}
              onChange={(e) => dispatch({ type: 'SET_CUSTOM_PAPER', w: state.paper.w, h: +e.target.value * 10 })}
            />
          </div>
        </div>
      )}
      <div>
        <label className={labelCls} htmlFor="st-margin">Margin guide (mm)</label>
        <input
          id="st-margin" type="number" min="0" max="50" className={inputCls}
          value={state.margin}
          onChange={(e) => dispatch({ type: 'SET_MARGIN', margin: +e.target.value })}
        />
      </div>
    </div>
  )
}

export function CentrePanel({ state, dispatch }) {
  return (
    <div className={rowCls}>
      <p className="text-small text-graphite">
        Drag the centre point on the paper, or set it exactly. Working
        off-centre is a real technique — the reset returns to true centre.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="st-cx">X (mm)</label>
          <input
            id="st-cx" type="number" step="0.5" className={inputCls}
            value={state.centre.x}
            onChange={(e) => dispatch({ type: 'SET_CENTRE', x: +e.target.value, y: state.centre.y })}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="st-cy">Y (mm)</label>
          <input
            id="st-cy" type="number" step="0.5" className={inputCls}
            value={state.centre.y}
            onChange={(e) => dispatch({ type: 'SET_CENTRE', x: state.centre.x, y: +e.target.value })}
          />
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: 'RESET_CENTRE' })}
        className="border border-mist bg-white px-3 py-1.5 text-small text-graphite hover:text-ink hover:border-ink transition-colors cursor-pointer"
      >
        Reset to centre
      </button>
    </div>
  )
}

export function CirclesPanel({ state, dispatch }) {
  const { rings, paper, centre, margin } = state
  const maxR = maxUsableRadius(paper, centre, margin).toFixed(0)
  return (
    <div className={rowCls}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="st-count">Circles (1–24)</label>
          <input
            id="st-count" type="number" min="1" max="24" className={inputCls}
            value={rings.count}
            onChange={(e) => dispatch({ type: 'SET_RING_COUNT', count: +e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="st-gap">Spacing (mm)</label>
          <input
            id="st-gap" type="number" min="1" max="200" className={inputCls}
            value={rings.gap}
            disabled={rings.mode === 'custom'}
            onChange={(e) => dispatch({ type: 'SET_RING_GAP', gap: +e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-1" role="radiogroup" aria-label="Spacing mode">
        {['uniform', 'custom'].map((mode) => (
          <button
            key={mode}
            role="radio"
            aria-checked={rings.mode === mode}
            onClick={() => dispatch({ type: 'SET_SPACING_MODE', mode })}
            className={`px-3 py-1.5 text-small capitalize border transition-colors cursor-pointer ${
              rings.mode === mode
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-graphite border-mist hover:border-ink'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {rings.mode === 'custom' && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {rings.radii.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-small text-ash w-14 shrink-0">Ring {i + 1}</span>
              <input
                type="number" min="1" max="2000" step="0.5"
                aria-label={`Ring ${i + 1} radius in millimetres`}
                className={inputCls}
                value={r}
                onChange={(e) => dispatch({ type: 'SET_RING_RADIUS', index: i, radius: +e.target.value })}
              />
              <span className="text-small text-ash">mm</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-small text-ash">Printable radius from this centre: ~{maxR} mm.</p>
    </div>
  )
}

export function LinesPanel({ state, dispatch }) {
  const { lines, rings } = state
  return (
    <div className={rowCls}>
      <div>
        <span className={labelCls}>Angle step</span>
        <div className="flex flex-wrap gap-1">
          {ANGLE_PRESETS.map((a) => (
            <button
              key={a}
              onClick={() => dispatch({ type: 'SET_ANGLE_STEP', step: a })}
              aria-pressed={lines.step === a}
              className={`px-2.5 py-1.5 text-small border transition-colors cursor-pointer ${
                lines.step === a
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-graphite border-mist hover:border-ink'
              }`}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="st-step">Custom angle (°)</label>
          <input
            id="st-step" type="number" min="1" max="180" step="0.5" className={inputCls}
            value={lines.step}
            onChange={(e) => dispatch({ type: 'SET_ANGLE_STEP', step: +e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="st-sectors">Sectors</label>
          <input
            id="st-sectors" type="number" min="2" max="360" className={inputCls}
            value={Math.round(lines.sectors)}
            onChange={(e) => dispatch({ type: 'SET_SECTORS', sectors: +e.target.value })}
          />
        </div>
      </div>
      <p className="text-small text-ash" aria-live="polite">
        {lines.step}° → {lines.sectors} sectors
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="st-inner">Lines from ring</label>
          <select
            id="st-inner" className={inputCls}
            value={lines.innerRing}
            onChange={(e) => dispatch({ type: 'SET_LINE_RING', which: 'inner', index: +e.target.value })}
          >
            {rings.radii.map((r, i) => (
              <option key={i} value={i}>Ring {i + 1} ({r} mm)</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="st-outer">to ring</label>
          <select
            id="st-outer" className={inputCls}
            value={lines.outerRing}
            onChange={(e) => dispatch({ type: 'SET_LINE_RING', which: 'outer', index: +e.target.value })}
          >
            {rings.radii.map((r, i) => (
              <option key={i} value={i}>Ring {i + 1} ({r} mm)</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="st-offset">Rotation offset (°)</label>
        <input
          id="st-offset" type="number" min="-180" max="180" step="0.5" className={inputCls}
          value={lines.offset}
          onChange={(e) => dispatch({ type: 'SET_ROTATION_OFFSET', offset: +e.target.value })}
        />
        <p className="text-small text-ash mt-1">Start on-axis (0°) or between axes (half a step).</p>
      </div>
    </div>
  )
}

export function GuidesToggles({ state, dispatch }) {
  const items = [
    ['circles', 'Circles'], ['lines', 'Radial lines'], ['centre', 'Centre'], ['margin', 'Margin'],
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map(([key, label]) => (
        <label key={key} className="flex items-center gap-1.5 text-small text-graphite cursor-pointer">
          <input
            type="checkbox"
            checked={state.guides[key]}
            onChange={() => dispatch({ type: 'TOGGLE_GUIDE', guide: key })}
          />
          {label}
        </label>
      ))}
    </div>
  )
}
