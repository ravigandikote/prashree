/**
 * Local artwork catalogue derived from PraShree-Products-Metadata/items.json
 * (the single source of truth, also used to generate the Supabase seed SQL).
 * Used as a read-only fallback when the database is unreachable so the
 * catalogue still renders; the database remains authoritative once seeded.
 */
import items from '../../PraShree-Products-Metadata/items.json'

export const fallbackArtworks = items.map((i) => ({
  id: i.id,               // slug stands in for the DB uuid in fallback mode
  slug: i.id,
  name: i.name,
  description: i.intent,
  price: i.price,
  sale_price: null,
  images: [`/images/products/thumbs/${i.id}.jpg`],
  pdf_url: `/catalogues/${i.pdf}`,
  vastu_note: `Primary Vastu direction: ${i.direction}`,
  size: i.size,
  size_code: i.size_code,
  price_range: i.price_range,
  usd: i.usd,
  prints: i.prints,
  hours: i.hours,
  series: i.series,
  form: i.form,
  intent: i.intent,
  direction: i.direction,
  is_featured: false,
  is_available: true,
}))
