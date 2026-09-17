/**
 * Synthesises the Sound Healing library into public/sounds/ (gitignored —
 * generated on `npm run dev` / `npm run build`, never committed). These are
 * stand-ins until Monica's recordings replace them from /admin/sounds; the
 * screen prefers a site_audio row's audio_url and falls back to these.
 *
 *   npm run sounds:generate          # writes missing files only
 *   npm run sounds:generate -- --force
 *
 * Every loopable file ends with a crossfade onto its own start so it loops
 * without a click. Deterministic PRNG so re-running yields identical bytes.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'public/sounds'
const force = process.argv.includes('--force')
mkdirSync(OUT, { recursive: true })

// ── helpers ──
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const TAU = Math.PI * 2

function writeWav(name, samples, rate) {
  const n = samples.length
  let peak = 1e-6; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(samples[i]))
  const g = 0.85 / peak
  const b = Buffer.alloc(44 + n * 2)
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12)
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24)
  b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i] * g)) * 32767), 44 + i * 2)
  const path = join(OUT, name)
  writeFileSync(path, b)
  return { path, kb: Math.round(b.length / 1024), seconds: (n / rate).toFixed(1) }
}

/** Trim a longer render to `seconds`, crossfading its tail onto its head so the loop is seamless. */
function loopify(samples, rate, seconds, xfadeSeconds) {
  const L = Math.floor(rate * seconds), X = Math.floor(rate * xfadeSeconds)
  const out = new Float32Array(L)
  for (let i = 0; i < L; i++) out[i] = samples[i]
  for (let i = 0; i < X; i++) {
    const w = 0.5 - 0.5 * Math.cos((i / X) * Math.PI) // equal-power-ish raised cosine
    out[i] = samples[i] * w + samples[L + i] * (1 - w)
  }
  return out
}

/** Simple 2-pole resonant band-pass (state-variable filter), returns a processor. */
function bandpass(rate, hz, q) {
  let low = 0, band = 0
  const f = 2 * Math.sin(Math.PI * Math.min(hz, rate * 0.45) / rate), damp = 1 / q
  return (x) => { low += f * band; const high = x - low - damp * band; band += f * high; return band }
}
function pinkNoise(rnd) { // Paul Kellet's refined pink noise
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  return () => {
    const w = rnd() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980
    const p = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926
    return p * 0.11
  }
}

// ── 1. singing bowls, one per chakra (rimmed: swells in, then sustains with slow beating) ──
const BOWLS = [
  ['bowl-root', 256], ['bowl-sacral', 288], ['bowl-solar-plexus', 320], ['bowl-heart', 341.3],
  ['bowl-throat', 384], ['bowl-third-eye', 426.7], ['bowl-crown', 480],
]
function bowl(hz, seed) {
  const rate = 16000, seconds = 16, xf = 3, rnd = mulberry32(seed)
  const n = Math.floor(rate * (seconds + xf))
  const partials = [[1, 1], [2.71, 0.42], [4.98, 0.2], [7.9, 0.08], [11.4, 0.03]]
    .filter(([r]) => hz * r < rate * 0.45)
    .map(([r, a]) => ({ f1: hz * r, f2: hz * r + (0.35 + rnd() * 0.9), a, ph1: rnd() * TAU, ph2: rnd() * TAU }))
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / rate
    const swell = Math.min(1, t / 2.2)
    const undul = 1 + 0.14 * Math.sin(TAU * 0.11 * t + 1.3) + 0.06 * Math.sin(TAU * 0.37 * t)
    let v = 0
    for (const p of partials) v += p.a * (Math.sin(TAU * p.f1 * t + p.ph1) + 0.8 * Math.sin(TAU * p.f2 * t + p.ph2)) * 0.5
    out[i] = v * swell * undul
  }
  return { samples: loopify(out, rate, seconds, xf), rate }
}

