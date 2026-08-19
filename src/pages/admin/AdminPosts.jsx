import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { getAllPosts, createPost, updatePost, deletePost, uploadImage } from '../../lib/supabase'
import { inputClasses } from './adminUi'
import toast from 'react-hot-toast'

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const EMPTY = { title: '', slug: '', excerpt: '', body: '', tags: '', published: false }

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => getAllPosts().then((data) => setPosts(data || [])).catch(() => {})
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm(EMPTY)
    setCoverFile(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (post) => {
    setEditing(post)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      body: post.body || '',
      tags: (post.tags || []).join(', '),
      published: post.published,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let cover_image = editing?.cover_image || null
      if (coverFile) {
        const path = `blog/${Date.now()}-${coverFile.name}`
        cover_image = await uploadImage('artworks', path, coverFile)
      }
      const data = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || null,
        body: form.body,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published,
        cover_image,
        published_at: form.published
          ? (editing?.published_at || new Date().toISOString())
          : null,
      }
      if (editing) {
        await updatePost(editing.id, data)
        toast.success('Post updated')
      } else {
        await createPost(data)
        toast.success('Post created')
      }
      resetForm()
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deletePost(id)
      toast.success('Post deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-h2 text-ink">Blog posts</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-small hover:bg-charcoal transition-colors cursor-pointer border-0"
        >
          <Plus size={14} /> New post
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-start justify-center pt-12 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl mx-4 border border-mist mb-12">
            <div className="flex items-center justify-between p-4 border-b border-mist">
              <h2 className="font-display text-h3 text-ink">
                {editing ? 'Edit post' : 'New post'}
              </h2>
              <button onClick={resetForm} className="text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-graphite mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs text-graphite mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClasses} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-graphite mb-1">Excerpt</label>
                <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={`${inputClasses} resize-none`} />
              </div>

              <div>
                <label className="block text-xs text-graphite mb-1">Body (Markdown) *</label>
                <textarea
                  rows={12}
                  required
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className={`${inputClasses} resize-y font-mono`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-graphite mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs text-graphite mb-1">Cover image</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="text-small" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-small cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2 bg-ink text-white text-small hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer border-0">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border border-mist text-graphite text-small hover:text-ink transition-colors cursor-pointer bg-transparent">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-mist overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr className="border-b border-mist">
              <th className="text-left p-3 text-graphite font-medium">Title</th>
              <th className="text-left p-3 text-graphite font-medium">Tags</th>
              <th className="text-left p-3 text-graphite font-medium">Status</th>
              <th className="text-left p-3 text-graphite font-medium">Date</th>
              <th className="text-right p-3 text-graphite font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-mist last:border-0">
                  <td className="p-3">
                    <p className="font-medium text-ink">{post.title}</p>
                    <p className="text-xs text-ash">{post.slug}</p>
                  </td>
                  <td className="p-3 text-graphite">{(post.tags || []).join(', ') || '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs uppercase tracking-wider border ${post.published ? 'bg-ink text-white border-ink' : 'text-ash border-mist'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3 text-graphite">
                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(post)} className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0" aria-label={`Edit ${post.title}`}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0 ml-1" aria-label={`Delete ${post.title}`}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-graphite">
                  No posts yet. Click &ldquo;New post&rdquo; to write the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
