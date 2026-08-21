import { useState } from 'react'
import { Download, FileText, Image as ImageIcon, PenTool } from 'lucide-react'
import Button from '../Button'
import { downloadPdf, downloadPng, downloadSvg } from '../../lib/mandala/exporter'

/**
 * Export at any stage. The guides-only base is a first-class outcome:
 * print at 100% and continue by hand with pen.
 */
export default function ExportDialog({ open, onClose, state }) {
  const [includeGuides, setIncludeGuides] = useState(true)
  const [busy, setBusy] = useState(null)

  if (!open) return null

  const run = async (kind, fn) => {
    setBusy(kind)
    try {
      await fn(state, { includeGuides })
    } catch {
      /* download cancelled or unsupported */
    } finally {
      setBusy(null)
    }
  }

  const hasArt = Object.keys(state.fills || {}).length > 0

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Download your mandala"
      onClick={onClose}
    >
      <div className="bg-white w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <p className="text-small uppercase tracking-label text-graphite">Download</p>
        <h2 className="font-display text-h2 text-ink mt-1">
          {hasArt ? 'Your mandala, as it stands' : 'Your base, ready for the pen'}
        </h2>

        <p className="text-small text-graphite mt-4 flex gap-2">
          <PenTool size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Print at <strong>100% scale</strong> and the guides are true to
            size — a 50 mm ring measures exactly 50 mm on paper. Many artists
            stop here on purpose: print the base and fill the rings by hand.
          </span>
        </p>

        <div className="mt-6 space-y-2">
          <p className="text-[10px] uppercase tracking-label text-graphite">Construction guides</p>
          <label className="flex items-center gap-2 text-small text-charcoal cursor-pointer">
            <input
              type="radio" name="guides" checked={includeGuides}
              onChange={() => setIncludeGuides(true)}
            />
            Include guides (light grey — for printing and practising)
          </label>
          <label className="flex items-center gap-2 text-small text-charcoal cursor-pointer">
            <input
              type="radio" name="guides" checked={!includeGuides}
              onChange={() => setIncludeGuides(false)}
            />
            Hide guides (clean final artwork)
          </label>
        </div>

        <p className="text-small text-ash mt-4">
          Paper: {state.paper.w} × {state.paper.h} mm · vector output
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => run('pdf', downloadPdf)} disabled={!!busy}>
            <FileText size={14} aria-hidden="true" />
            {busy === 'pdf' ? 'Preparing PDF…' : 'Download PDF (print-ready)'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => run('png', downloadPng)} disabled={!!busy}>
              <ImageIcon size={14} aria-hidden="true" /> PNG · 300 DPI
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => run('svg', downloadSvg)} disabled={!!busy}>
              <Download size={14} aria-hidden="true" /> SVG
            </Button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-small text-graphite hover:text-ink bg-transparent border-0 cursor-pointer p-0 underline underline-offset-4 decoration-transparent hover:decoration-ink transition-all"
        >
          Back to the drafting table
        </button>
      </div>
    </div>
  )
}
