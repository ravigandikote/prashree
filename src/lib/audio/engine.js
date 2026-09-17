/**
 * The sound engine: one AudioContext for the whole app, one master gain
 * (capped at 0.6 — tones sit under the page, they do not fill the room),
 * at most one looping tone at a time, plus one-shots (the gong).
 *
 * Rules it enforces:
 *  - nothing is created, fetched or decoded until unlock() runs inside a
 *    user gesture; a blocked resume() is a normal outcome, never thrown;
 *  - every fade is a GainNode ramp against ctx.currentTime, never a timer
 *    poking .volume;
 *  - playTone / crossfadeTo fade the previous tone out while the new one
 *    fades in, so two tones never sit at full level together;
 *  - short files decode into an AudioBuffer and loop gaplessly via
 *    AudioBufferSourceNode; files over `bufferMaxBytes` fall back to an
 *    <audio> element (loop gaps are possible there — the engine records
 *    which URLs took that path in state.largeFiles so we can report them).
 *
 * Dependencies are injectable so the whole thing runs under Vitest with a
 * fake context (see engine.test.js).
 */

export const DEFAULTS = Object.freeze({
  masterGain: 0.6,
  fadeIn: 2.5,          // seconds
  fadeOut: 1.5,
  duckLevel: 0.15,      // fraction of masterGain
  duckMs: 600,
  unduckMs: 900,
  bufferMaxBytes: 4 * 1024 * 1024,   // WAV decodes instantly; compressed files are far smaller anyway
})

const defaultCreateContext = () => {
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext
  return Ctor ? new Ctor() : null
}
const defaultFetchBytes = async (url) => {
  const res = await fetch(url, { credentials: 'omit' })
  if (!res.ok) throw new Error(`audio ${res.status} for ${url}`)
  return res.arrayBuffer()
}

