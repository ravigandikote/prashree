import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, FileText, Star, ExternalLink } from 'lucide-react'
import {
  getAllProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadFile,
} from '../../lib/supabase'
import { watermarkImage, watermarkPdf } from '../../lib/watermark'
import { fallbackArtworks } from '../../data/artworks'
import { inputClasses } from './adminUi'
import toast from 'react-hot-toast'

/* Everything an artwork needs is editable here — nothing about a new piece
   should require a code change or a file dropped into the repo. Photos and
   the catalogue PDF upload straight to Supabase Storage (bucket `products`),
   watermarked in the browser on the way up. */

const BUCKET = 'products'

const DIRECTIONS = [
  'East', 'West', 'North', 'South',
  'North-East', 'North-West', 'South-East', 'South-West', 'Centre',
]

const EMPTY = {
  name: '', slug: '', description: '', price: '', sale_price: '', category_id: '',
  pdf_url: '', vastu_note: '', size: '', size_code: '', price_range: '', usd: '',
  prints: '', hours: '', series: '', form: '', intent: '', direction: '',
  is_featured: false, is_available: true, is_sold: false,
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Distinct values for a field across the catalogue — feeds the datalists so
    new pieces reuse the exact wording the /products filters group by. */
function suggestions(products, field) {
  const all = [...products, ...fallbackArtworks].map((p) => p[field]).filter(Boolean)
  return [...new Set(all)].sort((a, b) => a.localeCompare(b))
}

/** Field wrapper: label, optional hint saying where the value shows on the site. */
function Row({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs text-graphite mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-ash mt-1">{hint}</p>}
    </div>
  )
}

function Section({ title, note, children }) {
  return (
    <fieldset className="border border-mist p-4">
      <legend className="px-2 text-[10px] uppercase tracking-label text-graphite">
        {title}
      </legend>
      {note && <p className="text-[11px] text-ash mb-3 -mt-1">{note}</p>}
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [images, setImages] = useState([])        // URLs already saved on the row
  const [imageFiles, setImageFiles] = useState([]) // picked, not yet uploaded
  const [pdfFile, setPdfFile] = useState(null)
  const [watermarkUploads, setWatermarkUploads] = useState(true)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState('')

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const loadData = () => {
    Promise.all([getAllProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods || [])
        setCategories(cats || [])
      })
      .catch(() => { })
  }

  useEffect(() => { loadData() }, [])

  const formOptions = useMemo(() => suggestions(products, 'form'), [products])
  const seriesOptions = useMemo(() => suggestions(products, 'series'), [products])
  const sizeOptions = useMemo(() => suggestions(products, 'size'), [products])
  const sizeCodeOptions = useMemo(() => suggestions(products, 'size_code'), [products])

  const resetForm = () => {
    setForm(EMPTY)
    setImages([])
    setImageFiles([])
    setPdfFile(null)
    setWatermarkUploads(true)
    setEditing(null)
    setShowForm(false)
    setProgress('')
  }

  const openNew = () => { resetForm(); setShowForm(true) }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price?.toString() || '',
      sale_price: product.sale_price?.toString() || '',
      category_id: product.category_id || '',
      pdf_url: product.pdf_url || '',
      vastu_note: product.vastu_note || '',
      size: product.size || '',
      size_code: product.size_code || '',
      price_range: product.price_range || '',
      usd: product.usd || '',
      prints: product.prints || '',
      hours: product.hours || '',
      series: product.series || '',
      form: product.form || '',
      intent: product.intent || '',
      direction: product.direction || '',
      is_featured: product.is_featured,
      is_available: product.is_available,
      is_sold: product.is_sold || false,
    })
    setImages(product.images || [])
    setImageFiles([])
    setPdfFile(null)
    setWatermarkUploads(true)
    setShowForm(true)
  }

  /** Vastu note follows the direction unless Monica has written her own. */
  const handleDirection = (direction) => {
    const auto = (d) => (d ? `Primary Vastu direction: ${d}` : '')
    set({
      direction,
      vastu_note:
        !form.vastu_note || form.vastu_note === auto(form.direction)
          ? auto(direction)
          : form.vastu_note,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const slug = form.slug || slugify(form.name)
      let nextImages = [...images]
      let pdfUrl = form.pdf_url || null

      for (const [i, file] of imageFiles.entries()) {
        setProgress(`Uploading photo ${i + 1} of ${imageFiles.length}…`)
        const ready = watermarkUploads ? await watermarkImage(file) : file
        const url = await uploadFile(
          BUCKET, `${slug}/${Date.now()}-${ready.name}`, ready
        )
        nextImages.push(url)
      }

      if (pdfFile) {
        setProgress('Uploading catalogue PDF…')
        const ready = watermarkUploads ? await watermarkPdf(pdfFile) : pdfFile
        pdfUrl = await uploadFile(
          BUCKET, `catalogues/${slug}-${Date.now()}.pdf`, ready
        )
      }

      setProgress('Saving…')
      const productData = {
        name: form.name,
        slug,
        description: form.description || null,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        category_id: form.category_id || null,
        pdf_url: pdfUrl,
        vastu_note: form.vastu_note || null,
        size: form.size || null,
        size_code: form.size_code || null,
        price_range: form.price_range || null,
        usd: form.usd || null,
        prints: form.prints || null,
        hours: form.hours || null,
        series: form.series || null,
        form: form.form || null,
        intent: form.intent || null,
        direction: form.direction || null,
        is_featured: form.is_featured,
        is_available: form.is_available,
        is_sold: form.is_sold,
        images: nextImages,
      }

      if (editing) {
        await updateProduct(editing.id, productData)
        toast.success('Artwork updated')
      } else {
        await createProduct(productData)
        toast.success('Artwork created')
      }

      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save artwork')
    } finally {
      setSaving(false)
      setProgress('')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(id)
      toast.success('Artwork deleted')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Artworks</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-sm hover:bg-charcoal transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> Add Artwork
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-12 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl mx-4 border border-mist mb-12">
            <div className="flex items-center justify-between p-4 border-b border-mist sticky top-0 bg-white">
              <h2 className="font-display text-lg font-semibold text-ink">
                {editing ? `Edit — ${editing.name}` : 'Add Artwork'}
              </h2>
              <button onClick={resetForm} className="text-graphite hover:text-ink cursor-pointer bg-transparent border-0">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <Section
                title="The piece"
                note="Name, art form and series drive the catalogue chips and filters — reuse the existing wording where you can (start typing to pick from the list)."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Row label="Name *" hint="e.g. Drishti · The Awakened Eye">
                    <input
                      required
                      value={form.name}
                      onChange={(e) => set({ name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
                      className={inputClasses}
                    />
                  </Row>
                  <Row label="Slug" hint="Page address: /products/<slug>. Changing it breaks old links.">
                    <input value={form.slug} onChange={(e) => set({ slug: e.target.value })} className={inputClasses} />
                  </Row>
                </div>

                <Row label="Intent *" hint="The one-line subtitle under the name on the card and detail page.">
                  <input
                    required
                    value={form.intent}
                    onChange={(e) => set({ intent: e.target.value })}
                    placeholder="Protection, awareness & inner vision"
                    className={inputClasses}
                  />
                </Row>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Row label="Art form *" hint="Filter + the black chip on the card.">
                    <input
                      required list="form-options" value={form.form}
                      onChange={(e) => set({ form: e.target.value })}
                      className={inputClasses}
                    />
                    <datalist id="form-options">
                      {formOptions.map((v) => <option key={v} value={v} />)}
                    </datalist>
                  </Row>
                  <Row label="Series" hint="Groups the piece under “You may also like”.">
                    <input
                      list="series-options" value={form.series}
                      onChange={(e) => set({ series: e.target.value })}
                      className={inputClasses}
                    />
                    <datalist id="series-options">
                      {seriesOptions.map((v) => <option key={v} value={v} />)}
                    </datalist>
                  </Row>
                </div>

                <Row label="Description" hint="Optional longer note. Only shown on the detail page, and only when it differs from the intent.">
                  <textarea
                    rows={3} value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    className={`${inputClasses} resize-none`}
                  />
                </Row>

                <Row label="Category" hint="Optional legacy grouping — the /products filters use art form and series instead.">
                  <select value={form.category_id} onChange={(e) => set({ category_id: e.target.value })} className={inputClasses}>
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Row>
              </Section>

              <Section title="Size, time & Vastu">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Row label="Size" hint="Shown as written.">
                    <input
                      list="size-options" value={form.size}
                      onChange={(e) => set({ size: e.target.value })}
                      placeholder="34 × 26 in · 86 × 66 cm"
                      className={inputClasses}
                    />
                    <datalist id="size-options">
                      {sizeOptions.map((v) => <option key={v} value={v} />)}
                    </datalist>
                  </Row>
                  <Row label="Size code" hint="Groups the size filter (A5, B5, A3, 24×17…).">
                    <input
                      list="size-code-options" value={form.size_code}
                      onChange={(e) => set({ size_code: e.target.value })}
                      className={inputClasses}
                    />
                    <datalist id="size-code-options">
                      {sizeCodeOptions.map((v) => <option key={v} value={v} />)}
                    </datalist>
                  </Row>
                  <Row label="Hand-drawing time" hint="e.g. 150–200 hrs">
                    <input value={form.hours} onChange={(e) => set({ hours: e.target.value })} className={inputClasses} />
                  </Row>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Row label="Vastu direction" hint="Chip on the card + the direction filter.">
                    <select value={form.direction} onChange={(e) => handleDirection(e.target.value)} className={inputClasses}>
                      <option value="">None</option>
                      {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Row>
                  <Row label="Vastu note" hint="Fills in from the direction; edit it freely." className="sm:col-span-2">
                    <textarea
                      rows={2} value={form.vastu_note}
                      onChange={(e) => set({ vastu_note: e.target.value })}
                      className={`${inputClasses} resize-none`}
                    />
                  </Row>
                </div>
              </Section>

              <Section title="Pricing" note="Exactly the strip shown on the detail page.">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Row label="Price (₹) *" hint="The headline original price.">
                    <input type="number" required step="0.01" min="0" value={form.price} onChange={(e) => set({ price: e.target.value })} className={inputClasses} />
                  </Row>
                  <Row label="Sale price (₹)" hint="Optional — replaces the headline price.">
                    <input type="number" step="0.01" min="0" value={form.sale_price} onChange={(e) => set({ sale_price: e.target.value })} className={inputClasses} />
                  </Row>
                  <Row label="Price range" hint="e.g. ₹80,000–1,00,000">
                    <input value={form.price_range} onChange={(e) => set({ price_range: e.target.value })} className={inputClasses} />
                  </Row>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Row label="International" hint="e.g. USD 950–1,200">
                    <input value={form.usd} onChange={(e) => set({ usd: e.target.value })} className={inputClasses} />
                  </Row>
                  <Row label="Fine-art prints" hint="Per print, e.g. ₹4,500–9,000. Highlighted when the original is sold.">
                    <input value={form.prints} onChange={(e) => set({ prints: e.target.value })} className={inputClasses} />
                  </Row>
                </div>
              </Section>

              <Section
                title="Photos & catalogue PDF"
                note="Uploaded straight to storage — nothing needs to be added to the code."
              >
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((url, i) => (
                      <div key={url} className="relative w-24">
                        <img src={url} alt="" className="w-24 h-24 object-cover bg-paper border border-mist" />
                        <div className="flex justify-between mt-1">
                          {i === 0 ? (
                            <span className="text-[10px] uppercase tracking-label text-graphite">Cover</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setImages([url, ...images.filter((u) => u !== url)])}
                              className="text-[10px] uppercase tracking-label text-graphite hover:text-ink bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <Star size={10} /> Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((u) => u !== url))}
                            className="text-[10px] uppercase tracking-label text-graphite hover:text-ink bg-transparent border-0 p-0 cursor-pointer"
                            aria-label="Remove photo"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Row label="Add photos" hint="First photo is the cover. JPG or PNG; large files are resized to 2000px.">
                  <input
                    type="file" accept="image/*" multiple
                    onChange={(e) => setImageFiles([...e.target.files])}
                    className="text-sm"
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-[11px] text-graphite mt-1 flex items-center gap-1">
                      <Upload size={11} /> {imageFiles.map((f) => f.name).join(', ')}
                    </p>
                  )}
                </Row>

                <Row
                  label="Catalogue PDF"
                  hint="The two-page plate shown on the detail page and offered as a download. Compress large exports first — under ~5 MB opens quickly on a phone."
                >
                  <input
                    type="file" accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0] || null)}
                    className="text-sm"
                  />
                  {pdfFile && (
                    <p className="text-[11px] text-graphite mt-1 flex items-center gap-1">
                      <Upload size={11} /> {pdfFile.name} · {(pdfFile.size / 1048576).toFixed(1)} MB
                      {pdfFile.size > 20 * 1048576 && ' — large, this upload will take a while'}
                    </p>
                  )}
                  {form.pdf_url && !pdfFile && (
                    <p className="text-[11px] text-graphite mt-1 flex items-center gap-2">
                      <FileText size={11} />
                      <a href={form.pdf_url} target="_blank" rel="noreferrer" className="text-graphite hover:text-ink break-all">
                        {form.pdf_url.split('/').pop()}
                      </a>
                      <button
                        type="button" onClick={() => set({ pdf_url: '' })}
                        className="text-graphite hover:text-ink bg-transparent border-0 p-0 cursor-pointer uppercase tracking-label text-[10px]"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                </Row>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox" checked={watermarkUploads}
                    onChange={(e) => setWatermarkUploads(e.target.checked)}
                  />
                  Watermark uploads with the PraShree Arts mark
                </label>
              </Section>

              <Section title="Visibility">
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" title="Shows in the featured strip">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => set({ is_featured: e.target.checked })} />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer" title="Uncheck to hide the piece from the site">
                    <input type="checkbox" checked={form.is_available} onChange={(e) => set({ is_available: e.target.checked })} />
                    Listed on the site
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer" title="Original sold — the piece stays listed and visitors can enquire about prints">
                    <input type="checkbox" checked={form.is_sold} onChange={(e) => set({ is_sold: e.target.checked })} />
                    Original sold
                  </label>
                </div>
              </Section>

              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={saving} className="px-6 py-2 bg-ink text-white text-sm hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer border-0">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border border-mist text-graphite text-sm hover:text-ink transition-colors cursor-pointer bg-transparent">
                  Cancel
                </button>
                {progress && <span className="text-small text-graphite">{progress}</span>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-mist overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mist">
              <th className="text-left p-3 text-graphite font-medium">Artwork</th>
              <th className="text-left p-3 text-graphite font-medium">Form / series</th>
              <th className="text-left p-3 text-graphite font-medium">Price</th>
              <th className="text-left p-3 text-graphite font-medium">Assets</th>
              <th className="text-left p-3 text-graphite font-medium">Status</th>
              <th className="text-right p-3 text-graphite font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-b border-mist last:border-0 hover:bg-paper/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-10 h-10 object-cover bg-paper" />
                      ) : (
                        <span className="w-10 h-10 bg-paper border border-mist" aria-hidden="true" />
                      )}
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-graphite">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-graphite text-xs">
                    {p.form || '—'}
                    {p.series && <span className="block text-ash">{p.series}</span>}
                  </td>
                  <td className="p-3">
                    {p.sale_price ? (
                      <span>₹{p.sale_price} <span className="line-through text-graphite">₹{p.price}</span></span>
                    ) : (
                      <span>₹{p.price}</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-graphite">
                    <span className={p.images?.length ? 'text-charcoal' : 'text-ash'}>
                      {p.images?.length || 0} photo{p.images?.length === 1 ? '' : 's'}
                    </span>
                    <span className={`block ${p.pdf_url ? 'text-charcoal' : 'text-ash'}`}>
                      {p.pdf_url ? 'PDF ✓' : 'no PDF'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs uppercase tracking-wider border ${p.is_available ? 'bg-ink text-white border-ink' : 'text-ash border-mist'}`}>
                      {p.is_available ? 'Listed' : 'Hidden'}
                    </span>
                    {p.is_featured && <span className="ml-2 px-2 py-0.5 text-xs uppercase tracking-wider border border-graphite text-charcoal">Featured</span>}
                    {p.is_sold && <span className="ml-2 px-2 py-0.5 text-xs uppercase tracking-wider bg-ink text-white border border-ink">Sold</span>}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <a
                      href={`/products/${p.slug}`} target="_blank" rel="noreferrer"
                      className="p-1.5 text-graphite hover:text-ink inline-block" aria-label={`View ${p.name} on the site`}
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button onClick={() => openEdit(p)} className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label={`Edit ${p.name}`}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0 ml-1" aria-label={`Delete ${p.name}`}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-graphite">
                  No artworks yet. Click &quot;Add Artwork&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
