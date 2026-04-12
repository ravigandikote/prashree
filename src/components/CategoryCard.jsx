import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CategoryCard({ category, index = 0 }) {
  const placeholderImage = `https://placehold.co/600x400/1a1a1a/ffffff?text=${encodeURIComponent(category.name)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/categories/${category.slug}`}
        className="group block no-underline"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-lighter rounded-sm">
          <img
            src={category.image_url || placeholderImage}
            alt={category.name}
            loading="lazy"
            className="w-full h-full object-cover grayscale-hover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
            <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-xs tracking-wider uppercase">
                Explore Collection
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-display text-lg font-semibold text-primary group-hover:text-accent transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-muted text-sm mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
