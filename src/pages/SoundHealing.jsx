import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Square } from 'lucide-react'
import SEO from '../components/SEO'
import { CHAKRAS, INTENTIONS, INSTRUMENTS, DURATIONS, DEFAULT_MINUTES, intentionByKey, chakraByKey } from '../data/soundHealing'
import { useHealingSession } from '../lib/useHealingSession'

/*
 * Sound healing, as a studio activity. Choose what you'd like to sit with
 * (or pick chakras directly), choose a length, press Begin. The bowls come
 * first, then the rain stick, the ocean drum, a gong, and the raga alaap
 * fading in last. Described as practice throughout — never as treatment.
 * Sounds are synthesised stand-ins until Monica's recordings are uploaded.
 */
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function SoundHealing() {
  const [params] = useSearchParams()
  const tempo = import.meta.env.DEV ? Math.max(1, Number(params.get('tempo')) || 1) : 1
  const [intention, setIntention] = useState(null)
  const [chakras, setChakras] = useState([])
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const session = useHealingSession({ tempo })

  const pickIntention = (key) => {
    const i = intentionByKey(key)
    setIntention(key)
    setChakras(i ? i.chakras : [])
  }
  const toggleChakra = (key) => {
    setIntention(null)
    setChakras((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key].slice(-2)))
  }

  const chosen = useMemo(() => chakras.map(chakraByKey).filter(Boolean), [chakras])
  const canBegin = chosen.length > 0 && session.stage !== 'starting'
  const running = session.stage === 'playing' || session.stage === 'done'

  const rows = [
    ...chosen.map((c) => ({ id: `bowl-${c.key}`, name: `Singing bowl · ${c.name} (${c.note}, ${c.hz} Hz)`, line: c.line })),
    ...INSTRUMENTS.filter((i) => i.key !== 'bowl').map((i) => ({ id: i.key === 'gong' ? 'gong' : i.key, name: i.name, line: i.line })),
  ]
  const status = (id) => {
    const s = session.entered[id]
    if (id === 'gong') return session.entered.gong ? 'struck' : session.entered['gong-close'] ? 'struck' : 'waiting'
    return s || 'waiting'
  }
  const STATUS_LABEL = { waiting: 'waiting', entering: 'entering', playing: 'playing', resting: 'settling back', struck: 'struck', fading: 'fading', missing: 'unavailable' }

  return (
    <>
      <SEO
        title="Sound Healing — Singing Bowls, Rain Stick, Ocean Drum, Gong & Raga"
        description="A guided listening session from PraShree Arts: singing bowls tuned to the chakras, then rain stick, ocean drum, a gong and a slow raga alaap. Choose what you'd like to sit with and how long."
        path="/studio/sound-healing"
        keywords={['sound healing session online', 'chakra singing bowls', 'singing bowl frequencies', 'sound bath online']}
      />
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-20">
        <Link to="/studio" className="inline-flex items-center gap-2 text-small text-graphite hover:text-ink no-underline mb-8">
          <ArrowLeft size={14} aria-hidden="true" /> The Studio
        </Link>
        <header className="max-w-2xl mb-10">
          <p className="text-small uppercase tracking-label text-graphite mb-3">Sound healing</p>
          <h1 className="font-display text-display-sm md:text-display text-ink">Sit with a sound</h1>
          <p className="text-body text-graphite mt-4">
            Singing bowls tuned to the chakras come first. A rain stick, an ocean drum, a gong and a slow raga
            alaap join in turn. Headphones or a quiet room, eyes closed if you like. It works in whatever way
            it works; nothing here is a treatment.
          </p>
          <p className="text-small text-ash mt-3">
            The sounds are studio stand-ins for now, made to the bowls' pitches; Monica's own recordings replace them as they are added.
          </p>
        </header>

        {!running && (
          <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 lg:gap-16">
            <div>
              {/* ── what to sit with ── */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="font-display text-h3 text-ink mb-4">What would you like to sit with?</legend>
                <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0" role="radiogroup" aria-label="What would you like to sit with">
                  {INTENTIONS.map((i) => {
                    const on = intention === i.key
                    return (
                      <li key={i.key}>
                        <button
                          type="button" role="radio" aria-checked={on}
                          onClick={() => pickIntention(i.key)}
                          className={`w-full text-left min-h-11 px-4 py-3 border cursor-pointer transition-colors ${on ? 'bg-ink text-paper border-ink' : 'bg-white text-charcoal border-mist hover:border-ink'}`}
                        >
                          <span className="block text-[16px] font-medium">{i.label}</span>
                          <span className={`block text-[15px] mt-0.5 ${on ? 'text-paper/75' : 'text-graphite'}`}>{i.line}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>

              {/* ── or choose the bowls directly ── */}
              <fieldset className="border-0 p-0 m-0 mt-10">
                <legend className="font-display text-h3 text-ink mb-1">Or choose the bowls</legend>
                <p className="text-small text-graphite mb-4">Up to two. Each bowl is tuned to the note tradition pairs with that chakra.</p>
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0" aria-label="Chakras">
                  {CHAKRAS.map((c) => {
                    const on = chakras.includes(c.key)
                    return (
                      <li key={c.key}>
                        <button
                          type="button" aria-pressed={on}
                          onClick={() => toggleChakra(c.key)}
                          title={`${c.sanskrit} · ${c.seat}`}
                          className={`min-h-11 px-4 border text-[15px] cursor-pointer transition-colors ${on ? 'bg-ink text-paper border-ink' : 'bg-white text-charcoal border-mist hover:border-ink'}`}
                        >
                          {c.name} <span className={on ? 'text-paper/70' : 'text-graphite'}>· {c.note} {c.hz} Hz</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {chosen.length > 0 && (
                  <ul className="mt-4 space-y-1 list-none p-0 m-0 text-[15px] text-graphite">
                    {chosen.map((c) => <li key={c.key}><span className="text-charcoal">{c.sanskrit}</span> · {c.line}</li>)}
                  </ul>
                )}
              </fieldset>
            </div>

            {/* ── length + begin ── */}
            <aside className="lg:sticky lg:top-24 self-start border border-mist p-6">
              <p className="text-small uppercase tracking-label text-graphite">Length</p>
              <div className="flex gap-2 mt-3" role="radiogroup" aria-label="Session length">
                {DURATIONS.map((m) => (
                  <button
                    key={m} type="button" role="radio" aria-checked={minutes === m}
                    onClick={() => setMinutes(m)}
                    className={`min-h-11 px-4 border text-[15px] cursor-pointer ${minutes === m ? 'bg-ink text-paper border-ink' : 'bg-white text-charcoal border-mist hover:border-ink'}`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              <ol className="mt-6 space-y-2 list-none p-0 m-0 text-[15px] text-graphite">
                {INSTRUMENTS.map((i, k) => (
                  <li key={i.key} className="flex gap-3"><span className="text-ash w-4">{k + 1}</span><span><span className="text-charcoal">{i.name}</span> — {i.line}</span></li>
                ))}
              </ol>
              <button
                type="button"
                disabled={!canBegin}
                onClick={() => session.begin({ chakras }, minutes)}
                className="mt-6 w-full min-h-12 bg-ink text-paper text-[15px] uppercase tracking-label border-0 cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                {session.stage === 'starting' ? 'Starting…' : 'Begin'}
              </button>
              {chosen.length === 0 && <p className="text-small text-graphite mt-2">Choose something to sit with, or a bowl, to begin.</p>}
              {session.stage === 'blocked' && (
                <p className="text-small text-charcoal mt-3" role="status">Your browser did not allow sound yet. Press Begin once more.</p>
              )}
            </aside>
          </div>
        )}

        {running && (
          <div className="max-w-2xl">
            <div className="flex items-baseline justify-between gap-6">
              <p className="font-display text-h2 text-ink m-0" aria-live="polite">
                {session.stage === 'done' ? 'Session complete.' : `${fmt(session.elapsed)} of ${fmt(session.total)}`}
              </p>
              <button
                type="button" onClick={() => session.stop()}
                className="inline-flex items-center gap-2 min-h-11 px-4 border border-ink text-ink bg-white text-[15px] cursor-pointer"
              >
                <Square size={14} aria-hidden="true" /> {session.stage === 'done' ? 'Back' : 'Stop'}
              </button>
            </div>
            <div className="hairline mt-4 relative overflow-hidden" aria-hidden="true">
              <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${session.total ? (session.elapsed / session.total) * 100 : 0}%`, transition: 'width 500ms linear' }} />
            </div>
            <ul className="mt-8 divide-y divide-mist list-none p-0 m-0" aria-label="Instruments in this session">
              {rows.map((r) => {
                const st = status(r.id)
                return (
                  <li key={r.id} className="py-4 flex items-start justify-between gap-6">
                    <div>
                      <p className={`m-0 text-[16px] ${st === 'waiting' ? 'text-graphite' : 'text-ink'}`}>{r.name}</p>
                      <p className="m-0 mt-0.5 text-[15px] text-graphite">{r.line}</p>
                    </div>
                    <span className={`shrink-0 text-[15px] pt-0.5 ${st === 'playing' || st === 'struck' ? 'text-ink' : 'text-graphite'}`} aria-label={`status: ${STATUS_LABEL[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="text-small text-graphite mt-8">Stay as long as you like after it ends. Leaving this page stops the sound.</p>
          </div>
        )}
      </section>
    </>
  )
}
