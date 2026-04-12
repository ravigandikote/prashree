import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, Copy } from 'lucide-react'
import { supabase, uploadImage, deleteImage } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminMedia() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [bucket] = useState('artworks')
  const fileInputRef = useRef(null)

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (error) throw error

      const filesWithUrls = (data || [])
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name)
          return { ...f, publicUrl: urlData.publicUrl }
        })
      setFiles(filesWithUrls)
    } catch {
      // Storage may not be set up yet
      setFiles([])
    }
  }

  useEffect(() => { loadFiles() }, [])

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    setUploading(true)
    try {
      for (const file of selectedFiles) {
        const path = `${Date.now()}-${file.name}`
        await uploadImage(bucket, path, file)
      }
      toast.success(`${selectedFiles.length} file(s) uploaded`)
      loadFiles()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return
    try {
      await deleteImage(bucket, fileName)
      toast.success('File deleted')
      loadFiles()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Media Library</h1>
        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm hover:bg-secondary transition-colors cursor-pointer">
          <Upload size={14} />
          {uploading ? 'Uploading...' : 'Upload Files'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.name} className="group relative bg-white border border-border overflow-hidden">
              <div className="aspect-square">
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(file.publicUrl)}
                  className="p-2 bg-white text-primary rounded-full hover:bg-lighter cursor-pointer border-0"
                  title="Copy URL"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 cursor-pointer border-0"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-border p-12 text-center">
          <Upload size={32} className="mx-auto text-light" />
          <p className="text-muted mt-4">No files uploaded yet.</p>
          <p className="text-xs text-muted mt-1">
            Upload images to use in products and galleries.
          </p>
        </div>
      )}
    </div>
  )
}
