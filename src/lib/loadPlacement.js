/**
 * One-shot loader for /placement: fetches the nine direction profiles and the
 * catalogue in parallel, then builds the full direction → artworks map so the
 * wheel never needs another round trip. Falls back to the bundled data when
 * the database is unreachable or unseeded (same policy as /products and
 * /workshops), and never leaves the page on a spinner past `timeoutMs`.
 */
import { getDirectionProfiles, getPlacementProducts } from './supabase'
import { fallbackDirectionProfiles } from '../data/vastu'
import { fallbackArtworks } from '../data/artworks'
import { buildDirectionMap } from './placement'

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))])

export async function loadPlacement({ timeoutMs = 4000 } = {}) {
  const [profiles, products] = await Promise.all([
    withTimeout(getDirectionProfiles(), timeoutMs).catch(() => null),
    withTimeout(getPlacementProducts(), timeoutMs).catch(() => null),
  ])
  const liveProfiles = profiles?.length ? profiles : fallbackDirectionProfiles
  // real catalogue rows carry `form`; anything else means an unseeded DB
  const liveProducts = products?.some((p) => p.form) ? products : fallbackArtworks
  return {
    profiles: liveProfiles,
    directions: liveProfiles.map((p) => p.direction),
    byDirection: buildDirectionMap(liveProducts, liveProfiles.map((p) => p.direction)),
    source: { profiles: profiles?.length ? 'db' : 'fallback', products: products?.some((p) => p.form) ? 'db' : 'fallback' },
  }
}
