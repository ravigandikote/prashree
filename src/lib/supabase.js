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

/* ── Interests (express-interest requests) ── */
export async function createInterest(interest) {
  const { error } = await supabase.from('interests').insert([interest])
  if (error) throw error
}

export async function getInterests() {
  const { data, error } = await supabase
    .from('interests')
    .select('*, products(name, slug)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateInterest(id, updates) {
  const { data, error } = await supabase
    .from('interests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Enquiries (contact / booking form) ── */
export async function createEnquiry(enquiry) {
  const { error } = await supabase.from('enquiries').insert([enquiry])
  if (error) throw error
}

export async function getEnquiries() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateEnquiry(id, updates) {
  const { data, error } = await supabase
    .from('enquiries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Posts (blog) ── */
export async function getPublishedPosts({ limit } = {}) {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return data
}

/* ── Admin: Posts CRUD ── */
export async function getAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPost(post) {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePost(id, updates) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

/* ── Upcoming workshops ── */
export async function getActiveWorkshops() {
  const { data, error } = await supabase
    .from('workshop_events')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function getAllWorkshops() {
  const { data, error } = await supabase
    .from('workshop_events')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createWorkshop(workshop) {
  const { data, error } = await supabase
    .from('workshop_events')
    .insert([workshop])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkshop(id, updates) {
  const { data, error } = await supabase
    .from('workshop_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWorkshop(id) {
  const { error } = await supabase.from('workshop_events').delete().eq('id', id)
  if (error) throw error
}

/* ── Mandala Studio templates ── */
export async function getStarterTemplates() {
  const { data, error } = await supabase
    .from('mandala_templates')
    .select('id, name, config_json, created_at')
    .eq('is_starter', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getAllMandalaTemplates() {
  const { data, error } = await supabase
    .from('mandala_templates')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createMandalaTemplate(template) {
  const { data, error } = await supabase
    .from('mandala_templates')
    .insert([template])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMandalaTemplate(id, updates) {
  const { data, error } = await supabase
    .from('mandala_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMandalaTemplate(id) {
  const { error } = await supabase.from('mandala_templates').delete().eq('id', id)
  if (error) throw error
}

/* ── Connections ── */
export async function getConnections() {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

