/**
 * Audio asset addressing for the sound layer.
 *
 * Tones live in Supabase Storage, bucket `products`, folder `audio/`, one
 * compressed AAC file (.m4a) per tone — see scripts/compress-audio.mjs. The
 * database stores the full public URL (like pdf_url / images), but a bare
 * bucket path is accepted too so a row can be filled in by hand.
 *
 * Nothing here fetches anything: the engine (Phase 2) only touches a URL once
 * the visitor has switched sound on.
 */

export const AUDIO_BUCKET = 'products'
export const AUDIO_FOLDER = 'audio'

/** Containers/codecs every current browser both plays and decodes in Web Audio. */
export const PLAYABLE_EXTENSIONS = ['m4a', 'mp4', 'aac', 'mp3', 'ogg', 'opus', 'webm', 'wav']

/** Per-file budget from the asset spec (after compression). */
export const TONE_BUDGET_BYTES = 300 * 1024

const supabaseUrl = () => (import.meta.env?.VITE_SUPABASE_URL || '').replace(/\/$/, '')

/** Public URL of an object in the products bucket: 'audio/aditya.m4a' → https://…/products/audio/aditya.m4a */
export function storagePublicUrl(path, bucket = AUDIO_BUCKET) {
  const clean = String(path || '').replace(/^\/+/, '')
  return `${supabaseUrl()}/storage/v1/object/public/${bucket}/${clean}`
}

/**
 * Normalise whatever is in audio_url to something the engine can fetch:
 * a full http(s) URL passes through; a bucket-relative path ('audio/x.m4a'
 * or 'x.m4a') becomes the public URL; empty → null.
 */
export function resolveAudioUrl(value) {
  const v = String(value || '').trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) return v
  const path = v.includes('/') ? v : `${AUDIO_FOLDER}/${v}`
  return storagePublicUrl(path)
}

/** File extension (lower-case, no dot) of a URL or path, ignoring query strings. */
export function audioExtension(url) {
  const m = String(url || '').split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i)
  return m ? m[1].toLowerCase() : ''
}

export function isPlayableAudioUrl(url) {
  return PLAYABLE_EXTENSIONS.includes(audioExtension(url))
}

/** Storage path for a new upload: audio/<slug>.<ext>, slug sanitised. */
export function audioStoragePath(slug, filename) {
  const ext = audioExtension(filename) || 'm4a'
  const safe = String(slug || 'tone').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  return `${AUDIO_FOLDER}/${safe}.${ext}`
}
