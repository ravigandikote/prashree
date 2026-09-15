/**
 * Pure logic for the Vastu placement compass (/placement).
 * Builds the direction → artworks map once from the catalogue so tapping
 * between sectors is instant. No Supabase here — see loadPlacement.js.
 */
import { DIRECTIONS } from '../data/vastu'

/**
 * The money manifestation frames are a separate product line with their own
 * marketing and never surface on the compass. They are recognised by their
 * art form / series rather than by an absent direction tag, so a new piece
 * added in /admin with that form is excluded automatically.
 */
export function isMoneyLine(product) {
  return /money manifestation/i.test(`${product.form || ''} ${product.series || ''}`)
}

/**
 * A piece qualifies for the compass when it is a catalogued artwork (has an
 * art form), is listed, and is not in the money line. Sold originals stay in,
 * matching the catalogue: the card shows "Original sold" and offers a print.
 */
export function eligibleForPlacement(product) {
  return Boolean(product.form) && product.is_available !== false && !isMoneyLine(product)
}

const byName = (a, b) => a.name.localeCompare(b.name)

/**
 * { [direction]: Artwork[] } for every direction, primary matches first
 * (A–Z), then secondary matches (A–Z). Directions with nothing mapped get an
 * empty array rather than being padded. `Centre` is included for completeness
 * but the profile's `shows_artworks` decides whether it is rendered.
 */
export function buildDirectionMap(products, directions = DIRECTIONS) {
  const eligible = (products || []).filter(eligibleForPlacement)
  const map = {}
  for (const direction of directions) {
    const primary = eligible.filter((p) => p.direction === direction).sort(byName)
    const secondary = eligible
      .filter((p) => p.secondary_direction === direction && p.direction !== direction)
      .sort(byName)
    map[direction] = [
      ...primary.map((p) => ({ ...p, match: 'primary' })),
      ...secondary.map((p) => ({ ...p, match: 'secondary' })),
    ]
  }
  return map
}

/** Directions (excluding Centre) that currently have no artwork — for the admin/flagging, never for auto-reassignment. */
export function emptyDirections(map) {
  return Object.keys(map).filter((d) => d !== 'Centre' && map[d].length === 0)
}
