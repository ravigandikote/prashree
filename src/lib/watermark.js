/**
 * Browser-side watermarking for files uploaded from /admin.
 *
 * The committed assets are stamped at build time (scripts/watermark-artworks.mjs
 * and scripts/watermark-pdfs.mjs). Anything Monica uploads from the admin panel
 * never passes through those scripts, so it is stamped here instead — same
 * treatment, so a downloaded artwork or catalogue always carries the credit.
 *
 * Both helpers return a new File; they throw on failure rather than silently
 * uploading an unmarked file (the admin form offers a checkbox to opt out).
 */

const MARK = 'PraShree Arts'
const URL_TEXT = 'prashreearts.com'
const CREDIT = '© PraShree Arts · prashreearts.com · all rights reserved'
const TAG = 'prashree-watermarked'

/** Longest edge kept for uploaded artwork photos (keeps pages light). */
const MAX_EDGE = 2000
const JPEG_QUALITY = 0.86

/* ────────────────────────────── images ────────────────────────────── */

/**
 * Draws the tiled diagonal wordmark + bottom credit bar over an image and
 * returns a JPEG File. Mirrors the overlay in scripts/watermark-artworks.mjs.
 */
export async function watermarkImage(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const fontSize = Math.max(11, Math.round(w / 26))
  const stepY = Math.round(Math.max(w, h) / 3.2)
  const stepX = Math.round(stepY * 1.9)

  // Tile in a rotated frame so the repeats stay parallel; the frame is drawn
  // oversized (±1 canvas) so no corner is left bare after the rotation.
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((-30 * Math.PI) / 180)
  ctx.font = `${fontSize}px Georgia, "Times New Roman", serif`
  const reach = Math.max(w, h)
  for (let y = -reach; y < reach; y += stepY) {
    for (let x = -reach; x < reach; x += stepX) {
      // paired light/dark passes so the mark reads on ink and on paper alike
      ctx.fillStyle = 'rgba(255,255,255,0.20)'
      ctx.fillText(MARK, x, y)
      ctx.fillStyle = 'rgba(0,0,0,0.13)'
      ctx.fillText(MARK, x + 1, y + 1)
    }
  }
  ctx.restore()

  const creditSize = Math.max(10, Math.round(w / 34))
  const barHeight = creditSize * 2.4
  ctx.fillStyle = 'rgba(0,0,0,0.42)'
  ctx.fillRect(0, h - barHeight, w, barHeight)
  ctx.font = `${creditSize}px Georgia, "Times New Roman", serif`
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.textAlign = 'left'
  ctx.fillText(`© ${MARK}`, creditSize * 0.9, h - creditSize * 0.85)
  ctx.font = `${Math.round(creditSize * 0.85)}px Helvetica, Arial, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.textAlign = 'right'
  ctx.fillText(URL_TEXT, w - creditSize * 0.9, h - creditSize * 0.85)

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  )
  if (!blob) throw new Error('Could not render the watermark onto this image.')

  const name = file.name.replace(/\.[^.]+$/, '') || 'artwork'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}

/* ─────────────────────────────── PDFs ─────────────────────────────── */

/**
 * Stamps every page of a catalogue PDF. Already-stamped files (tagged in the
 * PDF keywords, as the build script does) are returned untouched, so a
 * re-upload can never double-stamp. pdf-lib is imported lazily — it is only
 * ever needed inside the admin panel.
 */
export async function watermarkPdf(file) {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib')
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })

  if ((doc.getKeywords() || '').includes(TAG)) return file

  const font = await doc.embedFont(StandardFonts.TimesRoman)
  const sans = await doc.embedFont(StandardFonts.Helvetica)

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const size = Math.max(14, Math.min(width, height) / 22)
    const stepX = size * 12
    const stepY = size * 7

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
  const bytes = await doc.save({ useObjectStreams: true })
  return new File([bytes], file.name, { type: 'application/pdf' })
}