// ── 2. rain stick: showers of tiny filtered grains, density rising and falling like a tilt ──
function rainStick(seed) {
  const rate = 16000, seconds = 12, xf = 2, rnd = mulberry32(seed)
  const n = Math.floor(rate * (seconds + xf)), out = new Float32Array(n)
  const density = (t) => { const c = (t % 6) / 6; return 0.05 + 0.95 * Math.pow(Math.sin(Math.PI * c), 1.4) } // two tilts per loop
  const filters = Array.from({ length: 6 }, () => bandpass(rate, 1800 + rnd() * 4200, 6 + rnd() * 6))
  for (let i = 0; i < n; i++) {
    const t = i / rate
    if (rnd() < density(t) * 0.09) {
      const len = Math.floor(rate * (0.003 + rnd() * 0.009)), amp = 0.4 + rnd() * 0.6, fl = filters[Math.floor(rnd() * filters.length)]
      for (let k = 0; k < len && i + k < n; k++) out[i + k] += fl(rnd() * 2 - 1) * amp * (1 - k / len)
    }
  }
  return { samples: loopify(out, rate, seconds, xf), rate }
}

// ── 3. ocean drum: pink noise in slow swells, beads rolling brighter on the rise ──
function oceanDrum(seed) {
  const rate = 16000, seconds = 16, xf = 3, rnd = mulberry32(seed)
  const n = Math.floor(rate * (seconds + xf)), out = new Float32Array(n), pink = pinkNoise(rnd)
  const bp = bandpass(rate, 2400, 1.2)
  let lp = 0
  for (let i = 0; i < n; i++) {
    const t = i / rate
    const ph = (t * 0.125) % 1                                   // one wave every 8 s
    const swell = Math.pow(0.5 - 0.5 * Math.cos(TAU * ph), 1.8)  // slow rise, slow fall
    const velocity = Math.max(0, Math.sin(TAU * ph))             // beads roll on the rising side
    const p = pink()
    const cutoff = 0.05 + 0.5 * swell
    lp += cutoff * (p - lp)
    out[i] = lp * (0.15 + swell) * 1.6 + bp(rnd() * 2 - 1) * velocity * 0.12
  }
  return { samples: loopify(out, rate, seconds, xf), rate }
}

// ── 4. gong: one strike, low and full, upper partials blooming after the hit ──
function gong(seed) {
  const rate = 16000, seconds = 10, rnd = mulberry32(seed), n = Math.floor(rate * seconds), out = new Float32Array(n)
  const f0 = 82.4
  const partials = [[1, 1, 0.02, 0.25], [1.48, 0.7, 0.05, 0.3], [2.05, 0.55, 0.3, 0.35], [2.62, 0.45, 0.5, 0.4], [3.3, 0.35, 0.8, 0.45], [4.1, 0.3, 1.1, 0.5], [5.2, 0.22, 1.4, 0.6], [6.8, 0.15, 1.6, 0.7], [8.9, 0.1, 1.9, 0.8], [11.7, 0.06, 2.1, 0.9]]
    .map(([r, a, att, dec]) => ({ f: f0 * r * (1 + (rnd() - 0.5) * 0.004), a, att, dec, ph: rnd() * TAU }))
  for (let i = 0; i < n; i++) {
    const t = i / rate
    let v = 0
    for (const p of partials) {
      const env = (1 - Math.exp(-t / p.att)) * Math.exp(-t * p.dec)
      v += p.a * env * Math.sin(TAU * p.f * t + p.ph + 0.4 * Math.sin(TAU * 0.9 * t))
    }
    out[i] = v * Math.min(1, t * 400) * Math.min(1, (seconds - t) / 0.5)
  }
  return { samples: out, rate }
}

