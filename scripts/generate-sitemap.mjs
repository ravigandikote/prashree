/**
 * Regenerates public/sitemap.xml: static routes + one URL per artwork in
 * PraShree-Products-Metadata/items.json. Run after adding artworks or routes:
 *   npm run seo:sitemap
 * (Published blog posts live only in the DB; list them here manually or
 * extend this script once posts exist.)
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://www.prashreearts.com'
const items = JSON.parse(readFileSync('PraShree-Products-Metadata/items.json', 'utf8'))

const staticRoutes = [
  { path: '/', priority: '1.0' },
  { path: '/products', priority: '0.9' },
  { path: '/about', priority: '0.8' },
  { path: '/learn', priority: '0.8' },
  { path: '/workshops', priority: '0.8' },
  { path: '/contact', priority: '0.7' },
  { path: '/studio', priority: '0.7' },
  { path: '/blog', priority: '0.6' },
  { path: '/sacred-geometry', priority: '0.5' },
]

const today = new Date().toISOString().slice(0, 10)
const url = (loc, priority) =>
  `  <url><loc>${SITE}${loc}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((r) => url(r.path, r.priority)),
  ...items.map((i) => url(`/products/${i.id}`, '0.8')),
  '</urlset>',
].join('\n')

writeFileSync('public/sitemap.xml', xml + '\n')
console.log(`sitemap: ${staticRoutes.length} routes + ${items.length} artworks`)
