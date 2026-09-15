/**
 * Post-build: writes dist/placement.html — the built SPA shell with the
 * compass page's text (title, heading, the nine direction readings) already
 * inside #root and the right <title>/description/canonical/OG tags, so
 * crawlers that don't run JS can index /placement. vercel.json rewrites
 * /placement to this file; React replaces the static markup on mount.
 * Copy comes from the bundled draft (vastu-profiles.json); admin edits reach
 * crawlers on the next deploy.
 *   npm run build   (runs this automatically)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const SITE = 'https://www.prashreearts.com'
const TITLE = 'Vastu Placement — Find the Wall for Your Artwork | PraShree Arts'
const DESC = "Pick a direction on the compass and see which of Monica Prakash's original artworks belong on that wall, with a one-line reason for each. Vastu placement guidance for mandala and devotional art."
const OG_IMAGE = `${SITE}/images/og-placement.jpg`

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html not found — run vite build first')
  process.exit(1)
}
const profiles = JSON.parse(readFileSync('PraShree-Products-Metadata/vastu-profiles.json', 'utf8'))
  .sort((a, b) => a.sort_order - b.sort_order)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const body = `<main>
<p>Vastu placement</p>
<h1>Which wall are you filling?</h1>
<p>Tap a direction to see what belongs there.</p>
${profiles.map((p) => `<section>
<h2>${esc(p.label)}${p.sanskrit_name ? ` — ${esc(p.sanskrit_name)}` : ''}</h2>
<p>${[p.guardian && `Guardian ${p.guardian}`, p.element && `Element ${p.element}`, p.essence].filter(Boolean).map(esc).join(' · ')}</p>
<p>${esc(p.description)}</p>
<p><a href="/placement?direction=${esc(p.direction.toLowerCase())}">Artworks for the ${esc(p.label.toLowerCase())} wall</a></p>
</section>`).join('\n')}
</main>`

let html = readFileSync('dist/index.html', 'utf8')
const swaps = [
  [/<title>[^<]*<\/title>/, `<title>${esc(TITLE)}</title>`],
  [/(<meta name="description"\s+content=")[^"]*(")/, `$1${esc(DESC)}$2`],
  [/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(TITLE)}$2`],
  [/(<meta property="og:description"\s+content=")[^"]*(")/, `$1${esc(DESC)}$2`],
  [/(<meta property="og:url" content=")[^"]*(")/, `$1${SITE}/placement$2`],
  [/(<meta property="og:image" content=")[^"]*(")/, `$1${OG_IMAGE}$2`],
  [/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}/placement$2`],
]
let applied = 0
for (const [re, rep] of swaps) if (re.test(html)) { html = html.replace(re, rep); applied++ }
// the SPA adds its canonical at runtime (react-helmet); crawlers need it in the static head
if (!/rel="canonical"/.test(html)) {
  html = html.replace('</head>', `  <link rel="canonical" href="${SITE}/placement" />\n</head>`)
  applied++
}
if (!html.includes('<div id="root"></div>')) { console.error('no empty #root in dist/index.html'); process.exit(1) }
html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
writeFileSync('dist/placement.html', html)
console.log(`wrote dist/placement.html (${profiles.length} readings, ${applied}/${swaps.length} head tags swapped)`)
