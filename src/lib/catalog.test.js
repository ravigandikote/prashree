import { describe, it, expect } from 'vitest'
import {
  DEFAULT_FILTERS,
  filterArtworks,
  sortArtworks,
  facetCounts,
  filtersToParams,
  paramsToFilters,
} from './catalog'

const A = (over) => ({
  name: 'Aditya · Sunflower of Joy',
  intent: 'Joy, positivity & new beginnings',
  pdf_file: 'Aditya-SunflowerOfJoy_2page.pdf',
  series: 'Joy & Positivity Series',
  form: 'Mandala Art',
  size_code: '24×17',
  direction: 'East',
  price: 8500,
  ...over,
})

const ITEMS = [
  A({ name: 'Anahata', price: 15000, size_code: 'A3', form: 'Mandala Art', direction: 'South-West', series: 'Love Series' }),
  A({ name: 'Bodhi', price: 4500, size_code: 'A5', form: 'Abstract Line Art', direction: 'North', series: 'Calm Series' }),
  A({ name: 'Chakra', price: 8000, size_code: 'B5', form: 'Mandala Art', direction: 'North', series: 'Energy Series' }),
  A({ name: 'Dhara', price: 5000, size_code: '17×24', form: 'Botanical & Floral Art', direction: 'East', series: 'Nature Series', intent: 'Grounding lotus energy' }),
]

describe('filterArtworks', () => {
  it('AND-combines filters', () => {
    const out = filterArtworks(ITEMS, { ...DEFAULT_FILTERS, form: 'Mandala Art', dir: 'North' })
    expect(out.map((i) => i.name)).toEqual(['Chakra'])
  })

  it('applies price bands as >= low && < high', () => {
    expect(filterArtworks(ITEMS, { ...DEFAULT_FILTERS, price: '0-5000' }).map((i) => i.name)).toEqual(['Bodhi'])
    expect(filterArtworks(ITEMS, { ...DEFAULT_FILTERS, price: '5000-8000' }).map((i) => i.name)).toEqual(['Dhara'])
    expect(filterArtworks(ITEMS, { ...DEFAULT_FILTERS, price: '8000-10000' }).map((i) => i.name)).toEqual(['Chakra'])
    expect(filterArtworks(ITEMS, { ...DEFAULT_FILTERS, price: '10000-9999999' }).map((i) => i.name)).toEqual(['Anahata'])
  })

  it('band 8000-10000 includes 8000 and excludes 10000', () => {
    const items = [A({ name: 'Low', price: 8000 }), A({ name: 'High', price: 10000 })]
    const out = filterArtworks(items, { ...DEFAULT_FILTERS, price: '8000-10000' })
    expect(out.map((i) => i.name)).toEqual(['Low'])
  })

  it('searches across name, intent, pdf, series, and form (case-insensitive)', () => {
    const q = (s) => filterArtworks(ITEMS, { ...DEFAULT_FILTERS, q: s }).map((i) => i.name)
    expect(q('anahata')).toEqual(['Anahata'])        // name
    expect(q('LOTUS')).toEqual(['Dhara'])            // intent
    expect(q('sunflowerofjoy')).toHaveLength(4)      // pdf (shared in fixture)
    expect(q('energy series')).toEqual(['Chakra'])   // series
    expect(q('botanical')).toEqual(['Dhara'])        // form
    expect(q('zzz')).toEqual([])
  })
})

describe('sortArtworks', () => {
  it('orders sizes A5 → 17×24/24×17 → B5 → A3, then name', () => {
    const out = sortArtworks(ITEMS, 'size').map((i) => i.size_code)
    expect(out).toEqual(['A5', '17×24', 'B5', 'A3'])
  })

  it('sorts by price both ways and by name by default', () => {
    expect(sortArtworks(ITEMS, 'priceAsc').map((i) => i.price)).toEqual([4500, 5000, 8000, 15000])
    expect(sortArtworks(ITEMS, 'priceDesc')[0].price).toBe(15000)
    expect(sortArtworks(ITEMS, 'name')[0].name).toBe('Anahata')
  })
})

describe('facetCounts', () => {
  it('counts a facet against every OTHER active filter', () => {
    // dir=North active: form counts computed among North items only
    const counts = facetCounts(ITEMS, { ...DEFAULT_FILTERS, dir: 'North' }, 'form')
    expect(counts).toEqual({ 'Abstract Line Art': 1, 'Mandala Art': 1 })
    // ...but the dir facet itself ignores the dir filter (so options stay switchable)
    const dirCounts = facetCounts(ITEMS, { ...DEFAULT_FILTERS, dir: 'North' }, 'dir')
    expect(dirCounts).toEqual({ 'South-West': 1, North: 2, East: 1 })
  })
})

describe('URL state round-trip', () => {
  it('omits defaults, restores non-defaults, and reset means empty params', () => {
    const filters = { ...DEFAULT_FILTERS, form: 'Mandala Art', price: '8000-10000', sort: 'priceAsc' }
    const params = filtersToParams(filters)
    expect(params.get('series')).toBeNull()
    expect(params.get('sort')).toBe('priceAsc')
    expect(paramsToFilters(params)).toEqual(filters)
    // reset
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe('')
    expect(paramsToFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS)
  })
})
