import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSoundEngine, DEFAULTS } from './engine'

/* ── A small fake of the Web Audio surface the engine touches ── */
class FakeParam {
  constructor(v = 1) { this.value = v; this.calls = [] }
  setValueAtTime(v, t) { this.calls.push(['set', v, t]); this.value = v }
  linearRampToValueAtTime(v, t) { this.calls.push(['ramp', v, t]); this.value = v }
  cancelScheduledValues(t) { this.calls.push(['cancel', t]) }
}
class FakeNode {
  constructor(ctx) { this.ctx = ctx; this.connected = []; this.disconnected = false }
  connect(n) { this.connected.push(n); return n }
  disconnect() { this.disconnected = true }
}
class FakeGain extends FakeNode { constructor(ctx) { super(ctx); this.gain = new FakeParam(1) } }
class FakeSource extends FakeNode {
  constructor(ctx) { super(ctx); this.buffer = null; this.loop = false; this.started = false; this.stopped = false; ctx.sources.push(this) }
  start() { this.started = true }
  stop() { this.stopped = true }
}
class FakeCtx {
  constructor({ blocked = false } = {}) {
    this.blocked = blocked; this.state = 'suspended'; this.currentTime = 10
    this.destination = { name: 'destination' }; this.sources = []; this.gains = []; this.closed = false
  }
  async resume() { if (this.blocked) throw new Error('NotAllowedError'); this.state = 'running' }
  createGain() { const g = new FakeGain(this); this.gains.push(g); return g }
  createBufferSource() { return new FakeSource(this) }
  createMediaElementSource() { return new FakeNode(this) }
  async decodeAudioData(bytes) { return { duration: bytes.byteLength / 1000, fake: true } }
  async close() { this.closed = true }
}

const bytes = (n) => new ArrayBuffer(n)
const make = (ctxOpts = {}, engineOpts = {}) => {
  const ctx = new FakeCtx(ctxOpts)
  const fetched = []
  const engine = createSoundEngine({
    createContext: () => ctx,
    fetchBytes: async (url) => { fetched.push(url); return bytes(url.includes('big') ? 2 * 1024 * 1024 : 2500) },
    createElement: () => ({ play: async () => {}, pause() {}, loop: false, duration: 7 }),
    ...engineOpts,
  })
  return { ctx, engine, fetched }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('unlock', () => {
  it('creates nothing until unlock() is called', async () => {
    const { ctx, engine, fetched } = make()
    expect(engine.context()).toBeNull()
    expect(await engine.playTone('https://a/tone.m4a')).toBe(false)
    expect(fetched).toEqual([])
    expect(ctx.gains).toHaveLength(0)
  })

  it('resumes the context and wires a 0.6 master bus to the destination', async () => {
    const { ctx, engine } = make()
    expect(await engine.unlock()).toBe(true)
    expect(engine.getState().unlocked).toBe(true)
    expect(ctx.gains[0].gain.value).toBe(DEFAULTS.masterGain)
    expect(ctx.gains[0].connected[0]).toBe(ctx.destination)
    await engine.unlock() // idempotent: still one master bus
    expect(ctx.gains).toHaveLength(1)
  })

  it('treats a blocked resume() as a normal, quiet outcome', async () => {
    const { engine, fetched } = make({ blocked: true })
    await expect(engine.unlock()).resolves.toBe(false)
    expect(engine.getState().unlocked).toBe(false)
    expect(await engine.playTone('https://a/tone.m4a')).toBe(false)
    expect(fetched).toEqual([])
  })
})

describe('playTone / stopTone', () => {
  it('fetches once, loops an AudioBufferSourceNode, and ramps 0 → 1 over 2.5 s from currentTime', async () => {
    const { ctx, engine, fetched } = make()
    await engine.unlock()
    expect(await engine.playTone('https://a/tone.m4a')).toBe(true)
    expect(fetched).toEqual(['https://a/tone.m4a'])
    const src = ctx.sources[0]
    expect(src.loop).toBe(true)
    expect(src.started).toBe(true)
    expect(src.buffer.fake).toBe(true)
    const toneGain = ctx.gains[1].gain
    expect(toneGain.calls).toEqual([['cancel', 10], ['set', 0, 10], ['ramp', 1, 12.5]])
    expect(engine.getState().playing).toBe('https://a/tone.m4a')
    // same tone again: no second fetch, no second source
    await engine.playTone('https://a/tone.m4a')
    expect(fetched).toHaveLength(1)
    expect(ctx.sources).toHaveLength(1)
  })

  it('stopTone ramps to 0 over 1.5 s and disconnects after the ramp', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    await engine.playTone('https://a/tone.m4a')
    ctx.currentTime = 20
    engine.stopTone()
    const toneGain = ctx.gains[1].gain
    expect(toneGain.calls.at(-1)).toEqual(['ramp', 0, 21.5])
    expect(engine.getState().playing).toBeNull()
    expect(ctx.sources[0].stopped).toBe(false)
    vi.advanceTimersByTime(1600)
    expect(ctx.sources[0].stopped).toBe(true)
    expect(ctx.sources[0].disconnected).toBe(true)
    expect(ctx.gains[1].disconnected).toBe(true)
  })

  it('a delayed stop is cancelled by a new tone (route-change grace period)', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    await engine.playTone('https://a/one.m4a')
    engine.stopTone({ delay: 800 })
    vi.advanceTimersByTime(300)
    await engine.crossfadeTo('https://a/two.m4a')
    vi.advanceTimersByTime(3000)
    expect(engine.getState().playing).toBe('https://a/two.m4a')
    expect(ctx.sources[1].stopped).toBe(false)
  })

  it('holdTone cancels a pending stop; a shorter delay never shortens a longer one', async () => {
    const { engine } = make()
    await engine.unlock()
    await engine.playTone('https://a/one.m4a')
    engine.stopTone({ delay: 2000 })
    engine.stopTone({ delay: 500 })          // ignored: the 2 s grace stands
    vi.advanceTimersByTime(600)
    expect(engine.getState().playing).toBe('https://a/one.m4a')
    engine.holdTone()
    vi.advanceTimersByTime(3000)
    expect(engine.getState().playing).toBe('https://a/one.m4a')
    engine.stopTone({ delay: 100 })
    vi.advanceTimersByTime(150)
    expect(engine.getState().playing).toBeNull()
  })

  it('a delayed stop fires when nothing claims the engine', async () => {
    const { engine } = make()
    await engine.unlock()
    await engine.playTone('https://a/one.m4a')
    engine.stopTone({ delay: 800 })
    expect(engine.getState().playing).toBe('https://a/one.m4a')
    vi.advanceTimersByTime(801)
    expect(engine.getState().playing).toBeNull()
  })
})

