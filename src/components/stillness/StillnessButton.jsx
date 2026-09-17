import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import StillnessOverlay from './StillnessOverlay'

/*
 * The persistent entry point, bottom-right on every public page except the
 * Studio (a working tool with its own bottom bar). It lifts above the cookie
 * bar while that is visible (the bar publishes its height as
 * --floating-bottom) and drops to the corner once it is dismissed. Modals sit
 * above it (z-50 backdrop vs z-40). On narrow viewports the full label shows
 * on first load and collapses to a ring glyph after a few seconds; the
 * accessible name never changes.
 */
const COLLAPSE_AFTER_MS = 4000

export default function StillnessButton() {
  const { pathname } = useLocation()
  // remember which route the session was opened on: leaving that route closes it, no effect needed
  const [openedOn, setOpenedOn] = useState(null)
  const open = openedOn !== null && openedOn === pathname
  const [collapsed, setCollapsed] = useState(false)
  const btnRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setCollapsed(true), COLLAPSE_AFTER_MS)
    return () => clearTimeout(t)
  }, [])

  // not over the drawing tool (its own bottom bar) or the sound session (two audio experiences would collide)
  if (pathname.startsWith('/studio/') || pathname.startsWith('/admin')) return null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpenedOn(pathname)}
        aria-label="Two minutes of stillness"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-4 sm:right-6 z-40 inline-flex items-center gap-3 min-h-11 min-w-11 pl-2.5 pr-2.5 sm:pr-4 bg-ink text-paper border border-paper/20 shadow-[0_6px_24px_rgba(10,10,10,0.25)] cursor-pointer transition-colors hover:bg-charcoal"
        style={{ bottom: 'calc(var(--floating-bottom, 0px) + 1rem)' }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
          <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <circle cx="12" cy="12" r="0.9" fill="currentColor" opacity="0.8" />
        </svg>
        <span className={`text-[15px] whitespace-nowrap ${collapsed ? 'hidden sm:inline' : 'inline'}`}>
          Two minutes of stillness
        </span>
      </button>
      <StillnessOverlay open={open} onClose={() => setOpenedOn(null)} returnFocusTo={btnRef} />
    </>
  )
}
