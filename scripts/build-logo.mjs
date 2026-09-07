/**
 * Rebuilds the PraShree Arts logo from the original high-resolution artwork.
 *
 * The mark is Monica's "Ananda · Smile of Contentment" mandala with a black
 * disc at its centre carrying the Kannada wordmark ಪ್ರಶ್ರೀ. The old logo was a
 * low-resolution scan; this rebuilds it from the 3000 px master so it stays
 * sharp in print.
 *
 * Inputs
 *   images-src/logo-source-mandala.jpg   3000×3000 artwork master (gitignored).
 *     Regenerate with:
 *       pdfimages -all -f 1 -l 1 \
 *         src/assets/artworks/pdf/Ananda-SmileOfContentment_B5_2page.pdf out
 *       (the 3000×3000 JPEG is the artwork; the 431 px one is the old logo)
 *   brand/prashree-kannada-wordmark.svg  wordmark traced from the original logo
 *
 * Run: npm run logo
 */
import sharp from 'sharp'
import { mkdir, readFile, stat } from 'node:fs/promises'

const SOURCE = 'images-src/logo-source-mandala.jpg'
const WORDMARK = 'brand/prashree-kannada-wordmark.svg'

/* Proportions measured from the original logo (431 px master) */
// The original logo's disc measures 0.4872 of the mandala radius, but that
// scan's blur let the sunburst tips bleed past it. 0.46 reproduces the same
// toothed collar around the disc on this sharper master.
const DISC_RATIO = 0.46 // black disc radius ÷ mandala radius
const TEXT_RATIO = 0.776 // wordmark width ÷ disc diameter

const OUTPUTS = [
  { file: 'public/images/logo/prashree-logo-print.png', size: 3000 }, // marketing / print
  { file: 'public/images/logo/prashree-logo.png', size: 1024 }, // web master
  // bundled into the app: the largest on-screen use is the 80px home hero, so
  // 512 is already 3x — the old 1024 cost ~180 kB on every page load
  { file: 'src/assets/logo.png', size: 512 },
  { file: 'public/logo.png', size: 512 }, // favicon + OG fallback
  { file: 'public/images/logo/prashree-logo-192.png', size: 192 }, // small UI
]

try {
  await stat(SOURCE)
} catch {
  console.error(`missing ${SOURCE} — see the header of this script to regenerate it`)
  process.exit(1)
}

/** Centre and radius of the mandala in the scan, from its dark content. */
async function findMandala(buf) {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const dark = (x, y) => data[y * W + x] < 170

  const scanRow = (y) => {
    let lo = -1, hi = -1
    for (let x = 0; x < W; x++) if (dark(x, y)) { if (lo < 0) lo = x; hi = x }
    return [lo, hi]
  }
  const scanCol = (x) => {
    let lo = -1, hi = -1
    for (let y = 0; y < H; y++) if (dark(x, y)) { if (lo < 0) lo = y; hi = y }
    return [lo, hi]
  }

  // average a band of lines through the middle so a stray speck can't skew it
  const xs = [], ys = []
  for (let d = -8; d <= 8; d += 4) {
    const [l, r] = scanRow(Math.round(H / 2) + d)
    if (l >= 0) xs.push([l, r])
    const [t, b] = scanCol(Math.round(W / 2) + d)
    if (t >= 0) ys.push([t, b])
  }
  const avg = (arr, i) => arr.reduce((s, p) => s + p[i], 0) / arr.length
  const left = avg(xs, 0), right = avg(xs, 1), top = avg(ys, 0), bottom = avg(ys, 1)
  return {
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    r: ((right - left) / 2 + (bottom - top) / 2) / 2,
  }
}

const source = await readFile(SOURCE)
const { cx, cy, r } = await findMandala(source)
console.log(`mandala centre ${cx.toFixed(0)},${cy.toFixed(0)} radius ${r.toFixed(0)}`)

// square crop on the mandala, paper lifted to clean white, ink kept deep
const side = Math.round(r * 2)
const square = await sharp(source)
  .extract({
    left: Math.max(0, Math.round(cx - r)),
    top: Math.max(0, Math.round(cy - r)),
    width: side,
    height: side,
  })
  .greyscale()
  .linear(1.18, -14)
  .toBuffer()

const wordmark = await readFile(WORDMARK)
const wordmarkBase = (await sharp(wordmark).metadata()).width // px at 72 dpi
await mkdir('public/images/logo', { recursive: true })

for (const { file, size } of OUTPUTS) {
  const discR = Math.round((size / 2) * DISC_RATIO)
  const textW = Math.round(discR * 2 * TEXT_RATIO)

  const art = await sharp(square).resize(size, size, { kernel: 'lanczos3' }).toBuffer()
  // render the vector wordmark a touch above its final size, then fit exactly
  const density = Math.min(1200, Math.max(72, Math.ceil((72 * textW * 1.4) / wordmarkBase)))
  const text = await sharp(wordmark, { density }).resize({ width: textW }).png().toBuffer()
  const textMeta = await sharp(text).metadata()

  const disc = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${discR}" fill="#0a0a0a"/></svg>`
  )
  // circular alpha mask — transparent outside the mandala, like the original
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#fff"/></svg>`
  )

  const composed = await sharp(art)
    .composite([
      { input: disc },
      {
        input: text,
        left: Math.round((size - textW) / 2),
        top: Math.round((size - textMeta.height) / 2),
      },
    ])
    .toBuffer()

  await sharp(composed)
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 9, palette: true, colours: 128 })
    .toFile(file)

  const { size: bytes } = await stat(file)
  console.log(`${file} — ${size}px, ${(bytes / 1024).toFixed(0)} KB`)
}
