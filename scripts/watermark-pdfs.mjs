/**
 * Stamps the catalogue PDFs in public/catalogues/ with Monica's watermark —
 * a light diagonal wordmark across every page plus a footer credit — so a
 * downloaded catalogue still carries the attribution.
 *
 * Run:  npm run watermark:pdfs
 * Idempotent: each stamped file is tagged in its PDF keywords and skipped
 * on later runs, so it can never be double-stamped.
 */
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DIR = 'public/catalogues'
const TAG = 'prashree-watermarked'
const MARK = 'PraShree Arts'
const CREDIT = '© PraShree Arts · prashreearts.com · all rights reserved'

const files = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith('.pdf'))
let stamped = 0
let skipped = 0

for (const file of files) {
  const full = path.join(DIR, file)
  const doc = await PDFDocument.load(await readFile(full), { ignoreEncryption: true })

  if ((doc.getKeywords() || '').includes(TAG)) { skipped++; continue }

  const font = await doc.embedFont(StandardFonts.TimesRoman)
  const sans = await doc.embedFont(StandardFonts.Helvetica)

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const size = Math.max(14, Math.min(width, height) / 22)
    const stepX = size * 12
    const stepY = size * 7

    // diagonal wordmark, tiled across the page
    for (let y = -height * 0.2; y < height * 1.3; y += stepY) {
      for (let x = -width * 0.3; x < width * 1.2; x += stepX) {
        page.drawText(MARK, {
          x, y, size, font,
          color: rgb(0.45, 0.45, 0.45),
          opacity: 0.11,
          rotate: degrees(30),
        })
      }
    }

    // footer credit
    const creditSize = Math.max(7, Math.min(width, height) / 62)
    page.drawText(CREDIT, {
      x: (width - sans.widthOfTextAtSize(CREDIT, creditSize)) / 2,
      y: creditSize * 1.2,
      size: creditSize,
      font: sans,
      color: rgb(0.25, 0.25, 0.25),
      opacity: 0.65,
    })
  }

  doc.setKeywords([TAG])
  doc.setProducer('PraShree Arts')
  await writeFile(full, await doc.save({ useObjectStreams: true }))
  stamped++
}

console.log(`watermarked ${stamped} PDFs (${skipped} already stamped)`)
