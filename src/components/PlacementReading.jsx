import { useState } from 'react'
import ProductCard from './ProductCard'
import Button from './Button'
import { EnquiryModal } from './EnquiryForm'

/*
 * The reading panel under / beside the compass: the direction itself, then
 * the artworks that belong on that wall with their one-line placement note.
 * All copy comes from the direction profile and the artwork rows (editable in
 * /admin) — nothing is hard-coded here except the empty-state prompt.
 * No hover transitions and no entrances: content simply swaps.
 */
export default function PlacementReading({ profile, artworks }) {
  const [commission, setCommission] = useState(false)
  if (!profile) return null

  const showArtworks = profile.shows_artworks !== false
  const guardianLine = [profile.guardian && `Guardian ${profile.guardian}`, profile.element && `Element ${profile.element}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div key={profile.direction}>
      {/* ── The direction ── */}
      <section aria-labelledby="reading-title">
        <h2 id="reading-title" className="font-display text-h2 md:text-display-sm text-ink leading-tight">
          {profile.label}
        </h2>
        {profile.sanskrit_name && (
          <p className="font-script text-[2.25rem] leading-none text-graphite mt-2" lang="sa-Latn">
            {profile.sanskrit_name}
          </p>
        )}
        {guardianLine && (
          <p className="text-small uppercase tracking-label text-graphite mt-4">{guardianLine}</p>
        )}
        <p className="text-body text-charcoal mt-5 max-w-[60ch]">{profile.description}</p>
      </section>

      {/* ── The artworks ── */}
      {showArtworks && (
        <section aria-label={`Artworks for the ${profile.label.toLowerCase()} wall`} className="mt-10">
          <hr className="hairline mb-8" />
          {artworks.length ? (
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 list-none p-0 m-0 [&_article]:transition-none">
              {artworks.map((a) => (
                <li key={a.slug} className="flex flex-col">
                  <ProductCard product={a} />
                  {a.placement_note && (
                    <p className="italic text-body text-charcoal mt-3 px-1 leading-relaxed">
                      {a.placement_note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-mist p-8 text-center">
              <p className="text-body text-charcoal max-w-[45ch] mx-auto">
                Nothing in the collection for this direction yet. Monica takes commissions for specific walls.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setCommission(true)}>
                Ask about a commission
              </Button>
              <EnquiryModal
                open={commission}
                onClose={() => setCommission(false)}
                kind="contact"
                title="Commission"
                subject={`A piece for a ${profile.label.toLowerCase()} wall`}
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
