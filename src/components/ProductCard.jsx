import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Photo from './Photo'
import { formatPrice } from '../lib/format'

/* Neutral local placeholder — shown until real product photos are uploaded */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f7f6f3"/><circle cx="200" cy="200" r="90" fill="none" stroke="#d4d2cc" stroke-width="1.5"/><circle cx="200" cy="200" r="60" fill="none" stroke="#d4d2cc" stroke-width="1"/><circle cx="200" cy="200" r="30" fill="none" stroke="#d4d2cc" stroke-width="1"/></svg>'
  )

export default function ProductCard({ product, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={`/products/${product.slug}`} className="group block no-underline">
        {/* Product photos stay untouched (treatment: plain) so customers see true colours */}
        <Photo
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.name}
          treatment="plain"
          aspect="aspect-square"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          imgClassName="group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="mt-4">
          {product.categories?.name && (
            <p className="text-small uppercase tracking-label text-ash">
              {product.categories.name}
            </p>
          )}
          <h3 className="font-display text-h3 text-ink mt-1 group-hover:underline decoration-1 underline-offset-4">
            {product.name}
          </h3>
          <p className="text-charcoal mt-1">
            {formatPrice(product.sale_price || product.price)}
            {product.sale_price ? (
              <span className="text-ash text-small line-through ml-2">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
