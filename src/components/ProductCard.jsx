import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { InterestModal } from './InterestForm'
import { formatPrice } from '../lib/format'

/**
 * Artwork card for the catalogue grid. Thumbs come pre-framed with a black
 * border — shown object-contain on paper, no extra border. Product imagery
 * stays untouched (true colours). The whole card links to the detail page;
 * the Enquire button opens the interest modal without following the link.
 */
export default function ProductCard({ product }) {
  const [showInterest, setShowInterest] = useState(false)
  const navigate = useNavigate()

  const pdfFile = product.pdf_url ? product.pdf_url.split('/').pop() : null

  return (
    <>
      <article className="group border border-mist hover:border-ink transition-colors flex flex-col bg-white">
        <Link
          to={`/products/${product.slug}`}
          className="no-underline flex-1 flex flex-col"
        >
          <div className="h-[270px] bg-paper flex items-center justify-center p-4">
            <img
              src={product.images?.[0]}
              alt={product.name}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-display text-xl text-ink leading-snug group-hover:underline decoration-1 underline-offset-4">
              {product.name}
            </h3>
            {product.intent && (
              <p className="text-small text-graphite mt-1">{product.intent}</p>
            )}

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
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

            {/* Meta grid */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 mt-4 text-small">
              {product.size && (
                <>
                  <dt className="uppercase tracking-label text-[10px] text-graphite pt-0.5">Size</dt>
                  <dd className="text-charcoal">{product.size}</dd>
                </>
              )}
              <dt className="uppercase tracking-label text-[10px] text-graphite pt-1.5">Price</dt>
              <dd className="text-charcoal">
                <span className="font-display text-h3 text-ink">
                  {formatPrice(product.sale_price || product.price)}
                </span>
                {product.price_range && (
                  <span className="block text-[11px] text-graphite">
                    ({product.price_range}{product.usd ? ` · ${product.usd}` : ''})
                  </span>
                )}
              </dd>
              {product.prints && (
                <>
                  <dt className="uppercase tracking-label text-[10px] text-graphite pt-0.5">Prints</dt>
                  <dd className="text-charcoal">{product.prints} per print</dd>
                </>
              )}
              {product.hours && (
                <>
                  <dt className="uppercase tracking-label text-[10px] text-graphite pt-0.5">Hours</dt>
                  <dd className="text-charcoal">{product.hours}</dd>
                </>
              )}
              {pdfFile && (
                <>
                  <dt className="uppercase tracking-label text-[10px] text-graphite pt-0.5">PDF</dt>
                  <dd className="break-all text-[11px] text-ash">{pdfFile}</dd>
                </>
              )}
            </dl>
          </div>
        </Link>

        {/* Card footer: enquire without following the card link */}
        <div className="border-t border-mist px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowInterest(true)}
            className="inline-flex items-center gap-1.5 text-small text-ink bg-transparent border-0 cursor-pointer p-0 underline decoration-transparent hover:decoration-ink underline-offset-4 transition-all"
            aria-label={`Express interest in ${product.name}`}
          >
            <MessageCircle size={14} aria-hidden="true" /> Enquire
          </button>
          <button
            onClick={() => navigate(`/products/${product.slug}`)}
            className="text-small text-graphite hover:text-ink bg-transparent border-0 cursor-pointer p-0"
          >
            View →
          </button>
        </div>
      </article>

      <InterestModal
        open={showInterest}
        onClose={() => setShowInterest(false)}
        product={product}
      />
    </>
  )
}
