import { describe, it, expect } from 'vitest'
import {
  resolveAudioUrl, storagePublicUrl, audioExtension, isPlayableAudioUrl,
  audioStoragePath, TONE_BUDGET_BYTES,
} from './urls'

describe('audio urls', () => {
  it('passes full URLs through untouched', () => {
    const u = 'https://x.supabase.co/storage/v1/object/public/products/audio/aditya.m4a'
    expect(resolveAudioUrl(u)).toBe(u)
  })

  it('turns a bucket path or bare filename into the public URL', () => {
    expect(resolveAudioUrl('audio/aditya.m4a')).toMatch(/\/storage\/v1\/object\/public\/products\/audio\/aditya\.m4a$/)
    expect(resolveAudioUrl('aditya.m4a')).toMatch(/\/products\/audio\/aditya\.m4a$/)
    expect(storagePublicUrl('/audio/x.m4a')).not.toMatch(/public\/products\/\/audio/)
  })

  it('empty means no tone', () => {
    expect(resolveAudioUrl('')).toBeNull()
    expect(resolveAudioUrl(null)).toBeNull()
    expect(resolveAudioUrl('   ')).toBeNull()
  })

  it('reads extensions past query strings and rejects unknown containers', () => {
    expect(audioExtension('https://a/b/tone.M4A?token=1')).toBe('m4a')
    expect(isPlayableAudioUrl('https://a/tone.m4a')).toBe(true)
    expect(isPlayableAudioUrl('https://a/tone.flac')).toBe(false)
    expect(isPlayableAudioUrl('')).toBe(false)
  })

  it('builds a safe storage path from an artwork slug', () => {
    expect(audioStoragePath('Aditya · Sunflower', 'bowl.m4a')).toBe('audio/aditya-sunflower.m4a')
    expect(audioStoragePath('gong-open', 'Gong Open.WAV')).toBe('audio/gong-open.wav')
    expect(audioStoragePath('', 'x')).toBe('audio/tone.m4a')
  })

  it('keeps the spec budget where the admin can read it', () => {
    expect(TONE_BUDGET_BYTES).toBe(307200)
  })
})
