import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  SECTOR_DEG, annularSectorPath, polar, rotationTo, sectorAngle, stepIndex,
} from '../lib/compassGeometry'
import { directionToSlug } from '../data/vastu'

/*
 * The Vastu placement compass: one inline SVG drawn as an instrument.
 * Eight annular sectors + the centre disc (Brahmasthana) are the hit areas.
 * A fixed marker sits at the top; the wheel rotates beneath it (CSS transform
 * transition, shortest way round, none under prefers-reduced-motion) so the
 * chosen sector arrives at the marker. Labels counter-rotate to stay upright.
 * Monochrome by brand rule: ink on paper at rest, the selection is solid ink.
 */
const VB = 400            // viewBox size
const CX = 200
const CY = 208            // leaves headroom for the marker
const R_OUT = 188         // heavy outer rule
const R_TICK_IN = 180     // tick band inner edge (hairline ring)
const R_TICK_LONG = 173   // where the cardinal/ordinal ticks start
const R_LABEL = 138       // label radius — chosen so an upright diagonal label
const R_INNER = 102       //   ("North-West", ~87 units wide at 18) clears both
const R_MID = 78          //   the inner ring and the tick band at 45°
const R_DISC = 50         // centre disc (Brahmasthana)
const R_HIT_OUT = R_OUT   // sector hit area spans disc edge → outer rule

/**
 * @param {{
 *   profiles: Array<{direction: string, label: string, essence: string, sort_order: number}>,
 *   value: string | null,
 *   onChange: (direction: string) => void,
 *   className?: string,
 * }} props
 */
