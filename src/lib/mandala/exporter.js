/**
 * Export: builds clean SVG markup from studio state (pure, testable),
 * then wraps it as vector PDF (jsPDF + svg2pdf), PNG at 300 DPI, or raw SVG.
 * Everything stays in millimetres so prints at 100% are true to size.
 */
import { pointAt, sectorAngles } from './geometry'

export const GUIDE_STROKE = '#c9c9c9'
export const GUIDE_WIDTH = 0.2 // mm

/** Pure SVG document for the current state. `includeGuides` keeps or drops construction guides. */
export function buildSvgMarkup(state, { includeGuides = true } = {}) {
  const { paper, margin, centre, rings, lines, guides } = state
  const parts = []

  if (includeGuides) {
    if (guides.margin && margin > 0) {
      parts.push(
        `<rect x="${margin}" y="${margin}" width="${paper.w - 2 * margin}" height="${paper.h - 2 * margin}" fill="none" stroke="${GUIDE_STROKE}" stroke-width="0.15" stroke-dasharray="2 2"/>`
      )
    }
    if (guides.circles) {
      for (const r of rings.radii) {
        parts.push(
          `<circle cx="${centre.x}" cy="${centre.y}" r="${r}" fill="none" stroke="${GUIDE_STROKE}" stroke-width="${GUIDE_WIDTH}"/>`
        )
      }
    }
    if (guides.lines) {
      const rInner = rings.radii[lines.innerRing] ?? 0
      const rOuter = rings.radii[lines.outerRing] ?? 0
      if (rOuter > 0) {
        for (const a of sectorAngles(lines.sectors, lines.offset)) {
          const p1 = pointAt(centre, rInner, a)
          const p2 = pointAt(centre, rOuter, a)
          parts.push(
            `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${GUIDE_STROKE}" stroke-width="${GUIDE_WIDTH}"/>`
          )
        }
      }
    }
    if (guides.centre) {
      parts.push(`<circle cx="${centre.x}" cy="${centre.y}" r="1" fill="#0a0a0a"/>`)
    }
  }

  // artwork layer (pattern fills) — populated from Phase 4 onward
  if (state.artworkMarkup) parts.push(state.artworkMarkup)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${paper.w}mm" height="${paper.h}mm" viewBox="0 0 ${paper.w} ${paper.h}">` +
    `<rect width="${paper.w}" height="${paper.h}" fill="#ffffff"/>` +
    parts.join('') +
    `</svg>`
  )
}

export function exportFilename(state, ext) {
  const name = (state.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `prashree-mandala-${name || 'untitled'}-${date}.${ext}`
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function downloadSvg(state, opts) {
  const markup = buildSvgMarkup(state, opts)
  triggerDownload(new Blob([markup], { type: 'image/svg+xml' }), exportFilename(state, 'svg'))
}

/** Vector PDF at the exact paper size — a 50 mm ring prints at 50 mm. */
export async function downloadPdf(state, opts) {
  const [{ jsPDF }] = await Promise.all([import('jspdf'), import('svg2pdf.js')])
  const { paper } = state
  const doc = new jsPDF({
    unit: 'mm',
    format: [paper.w, paper.h],
    orientation: paper.w > paper.h ? 'landscape' : 'portrait',
    compress: true,
  })
  const markup = buildSvgMarkup(state, opts)
  const el = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  await doc.svg(el, { x: 0, y: 0, width: paper.w, height: paper.h })
  doc.save(exportFilename(state, 'pdf'))
}

/** PNG rasterised at 300 DPI. */
export async function downloadPng(state, opts) {
  const { paper } = state
  const markup = buildSvgMarkup(state, opts)
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('SVG rasterisation failed'))
      img.src = url
    })
    const scale = 300 / 25.4 // px per mm at 300 DPI
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(paper.w * scale)
    canvas.height = Math.round(paper.h * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    triggerDownload(blob, exportFilename(state, 'png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}
