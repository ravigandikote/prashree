import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading, LoadingSpinner } from '../components/UI'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../lib/supabase'
import { fallbackArtworks } from '../data/artworks'
import {
  DEFAULT_FILTERS, PRICE_BANDS, SORT_OPTIONS, SIZE_LABELS,
  filterArtworks, sortArtworks, facetCounts, facetValues,
  filtersToParams, paramsToFilters,
} from '../lib/catalog'

const PAGE_SIZE = 24

/* normalize a DB/fallback row for the filter logic (search includes pdf name) */
const normalize = (p) => ({
  ...p,
  pdf_file: p.pdf_url ? p.pdf_url.split('/').pop() : '',
})

const FACETS = [
  { key: 'form', label: 'Art form', all: 'All art forms' },
  { key: 'series', label: 'Series / category', all: 'All series' },
  { key: 'size', label: 'Size', all: 'All sizes' },
  { key: 'price', label: 'Price', all: 'All prices' },
  { key: 'dir', label: 'Vastu direction', all: 'All directions' },
]

function FacetSelect({ facet, items, filters, onChange, id }) {
  const counts = facetCounts(items, filters, facet.key)
  const options =
    facet.key === 'price'
      ? PRICE_BANDS.filter((b) => b.value).map((b) => ({ value: b.value, label: b.label }))
      : facetValues(items, facet.key).map((v) => ({
          value: v,
          label: facet.key === 'size' ? SIZE_LABELS[v] || v : v,
        }))
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[10px] uppercase tracking-label text-graphite mb-1 whitespace-nowrap">
        {facet.label}
      </label>
      <select
        id={id}
        value={filters[facet.key]}
        onChange={(e) => onChange(facet.key, e.target.value)}
        className="w-full bg-white border border-mist px-2 py-2 text-small text-charcoal focus:outline-none focus:border-ink cursor-pointer"
      >
        <option value="">{facet.all}</option>
        {options.map((o) => {
          const n = counts[o.value] || 0
          return (
            <option key={o.value} value={o.value} disabled={n === 0}>
              {o.label} ({n})
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default function Products() {
  const [items, setItems] = useState(null) // null = loading
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])
  const [qInput, setQInput] = useState(filters.q)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sheetOpen, setSheetOpen] = useState(false)
  const debounceRef = useRef()

  useEffect(() => {
    getProducts()
      .then((data) => {
        // real catalogue rows carry `form`; anything else means unseeded DB
        const catalogued = (data || []).filter((p) => p.form)
        setItems((catalogued.length ? catalogued : fallbackArtworks).map(normalize))
      })
      .catch(() => setItems(fallbackArtworks.map(normalize)))
  }, [])

  const applyFilters = (next) => {
    setSearchParams(filtersToParams(next), { replace: true, preventScrollReset: true })
    setVisibleCount(PAGE_SIZE)
  }

  const handleFacet = (key, value) => applyFilters({ ...filters, [key]: value })

  const handleSearch = (value) => {
    setQInput(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(
      () => applyFilters({ ...filters, q: value }),
      200
    )
  }

  const handleReset = () => {
    setQInput('')
    applyFilters(DEFAULT_FILTERS)
  }

  const filtered = useMemo(
    () => (items ? sortArtworks(filterArtworks(items, filters), filters.sort) : []),
    [items, filters]
  )
  const visible = filtered.slice(0, visibleCount)
  const activeFilterCount = FACETS.filter((f) => filters[f.key]).length

  return (
    <>
      <SEO
        title="Buy Hand-Drawn Mandala Art & Original Artworks"
        description="Original hand-drawn artworks by Monica Prakash — mandala, botanical, abstract line, devotional, geometric, and money manifestation art. Filter by art form, series, size, price, and Vastu direction; enquire directly, ships across India."
        path="/products"
        keywords={[
          'buy mandala art online India', 'original mandala artwork for sale',
          'mandala wall art', 'Vastu direction wall art', 'money manifestation art',
          'botanical line art', 'devotional art India', 'fine art prints India',
        ]}
        jsonLd={
          items && items.length
            ? {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'PraShree Arts — original artworks',
                numberOfItems: items.length,
                itemListElement: items.slice(0, 30).map((p, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `https://www.prashreearts.com/products/${p.slug}`,
                  name: p.name,
                })),
              }
            : undefined
        }
      />

      {/* ── Header ── */}
      <section className="bg-white pt-16 md:pt-20 pb-8">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Artworks & Products"
            title="The collection"
            subtitle="Every piece is hand-drawn by Monica. Express interest on any artwork and she'll reach out personally — originals, fine-art prints, and commissions."
            className="mb-0"
          />
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-20 z-40 bg-paper border-y border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Desktop: facet row, then search/sort/reset/count row */}
          <div className="hidden md:block space-y-3">
            <div className="grid grid-cols-5 gap-4">
              {FACETS.map((f) => (
                <FacetSelect
                  key={f.key}
                  id={`facet-${f.key}`}
                  facet={f}
                  items={items || []}
                  filters={filters}
                  onChange={handleFacet}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-72">
                <label htmlFor="catalog-q" className="sr-only">Search</label>
                <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ash" aria-hidden="true" />
                <input
                  id="catalog-q"
                  type="search"
                  value={qInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search name, intent, series…"
                  className="w-full bg-white border border-mist pl-7 pr-2 py-2 text-small text-charcoal focus:outline-none focus:border-ink"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="catalog-sort" className="text-[10px] uppercase tracking-label text-graphite whitespace-nowrap">
                  Sort
                </label>
                <select
                  id="catalog-sort"
                  value={filters.sort}
                  onChange={(e) => applyFilters({ ...filters, sort: e.target.value })}
                  className="w-44 bg-white border border-mist px-2 py-2 text-small text-charcoal focus:outline-none focus:border-ink cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleReset}
                className="border border-mist bg-white px-4 py-2 text-small text-graphite hover:text-ink hover:border-ink transition-colors cursor-pointer"
              >
                Reset
              </button>
              <p className="ml-auto text-small text-graphite whitespace-nowrap" aria-live="polite">
                {items ? `${filtered.length} of ${items.length} artworks` : '…'}
              </p>
            </div>
          </div>

          {/* Mobile: Filters button + search + sort */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-2 border border-mist bg-white px-3 py-2 text-small text-charcoal cursor-pointer whitespace-nowrap"
                aria-expanded={sheetOpen}
              >
                <SlidersHorizontal size={14} aria-hidden="true" />
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>
              <div className="relative flex-1 min-w-0">
                <label htmlFor="catalog-q-m" className="sr-only">Search</label>
                <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ash" aria-hidden="true" />
                <input
                  id="catalog-q-m"
                  type="search"
                  value={qInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-white border border-mist pl-7 pr-2 py-2 text-small text-charcoal focus:outline-none focus:border-ink"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="catalog-sort-m" className="text-[10px] uppercase tracking-label text-graphite">
                Sort
              </label>
              <select
                id="catalog-sort-m"
                value={filters.sort}
                onChange={(e) => applyFilters({ ...filters, sort: e.target.value })}
                className="flex-1 bg-white border border-mist px-2 py-2 text-small text-charcoal focus:outline-none focus:border-ink cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-small text-graphite whitespace-nowrap" aria-live="polite">
                {items ? `${filtered.length} of ${items.length}` : '…'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filter sheet ── */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 md:hidden"
          onClick={() => setSheetOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-white p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-small uppercase tracking-label text-graphite">Filters</p>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-1 text-graphite hover:text-ink bg-transparent border-0 cursor-pointer"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {FACETS.map((f) => (
                <FacetSelect
                  key={f.key}
                  id={`sheet-${f.key}`}
                  facet={f}
                  items={items || []}
                  filters={filters}
                  onChange={handleFacet}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 bg-ink text-white py-2.5 text-small uppercase tracking-label border-0 cursor-pointer"
              >
                Show {filtered.length} artworks
              </button>
              <button
                onClick={handleReset}
                className="border border-mist px-4 py-2.5 text-small text-graphite cursor-pointer bg-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          {!items ? (
            <LoadingSpinner />
          ) : visible.length > 0 ? (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
                {visible.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
              {filtered.length > visibleCount && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="border border-ink px-8 py-3 text-small uppercase tracking-label text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer bg-transparent"
                  >
                    Load more ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-graphite">No artworks match these filters.</p>
              <button
                onClick={handleReset}
                className="mt-3 text-ink underline underline-offset-4 bg-transparent border-0 cursor-pointer text-body"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
