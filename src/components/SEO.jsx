import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://prashreearts.com'

const DEFAULT_KEYWORDS = [
  'mandala art', 'hand-drawn mandala', 'black and white mandala',
  'mandala wall art', 'mandala art therapy', 'Janur art', 'coconut leaf art',
  'sacred geometry art', 'Vastu wall art', 'art workshops Bengaluru',
  'handmade art India', 'Monica Prakash', 'PraShree Arts',
]

export default function SEO({
  title,
  description = 'Hand-drawn mandala art, Janur (coconut-leaf) art, art therapy workshops, and bespoke handmade artworks by Monica Prakash — PraShree Arts, Bengaluru.',
  path = '',
  image = '/images/og-image.jpg',
  keywords = [],
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title
    ? `${title} | PraShree Arts`
    : 'PraShree Arts — Hand-Drawn Mandala Art, Janur Art & Art Therapy | Bengaluru'
  const kw = [...new Set([...keywords, ...DEFAULT_KEYWORDS])].join(', ')

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={kw} />
      <link rel="canonical" href={`${SITE_URL}${path}`} />
      <meta property="og:site_name" content="PraShree Arts" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}${path}`} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
