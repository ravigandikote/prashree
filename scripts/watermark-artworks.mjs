/**
 * Stamps Monica's watermark into the artwork images that ship on the site,
 * so a right-click-save carries the credit with it.
 *
 *   source: PraShree-Products-Metadata/thumbs/<id>.jpg   (clean masters, committed)
 *   output: public/images/products/thumbs/<id>.jpg       (watermarked, served)
 *
 * Run after adding artwork images:  npm run watermark:images
 * Re-running is safe — output is always rebuilt from the clean master.
 */
import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'PraShree-Products-Metadata/thumbs'
const OUT = 'public/images/products/thumbs'
const MARK = 'PraShree Arts'
const URL_TEXT = 'prashreearts.com'

/** Diagonal repeating wordmark + a corner credit, as an SVG overlay. */
function overlaySvg(w, h) {
  const step = Math.round(Math.max(w, h) / 3.2) // spacing between repeats
  const fontSize = Math.max(11, Math.round(w / 26))
  const rows = []
  for (let y = -h; y < h * 2; y += step) {
    for (let x = -w; x < w * 2; x += Math.round(step * 1.9)) {
      // paired light/dark passes so the mark reads on ink and on paper alike
      rows.push(
        `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="${fontSize}" fill="#ffffff" fill-opacity="0.20" transform="rotate(-30 ${x} ${y})">${MARK}</text>` +
        `<text x="${x + 1}" y="${y + 1}" font-family="Georgia, serif" font-size="${fontSize}" fill="#000000" fill-opacity="0.13" transform="rotate(-30 ${x + 1} ${y + 1})">${MARK}</text>`
      )
    }
  }
  const creditSize = Math.max(10, Math.round(w / 34))
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      ${rows.join('')}
      <rect x="0" y="${h - creditSize * 2.4}" width="${w}" height="${creditSize * 2.4}" fill="#000000" fill-opacity="0.42"/>
      <text x="${Math.round(creditSize * 0.9)}" y="${h - creditSize * 0.85}" font-family="Georgia, serif" font-size="${creditSize}" fill="#ffffff" fill-opacity="0.92">© ${MARK}</text>
      <text x="${w - Math.round(creditSize * 0.9)}" y="${h - creditSize * 0.85}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(creditSize * 0.85)}" letter-spacing="1" fill="#ffffff" fill-opacity="0.82">${URL_TEXT}</text>
    </svg>`
  )
}

await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f))
let done = 0

for (const file of files) {
  const src = path.join(SRC, file)
  const { width, height } = await sharp(src).metadata()
  await sharp(src)
    .composite([{ input: overlaySvg(width, height), top: 0, left: 0 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT, file.replace(/\.png$/i, '.jpg')))
  done++
}

console.log(`watermarked ${done} artwork images → ${OUT}`)
