import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading, LoadingSpinner, EmptyState } from '../components/UI'
import ProductCard from '../components/ProductCard'
import GalleryGrid from '../components/GalleryGrid'
import { getCategoryBySlug, getProducts, getGalleryByCategory } from '../lib/supabase'

export default function CategoryDetail() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    setLoading(true)
    getCategoryBySlug(slug)
      .then(async (cat) => {
        setCategory(cat)
        const [prods, gal] = await Promise.all([
          getProducts({ categoryId: cat.id }),
          getGalleryByCategory(cat.id),
        ])
        setProducts(prods || [])
        setGallery(gal || [])
      })
      .catch(() => {
        // Fallback for demo
        setCategory({
          name: slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          slug,
          description: 'Handcrafted art collection by Monica Prakash.',
        })
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSpinner />

  if (!category) {
    return (
      <EmptyState title="Category Not Found" message="This category doesn't exist." />
    )
  }

  return (
    <>
      <SEO
        title={category.name}
        description={category.description || `Browse ${category.name} artworks by PraShree Arts.`}
        path={`/categories/${slug}`}
      />

      {/* ── Header ── */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-muted hover:text-primary text-sm mb-6 no-underline transition-colors"
          >
            <ArrowLeft size={14} /> All Categories
          </Link>
          <SectionHeading
            title={category.name}
            subtitle={category.description}
          />

          {/* Tab switcher */}
          <div className="flex justify-center gap-8 mt-8">
            {['products', 'gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  pb-2 text-sm font-medium tracking-wide uppercase border-b-2 transition-colors
                  cursor-pointer bg-transparent border-x-0 border-t-0
                  ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-primary'
                  }
                `}
              >
                {tab === 'products' ? 'Products' : 'Gallery'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'products' ? (
            products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Products Yet"
                message="Products for this category are coming soon. Check back later."
              />
            )
          ) : gallery.length > 0 ? (
            <GalleryGrid images={gallery} />
          ) : (
            <EmptyState
              title="Gallery Coming Soon"
              message="Portfolio images for this category will be added shortly."
            />
          )}
        </div>
      </section>
    </>
  )
}
