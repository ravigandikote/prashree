import { Helmet } from 'react-helmet-async'

export default function SEO({
  title,
  description = 'PraShree Arts – Handcrafted Mandala Art, Janur Art, Home Décor & Therapeutic Art Workshops by Monica Prakash.',
  path = '',
}) {
  const siteUrl = 'https://prashreearts.com'
  const fullTitle = title
    ? `${title} | PraShree Arts`
    : 'PraShree Arts – Mandala Art Therapy by Monica Prakash'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${siteUrl}${path}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteUrl}${path}`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
