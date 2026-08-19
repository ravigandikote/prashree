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

// original filename -> destination folder under public/images/
const MAP = {
  '20250620-IMG_1958.jpg': 'monica/portraits',
  '20250620-IMG_1984.jpg': 'monica/portraits',
  '20250620-IMG_1998.jpg': 'monica/portraits',
  '20250620-IMG_2199.jpg': 'monica/portraits',
  '20250620-IMG_2208.jpg': 'monica/portraits',
  '20250831-IMG_1132.jpg': 'monica/portraits',
  '20251227-IMG_7387.jpg': 'monica/portraits',
  '20250828-IMG_0812.jpg': 'monica/portraits',
  '20250918-IMG_1516.jpg': 'monica/portraits',
  '20251118-IMG_1862-2.jpg': 'monica/portraits',
  '20251227-IMG_7529.jpg': 'monica/teaching',
  '20251227-IMG_7546.jpg': 'monica/teaching',
  '20250828-IMG_4718.jpg': 'monica/decor',
  // future: 'DSC07336.jpeg': 'monica/portraits',
  // future: 'IMG_5730.JPG': 'connections',
}

for (const [file, dest] of Object.entries(MAP)) {
  const src = path.join(SRC, file)
  try { await stat(src) } catch { console.log(`skip (missing): ${file}`); continue }

  const dir = path.join(OUT, dest)
  await mkdir(dir, { recursive: true })
  const base = path.parse(file).name
  const meta = await sharp(src).metadata()
  const longEdge = Math.max(meta.width, meta.height)

  for (const w of WIDTHS) {
    if (w > longEdge) continue
    const outFile = path.join(dir, `${base}-${w}.jpg`)
    try { await stat(outFile); continue } catch { /* build it */ }
    const resize = meta.width >= meta.height ? { width: w } : { height: w }
    await sharp(src).rotate().resize(resize).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(outFile)
    console.log(`wrote ${outFile}`)
  }
}
console.log('done')
