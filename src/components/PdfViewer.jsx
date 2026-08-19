import { FileText, Download } from 'lucide-react'

/**
 * Embedded PDF viewer with a download fallback. <object> renders inline where
 * the browser supports it (desktop); elsewhere (e.g. iOS Safari) the fallback
 * content inside the object is shown. The download link is always offered.
 */
export default function PdfViewer({ url, title = 'Catalogue' }) {
  if (!url) return null
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
