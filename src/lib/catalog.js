/**
 * Pure filtering/sorting/faceting logic for the artworks catalogue.
 * Mirrors the reference implementation (prashree-products-catalog.html):
 * AND-combined filters, price bands as `low-high` with price >= low && < high,
 * search across name+intent+pdf+series+form, size order A5 → 17×24/24×17 → B5 → A3.
 */

export const DEFAULT_FILTERS = {
  form: '',
  series: '',
  size: '',
  price: '',
  dir: '',
  q: '',
  sort: 'name',
}

export const SIZE_ORDER = { A5: 1, '17×24': 2, '24×17': 2, B5: 3, A3: 4 }

export const SIZE_LABELS = {
  A3: 'A3 (29.7 × 42 cm)',
  A5: 'A5 (14.8 × 21 cm)',
  B5: 'B5 (17.6 × 25 cm)',
  '24×17': '24 × 17 cm',
  '17×24': '17 × 24 cm',
}

export const PRICE_BANDS = [
  { value: '', label: 'All prices' },
  { value: '0-5000', label: 'Under ₹5,000' },
  { value: '5000-8000', label: '₹5,000–8,000' },
  { value: '8000-10000', label: '₹8,000–10,000' },
  { value: '10000-9999999', label: 'Above ₹10,000' },
]

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'priceAsc', label: 'Price low → high' },
  { value: 'priceDesc', label: 'Price high → low' },
  { value: 'size', label: 'Size' },
]

function searchText(item) {
  return [item.name, item.intent, item.pdf_file, item.series, item.form]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Does `item` pass a single facet/filter? (price value: "low-high") */
function passes(item, key, value) {
  if (!value) return true
  switch (key) {
    case 'form': return item.form === value
    case 'series': return item.series === value
    case 'size': return item.size_code === value
    case 'dir': return item.direction === value
    case 'price': {
      const [lo, hi] = value.split('-').map(Number)
      return Number(item.price) >= lo && Number(item.price) < hi
    }
    case 'q': return searchText(item).includes(value.trim().toLowerCase())
    default: return true
  }
}

const FILTER_KEYS = ['form', 'series', 'size', 'price', 'dir', 'q']

/** AND-combine all active filters. */
export function filterArtworks(items, filters) {
  return items.filter((item) =>
    FILTER_KEYS.every((key) => passes(item, key, filters[key]))
  )
}

/** Sort a (already filtered) list; never mutates the input. */
export function sortArtworks(items, sort) {
  const list = [...items]
  switch (sort) {
    case 'priceAsc':
      return list.sort((a, b) => a.price - b.price)
    case 'priceDesc':
      return list.sort((a, b) => b.price - a.price)
    case 'size':
      return list.sort(
        (a, b) =>
          (SIZE_ORDER[a.size_code] || 99) - (SIZE_ORDER[b.size_code] || 99) ||
          a.name.localeCompare(b.name)
      )
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name))
  }
}

/**
 * Facet option counts for one facet: items matching every OTHER active filter,
 * grouped by this facet's value. Options with count 0 should be disabled.
 */
export function facetCounts(items, filters, facetKey) {
  const others = items.filter((item) =>
    FILTER_KEYS.every((key) => key === facetKey || passes(item, key, filters[key]))
  )
  const field =
    facetKey === 'size' ? 'size_code' : facetKey === 'dir' ? 'direction' : facetKey
  const counts = {}
  if (facetKey === 'price') {
    for (const band of PRICE_BANDS) {
      if (!band.value) continue
      counts[band.value] = others.filter((i) => passes(i, 'price', band.value)).length
    }
  } else {
    for (const item of others) {
      const v = item[field]
      if (v) counts[v] = (counts[v] || 0) + 1
    }
  }
  return counts
}

/** Distinct sorted values for a facet across the full list. */
export function facetValues(items, facetKey) {
  const field =
    facetKey === 'size' ? 'size_code' : facetKey === 'dir' ? 'direction' : facetKey
  const vals = [...new Set(items.map((i) => i[field]).filter(Boolean))]
  if (facetKey === 'size') {
    return vals.sort((a, b) => (SIZE_ORDER[a] || 99) - (SIZE_ORDER[b] || 99) || a.localeCompare(b))
  }
  return vals.sort((a, b) => a.localeCompare(b))
}

/** filters object ⇄ URLSearchParams (defaults are omitted from the URL) */
export function filtersToParams(filters) {
  const params = new URLSearchParams()
  for (const key of [...FILTER_KEYS, 'sort']) {
    const v = filters[key]
    if (v && v !== DEFAULT_FILTERS[key]) params.set(key, v)
  }
  return params
}

export function paramsToFilters(params) {
  const filters = { ...DEFAULT_FILTERS }
  for (const key of [...FILTER_KEYS, 'sort']) {
    const v = params.get(key)
    if (v) filters[key] = v
  }
  return filters
}
