import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'

/**
 * Privacy policy. Everything here describes what the site actually does —
 * the forms in src/components, the Supabase tables they write to, and the
 * consent-gated analytics in src/lib/analytics.js. Keep it in step with the
 * code: if a form starts collecting a new field, say so here too.
 */

const UPDATED = '7 September 2026'

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="How PraShree Arts handles the details you share through enquiry forms, what analytics we use, and how to have your information removed."
        path="/privacy"
      />

      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            as="h1"
            align="left"
            eyebrow="Privacy"
            title="Privacy policy"
            subtitle={`How your details are handled at PraShree Arts. Last updated ${UPDATED}.`}
            className="mb-0"
          />
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose-post">
          <p>
            PraShree Arts is a one-person studio run by Monica Prakash in
            Bengaluru, India. This site takes no payments and runs no
            advertising. The only information it holds is what you choose to
            type into an enquiry form.
          </p>

          <h2>What is collected</h2>
          <p>
            When you express interest in an artwork, book a session, or write to
            the studio, the form asks for your <strong>name</strong> and{' '}
            <strong>phone number</strong>, and optionally your{' '}
            <strong>email address</strong>, <strong>city</strong> and a{' '}
            <strong>message</strong>. Event décor enquiries also ask for the{' '}
            <strong>date, venue and guest count</strong> of your occasion.
          </p>
          <p>
            That is all. No card or bank details are ever requested — there is no
            online payment on this site. Nothing is collected silently while you
            browse beyond what is described under Analytics below.
          </p>

          <h2>Why it is collected</h2>
          <p>
            Solely so Monica can reply to you personally about the artwork,
            class, workshop or occasion you asked about, and keep a record of
            that conversation. Your details are never sold, rented, or shared
            for marketing.
          </p>

          <h2>Where it is stored</h2>
          <p>
            Enquiries are stored in a private Supabase database that only Monica
            can read, through a password-protected admin area. The site itself is
            hosted on Vercel, which keeps standard server logs of requests. Both
            are third-party service providers acting on the studio&apos;s behalf.
          </p>

          <h2>Analytics and cookies</h2>
          <p>
            The site uses <strong>Google Analytics</strong> to understand which
            artworks, workshops and pages people look at, so the site can be
            improved. It loads <strong>only if you accept</strong> in the cookie
            banner. Decline and no analytics cookies are set at all — everything
            on the site works identically either way.
          </p>
          <p>
            If you accept, Google Analytics records the pages you visit,
            approximate location (city level), device and browser type, and how
            you arrived. It cannot see your name, phone number or anything you
            type into a form. Your choice is remembered in your own browser and
            you can change it any time by clearing your browser storage for this
            site.
          </p>

          <h2>How long it is kept</h2>
          <p>
            Enquiries are kept for as long as they are useful to the studio — an
            artwork enquiry may be revisited months later when a piece becomes
            available. Ask us to delete yours and we will.
          </p>

          <h2>Your choices</h2>
          <p>
            You may ask to see the details the studio holds about you, correct
            them, or have them deleted. Write to{' '}
            <a href="mailto:monica@prashreearts.com">monica@prashreearts.com</a>{' '}
            or call <a href="tel:+919353464363">+91 93534 64363</a> and we will
            act on it.
          </p>

          <h2>Children</h2>
          <p>
            The site is not aimed at children. Where a child attends a workshop,
            the booking is made by a parent or guardian, and only the adult&apos;s
            contact details are held.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, the date at the top of this page changes with
            it. Questions about any of it are welcome at{' '}
            <a href="mailto:monica@prashreearts.com">monica@prashreearts.com</a>.
          </p>
        </div>
      </section>
    </>
  )
}