// ── 5. raga alaap: a tanpura drone and a slow, breathy bansuri line in Raga Yaman ──
function ragaAlaap(seed) {
  const rate = 16000, seconds = 48, xf = 4, rnd = mulberry32(seed)
  const n = Math.floor(rate * (seconds + xf)), out = new Float32Array(n)
  const Sa = 261.6
  // tanpura: Pa . Sa Sa Sa(low), one string every 0.75 s, each a plucked string with slowly shifting overtone emphasis (jawari)
  const strings = [Sa * 0.75, Sa, Sa, Sa / 2]
  for (let k = 0; ; k++) {
    const start = k * 0.75
    if (start >= seconds + xf) break
    const f = strings[k % 4], s0 = Math.floor(start * rate)
    for (let i = s0; i < n && i - s0 < rate * 3.2; i++) {
      const t = (i - s0) / rate
      let v = 0
      for (let h = 1; h <= 18; h++) {
        const jaw = 1 + 0.6 * Math.sin(TAU * 0.28 * (i / rate) + h * 0.7)
        v += Math.sin(TAU * f * h * t) * Math.pow(h, -0.9) * jaw * Math.exp(-t * (0.9 + h * 0.18))
      }
      out[i] += v * 0.10 * Math.min(1, t * 300)
    }
  }
  // bansuri phrases in Yaman: S R G M# P D N S'
  const N = { 'N.': Sa * 15 / 16, S: Sa, R: Sa * 9 / 8, G: Sa * 5 / 4, 'M#': Sa * 45 / 32, P: Sa * 3 / 2, D: Sa * 5 / 3, N: Sa * 15 / 8, "S'": Sa * 2 }
  const phrases = [
    [['N.', 1.4], ['S', 2.6], [null, 1.2]],
    [['S', 0.9], ['R', 1.2], ['G', 2.8], [null, 1.4]],
    [['G', 0.8], ['M#', 1.0], ['G', 0.9], ['R', 1.1], ['S', 2.4], [null, 1.6]],
    [['G', 0.9], ['M#', 0.8], ['D', 1.0], ['P', 2.9], [null, 1.3]],
    [['N', 1.1], ['D', 0.8], ['P', 0.9], ['M#', 0.8], ['G', 1.0], ['R', 1.2], ['S', 3.2], [null, 2.0]],
    [['R', 0.8], ['G', 0.8], ['P', 1.1], ["S'", 2.6], ['N', 1.2], ['D', 1.0], ['P', 2.8], [null, 1.8]],
  ]
  let cursor = 1.5, prev = N.S
  const breath = bandpass(rate, 1800, 2)
  for (const phrase of phrases) {
    for (const [note, dur] of phrase) {
      if (note === null) { cursor += dur; prev = prev; continue }
      const f = N[note], s0 = Math.floor(cursor * rate), len = Math.floor(dur * rate)
      let phase = 0
      for (let i = 0; i < len && s0 + i < n; i++) {
        const t = i / rate
        const glide = Math.min(1, t / 0.16)                       // meend from the previous note
        const vib = 1 + 0.004 * Math.sin(TAU * 5.2 * t) * Math.min(1, Math.max(0, (t - 0.5) / 0.8))
        const freq = (prev + (f - prev) * glide) * vib
        phase += TAU * freq / rate
        const env = Math.min(1, t / 0.12) * Math.min(1, (dur - t) / 0.35) * (0.85 + 0.15 * Math.sin(TAU * 0.6 * t))
        const tone = Math.sin(phase) + 0.45 * Math.sin(2 * phase) + 0.18 * Math.sin(3 * phase) + 0.06 * Math.sin(4 * phase)
        out[s0 + i] += (tone * 0.22 + breath(rnd() * 2 - 1) * 0.05) * env
      }
      cursor += dur; prev = f
    }
  }
  return { samples: loopify(out, rate, seconds, xf), rate }
}

// ── render ──
const jobs = [
  ...BOWLS.map(([slug, hz], i) => [slug, () => bowl(hz, 100 + i)]),
  ['rain-stick', () => rainStick(7)],
  ['ocean-drum', () => oceanDrum(11)],
  ['gong-healing', () => gong(3)],
  ['raga-alaap', () => ragaAlaap(21)],
]
let made = 0
for (const [slug, render] of jobs) {
  const name = `${slug}.wav`
  if (!force && existsSync(join(OUT, name))) continue
  const { samples, rate } = render()
  const r = writeWav(name, samples, rate)
  console.log(`${r.path}  ${r.kb} KB · ${r.seconds} s`)
  made++
}
console.log(made ? `${made} file(s) written to ${OUT}` : `${OUT} already complete (use --force to regenerate)`)
