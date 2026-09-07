import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'

/**
 * Terms of use. Facts wrapped in [[ ]] are the commercial ones only Monica can
 * settle — delivery, cancellation, invoicing. Everything else describes how the
 * site already behaves. Never replace a [[ ]] with a guess.
 */

const UPDATED = '7 September 2026'

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Use"
        description="Terms for using the PraShree Arts website: how artwork enquiries and commissions work, copyright in Monica Prakash's artwork, and workshop bookings."
        path="/terms"
      />

      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            as="h1"
            align="left"
            eyebrow="Terms"
            title="Terms of use"
            subtitle={`The plain-language basis on which this site and studio work. Last updated ${UPDATED}.`}
            className="mb-0"
          />
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose-post">
          <p>
            This site is run by PraShree Arts, the studio of Monica Prakash,
            Bengaluru, India. Using it means you are happy with what follows.
          </p>

          <h2>Artworks and enquiries</h2>
          <p>
            Nothing is sold through this website. Every artwork page ends in an
            enquiry, not a checkout: you express interest, and Monica contacts
            you personally to discuss the piece, any customisation, delivery and
            payment. No order exists until she has confirmed it with you
            directly.
          </p>
          <p>
            Prices shown are the studio&apos;s current guide for each piece and
            the range it may sit within. They may change, and a commissioned or
            custom-sized piece is quoted separately.
          </p>

          <h2>Original work</h2>
          <p>
            Every piece is drawn by hand. Two pieces are never identical, and a
            commission made &ldquo;like&rdquo; an existing artwork will differ from
            it in the detail — that is the nature of the work, not a fault. Colour
            on your screen may differ slightly from ink on paper.
          </p>
          <p>
            When an original has been sold it stays listed and marked as sold,
            and fine-art prints of it can still be made to order.
          </p>

          <h2>Delivery, cancellation and invoicing</h2>
          <p>
            [[Delivery timelines, packing and shipping charges, cancellation and
            refund terms, and GST/invoicing details to be confirmed by Monica —
            these are agreed directly with you when an enquiry becomes an order.]]
          </p>

          <h2>Classes and workshops</h2>
          <p>
            A booking request through this site is a request, not a confirmed
            seat. Monica confirms your place, the venue and the fee with you
            directly. Schedules and venues can change; you will be told if they
            do. [[Cancellation and rescheduling terms for classes and workshops
            to be confirmed by Monica.]]
          </p>

          <h2>Copyright</h2>
          <p>
            Every artwork, photograph, catalogue and piece of writing on this site
            is the property of Monica Prakash / PraShree Arts. Images and
            catalogue PDFs are watermarked. You are welcome to share links to the
            site. You may not copy, reproduce, print, sell, or use any artwork or
            image — including for AI training or commercial purposes — without
            written permission. Buying an artwork transfers the piece itself, not
            the copyright or reproduction rights in it.
          </p>

          <h2>The Mandala Studio</h2>
          <p>
            The drawing tool at <a href="/studio">/studio</a> is offered free for
            personal and teaching use. Mandalas you create with it are yours,
            including anything you print or export. It is provided as it is, with
            no guarantee it will suit a particular purpose.
          </p>

          <h2>The site itself</h2>
          <p>
            The site is offered as it is. We keep it accurate and available, but
            cannot promise it will always be error-free or uninterrupted. Links to
            other sites are offered for convenience; we are not responsible for
            what they contain.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of India, with the courts at
            Bengaluru, Karnataka having jurisdiction.
          </p>

          <h2>Questions</h2>
          <p>
            Anything unclear? Write to{' '}
            <a href="mailto:monica@prashreearts.com">monica@prashreearts.com</a>{' '}
            or call <a href="tel:+919353464363">+91 93534 64363</a>.
          </p>
        </div>
      </section>
    </>
  )
}
