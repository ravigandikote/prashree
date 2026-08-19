import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { LoadingSpinner, EmptyState } from '../components/UI'
import Button from '../components/Button'
import PdfViewer from '../components/PdfViewer'
import { InterestModal } from '../components/InterestForm'
import { getProductBySlug } from '../lib/supabase'
import { formatPrice } from '../lib/format'

export default function ProductDetail() {
  const { slug } = useParams()
  // key remounts the view per slug so all state resets cleanly
  return <ProductView key={slug} slug={slug} />
}

function ProductView({ slug }) {
  const [product, setProduct] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showInterest, setShowInterest] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProductBySlug(slug)
      .then((data) => { if (!cancelled) setProduct(data) })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (loading) return <LoadingSpinner />
  if (notFound || !product) {
    return (
      <section className="py-24">
        <EmptyState
          title="Artwork not found"
          message="This piece doesn't exist or is no longer available."
        />
        <div className="text-center">
          <Button to="/products" variant="link">
            <ArrowLeft size={14} /> Back to the collection
          </Button>
        </div>
      </section>
    )
  }

  const images = product.images?.length ? product.images : []

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `${product.name} — handcrafted by Monica Prakash at PraShree Arts.`}
        path={`/products/${slug}`}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-small text-graphite mb-10" aria-label="Breadcrumb">
            <Link to="/products" className="hover:text-ink no-underline text-graphite transition-colors">
              Collection
            </Link>
            {product.categories && (
              <>
                <span aria-hidden="true">/</span>
                <span>{product.categories.name}</span>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery — product photos untouched so customers see true colours */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {images.length > 0 ? (
                <>
                  <div className="aspect-square overflow-hidden bg-paper">
                    <img
                      src={images[selectedImage]}
                      alt={`${product.name} — view ${selectedImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-3 mt-4">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`w-20 h-20 overflow-hidden border transition-colors cursor-pointer p-0 bg-transparent ${
                            selectedImage === i ? 'border-ink' : 'border-mist'
                          }`}
                          aria-label={`Show view ${i + 1}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-paper border border-mist flex items-center justify-center">
                  <p className="text-ash text-small uppercase tracking-label">
                    Photos coming soon
                  </p>
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {product.categories?.name && (
                <p className="text-small uppercase tracking-label text-ash">
                  {product.categories.name}
                </p>
              )}
              <h1 className="font-display text-display-sm md:text-display text-ink mt-2">
                {product.name}
              </h1>

              <p className="text-h3 font-display text-charcoal mt-4">
                {formatPrice(product.sale_price || product.price)}
                {product.sale_price ? (
                  <span className="text-ash text-body line-through ml-3">
                    {formatPrice(product.price)}
                  </span>
                ) : null}
              </p>

              {product.description && (
                <p className="mt-6 text-graphite">{product.description}</p>
              )}

              {product.vastu_note && (
                <div className="mt-6 border-l-2 border-mist pl-4 flex gap-3">
                  <Compass size={18} className="text-graphite shrink-0 mt-1" aria-hidden="true" />
                  <p className="text-small text-graphite">{product.vastu_note}</p>
                </div>
              )}

              <hr className="hairline my-8" />

              <Button onClick={() => setShowInterest(true)}>
                Express interest
              </Button>
              <p className="text-small text-ash mt-3">
                No online payment — Monica will call you to discuss the piece,
                customisation, and delivery.
              </p>

              <div className="mt-8 space-y-2 text-small text-graphite">
                <p>Handcrafted by Monica Prakash</p>
                <p>Custom sizes and variations available on request</p>
              </div>
            </motion.div>
          </div>

          {/* Catalogue PDF */}
          {product.pdf_url && (
            <div className="mt-16 max-w-3xl">
              <PdfViewer url={product.pdf_url} title={`${product.name} catalogue`} />
            </div>
          )}
        </div>
      </section>

      <InterestModal
        open={showInterest}
        onClose={() => setShowInterest(false)}
        product={product}
      />
    </>
  )
}