describe('crossfadeTo', () => {
  it('fades the old tone out while the new one fades in — never two at full level', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    await engine.playTone('https://a/one.m4a')
    ctx.currentTime = 30
    await engine.crossfadeTo('https://a/two.m4a')
    const oldGain = ctx.gains[1].gain, newGain = ctx.gains[2].gain
    expect(oldGain.calls.at(-1)).toEqual(['ramp', 0, 31.5])
    expect(newGain.calls.at(-1)).toEqual(['ramp', 1, 32.5])
    expect(engine.getState().playing).toBe('https://a/two.m4a')
    vi.advanceTimersByTime(1600)
    expect(ctx.sources[0].stopped).toBe(true)
    expect(ctx.sources[1].stopped).toBe(false)
  })
})

describe('playOnce', () => {
  it('plays without looping and releases itself on end', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    const duration = await engine.playOnce('https://a/gong.m4a')
    expect(duration).toBeGreaterThan(0)
    const src = ctx.sources[0]
    expect(src.loop).toBe(false)
    expect(src.started).toBe(true)
    expect(engine.getState().playing).toBeNull() // a one-shot is not "the tone"
    src.onended()
    expect(src.disconnected).toBe(true)
  })

  it('returns 0 when locked', async () => {
    const { engine } = make({ blocked: true })
    await engine.unlock()
    expect(await engine.playOnce('https://a/gong.m4a')).toBe(0)
  })
})

describe('duck / unduck', () => {
  it('ramps the master bus down to 15% of 0.6 and back', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    engine.duck()
    const master = ctx.gains[0].gain
    expect(master.calls.at(-1)).toEqual(['ramp', DEFAULTS.masterGain * DEFAULTS.duckLevel, 10 + 0.6])
    expect(engine.getState().ducked).toBe(true)
    engine.unduck()
    expect(master.calls.at(-1)).toEqual(['ramp', DEFAULTS.masterGain, 10 + 0.9])
    expect(engine.getState().ducked).toBe(false)
  })
})

describe('large files', () => {
  it('falls back to an <audio> element above the buffer limit and records the URL', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    expect(await engine.playTone('https://a/big.m4a')).toBe(true)
    expect(engine.getState().largeFiles).toEqual(['https://a/big.m4a'])
    expect(ctx.sources).toHaveLength(0) // no buffer source: media element path
  })

  it('swallows a rejected element play()', async () => {
    const { engine } = make({}, { createElement: () => ({ play: async () => { throw new Error('NotAllowed') }, pause() {} }) })
    await engine.unlock()
    expect(await engine.playTone('https://a/big.m4a')).toBe(false)
    expect(engine.getState().playing).toBeNull()
  })
})

describe('dispose', () => {
  it('stops the tone, closes the context, and locks', async () => {
    const { ctx, engine } = make()
    await engine.unlock()
    await engine.playTone('https://a/tone.m4a')
    engine.dispose()
    expect(ctx.sources[0].stopped).toBe(true)
    expect(ctx.closed).toBe(true)
    expect(engine.getState()).toMatchObject({ unlocked: false, playing: null })
    expect(engine.context()).toBeNull()
  })

  it('a failed fetch is not cached and reports false', async () => {
    let calls = 0
    const { engine } = make({}, { fetchBytes: async () => { calls++; throw new Error('404') } })
    await engine.unlock()
    expect(await engine.playTone('https://a/missing.m4a')).toBe(false)
    expect(await engine.playTone('https://a/missing.m4a')).toBe(false)
    expect(calls).toBe(2)
  })
})
