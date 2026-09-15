import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO'
import VastuCompass from '../components/VastuCompass'
import PlacementReading from '../components/PlacementReading'
import { LoadingSpinner } from '../components/UI'
import { loadPlacement } from '../lib/loadPlacement'
import { fallbackDirectionProfiles, directionToSlug, slugToDirection } from '../data/vastu'

const NAV_PX = 80      // Navbar is h-20
const BAND_PX = 168    // wheel band that stays pinned on narrow screens: marker + selected sector
const WIDE = '(min-width: 1024px)'

/**
 * On narrow screens the wheel scrolls up normally until only its top band —
 * the fixed marker and whatever sector sits under it — remains, and that band
 * stays pinned above the results so the relationship is always visible.
 * Implemented as a sticky wrapper whose height shrinks by exactly the amount
 * the page has scrolled past its pin point (a margin-bottom keeps the layout
 * height constant, so nothing below jumps). Wide screens use a plain sticky
 * column instead and this hook stands down.
 */
function useStickyBand(wrapRef, sentinelRef) {
  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    let raf = 0
    const reset = () => {
      const el = wrapRef.current
      if (el) { el.style.height = ''; el.style.marginBottom = ''; el.style.borderBottom = '' }
    }
    const update = () => {
      raf = 0
      const el = wrapRef.current
      const sentinel = sentinelRef.current
      if (!el || !sentinel) return
      if (mq.matches) { reset(); return }
      const full = el.scrollHeight
      const overscroll = Math.max(0, NAV_PX - sentinel.getBoundingClientRect().top)
      const height = Math.max(BAND_PX, full - overscroll)
      el.style.height = `${height}px`
      el.style.marginBottom = `${full - height}px`
      el.style.borderBottom = height < full ? '1px solid var(--color-mist)' : ''
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    mq.addEventListener('change', schedule)
    // the line under the wheel changes with the selection, so re-measure on content growth
    const ro = new ResizeObserver(schedule)
    if (wrapRef.current?.firstElementChild) ro.observe(wrapRef.current.firstElementChild)
    schedule()
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mq.removeEventListener('change', schedule)
      reset()
    }
  }, [wrapRef, sentinelRef])
}

/**
 * /placement — the Vastu placement compass. Pick a direction; the wheel turns
 * and the reading opens beside (wide) or below (narrow) it. Selection lives
 * in the URL (?direction=north-east). Data: one load of the nine profiles +
 * the direction → artworks map (lib/loadPlacement), so switching is instant.
 * No SectionHeading here: that component has a scroll-in entrance and this
 * page's only motion is the wheel.
 */
export default function Placement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null) // null = loading; wheel shows bundled labels meanwhile
  const wrapRef = useRef(null)
  const sentinelRef = useRef(null)
  useStickyBand(wrapRef, sentinelRef)

  useEffect(() => {
    let cancelled = false
    loadPlacement().then((d) => { if (!cancelled) setData(d) })
    return () => { cancelled = true }
  }, [])

  const profiles = data?.profiles || fallbackDirectionProfiles
  const value = useMemo(() => slugToDirection(searchParams.get('direction')), [searchParams])
  const selected = value ? profiles.find((p) => p.direction === value) || null : null
  const artworks = selected && data ? data.byDirection[selected.direction] || [] : []

  const select = useCallback((direction) => {
    const next = new URLSearchParams(searchParams)
    next.set('direction', directionToSlug(direction))
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }, [searchParams, setSearchParams])

  const countLine = selected && data && selected.shows_artworks !== false
    ? ` · ${artworks.length === 1 ? '1 artwork' : `${artworks.length} artworks`}`
    : ''

  return (
    <>
      <SEO
        title="Vastu Placement — Find the Wall for Your Artwork"
        description="Pick a direction on the compass and see which of Monica Prakash's original artworks belong on that wall, with a one-line reason for each. Vastu placement guidance for mandala and devotional art."
        path="/placement"
        image="/images/og-placement.jpg"
        keywords={['Vastu art placement', 'which wall to hang mandala', 'Vastu direction artwork', 'north-east wall art']}
      />

      <section className="max-w-content mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-16">
        <header className="text-center mb-8 md:mb-10">
          <p className="text-small uppercase tracking-label text-graphite mb-3">Vastu placement</p>
          <h1 className="font-display text-display-sm md:text-display text-ink">Which wall are you filling?</h1>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:items-start">
          <div ref={sentinelRef} aria-hidden="true" className="lg:hidden" />
          {/* narrow: sticky, clipped to the top band as you scroll; wide: sticky column */}
          <div
            ref={wrapRef}
            className="sticky top-20 lg:top-24 z-10 bg-white overflow-hidden lg:overflow-visible"
          >
            <div>
              <VastuCompass profiles={profiles} value={value} onChange={select} className="max-w-[560px]" />
              <p aria-live="polite" className="text-center mt-6 pb-2 text-body text-charcoal min-h-[1.65em]">
                {selected
                  ? <><span className="font-display text-h3 text-ink">{selected.label}</span><span className="text-graphite"> · {selected.essence}{countLine}</span></>
                  : 'Tap a direction to see what belongs there.'}
              </p>
            </div>
          </div>

          <div className="mt-10 lg:mt-0 relative">
            {selected && !data && <LoadingSpinner />}
            {selected && data && <PlacementReading profile={selected} artworks={artworks} />}
          </div>
        </div>
      </section>
    </>
  )
}
