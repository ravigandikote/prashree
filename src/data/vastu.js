/**
 * Vastu direction profiles — the compass's own copy (label, Sanskrit name,
 * guardian, element, essence, description), one per direction.
 * PraShree-Products-Metadata/vastu-profiles.json is the source of truth: it
 * seeds the `vastu_direction_profiles` table via `npm run vastu:sql`, and is
 * bundled here as the read-only fallback when the database is unreachable.
 * The database is authoritative once seeded (Monica edits copy in /admin).
 */
import profiles from '../../PraShree-Products-Metadata/vastu-profiles.json'

/** Clockwise from North, Centre last — the order the wheel is drawn in. */
export const fallbackDirectionProfiles = [...profiles].sort((a, b) => a.sort_order - b.sort_order)

/** The nine valid `direction` / `secondary_direction` values, wheel order. */
export const DIRECTIONS = fallbackDirectionProfiles.map((p) => p.direction)

/** URL-safe key for a direction: 'North-East' → 'north-east'. */
export const directionToSlug = (direction) => direction.toLowerCase()

/** 'north-east' → 'North-East' (null when not a known direction). */
export const slugToDirection = (slug) =>
  DIRECTIONS.find((d) => directionToSlug(d) === String(slug || '').toLowerCase()) || null