export function createSoundEngine({
  createContext = defaultCreateContext,
  fetchBytes = defaultFetchBytes,
  createElement = (url) => { const el = new Audio(); el.preload = 'auto'; el.src = url; return el },
  options = {},
} = {}) {
  const opts = { ...DEFAULTS, ...options }
  let ctx = null
  let master = null
  let current = null          // { key, gain, source, element?, stopTimer? }
  let pendingStop = null
  let pendingStopAt = 0     // when the pending stop is due (so a longer grace can extend, a shorter never shortens)
  const cache = new Map()     // url → Promise<AudioBuffer | { element: true }>
  const listeners = new Set()
  const layers = new Map()    // id → { src, gain, source, element? } — independent looping beds (Sound Healing)
  const fading = new Set()    // nodes ramping to silence, awaiting teardown — dispose() must catch these too
  const state = { unlocked: false, playing: null, ducked: false, largeFiles: [], layers: [] }

  const emit = () => { for (const fn of listeners) fn({ ...state }) }
  const now = () => (ctx ? ctx.currentTime : 0)

  /** Ramp an AudioParam from where it is to `target` over `seconds`, anchored on ctx.currentTime. */
  const ramp = (param, target, seconds) => {
    const t = now()
    param.cancelScheduledValues(t)
    param.setValueAtTime(param.value, t)
    param.linearRampToValueAtTime(target, t + Math.max(0.01, seconds))
  }

  /** Create the context + master bus (once) and try to resume it. Call from a user gesture. */
  async function unlock() {
    if (!ctx) {
      ctx = createContext()
      if (!ctx) return false
      master = ctx.createGain()
      master.gain.value = opts.masterGain
      master.connect(ctx.destination)
    }
    try {
      if (ctx.state !== 'running') await ctx.resume()
    } catch { /* blocked: stays suspended, the toggle shows "off" */ }
    const was = state.unlocked
    state.unlocked = ctx.state === 'running'
    if (was !== state.unlocked) emit()
    return state.unlocked
  }

  /** Fetch + decode once per URL. Large files are not decoded (see largeFiles). */
  function load(url) {
    if (!cache.has(url)) {
      cache.set(url, (async () => {
        const bytes = await fetchBytes(url)
        if (bytes.byteLength > opts.bufferMaxBytes) {
          if (!state.largeFiles.includes(url)) { state.largeFiles.push(url); emit() }
          return { element: true }
        }
        return ctx.decodeAudioData(bytes.slice(0))
      })().catch((err) => { cache.delete(url); throw err }))
    }
    return cache.get(url)
  }

  const cancelPendingStop = () => { if (pendingStop) { clearTimeout(pendingStop); pendingStop = null; pendingStopAt = 0 } }

  /** Keep the current tone alive: cancels any pending (delayed) stop. A page that will crossfade calls this on mount. */
  const holdTone = () => cancelPendingStop()

  /** Fade the current tone out and release its nodes after the ramp. */
  function fadeOutCurrent(seconds = opts.fadeOut) {
    const tone = current
    if (!tone) return
    current = null
    state.playing = null
    ramp(tone.gain.gain, 0, seconds)
    fading.add(tone)
    tone.stopTimer = setTimeout(() => teardown(tone), seconds * 1000 + 50)
  }

  function teardown(tone) {
    fading.delete(tone)
    if (tone.stopTimer) clearTimeout(tone.stopTimer)
    try { tone.source.stop?.() } catch { /* already stopped */ }
    try { tone.source.disconnect() } catch { /* never connected */ }
    try { tone.gain.disconnect() } catch { /* never connected */ }
    if (tone.element) { try { tone.element.pause(); tone.element.src = '' } catch { /* ignore */ } }
  }

  /**
   * Start a looping tone, fading in; any tone already playing fades out at
   * the same time (that is the crossfade). `src` is a URL or an AudioBuffer.
   * Resolves true if it started, false if sound is locked or the file failed.
   */
  async function playTone(src, { fadeIn = opts.fadeIn, fadeOut = opts.fadeOut, loop = true } = {}) {
    cancelPendingStop()
    if (!state.unlocked || !ctx) return false
    const key = typeof src === 'string' ? src : src
    if (current && current.key === key) return true

    let decoded
    try {
      decoded = typeof src === 'string' ? await load(src) : src
    } catch { return false }
    if (!state.unlocked) return false            // locked while we were fetching
    if (current && current.key === key) return true

    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(master)

    let source, element
    if (decoded && decoded.element) {
      element = createElement(src)
      element.loop = loop
      source = ctx.createMediaElementSource(element)
      source.connect(gain)
      try { await element.play() } catch { teardown({ source, gain, element }); return false }
    } else {
      source = ctx.createBufferSource()
      source.buffer = decoded
      source.loop = loop
      source.connect(gain)
      source.start()
    }

    if (current) fadeOutCurrent(fadeOut)
    current = { key, gain, source, element }
    state.playing = typeof src === 'string' ? src : 'buffer'
    ramp(gain.gain, 1, fadeIn)
    emit()
    return true
  }

  /** Same as playTone; named for the navigation case. */
  const crossfadeTo = (src, o) => playTone(src, o)

  /** Fade the current tone out (optionally after `delay` ms — cancelled by a new playTone). */
  function stopTone({ fadeOut = opts.fadeOut, delay = 0 } = {}) {
    if (delay > 0) {
      const due = Date.now() + delay
      if (pendingStop && pendingStopAt >= due) return   // a longer grace is already running
      cancelPendingStop()
      pendingStopAt = due
      pendingStop = setTimeout(() => { pendingStop = null; pendingStopAt = 0; stopTone({ fadeOut }) }, delay)
      return
    }
    cancelPendingStop()
    if (!current) return
    fadeOutCurrent(fadeOut)
    emit()
  }

  /** One-shot (the gong): no loop, releases itself when it ends. Resolves to the duration in seconds, 0 if it could not play. */
  async function playOnce(src, { level = 1 } = {}) {
    if (!state.unlocked || !ctx) return 0
    let decoded
    try { decoded = typeof src === 'string' ? await load(src) : src } catch { return 0 }
    if (!state.unlocked) return 0
    const gain = ctx.createGain()
    gain.gain.value = level
    gain.connect(master)
    if (decoded && decoded.element) {
      const element = createElement(src)
      const source = ctx.createMediaElementSource(element)
      source.connect(gain)
      element.onended = () => teardown({ source, gain, element })
      try { await element.play() } catch { teardown({ source, gain, element }); return 0 }
      return element.duration || 0
    }
    const source = ctx.createBufferSource()
    source.buffer = decoded
    source.loop = false
    source.connect(gain)
    source.onended = () => teardown({ source, gain })
    source.start()
    return decoded.duration || 0
  }

  /* ── Layers: several independent looping beds at once (Sound Healing).
        Each has its own gain into the master bus; the single artwork tone
        (`current`) is untouched by these. ── */
  async function playLayer(id, src, { fadeIn = 3, level = 1, loop = true } = {}) {
    if (!state.unlocked || !ctx) return false
    if (layers.has(id)) { setLayerLevel(id, level, fadeIn); return true }
    let decoded
    try { decoded = typeof src === 'string' ? await load(src) : src } catch { return false }
    if (!state.unlocked || layers.has(id)) return layers.has(id)
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(master)
    let source, element
    if (decoded && decoded.element) {
      element = createElement(src)
      element.loop = loop
      source = ctx.createMediaElementSource(element)
      source.connect(gain)
      try { await element.play() } catch { teardown({ source, gain, element }); return false }
    } else {
      source = ctx.createBufferSource()
      source.buffer = decoded
      source.loop = loop
      source.connect(gain)
      source.start()
    }
    layers.set(id, { src, gain, source, element })
    ramp(gain.gain, level, fadeIn)
    state.layers = [...layers.keys()]
    emit()
    return true
  }
  function setLayerLevel(id, level, seconds = 1) {
    const layer = layers.get(id)
    if (layer) ramp(layer.gain.gain, level, seconds)
  }
  function stopLayer(id, { fadeOut = 2 } = {}) {
    const layer = layers.get(id)
    if (!layer) return
    layers.delete(id)
    ramp(layer.gain.gain, 0, fadeOut)
    fading.add(layer)
    layer.stopTimer = setTimeout(() => teardown(layer), fadeOut * 1000 + 50)
    state.layers = [...layers.keys()]
    emit()
  }
  function stopAllLayers(o) { for (const id of [...layers.keys()]) stopLayer(id, o) }

  /** Pull the master bus down (stillness mode) / back up. */
  function duck(level = opts.duckLevel, ms = opts.duckMs) {
    if (!master) return
    ramp(master.gain, opts.masterGain * level, ms / 1000)
    state.ducked = true
    emit()
  }
  function unduck(ms = opts.unduckMs) {
    if (!master) return
    ramp(master.gain, opts.masterGain, ms / 1000)
    state.ducked = false
    emit()
  }

  /** Stop everything now and release the context. */
  function dispose() {
    cancelPendingStop()
    if (current) { teardown(current); current = null }
    for (const layer of layers.values()) teardown(layer)
    for (const node of [...fading]) teardown(node)
    layers.clear()
    state.layers = []
    state.playing = null
    state.unlocked = false
    if (ctx) { try { ctx.close?.()?.catch?.(() => {}) } catch { /* ignore */ } }
    ctx = null
    master = null
    cache.clear()
    emit()
    listeners.clear()
  }

  return {
    unlock, playTone, crossfadeTo, stopTone, holdTone, playOnce, duck, unduck, dispose,
    playLayer, setLayerLevel, stopLayer, stopAllLayers,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    getState: () => ({ ...state }),
    /** The live context — only for building test buffers (dev lab) after unlock. */
    context: () => ctx,
    options: opts,
  }
}
