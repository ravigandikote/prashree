import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
} from '../../lib/supabase'
import toast from 'react-hot-toast'

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', display_order: '0' })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    getCategories()
      .then((data) => setCategories(data || []))
      .catch(() => { })
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', display_order: '0' })
    setImageFile(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      display_order: cat.display_order?.toString() || '0',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let image_url = editing?.image_url || null

      if (imageFile) {
        const path = `categories/${Date.now()}-${imageFile.name}`
        image_url = await uploadImage('artworks', path, imageFile)
      }

      const categoryData = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        display_order: parseInt(form.display_order) || 0,
        image_url,
      }

      if (editing) {
        await updateCategory(editing.id, categoryData)
        toast.success('Category updated')
      } else {
        await createCategory(categoryData)
        toast.success('Category created')
      }

      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? All products in this category will also be deleted.`)) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
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
        <h1 className="font-display text-2xl font-bold text-primary">Categories</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm hover:bg-secondary transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
          <div className="bg-white w-full max-w-lg mx-4 border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-primary">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={resetForm} className="text-muted hover:text-primary cursor-pointer bg-transparent border-0">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              <div>
                <label className="block text-xs text-muted mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClasses} resize-none`} />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Display Order</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm" />
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-border p-4 flex items-start gap-4 hover:border-primary transition-colors">
              {cat.image_url && (
                <img src={cat.image_url} alt="" className="w-16 h-16 object-cover bg-lighter shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-primary">{cat.name}</h3>
                <p className="text-xs text-muted mt-1 line-clamp-2">{cat.description}</p>
                <p className="text-xs text-muted mt-1">Order: {cat.display_order}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-muted hover:text-primary cursor-pointer bg-transparent border-0">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-muted hover:text-red-600 cursor-pointer bg-transparent border-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-muted bg-white border border-border">
            No categories yet. Click "Add Category" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
