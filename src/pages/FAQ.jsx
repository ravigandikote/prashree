import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import Button from '../components/Button'
import { faqGroups, allFaqs } from '../data/faq'

/** Accordion row. Answers stay in the DOM (hidden) so browser find works. */
function Item({ item, open, onToggle, id }) {
  return (
    <div className="border-b border-mist">
      <h3 className="m-0">
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-button`}
          className="w-full flex items-start justify-between gap-6 py-5 text-left bg-transparent border-0 cursor-pointer group"
        >
          <span className="font-display text-h3 text-ink leading-snug">{item.q}</span>
          <span className="text-graphite group-hover:text-ink transition-colors mt-1.5 shrink-0" aria-hidden="true">
            {open ? <Minus size={16} /> : <Plus size={16} />}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-10">
              <p className="text-graphite">{item.a}</p>
              {item.link && (
                <Link
                  to={item.link.to}
                  className="inline-flex items-center gap-1.5 mt-3 text-small text-ink no-underline border-b border-mist hover:border-ink pb-0.5 transition-colors"
                >
                  {item.link.label} <ArrowRight size={13} aria-hidden="true" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState('0-0') // first answer open as a hint

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <SEO
        title="Frequently Asked Questions"
        description="How buying an original mandala artwork works, prints of sold originals, custom commissions, class timings, doorstep sessions and event décor — answered by PraShree Arts, Bengaluru."
        path="/faq"
        keywords={['buy mandala art India FAQ', 'commission mandala artwork', 'mandala class Bengaluru', 'Janur art workshop']}
        jsonLd={jsonLd}
      />

      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            as="h1"
            align="left"
            eyebrow="Questions"
            title="Frequently asked"
            subtitle="The things people ask most often before they write in. If yours isn't here, just ask — Monica answers every message herself."
            className="mb-0"
          />
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqGroups.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? 'mt-16' : ''}>
              <p className="text-small uppercase tracking-label text-ash mb-4">
                {group.title}
              </p>
              <div className="border-t border-mist">
                {group.items.map((item, ii) => {
                  const id = `${gi}-${ii}`
                  return (
                    <Item
                      key={item.q}
                      id={`faq-${id}`}
                      item={item}
                      open={open === id}
                      onToggle={() => setOpen(open === id ? null : id)}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          <div className="mt-16 border border-mist p-8 text-center">
            <h2 className="font-display text-h2 text-ink">Still wondering?</h2>
            <p className="text-graphite mt-2 max-w-md mx-auto">
              Ask Monica directly — about a piece, a commission, a class, or an
              occasion you would like dressed.
            </p>
            <Button to="/contact" className="mt-6">Write to the studio</Button>
          </div>
        </div>
      </section>
    </>
  )
}
