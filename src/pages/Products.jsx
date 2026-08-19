import { useEffect, useState } from 'react'
import SEO from '../components/SEO'
import { SectionHeading, LoadingSpinner, EmptyState } from '../components/UI'
import ProductCard from '../components/ProductCard'
import Photo from '../components/Photo'
import { getProducts, getCategories } from '../lib/supabase'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods || [])
        // only offer categories that actually have products
        const used = new Set((prods || []).map((p) => p.category_id).filter(Boolean))
        setCategories((cats || []).filter((c) => used.has(c.id)))
      })
      .catch(() => {
        setProducts([])
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  const visible =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category_id === activeCategory)

  return (
    <>
      <SEO
        title="Artworks & Products"
        description="Handcrafted artworks by Monica Prakash — mandala pieces, Janur art, frames, and bespoke commissions. Express interest and Monica will reach out personally."
        path="/products"
      />

      {/* ── Header ── */}
      <section className="bg-white pt-16 pb-10 md:pt-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Artworks & Products"
                title="The collection"
                subtitle="Every piece is handcrafted by Monica. See something you love — or imagine something new — and express interest; she'll reach out personally."
                className="mb-0"
              />
            </div>
            <Photo
              base="/images/monica/portraits/20250620-IMG_2208"
              alt="A hand-drawn monochrome mandala card held forward, Monica in soft focus behind it"
              treatment="duotone"
              aspect="aspect-[5/3]"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Filter + grid ── */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 border-y border-mist py-4 mb-12">
              {[{ id: 'all', name: 'All' }, ...categories].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 text-small uppercase tracking-label transition-colors cursor-pointer border ${
                    activeCategory === cat.id
                      ? 'bg-ink text-white border-ink'
                      : 'bg-transparent text-graphite border-transparent hover:text-ink'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : visible.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="The collection is being prepared"
              message="Artworks will appear here soon. For bespoke orders in the meantime, please get in touch."
            />
          )}
        </div>
      </section>
    </>
  )
}
