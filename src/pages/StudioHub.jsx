import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import { STUDIO_ACTIVITIES } from '../data/studio'

/* Drawn thumbnails for activities without a photograph — same linework as the compass. */
function Glyph({ name }) {
  if (name !== 'bowl') return null
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <rect width="400" height="300" className="fill-paper" />
      {/* singing bowl: rim ellipse, body, foot, striker resting on the rim; ripples above */}
      <g fill="none" className="stroke-ink" strokeLinecap="round">
        <ellipse cx="200" cy="150" rx="118" ry="30" strokeWidth="2.4" />
        <ellipse cx="200" cy="150" rx="104" ry="22" strokeWidth="0.7" />
        <path d="M 82 150 C 86 222, 140 250, 200 250 C 260 250, 314 222, 318 150" strokeWidth="2.4" />
        <path d="M 100 190 C 130 214, 270 214, 300 190" strokeWidth="0.6" />
        <path d="M 112 212 C 140 232, 260 232, 288 212" strokeWidth="0.6" />
        <path d="M 160 250 L 156 262 L 244 262 L 240 250" strokeWidth="1.6" />
        <path d="M 250 128 L 352 62" strokeWidth="5" />
        <circle cx="356" cy="59" r="9" strokeWidth="1.6" className="fill-paper" />
        {[150, 122, 96].map((r, i) => (
          <path key={r} d={`M ${200 - r} 108 A ${r} ${r * 0.42} 0 0 1 ${200 + r} 108`} strokeWidth={0.5 + i * 0.25} opacity={0.35 + i * 0.2} />
        ))}
      </g>
    </svg>
  )
}

export default function StudioHub() {
  return (
    <>
      <SEO
        title="The Studio — Sound Healing & Mandala Tools"
        description="PraShree Arts' studio activities: a sound healing session with chakra-tuned singing bowls, rain stick, ocean drum, gong and raga alaap, and a mandala drawing tool that teaches Monica Prakash's method."
        path="/studio"
        keywords={['sound healing online', 'singing bowl chakra sounds', 'mandala generator', 'mandala drawing tool']}
      />
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-20">
        <header className="mb-10 md:mb-14 max-w-2xl">
          <p className="text-small uppercase tracking-label text-graphite mb-3">The Studio</p>
          <h1 className="font-display text-display-sm md:text-display text-ink">Things to do here</h1>
          <p className="text-body text-graphite mt-4">
            Small practices from Monica's studio you can sit with at home. Pick one; more will join this list.
          </p>
        </header>

        <ul className="grid gap-8 sm:grid-cols-2 list-none p-0 m-0">
          {STUDIO_ACTIVITIES.map((a) => (
            <li key={a.key}>
              <Link
                to={a.to}
                className="group block no-underline border border-mist hover:border-ink transition-colors bg-white h-full"
                aria-label={`${a.title} — open`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-paper">
                  {a.image ? (
                    <img src={a.image} alt="" loading="lazy" className="w-full h-full object-cover treat-grayscale" />
                  ) : (
                    <Glyph name={a.glyph} />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-display text-h3 text-ink flex items-center gap-3 m-0">
                    {a.title}
                    <ArrowRight size={18} aria-hidden="true" className="text-graphite group-hover:translate-x-1 transition-transform" />
                  </h2>
                  <p className="text-body text-charcoal mt-3">{a.line}</p>
                  {a.meta && <p className="text-small text-graphite mt-3">{a.meta}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
