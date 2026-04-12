import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from '../../lib/supabase'
import toast from 'react-hot-toast'

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', sale_price: '', category_id: '', is_featured: false, is_available: true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods || [])
        setCategories(cats || [])
      })
      .catch(() => { })
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', price: '', sale_price: '', category_id: '', is_featured: false, is_available: true })
    setImageFile(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      sale_price: product.sale_price?.toString() || '',
      category_id: product.category_id || '',
      is_featured: product.is_featured,
      is_available: product.is_available,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let images = editing?.images || []

      if (imageFile) {
        const path = `products/${Date.now()}-${imageFile.name}`
        const url = await uploadImage('products', path, imageFile)
        images = [url, ...images]
      }

      const productData = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        category_id: form.category_id || null,
        is_featured: form.is_featured,
        is_available: form.is_available,
        images,
      }

      if (editing) {
        await updateProduct(editing.id, productData)
        toast.success('Product updated')
      } else {
        await createProduct(productData)
        toast.success('Product created')
      }

      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const inputClasses =
    'w-full px-3 py-2 bg-white border border-border text-secondary focus:outline-none focus:border-primary transition-colors text-sm'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Products</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm hover:bg-secondary transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-12 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl mx-4 border border-border mb-12">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-primary">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={resetForm} className="text-muted hover:text-primary cursor-pointer bg-transparent border-0">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClasses} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">Price (₹) *</label>
                  <input type="number" required step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Sale Price (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClasses}>
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm" />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
                  Available
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white text-sm hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer border-0">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border border-border text-muted text-sm hover:text-primary transition-colors cursor-pointer bg-transparent">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-muted font-medium">Product</th>
              <th className="text-left p-3 text-muted font-medium">Category</th>
              <th className="text-left p-3 text-muted font-medium">Price</th>
              <th className="text-left p-3 text-muted font-medium">Status</th>
              <th className="text-right p-3 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-lighter/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt="" className="w-10 h-10 object-cover bg-lighter" />
                      )}
                      <div>
                        <p className="font-medium text-primary">{p.name}</p>
                        <p className="text-xs text-muted">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{p.categories?.name || '—'}</td>
                  <td className="p-3">
                    {p.sale_price ? (
                      <span>₹{p.sale_price} <span className="line-through text-muted">₹{p.price}</span></span>
                    ) : (
                      <span>₹{p.price}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs ${p.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {p.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    {p.is_featured && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700">Featured</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-muted hover:text-primary cursor-pointer bg-transparent border-0" aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-muted hover:text-red-600 cursor-pointer bg-transparent border-0 ml-1" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No products yet. Click "Add Product" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