export default function VastuCompass({ profiles, value, onChange, className = '' }) {
  const uid = useId()
  const rim = useMemo(
    () => [...profiles].filter((p) => p.direction !== 'Centre').sort((a, b) => a.sort_order - b.sort_order),
    [profiles]
  )
  const centre = useMemo(() => profiles.find((p) => p.direction === 'Centre') || null, [profiles])
  const stops = useMemo(() => (centre ? [...rim, centre] : rim), [rim, centre])

  const angleOf = (direction) => {
    const i = rim.findIndex((p) => p.direction === direction)
    return i < 0 ? null : sectorAngle(i)
  }

  // Accumulated rotation; the initial value is applied without animation.
  const [rotation, setRotation] = useState(() => {
    const a = value ? angleOf(value) : null
    return a === null ? 0 : -a
  })
  const rotRef = useRef(rotation)
  useEffect(() => {
    const a = value ? angleOf(value) : null
    if (a === null) return // nothing or Centre selected: the wheel stays where it is
    const next = rotationTo(rotRef.current, a)
    rotRef.current = next
    setRotation(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, rim])

  // Composite keyboard control: the group is the single tab stop; arrows move
  // a cursor around the rim (Centre is the ninth stop), Enter/Space selects.
  const [cursor, setCursor] = useState(null)
  const [keyboard, setKeyboard] = useState(false)
  const groupRef = useRef(null)
  const idFor = (direction) => `${uid}-${directionToSlug(direction)}`

  const handleKeyDown = (e) => {
    const n = stops.length
    const current = cursor ?? Math.max(0, stops.findIndex((p) => p.direction === value))
    let next = null
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': next = stepIndex(current, 1, n); break
      case 'ArrowLeft': case 'ArrowUp': next = stepIndex(current, -1, n); break
      case 'Home': next = 0; break
      case 'End': next = n - 1; break
      case 'Enter': case ' ':
        e.preventDefault()
        onChange(stops[current].direction)
        setCursor(current)
        setKeyboard(true)
        return
      default: return
    }
    e.preventDefault()
    setCursor(next)
    setKeyboard(true)
  }

  const activeIndex = cursor ?? stops.findIndex((p) => p.direction === value)
  const activeStop = activeIndex >= 0 ? stops[activeIndex] : null
  const showCursor = keyboard && activeStop
  const rotor = { transform: `rotate(${rotation}deg)`, transformOrigin: `${CX}px ${CY}px` }

  return (
    <div className={`relative w-full mx-auto select-none ${className}`}>
      <svg
        ref={groupRef}
        viewBox={`0 0 ${VB} ${VB}`}
        className="compass-wheel block w-full h-auto"
        role="radiogroup"
        aria-label="Vastu direction"
        aria-activedescendant={activeStop ? idFor(activeStop.direction) : undefined}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={() => setKeyboard(false)}
        onBlur={() => setKeyboard(false)}
        onFocus={(e) => { if (e.target === groupRef.current && !cursor && value) setCursor(stops.findIndex((p) => p.direction === value)) }}
      >
        {/* ── Fixed reading marker (does not rotate) ── */}
        <g aria-hidden="true" className="fill-ink">
          <path d={`M ${CX - 9} 2 L ${CX + 9} 2 L ${CX} 15 Z`} />
        </g>

        {/* ── The wheel ── */}
        <g className="compass-rotor" style={rotor}>
          {/* paper ground */}
          <circle cx={CX} cy={CY} r={R_OUT} className="fill-paper" />

          {/* sector hit areas + selection fills */}
          {rim.map((p, i) => {
            const a = sectorAngle(i)
            const selected = value === p.direction
            const d = annularSectorPath(CX, CY, R_DISC, R_HIT_OUT, a - SECTOR_DEG / 2, a + SECTOR_DEG / 2)
            return (
              <path
                key={p.direction}
                id={idFor(p.direction)}
                d={d}
                role="radio"
                aria-checked={selected}
                aria-label={`${p.label} — ${p.essence}`}
                onClick={() => onChange(p.direction)}
                className={`cursor-pointer ${selected ? 'fill-ink' : 'fill-transparent hover:fill-mist'}`}
              />
            )
          })}

          {/* ── Linework (on top of the fills, under the labels) ── */}
          <g className="stroke-ink pointer-events-none" fill="none">
            <circle cx={CX} cy={CY} r={R_OUT} strokeWidth="2.75" />
            <circle cx={CX} cy={CY} r={R_TICK_IN} strokeWidth="0.5" />
            <circle cx={CX} cy={CY} r={R_INNER} strokeWidth="0.75" />
            <circle cx={CX} cy={CY} r={R_MID} strokeWidth="0.4" />
            {/* sector divisions, running from the disc edge to the outer rule */}
            {rim.map((_, i) => {
              const a = sectorAngle(i) + SECTOR_DEG / 2
              const o = polar(CX, CY, R_OUT, a)
              const n = polar(CX, CY, R_DISC, a)
              return <line key={i} x1={o.x} y1={o.y} x2={n.x} y2={n.y} strokeWidth="0.75" />
            })}
            {/* fine radial ticks every 3° in the outer band, longer on the cardinals & ordinals */}
            {Array.from({ length: 120 }, (_, k) => {
              const a = k * 3
              const onSector = a % SECTOR_DEG === 0
              const inner = polar(CX, CY, onSector ? R_TICK_LONG : R_TICK_IN, a)
              const outer = polar(CX, CY, R_OUT - 1.5, a)
              return (
                <line key={a} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  strokeWidth={onSector ? 1.1 : a % 15 === 0 ? 0.7 : 0.4} />
              )
            })}
          </g>

          {/* ── Labels: counter-rotated so they stay upright at every angle ── */}
          {rim.map((p, i) => {
            const { x, y } = polar(CX, CY, R_LABEL, sectorAngle(i))
            const selected = value === p.direction
            return (
              <g
                key={p.direction}
                className="compass-label pointer-events-none"
                style={{ transform: `translate(${x}px, ${y}px) rotate(${-rotation}deg)`, transformOrigin: '0 0' }}
                aria-hidden="true"
              >
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-display ${selected ? 'fill-paper' : 'fill-ink'}`}
                  style={{ fontSize: 18, fontWeight: selected ? 600 : 500 }}
                >
                  {p.label}
                </text>
              </g>
            )
          })}

          {/* ── Centre disc: Brahmasthana ── */}
          {centre ? (
            <circle
              id={idFor(centre.direction)}
              cx={CX} cy={CY} r={R_DISC}
              role="radio"
              aria-checked={value === centre.direction}
              aria-label={`${centre.label} — ${centre.essence}`}
              onClick={() => onChange(centre.direction)}
              className={`cursor-pointer stroke-ink ${value === centre.direction ? 'fill-ink' : 'fill-paper hover:fill-mist'}`}
              strokeWidth="1.25"
            />
          ) : (
            <circle cx={CX} cy={CY} r={R_DISC} className="fill-paper stroke-ink" strokeWidth="1.25" />
          )}
          <circle cx={CX} cy={CY} r="2" className={`pointer-events-none ${value === 'Centre' ? 'fill-paper' : 'fill-ink'}`} aria-hidden="true" />
          {centre && (
            <g
              className="compass-label pointer-events-none"
              style={{ transform: `translate(${CX}px, ${CY}px) rotate(${-rotation}deg)`, transformOrigin: '0 0' }}
              aria-hidden="true"
            >
              <text
                textAnchor="middle" dominantBaseline="central"
                className={`font-display ${value === 'Centre' ? 'fill-paper' : 'fill-ink'}`}
                style={{ fontSize: 17, fontWeight: 500 }}
                y={12}
              >
                {centre.label}
              </text>
            </g>
          )}

          {/* ── Keyboard cursor: 2px ring on the active stop, ink with a paper core so it reads on both fills ── */}
          {showCursor && activeStop.direction !== 'Centre' && (() => {
            const i = rim.findIndex((p) => p.direction === activeStop.direction)
            const a = sectorAngle(i)
            const d = annularSectorPath(CX, CY, R_DISC + 2, R_HIT_OUT - 2, a - SECTOR_DEG / 2 + 1, a + SECTOR_DEG / 2 - 1)
            return (
              <g className="pointer-events-none" fill="none" aria-hidden="true">
                <path d={d} className="stroke-paper" strokeWidth="4" />
                <path d={d} className="stroke-ink" strokeWidth="2" />
              </g>
            )
          })()}
          {showCursor && activeStop.direction === 'Centre' && (
            <g className="pointer-events-none" fill="none" aria-hidden="true">
              <circle cx={CX} cy={CY} r={R_DISC - 4} className="stroke-paper" strokeWidth="4" />
              <circle cx={CX} cy={CY} r={R_DISC - 4} className="stroke-ink" strokeWidth="2" />
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
