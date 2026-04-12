import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function GalleryGrid({ images = [] }) {
  const [selected, setSelected] = useState(null)

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p>No gallery images yet. Check back soon.</p>
      </div>
    )
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, i) => (
          <motion.div
            key={img.id || i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="break-inside-avoid"
          >
            <button
              onClick={() => setSelected(img)}
              className="w-full cursor-pointer border-0 p-0 bg-transparent"
            >
              <img
                src={img.image_url}
                alt={img.title || 'Gallery image'}
                loading="lazy"
                className="w-full rounded-sm grayscale-hover hover:shadow-lg transition-shadow duration-300"
              />
            </button>
            {img.title && (
              <p className="text-sm text-muted mt-1 text-center">{img.title}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer bg-transparent border-0"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selected.image_url}
              alt={selected.title || 'Gallery image'}
              className="max-w-full max-h-[85vh] object-contain rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
            {selected.title && (
              <p className="absolute bottom-8 left-0 right-0 text-center text-white text-lg font-display">
                {selected.title}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
