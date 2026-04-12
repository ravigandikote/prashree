import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ── Category helpers ── */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

/* ── Product helpers ── */
export async function getProducts({ categoryId, featured, limit } = {}) {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (categoryId) query = query.eq('category_id', categoryId)
  if (featured) query = query.eq('is_featured', true)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

/* ── Gallery helpers ── */
export async function getGalleryByCategory(categoryId) {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('category_id', categoryId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

/* ── Order helpers ── */
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOrderPayment(orderId, paymentData) {
  const { data, error } = await supabase
    .from('orders')
    .update(paymentData)
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ── Media / Storage helpers ── */
export async function uploadImage(bucket, filePath, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function deleteImage(bucket, filePath) {
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) throw error
}

/* ── Admin: Product CRUD ── */
export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

/* ── Admin: Category CRUD ── */
export async function createCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

/* ── Admin: Gallery CRUD ── */
export async function addGalleryItem(item) {
  const { data, error } = await supabase
    .from('gallery')
    .insert([item])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGalleryItem(id) {
  const { error } = await supabase.from('gallery').delete().eq('id', id)
  if (error) throw error
}

/* ── Admin: Order management ── */
export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
