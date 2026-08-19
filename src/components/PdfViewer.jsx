import { FileText, Download } from 'lucide-react'
import { usePdfAvailable } from '../lib/usePdfAvailable'

/**
 * Embedded PDF viewer with a download fallback. <object> renders inline where
 * the browser supports it (desktop); elsewhere (e.g. iOS Safari) the fallback
 * content inside the object is shown. Renders a quiet note until the file
 * really exists (see usePdfAvailable).
 */
export default function PdfViewer({ url, title = 'Catalogue' }) {
  const available = usePdfAvailable(url)
  if (!url || available === null) return null
  if (!available) {
    return (
      <p className="text-small text-ash border border-mist bg-paper px-4 py-3 inline-flex items-center gap-2">
        <FileText size={14} aria-hidden="true" /> The catalogue PDF for this piece will be available soon.
      </p>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-small uppercase tracking-label text-graphite flex items-center gap-2">
          <FileText size={14} aria-hidden="true" /> {title}
        </p>
        <a
          href={url}
          download
          className="inline-flex items-center gap-1.5 text-small text-ink underline decoration-transparent hover:decoration-ink underline-offset-4 transition-all no-underline"
        >
          <Download size={14} aria-hidden="true" /> Download PDF
        </a>
      </div>
      <object
        data={url}
        type="application/pdf"
        className="w-full h-[70vh] min-h-[420px] border border-mist bg-paper"
        aria-label={title}
      >
        <div className="p-8 text-center">
          <p className="text-graphite">
            Your browser can&apos;t display the PDF here.
          </p>
          <a href={url} download className="text-ink underline underline-offset-4 mt-2 inline-block">
            Download {title}
          </a>
        </div>
      </object>
    </div>
  )
}
