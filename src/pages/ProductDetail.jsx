import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Minus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { LoadingSpinner, EmptyState } from '../components/UI'
import RazorpayButton from '../components/RazorpayButton'
import { useCart } from '../context/CartContext'
import { getProductBySlug } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setLoading(true)
    getProductBySlug(slug)
      .then((data) => setProduct(data))
      .catch(() => {
        // Fallback for demo
        setProduct({
          id: slug,
          name: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug,
          description: 'A beautiful handcrafted art piece by Monica Prakash. Each creation is unique and crafted with intention, reflecting the therapeutic philosophy of PraShree Arts.',
          price: 2500,
          images: [`https://placehold.co/800x800/1a1a1a/ffffff?text=${encodeURIComponent(slug)}`],
          categories: { name: 'Art', slug: 'art' },
        })
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSpinner />
  if (!product) return <EmptyState title="Product Not Found" message="This product doesn't exist." />

  const images = product.images?.length
    ? product.images
    : [`https://placehold.co/800x800/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`]

  const currentPrice = product.sale_price || product.price

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `Buy ${product.name} from PraShree Arts.`}
        path={`/products/${slug}`}
      />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link to="/categories" className="hover:text-primary no-underline text-muted transition-colors">
              Categories
            </Link>
            <span>/</span>
            {product.categories && (
              <>
                <Link
                  to={`/categories/${product.categories.slug}`}
                  className="hover:text-primary no-underline text-muted transition-colors"
                >
                  {product.categories.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-primary">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Image viewer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-square bg-lighter rounded-sm overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors cursor-pointer p-0 ${selectedImage === i ? 'border-primary' : 'border-border'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              {product.categories && (
                <Link
                  to={`/categories/${product.categories.slug}`}
                  className="text-muted text-sm tracking-wider uppercase no-underline hover:text-primary transition-colors"
                >
                  {product.categories.name}
                </Link>
              )}

              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-semibold text-primary">
                  &#8377;{currentPrice.toLocaleString('en-IN')}
                </span>
                {product.sale_price && (
                  <span className="text-lg text-muted line-through">
                    &#8377;{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-6 text-muted leading-relaxed">
                {product.description}
              </p>

              {/* Divider */}
              <div className="h-px bg-border my-8" />

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-secondary">Quantity</span>
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-lighter transition-colors cursor-pointer bg-transparent border-0"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-lighter transition-colors cursor-pointer bg-transparent border-0"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-6 border border-primary text-primary font-medium tracking-wide hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>

                <RazorpayButton
                  amount={currentPrice * quantity}
                  customerName=""
                  customerEmail=""
                  customerPhone=""
                  label="Buy Now"
                />
              </div>

              {/* Info */}
              <div className="mt-8 space-y-3 text-sm text-muted">
                <p>All artworks are handcrafted by Monica Prakash</p>
                <p>Delivery within 7-14 business days</p>
                <p>Custom sizes available on request</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
