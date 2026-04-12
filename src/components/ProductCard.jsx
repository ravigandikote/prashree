import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  const placeholderImage = `https://placehold.co/400x400/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`
  const imageUrl = product.images?.[0] || placeholderImage

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="group block no-underline"
      >
        <div className="relative aspect-square overflow-hidden bg-lighter rounded-sm">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Quick add button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-2.5 bg-white text-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} />
          </button>
          {/* Sale badge */}
          {product.sale_price && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 tracking-wider uppercase">
              Sale
            </span>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-display text-base font-semibold text-primary">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {product.sale_price ? (
              <>
                <span className="text-primary font-semibold">
                  &#8377;{product.sale_price.toLocaleString('en-IN')}
                </span>
                <span className="text-muted text-sm line-through">
                  &#8377;{product.price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-primary font-semibold">
                &#8377;{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
