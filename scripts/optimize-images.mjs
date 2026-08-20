/**
 * Generates web-optimized derivatives from camera originals in images-src/
 * into public/images/, organized per the site's image map. Run after adding
 * new originals:  node scripts/optimize-images.mjs
 *
 * Output: <name>-{800,1600,2400}.jpg (long edge, never enlarged), mozjpeg q78.
 */
import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'images-src'
const OUT = 'public/images'
const WIDTHS = [800, 1600, 2400]

// original filename -> destination + watermark removal crop (verified per image).
// cropTop removes a top-corner watermark without touching faces; cropLeft is
// used instead where the watermark vertically overlaps Monica's head
// (1958, 4718) but sits in the left ~16% of the frame.
// Set both to 0 for clean originals (DSC07336, IMG_5730).
const MAP = {
  '20250620-IMG_1958.jpg': { dest: 'monica/portraits', cropTop: 0, cropLeft: 0.18 },
  '20250620-IMG_1984.jpg': { dest: 'monica/portraits', cropTop: 0.185 },
  '20250620-IMG_1998.jpg': { dest: 'monica/portraits', cropTop: 0.175 },
  '20250620-IMG_2199.jpg': { dest: 'monica/portraits', cropTop: 0.175 },
  '20250620-IMG_2208.jpg': { dest: 'monica/portraits', cropTop: 0.175 },
  '20250831-IMG_1132.jpg': { dest: 'monica/portraits', cropTop: 0.14 },
  '20251227-IMG_7387.jpg': { dest: 'monica/portraits', cropTop: 0.16 },
  '20250828-IMG_0812.jpg': { dest: 'monica/portraits', cropTop: 0, cropLeft: 0.24 },
  '20250918-IMG_1516.jpg': { dest: 'monica/portraits', cropTop: 0, cropLeft: 0.24 },
  '20251118-IMG_1862-2.jpg': { dest: 'monica/portraits', cropTop: 0, cropLeft: 0.26 },
  // studio portrait before the framed mandala wall — clean, no watermark
  'IMG20260819191222.jpg': { dest: 'monica/portraits', cropTop: 0 },
  '20251227-IMG_7529.jpg': { dest: 'monica/teaching', cropTop: 0.1 },
  '20251227-IMG_7546.jpg': { dest: 'monica/teaching', cropTop: 0.11 },
  '20250828-IMG_4718.jpg': { dest: 'monica/decor', cropTop: 0, cropLeft: 0.16 },
  // future: 'DSC07336.jpeg': { dest: 'monica/portraits', cropTop: 0 },
  // future: 'IMG_5730.JPG': { dest: 'connections', cropTop: 0 },
}

for (const [file, { dest, cropTop = 0, cropLeft = 0 }] of Object.entries(MAP)) {
  const src = path.join(SRC, file)
  try { await stat(src) } catch { console.log(`skip (missing): ${file}`); continue }

  const dir = path.join(OUT, dest)
  await mkdir(dir, { recursive: true })
  const base = path.parse(file).name
  const meta = await sharp(src).metadata()
  // after rotate() EXIF orientation is applied; swap dims for rotated portraits
  const rotated = (meta.orientation || 1) >= 5
  const fullW = rotated ? meta.height : meta.width
  const fullH = rotated ? meta.width : meta.height
  const top = Math.round(fullH * cropTop)
  const left = Math.round(fullW * cropLeft)
  const cropH = fullH - top
  const cropW = fullW - left
  const longEdge = Math.max(cropW, cropH)

  for (const w of WIDTHS) {
    const target = Math.min(w, longEdge) // never enlarge small originals
    const outFile = path.join(dir, `${base}-${w}.jpg`)
    try { await stat(outFile); continue } catch { /* build it */ }
    const resize = cropW >= cropH ? { width: target } : { height: target }
    await sharp(src)
      .rotate()
      .extract({ left, top, width: cropW, height: cropH })
      .resize(resize)
      .jpeg({ quality: 78, mozjpeg: true, progressive: true })
      .toFile(outFile)
    console.log(`wrote ${outFile}`)
  }
}
console.log('done')
