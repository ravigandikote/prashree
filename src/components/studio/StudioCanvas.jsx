import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pointAt, sectorAngles, ringsOutOfBounds, clamp } from '../../lib/mandala/geometry'
import { ringFillPrimitives } from '../../lib/mandala/patterns'

/** One filled ring, memoised so untouched rings never re-render. */
const RingFill = memo(
  function RingFill({ state, index }) {
    const prims = useMemo(() => ringFillPrimitives(state, index), [state, index])
    return prims.map((p, i) =>
      p.type === 'circle' ? (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} />
      ) : (
        <path
          key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth}
          strokeLinecap="round" strokeLinejoin="round"
        />
      )
    )
  },
  (prev, next) =>
    prev.index === next.index &&
    prev.state.fills[prev.index] === next.state.fills[next.index] &&
    prev.state.rings.radii === next.state.rings.radii &&
    prev.state.centre === next.state.centre &&
    prev.state.lines === next.state.lines
)

const PX_PER_MM = 3.2 // on-screen scale at 100 %

/**
 * The drafting stage: an SVG whose viewBox is in millimetres, so what you
 * see is the true geometry of the chosen paper. Zoom 25–400 %, pan by
 * dragging the paper (or space-drag), centre point draggable.
 */
export default function StudioCanvas({ state, dispatch, zoom, setZoom, selectedRing, onSelectRing }) {
  const { paper, margin, centre, rings, lines, guides } = state
  const svgRef = useRef(null)
  const wrapRef = useRef(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const outOfBounds = ringsOutOfBounds(rings.radii, paper, centre, margin)

  /* screen px → mm on the paper */
  const toMM = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = new DOMPoint(clientX, clientY)
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }, [])

  /* centre-point dragging */
  const onCentreDown = (e) => {
    e.stopPropagation()
    e.target.setPointerCapture?.(e.pointerId)
    dragRef.current = { kind: 'centre' }
  }

  /* paper panning */
  const onStageDown = (e) => {
    dragRef.current = { kind: 'pan', startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }

  const onMove = (e) => {
    const drag = dragRef.current
    if (!drag) return
    if (drag.kind === 'centre') {
      const mm = toMM(e.clientX, e.clientY)
      if (mm) dispatch({ type: 'SET_CENTRE', x: mm.x, y: mm.y })
    } else if (drag.kind === 'pan') {
      setPan({ x: drag.panX + (e.clientX - drag.startX), y: drag.panY + (e.clientY - drag.startY) })
    }
  }

  const onUp = () => { dragRef.current = null }

  /* wheel zoom (ctrl/cmd or pinch-trackpad) */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom((z) => clamp(+(z * (e.deltaY < 0 ? 1.1 : 0.9)).toFixed(2), 0.25, 4))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [setZoom])

  const angles = sectorAngles(lines.sectors, lines.offset)
  const rInner = rings.radii[lines.innerRing] ?? 0
  const rOuter = rings.radii[lines.outerRing] ?? 0

  const widthPx = paper.w * PX_PER_MM * zoom
  const heightPx = paper.h * PX_PER_MM * zoom

  return (
    <div
      ref={wrapRef}
      className="relative flex-1 min-h-0 overflow-hidden bg-mist/60 touch-none select-none"
      onPointerDown={onStageDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      role="img"
      aria-label={`Mandala construction on ${paper.w} by ${paper.h} millimetre paper: ${rings.count} circles, ${lines.sectors} sectors`}
    >
      <div
        className="absolute"
        style={{
          left: `calc(50% + ${pan.x}px)`,
          top: `calc(50% + ${pan.y}px)`,
          transform: 'translate(-50%, -50%)',
          width: widthPx,
          height: heightPx,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${paper.w} ${paper.h}`}
          width={widthPx}
          height={heightPx}
          className="bg-white shadow-[0_2px_24px_rgba(10,10,10,0.18)]"
        >
          {/* margin guide */}
          {guides.margin && margin > 0 && (
            <rect
              x={margin} y={margin}
              width={paper.w - 2 * margin} height={paper.h - 2 * margin}
              fill="none" stroke="#d9d9d9" strokeWidth="0.15" strokeDasharray="2 2"
            />
          )}

          {/* concentric guide circles */}
          {guides.circles &&
            rings.radii.map((r, i) => (
              <circle
                key={i}
                cx={centre.x} cy={centre.y} r={r}
                fill="none"
                stroke={outOfBounds.includes(i) ? '#b3b3b3' : '#c9c9c9'}
                strokeWidth="0.2"
                strokeDasharray={outOfBounds.includes(i) ? '1.5 1.5' : undefined}
              />
            ))}

          {/* radial guide lines */}
          {guides.lines && rOuter > 0 &&
            angles.map((a) => {
              const p1 = pointAt(centre, rInner, a)
              const p2 = pointAt(centre, rOuter, a)
              return (
                <line
                  key={a}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="#c9c9c9" strokeWidth="0.2"
                />
              )
            })}

          {/* pattern fills (under the centre marker, over the guides) */}
          {Object.keys(state.fills || {}).map((k) => (
            <RingFill key={k} state={state} index={+k} />
          ))}

          {/* ring hit areas + selection highlight */}
          {onSelectRing &&
            state.rings.radii.map((r, i) => {
              const r0 = i === 0 ? 0 : state.rings.radii[i - 1]
              const mid = (r0 + r) / 2
              const thickness = Math.max(r - r0, 1)
              return (
                <circle
                  key={`hit-${i}`}
                  cx={centre.x} cy={centre.y} r={mid}
                  fill="none"
                  stroke={selectedRing === i ? 'rgba(10,10,10,0.07)' : 'transparent'}
                  strokeWidth={thickness}
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectRing(selectedRing === i ? null : i)
                  }}
                />
              )
            })}

          {/* centre point + crosshair */}
          {guides.centre && (
            <g
              onPointerDown={onCentreDown}
              className="cursor-move"
              aria-label="Centre point — drag to move"
            >
              <line x1={centre.x - 4} y1={centre.y} x2={centre.x + 4} y2={centre.y} stroke="#9a9a9a" strokeWidth="0.15" />
              <line x1={centre.x} y1={centre.y - 4} x2={centre.x} y2={centre.y + 4} stroke="#9a9a9a" strokeWidth="0.15" />
              <circle cx={centre.x} cy={centre.y} r="1" fill="#0a0a0a" />
              {/* generous invisible hit area */}
              <circle cx={centre.x} cy={centre.y} r="6" fill="transparent" />
            </g>
          )}
        </svg>
      </div>

      {/* zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white border border-mist text-small">
        <button
          onClick={() => setZoom((z) => clamp(+(z - 0.25).toFixed(2), 0.25, 4))}
          className="px-3 py-1.5 cursor-pointer bg-transparent border-0 text-ink hover:bg-paper"
          aria-label="Zoom out"
        >−</button>
        <span className="px-1 text-graphite tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => clamp(+(z + 0.25).toFixed(2), 0.25, 4))}
          className="px-3 py-1.5 cursor-pointer bg-transparent border-0 text-ink hover:bg-paper"
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
          className="px-3 py-1.5 cursor-pointer bg-transparent border-l border-mist text-graphite hover:text-ink"
        >Fit</button>
      </div>

      {/* out-of-bounds warning */}
      {outOfBounds.length > 0 && (
        <p className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border border-mist px-3 py-1.5 text-small text-graphite">
          {outOfBounds.length} circle{outOfBounds.length > 1 ? 's extend' : ' extends'} beyond the printable area
        </p>
      )}
    </div>
  )
}
