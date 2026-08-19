/**
 * Site-wide photo wrapper enforcing one consistent image treatment:
 *  - "grayscale": grayscale at rest, colour on hover (portfolio/About grids)
 *  - "duotone":   soft warm-grey duotone (hero and décor imagery)
 *  - "plain":     untouched (product photos — customers see true colours)
 *
 * `base` builds a srcset from the optimize-images.mjs derivatives
 * (`${base}-800.jpg` … `-2400.jpg`); plain `src` also works.
 * `position` (CSS object-position) crops watermarked originals so the
 * top-left watermark falls outside the frame — never stretch or blur it.
 */
const WIDTHS = [800, 1600, 2400]

export default function Photo({
  base,
  src,
  alt,
  treatment = 'grayscale',
  aspect,            // e.g. 'aspect-[3/4]'
  position,          // e.g. 'center 30%'
  sizes = '100vw',
  priority = false,
  className = '',
  imgClassName = '',
}) {
  const treatClass =
    treatment === 'grayscale' ? 'treat-grayscale'
    : treatment === 'duotone' ? 'treat-duotone'
    : ''

  const srcSet = base ? WIDTHS.map((w) => `${base}-${w}.jpg ${w}w`).join(', ') : undefined
  const resolvedSrc = src || (base ? `${base}-1600.jpg` : undefined)

  return (
    <div className={`overflow-hidden bg-paper ${aspect || ''} ${className}`}>
      <img
        src={resolvedSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className={`h-full w-full object-cover ${treatClass} ${imgClassName}`}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  )
}
