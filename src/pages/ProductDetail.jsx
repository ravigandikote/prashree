import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Compass, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import { LoadingSpinner, EmptyState } from '../components/UI'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import PdfViewer from '../components/PdfViewer'
import { usePdfAvailable } from '../lib/usePdfAvailable'
import { InterestModal } from '../components/InterestForm'
import { getProductBySlug, getProducts } from '../lib/supabase'
import { fallbackArtworks } from '../data/artworks'
import { formatPrice } from '../lib/format'

export default function ProductDetail() {
  const { slug } = useParams()
  // key remounts the view per slug so all state resets cleanly
  return <ProductView key={slug} slug={slug} />
}

function ProductView({ slug }) {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showInterest, setShowInterest] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProductBySlug(slug)
      .then((data) => { if (!cancelled) setProduct(data) })
      .catch(() => {
        // database unreachable → serve the bundled catalogue
        const local = fallbackArtworks.find((a) => a.slug === slug)
        if (!cancelled) {
          if (local) setProduct(local)
          else setNotFound(true)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  // "You may also like": same series first, then same form, excluding self
  useEffect(() => {
    if (!product) return
    let cancelled = false
    getProducts()
      .then((data) => (data?.some((p) => p.form) ? data : fallbackArtworks))
      .catch(() => fallbackArtworks)
      .then((all) => {
        if (cancelled) return
        const pool = all.filter((a) => a.slug !== product.slug)
        const same = [
          ...pool.filter((a) => a.series && a.series === product.series),
          ...pool.filter(
            (a) => a.form && a.form === product.form && a.series !== product.series
          ),
        ]
        setRelated(same.slice(0, 4))
      })
    return () => { cancelled = true }
  }, [product])

  const pdfAvailable = usePdfAvailable(product?.pdf_url)

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
        title={`${product.name} — Original Hand-Drawn Artwork`}
        description={`${product.intent || product.description || 'Handcrafted artwork'} · ${product.form || 'Original art'}${product.size ? ` · ${product.size}` : ''}${product.direction ? ` · Vastu: ${product.direction}` : ''} — hand-drawn by Monica Prakash, PraShree Arts, Bengaluru.`}
        path={`/products/${slug}`}
        image={product.images?.[0] || undefined}
        type="product"
        keywords={[
          product.form, product.series, 'original hand-drawn artwork',
          'buy mandala art India', product.direction && `${product.direction} Vastu art`,
        ].filter(Boolean)}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.prashreearts.com/' },
              { '@type': 'ListItem', position: 2, name: 'Artworks', item: 'https://www.prashreearts.com/products' },
              { '@type': 'ListItem', position: 3, name: product.name },
            ],
          })}
        </script>
      </Helmet>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.intent || product.description || undefined,
            image: product.images?.[0]
              ? `https://www.prashreearts.com${product.images[0]}`
              : undefined,
            url: `https://www.prashreearts.com/products/${slug}`,
            brand: { '@type': 'Brand', name: 'PraShree Arts' },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: Number(product.sale_price || product.price) || undefined,
              availability: product.is_available
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          })}
        </script>
      </Helmet>

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
              {(product.form || product.categories?.name) && (
                <p className="text-small uppercase tracking-label text-ash">
                  {product.form || product.categories?.name}
                </p>
              )}
              <h1 className="font-display text-display-sm md:text-display text-ink mt-2">
                {product.name}
              </h1>
              {product.intent && (
                <p className="font-display text-h3 text-graphite italic mt-2">
                  {product.intent}
                </p>
              )}

              {/* Chips */}
              {(product.form || product.series || product.direction) && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {product.form && (
                    <span className="px-2 py-0.5 bg-ink text-white text-[10px] uppercase tracking-label">
                      {product.form}
                    </span>
                  )}
                  {product.series && (
                    <span className="px-2 py-0.5 bg-paper border border-mist text-charcoal text-[10px] uppercase tracking-label">
                      {product.series}
                    </span>
                  )}
                  {product.direction && (
                    <span className="px-2 py-0.5 bg-paper border border-mist text-charcoal text-[10px] uppercase tracking-label">
                      {product.direction}
                    </span>
                  )}
                </div>
              )}

              {/* Pricing strip (mirrors the catalogue PDF) */}
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-mist border border-mist mt-6 text-center">
                <div className="bg-white px-3 py-4 col-span-2 sm:col-span-1">
                  <dt className="text-[10px] uppercase tracking-label text-graphite">Original</dt>
                  <dd className="font-display text-h2 text-ink mt-1">
                    {formatPrice(product.sale_price || product.price)}
                  </dd>
                  {product.price_range && (
                    <dd className="text-[11px] text-graphite">{product.price_range}</dd>
                  )}
                </div>
                {product.usd && (
                  <div className="bg-white px-3 py-4">
                    <dt className="text-[10px] uppercase tracking-label text-graphite">International</dt>
                    <dd className="text-charcoal text-small mt-1">{product.usd}</dd>
                  </div>
                )}
                {product.prints && (
                  <div className="bg-white px-3 py-4">
                    <dt className="text-[10px] uppercase tracking-label text-graphite">Fine-art prints</dt>
                    <dd className="text-charcoal text-small mt-1">{product.prints}</dd>
                    <dd className="text-[11px] text-ash">per print</dd>
                  </div>
                )}
                {product.size && (
                  <div className="bg-white px-3 py-4">
                    <dt className="text-[10px] uppercase tracking-label text-graphite">Size</dt>
                    <dd className="text-charcoal text-small mt-1">{product.size}</dd>
                  </div>
                )}
                {product.hours && (
                  <div className="bg-white px-3 py-4">
                    <dt className="text-[10px] uppercase tracking-label text-graphite">Hand-drawn</dt>
                    <dd className="text-charcoal text-small mt-1">{product.hours}</dd>
                  </div>
                )}
                {/* filler keeps the 3-col grid rectangular on desktop */}
                <div className="bg-white hidden sm:block" aria-hidden="true" />
              </dl>

              {product.description && product.description !== product.intent && (
                <p className="mt-6 text-graphite">{product.description}</p>
              )}

              {product.vastu_note && (
                <div className="mt-6 border-l-2 border-mist pl-4 flex gap-3">
                  <Compass size={18} className="text-graphite shrink-0 mt-1" aria-hidden="true" />
                  <p className="text-small text-graphite">{product.vastu_note}</p>
                </div>
              )}

              <hr className="hairline my-8" />

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setShowInterest(true)}>
                  Express interest
                </Button>
                {pdfAvailable && (
                  <Button variant="outline" href={product.pdf_url} download>
                    <Download size={14} aria-hidden="true" /> Catalogue PDF
                  </Button>
                )}
              </div>
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

          {/* You may also like */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-h2 text-ink mb-8">You may also like</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
                {related.map((r) => (
                  <ProductCard key={r.slug} product={r} />
                ))}
              </div>
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
