# PraShree Arts — Codebase Knowledge Base

Handcrafted-art portfolio + e-commerce site for **Monica Prakash** (Mandala Art Therapist,
Janur Art practitioner, founder of PraShree Arts, Creative Director at NeeRav Arts Village).
Strictly **black & white / monochrome** brand — the logo is B&W and the whole site must be.

## Actual stack (verified from code — differs from earlier assumptions)

> The refactor brief expected Next.js 15 App Router + TypeScript + Prisma + Auth.js +
> Cloudinary. **None of that is present.** The real stack is:

| Layer     | Reality |
|-----------|---------|
| Framework | **React 19** (`react@^19.2.4`) SPA — plain **JSX, no TypeScript** |
| Bundler   | **Vite 8** (rolldown-based) + `@vitejs/plugin-react` |
| Styling   | **Tailwind CSS v4** via `@tailwindcss/vite`; theme tokens in `src/index.css` `@theme` block (no tailwind.config file) |
| Routing   | `react-router-dom` v7 (client-side, `BrowserRouter`), lazy-loaded pages |
| Backend   | **Supabase** (Postgres + Auth + Storage) via `@supabase/supabase-js`; all queries client-side with anon key + RLS |
| Payments  | **Razorpay Checkout** (client-side only; no server order endpoint exists) |
| SEO       | `react-helmet-async` per-page (`src/components/SEO.jsx`); no sitemap/robots |
| Animation | `framer-motion` 12; Icons: `lucide-react`; Toasts: `react-hot-toast` |
| Fonts     | Google Fonts `<link>` in `index.html`: Playfair Display (display) + Inter (body) |
| Hosting   | Vercel static SPA (`vercel.json` rewrites everything except `/api/*` to `index.html`) |

No Prisma, no Auth.js, no Cloudinary, no MDX, no server components, no tests, no CI.

## Commands

```bash
npm run dev       # Vite dev server on port 3000
npm run build     # vite build → dist/
npm run preview   # preview production build
npm run lint      # eslint (flat config, react-hooks + react-refresh)
npm test          # vitest (catalog, events, mandala, vastu data)
npm run artworks:sql / vastu:sql   # regenerate the catalogue / Vastu seed SQL from the JSON sources
```

No migrate/seed commands — DB schema + seed live in `supabase/schema.sql`, run manually
in the Supabase SQL editor. Node: `.nvmrc` says 18, environment has 24 — both work.

**Fresh-install gotcha:** `npm i` can hit the npm optional-deps bug and miss rolldown's
native binding → `vite build` fails with "Cannot find native binding". Fix:
`npm install --no-save @rolldown/binding-linux-x64-gnu` (or wipe lockfile+node_modules and reinstall).

## Environment (`.env`, see `.env.example`)

```
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_RAZORPAY_KEY_ID
```
All client-exposed. Code falls back to placeholder values when unset (site runs on demo data).

## Route map (`src/App.jsx`)

Public routes wrap in `Layout` (Navbar + Footer + ScrollToTop):

| Route | Page | Data |
|---|---|---|
| `/` | `pages/Home.jsx` — **rebuilt Phase 2**: split hero (logo + 2199 portrait), statement band, **featured-artwork band (2026-09-07)**, Artworks/Learn/Décor/
Founder/Community sections, enquiry CTA. All static; no Supabase fallbacks. Latest-blog section deferred to Phase 6. CTAs point at `/categories`+`/workshops` until Phases 3/5 rename them | static |
| `/about` | `pages/About.jsx` — **rebuilt Phase 2**: 1984 hero, why-B&W + 1132 inset, credentials grid, teaching (7546), décor (4718), beyond-the-studio strip (0812/1516/1862), 20 art-form chips, NeeRav band | static |
| `/products` | `pages/Products.jsx` — **catalogue rebuilt 2026-08-19**: sticky filter bar (art form/series/size/price-band/Vastu direction selects with live `(n)` facet counts + disabled-at-0, 200 ms-debounced search over name+intent+pdf+series+form, sort Name/Price↑↓/Size, reset, "n of total" count), all state in the URL query (`useSearchParams`, replace, no scroll jump), mobile bottom-sheet for filters, load-more at 24. Data: `getProducts` filtered to rows with `form`; falls back to `src/data/artworks.js` (built from `PraShree-Products-Metadata/items.json`) when the DB is unreachable/unseeded. Pure logic in `src/lib/catalog.js` (Vitest-covered: `npm test`) | `getProducts` |
| `/products/:slug` | `pages/ProductDetail.jsx` — framed image, intent, form/series/direction chips, pricing strip (original+range/USD/prints/size/hours), vastu note, availability-checked catalogue-PDF button+viewer (`usePdfAvailable` HEAD-checks content-type because the SPA rewrite 200s missing files), Express-interest modal, JSON-LD Product, per-artwork OG image, "You may also like" (same series → same form, 4). Fallback to local data by slug | `getProductBySlug`, `createInterest` |
| `/categories`, `/categories/:slug`, `/cart` | redirects → `/products` (legacy shop-era URLs) | — |
| `/learn` | `pages/Learn.jsx` — 7529 hero, three offering cards (data in `src/data/learn.js`, [[ ]] for unknown durations/needs), 6 residential-workshop cards, **`#doorstep` dark section** (Janur Art / sound healing / Mandala Art Therapy at the host's venue — cards for residential societies, corporate offices, and studios/space owners on revenue share; data `doorstepAudiences` in learn.js), community strip; every card opens `EnquiryModal` (kind=booking → `enquiries` table, distinct subject per audience) | `createEnquiry` |
| `/connections` | **parked 2026-08-20** (user request): route redirects → `/about`; nav/footer links removed. `pages/Connections.jsx` + `src/data/connections.js` + the `connections` table are kept for revival | — |
| `/workshops` | `pages/WorkshopEvents.jsx` — **Upcoming Workshops (2026-08-21)**: announcement page for recurring/one-off workshops (flyer image or placeholder, schedule, venue, description, Reserve-a-spot → EnquiryModal kind=booking subject "Workshop: <title>"), Event JSON-LD. Data: `workshop_events` table (migration `20260821_workshop_events.sql`, seeded with the two Sunday workshops at Eco Cottage, Kalyan Nagar) via `getActiveWorkshops`, falling back to `src/data/workshopEvents.js` after a 4 s race timeout. Managed at `/admin/workshops` (CRUD + flyer upload to `artworks` bucket, active toggle, display order). Nav gained "Workshops"; Sacred Geometry left the navbar (still in footer + Studio CTA) to fit | `getActiveWorkshops`, `createEnquiry` |
| `/events` | **PraShree Events (2026-08-25)** — natural/sustainable event décor sub-brand page. Supplied banner (public/images/prashree-events-banner.png, title baked in; served as -1600/-2400/-3200.jpg derivatives, HTML text hero on mobile + sr-only h1), monochrome sections below per decision: intro, occasions grid (from banner list), storage-driven gallery (`artworks/events/` folder, masonry + lightbox, empty state), 3-step process, jute-texture materials callout (CSS cross-hatch), `EventEnquiryForm` (kind='event' + event_date/venue/guest_count → migration `20260825_event_enquiries.sql`), then "Continue on WhatsApp" prefilled summary (wa.me/919353464363 — number needs confirming as WhatsApp). Content in `src/data/events.js` (Vitest-covered). Service JSON-LD. Admin enquiries gained kind filter + event detail line | `createEnquiry`, storage list |
| `/sacred-geometry` | `pages/SacredGeometry.jsx` — educational sections; the old simple generator was retired in favour of a Studio CTA | static |
| `/studio` | **The Studio hub (2026-09-18)** — `pages/StudioHub.jsx`: a list of studio activities from `src/data/studio.js` (thumbnail + title + line + meta; `image` = photo/artwork thumb with the grayscale house treatment, `glyph` = drawn SVG for activities without a photo). Today: **Sound healing** → `/studio/sound-healing`, **Generate a mandala** → `/studio/mandala`. More join the list by adding an entry. Old links updated (Sacred Geometry CTA, FAQ, Terms, 404, footer "Sound Healing" + "Mandala Studio"); sitemap has all three | static |
| `/studio/sound-healing` | **Sound Healing (2026-09-18)** — `pages/SoundHealing.jsx` + `lib/useHealingSession.js` + `data/soundHealing.js` (Vitest). Choose "what you'd like to sit with" (8 intentions → 1–2 chakras by traditional association; deliberately NOT a list of conditions — site rule: practice, never treatment) or up to two chakras directly (7 bowls at C 256 / D 288 / E 320 / F 341.3 / G 384 / A 426.7 / B 480 Hz, scientific pitch), length 5/10/15 min, Begin (the gesture: switches sound on + unlocks). `buildSession` plans: bowl(s) at 0/20 s → rain stick 45 s → ocean drum 90 s → gong strike 130 s → raga alaap fades in over 25 s from 140 s → bowls settle back 175 s → everything fades over the last 30 s → closing gong. Runs on the engine's new **layers** API (`playLayer/setLayerLevel/stopLayer/stopAllLayers`, independent of the artwork tone). Sounds: `public/sounds/<slug>.wav` are **synthesised stand-ins** generated by `scripts/generate-healing-sounds.mjs` (`npm run sounds:generate`, also `predev`/`prebuild`; gitignored; ~6 MB total, a session downloads ~2.7 MB) — rimmed bowls with beating partials, grain-shower rain stick, pink-noise ocean swells, blooming gong, tanpura + bansuri-style alaap in Raga Yaman, all loop-crossfaded; a `site_audio` row with the same slug (seeded empty by `20260918_healing_sounds.sql`, filled at /admin/sounds) overrides the stand-in. DEV-only `?tempo=N` compresses the timeline for testing. Stillness button hidden on `/studio/*` | `getSiteAudio` |
| `/studio/mandala` | **Mandala Studio (2026-08-21)** (was `/studio` until 2026-09-18) — teaching-first drafting tool built in six phases. mm-true SVG stage (viewBox = paper), stepper mirroring the taught order (paper → centre → circles → radial lines → patterns → download). Pure logic in `src/lib/mandala/` (geometry, state+50-step undo/redo history with tweak coalescing, templates, exporter, patterns) — 37 Vitest tests incl. per-motif rotation-symmetry proofs and mm→pt scaling. 49 tileable motifs in 7 families (Petals & leaves, Line work, Geometry, Dots & pebbles, Scallops & arches, **Florals**, **Weave & lattice** — the last two added 2026-09 from a second batch of Monica's reference mandalas: swept/pinwheel lotus, contour petals, serrated fronds, daisies and blooms, vesica lattice, rosette net, basket weave, ribbed scales, onion arches, feather rays, coil clusters, nested squares, hatched triangles, bead chains, stippled cells); A/B sector alternation; per-ring weights fine/medium/bold; **density-aware tiling** (repeatsForCell keeps motif cells ~square, so outer rings carry more repeats — always a multiple of the sector count — instead of stretching). Export: vector PDF (jsPDF+svg2pdf, exact paper MediaBox), PNG 300 DPI, SVG; guides-only "print and fill by hand" is first-class. Templates: localStorage + JSON file import/export + autosave/resume + **PraShree starters** from `mandala_templates` (migration `20260821_mandala_templates.sql`, curated in `/admin/templates`). Examples strip links the 10 reference artworks. UI in `src/components/studio/` (canvas w/ zoom-pan + draggable centre + annulus ring hit areas, panels, pattern bottom-sheet on mobile) | `getStarterTemplates` |
| `/blog` | `pages/Blog.jsx` — **new Phase 6**: editorial list of published posts (cover, date, tags, excerpt); EmptyState until posts exist | `getPublishedPosts` |
| `/blog/:slug` | `pages/BlogPost.jsx` — serif reading layout (`.prose-post`), markdown via `marked` + `DOMPurify`, keyed remount per slug | `getPostBySlug` |
| `/faq` | `pages/FAQ.jsx` — **new 2026-09-07**: accordion of 15 questions in 3 groups (data `src/data/faq.js`, [[ ]] for delivery), FAQPage JSON-LD | static |
| `/privacy` | `pages/Privacy.jsx` — describes what the forms actually collect, where it is stored, and the consent-gated analytics | static |
| `/terms` | `pages/Terms.jsx` — enquiry-not-checkout basis, copyright, Studio licence; [[ ]] for delivery/cancellation/GST | static |
| `*` | `pages/NotFound.jsx` — custom 404 inside the site chrome, `noindex` (the SPA rewrite 200s every URL) | static |
| `/contact` | `pages/Contact.jsx` — **rebuilt Phase 6**: 7387 portrait, tel/mailto/Instagram ([[INSTAGRAM_URL]] placeholder)/location, real `EnquiryForm` (kind=contact) → `enquiries` table | `createEnquiry` |
| `/admin/login` | Supabase email/password sign-in (monochrome) | Supabase Auth |
| `/admin/*` | **reworked Phase 4** — `AdminLayout` (auth-guarded, desktop sidebar + mobile top-nav) → index = `AdminInterests` (filters by product/status, tel:/mailto links, status New/Called/Follow-up/Closed, expandable notes), `AdminEnquiries`, `AdminProducts` (**rebuilt 2026-09-07**: every field the site renders, grouped
into The piece / Size, time & Vastu / Pricing / Photos & catalogue PDF /
Visibility, each with a hint saying where it shows; datalists seeded from the
live catalogue so form/series/size wording keeps matching the filters; Vastu
note auto-fills from the direction; multi-photo upload with cover/remove;
**catalogue-PDF upload** to `products/catalogues/`; uploads watermarked in the
browser via `src/lib/watermark.js` (opt-out checkbox); lists hidden rows too
via `getAllProducts`), `AdminPosts` (markdown body, cover upload, publish toggle), `AdminCategories`, `AdminMedia`. Dashboard & Orders pages deleted. Shared bits in `admin/adminUi.js` + `admin/StatusBadge.jsx` — all badges monochrome | `lib/supabase.js` helpers |

## Components (`src/components/`)

`Layout`, `Navbar` (sticky, mobile drawer; no cart), `Footer` (ink bg; contact:
+91 93534 64363, monica@prashreearts.com, "Bengaluru · NeeRav Arts Village"), `SEO`,
`ScrollToTop`, `UI.jsx` (SectionHeading/MandalaOrnament/MandalaHeroBg/LoadingSpinner/
EmptyState), `Button`, `Photo`, `Form.jsx`, `ProductCard` (plain-treatment photo, inline
SVG placeholder, formatPrice), `PdfViewer` (object + download fallback), `InterestForm` +
`InterestModal` (Indian-phone validation `/^(\+91[-\s]?)?[6-9]\d{9}$/`),
`EnquiryForm` + `EnquiryModal` (kind contact|booking|decor; requires phone OR email),
`SacredGeometryInfoSection`, `PatternGenerator`, `MandalaCanvas`,
`FeaturedArtwork` (ink spotlight band on Home — shows whichever artwork is
ticked **Featured** in /admin/products, falling back to the bundled Drishti
row; bespoke pitch copy per slug in `FEATURE_COPY`, otherwise a line built
from the piece's own fields so featuring anything else can't invent claims;
links to /products).

Contexts: `AuthContext` (Supabase session) — CartContext deleted with the shop flow.
Libs: `lib/supabase.js` (client + query/CRUD helpers incl. interests/enquiries/posts/
connections), `lib/format.js` (`formatPrice`). Razorpay is fully removed.

## Artworks catalogue (2026-08-19)

`PraShree-Products-Metadata/items.json` is the source of truth for the 28
artworks (id/name/size/size_code/price/price_range/usd/prints/hours/series/
form/intent/direction/pdf/thumb). `npm run artworks:sql` regenerates
`supabase/migrations/20260820_artworks.sql` (ALTER products + idempotent
upserts by slug; also deletes the old `sample-%` seeds). Thumbs are committed
at `public/images/products/thumbs/<id>.jpg`. Catalogue PDFs: originals
(200 MB, gitignored) in `src/assets/artworks/pdf/`; ghostscript-compressed
copies (`gs -dPDFSETTINGS=/printer`, ~1.5 MB each) are committed in
`public/catalogues/` under the exact `pdf`-field names — the UI HEAD-checks
availability, so new PDFs go live by just adding the file. The generator only
references assets that actually exist (a missing thumb → empty `images`, a
missing PDF → NULL `pdf_url`) and, on conflict, keeps whatever the admin
uploaded (`images` only overwritten when the seed has one; `pdf_url` via
COALESCE) — so re-running the seed never wipes an admin upload. **Since
2026-09-07 a new artwork needs no code at all: /admin/products carries every
catalogue field plus photo and catalogue-PDF upload** (see below); items.json
+ the seed remain the way the 28 originals are version-controlled. Newest
piece: **Drishti · The Awakened Eye** (34 × 26 in, ₹90,000, Protection &
Insight Series — the first inches-scale work, so `catalog.js` gained the
`34×26in` size code/label). Products table gained: size, size_code, price_range,
usd, prints, hours, series, form, intent, direction (+ indexes on form/series/
size_code/price), and `is_sold` (migration `20260909_artwork_sold.sql`; source
flag `"sold": true` in items.json, emitted on INSERT only so re-running the
seed never clobbers a status set in the admin). A sold artwork stays listed:
card + detail show an "Original sold" badge with the price struck through,
prints are highlighted, the CTA becomes "Enquire about a print" (interest
message prefixed `[Print — original sold]`), and JSON-LD reports SoldOut.
Toggle per artwork at /admin/products. Filter reference behaviour ported from
`PraShree-Products-Metadata/prashree-products-catalog.html`; decisions
(2026-08-19): monochrome (no plum/gold), keep Vite+Supabase, keep site's own
interest forms (no WhatsApp/Google Form).

## Sound layer (2026-09-16, Phase 1 of 5)

Two features in progress: a paired tone per artwork (fades in on the detail
page once the visitor has switched sound on) and "Two minutes of stillness"
(a 4-7-8 breathing overlay with a gong). Autoplay rule: sound is **off by
default on every device**, the header toggle is the first gesture, nothing
downloads before it, every rejected play() is swallowed, the toggle reports
intent not output (iOS silent switch is left alone). Decisions: Supabase
Storage instead of Cloudinary — one AAC `.m4a` per tone under
`products/audio/` (64 kbps mono tones, 96 kbps gong) made by
`npm run audio:compress` (`scripts/compress-audio.mjs`, needs system ffmpeg;
no WASM ffmpeg dependency added); monochrome ring (paper on ink, no gold);
stillness button bottom-right lifting above the cookie bar, hidden on
/studio, admin and behind modals (there is no WhatsApp button to collide
with). Phase 1: migration `20260916_sound_layer.sql` (products.audio_url/
audio_title/audio_credit/audio_loop_seconds; `site_audio` table keyed by slug
with three pre-seeded empty rows gong-open/gong-close/fallback-tone, public
read, authenticated write), `src/lib/audio/urls.js` (resolveAudioUrl,
storagePublicUrl, isPlayableAudioUrl, audioStoragePath, TONE_BUDGET_BYTES —
Vitest), supabase `getSiteAudio`/`updateSiteAudio`, fallback artworks carry
null audio fields (tones are never bundled), README "Sound layer" section,
`docs/audio-spec-for-monica.md`. **Phase 2 (engine, 2026-09-16):** `src/lib/audio/engine.js` —
`createSoundEngine({ createContext, fetchBytes, createElement, options })`
with unlock (creates ctx + 0.6 master bus, resume() inside a gesture, blocked =
quiet false), playTone/crossfadeTo (URL or AudioBuffer; fetch+decode cached per
URL; AudioBufferSourceNode loop; old tone ramps out 1.5 s while new ramps in
2.5 s), stopTone({ fadeOut, delay }) (delay = route-change grace, cancelled by a
new tone), playOnce (gong, self-releasing), duck/unduck (master to 15 % over 0.6 s
/ back over 0.9 s), dispose; files > 1.5 MB use an <audio> element and are listed
in `state.largeFiles` (none exist yet). All ramps are cancel/set/linearRamp on
ctx.currentTime. 15 Vitest tests against a fake AudioContext.
`src/context/SoundContext.jsx` (`SoundProvider` inside BrowserRouter, `useSound`)
persists `enabled` under `prashree-sound`, re-unlocks on the first gesture after a
reload when enabled, schedules `stopTone({ delay: 800 })` on every route change,
disposes on unmount; play/crossfade/playOnce are no-ops while `enabled` is false.
`/dev/sound` (`src/pages/dev/SoundLab.jsx`, registered only under `vite dev`,
absent from dist) synthesises tones in the browser to exercise every method.
**Phase 3 (artwork pages, 2026-09-16):** `src/components/SoundToggle.jsx` in the
Navbar (desktop row + beside the hamburger): 44 px, icon + "Sound on/off" (15 px),
`aria-pressed`, label "Turn sound on/off"; "on" only when `enabled && unlocked`
(after a reload it shows off until a gesture — honest, not lying); a static filled
dot + sr-only "A tone is playing." when the engine is playing (no equaliser); one-
time hint "Some artworks carry a tone from Monica's sound sessions." after the
first switch-on, dismissed by ✕ or 12 s, `prashree-sound-hint`.
`src/components/ArtworkTone.jsx` under the gallery on ProductDetail: renders
nothing without `audio_url`; else title + credit + 44 px local play/pause; on
mount calls `holdTone()` (cancels the route-change stop so the previous artwork's
tone crossfades instead of cutting), then `crossfadeTo(url)` 1 s after the page
settles when enabled+unlocked+visible+not paused; local pause = `stopTone` and
stays paused; when sound is off the local button reads "Turn sound on to listen"
and switches the site-wide preference on (explicit gesture). Provider: `visible`
state, hides → `stopTone({fadeOut:0.5})`, pages resume on visible; play wrappers
gate on an `enabledRef` so a gesture can play in the same tick. Engine:
`holdTone()` + "longest pending grace wins". Admin: Sound fieldset on
/admin/products (tone upload to `products/audio/<slug>.<ext>`, budget warning
over 300 KB, loop length read from the file's metadata unless typed, title,
credit, Remove tone). Verified in headless Chrome with a local WAV server +
intercepted Supabase REST: no audio request with sound off on any route, fade-in
after settle, pause/play, crossfade between artworks, stop on leaving, no sound on
/, /products, /placement, tab-hide stop + resume, reload → off until gesture.
**Phase 4 (Two minutes of stillness, 2026-09-17):** `src/lib/stillness.js`
(pure: PHASES 4/7/8, CYCLE 19 s, 6 cycles = 114 s, `phaseAt`, `schedule`; 5 tests).
`src/components/stillness/StillnessButton.jsx` mounted in Layout: fixed bottom-
right z-40, `bottom: calc(var(--floating-bottom,0px) + 1rem)` — CookieConsent
publishes its height as `--floating-bottom` while visible; hidden on /studio and
/admin; full label on first load, collapses to the ring glyph below `sm` after 4 s
(aria-label constant); open state is "opened on this pathname" so a route change
closes it without an effect. `StillnessOverlay.jsx` (portal to body, z-70, ink,
800 ms in / 600 ms out, `#root` gets `inert`, body scroll locked + scrollY
restored, focus trapped, focus returns to the button): card with the 4-7-8
caution → Begin / Not now; practice = `StillnessRing.jsx` (concentric paper
hairlines + 72 ticks, group `transform: scale` with per-phase easings — inhale
4 s cubic-bezier(0.16,0.84,0.3,1) to 1, hold 7 s linear to 1.004 drift, exhale
8 s cubic-bezier(0.42,0.02,0.36,1) to 0.74; reduced motion: no scale, stroke
weight 1.35/1.1/0.8 per phase), phase words crossfade 700 ms, progress arc =
stroke-dashoffset over 114 s linear, sr-only polite live "Breathe in. Breath n of
6."; gong `playOnce` at begin (gong-open) and end (gong-close || gong-open) —
`site_audio` rows fetched only on open and only when sound is enabled; opening
ducks the master to 10 % and stops the artwork tone, closing unducks; exits:
Escape / ✕ (44 px) / tap outside / Not now, 600 ms fade, no confirm; completion:
hold 1.8 s → "Two minutes." → auto-close after 12 s. `/admin/sounds`
(`AdminSounds.jsx`, sidebar "Sounds") fills the three `site_audio` rows (upload to
products/audio/<slug>, duration from metadata, title, credit). Verified in
headless Chrome: full 114 s session with faked gong rows, tab trap, silence path
fetches nothing, reduced motion, lift above a 96 px bar. **Layers (2026-09-18):** the engine gained independent looping beds for Sound
Healing — `layers` Map, `fading` Set so dispose() also tears down nodes mid-fade,
`bufferMaxBytes` raised to 4 MB (uncompressed WAV decodes instantly). **Phase 5 (finish, 2026-09-17) ✅:** Chromium — zero audio requests and zero
AudioContexts created on /, /products, /products/:slug, /placement, /about,
/studio before any gesture, with the preference off AND on; keyboard-only: 12
Tabs to the toggle (Enter → "Turn sound off"), 37 to the stillness button, Enter
opens with focus on Begin and #root inert, Escape closes and focus returns; overlay
at 390/768/1280: all controls 44 px, smallest text 17 px, ring 304/416/416 px.
WebKit 26 (Safari engine; desktop + emulated iPhone 14): first visit blocked and
honest, toggle unlocks (resume resolves async — the label flips when it does),
tone fetched once after settle, tab-hide stops / return resumes, reload → "off"
until a gesture, stillness runs and exits. Lighthouse mobile on /products/aditya,
before vs after (both `vite preview`): perf 77→84 (noise), a11y 96/96, best
practices 96/96, script transfer 207→216 KB (+9 KB for the sound layer), media
requests 0/0. Not testable here: the iOS hardware silent switch and shipped-
browser autoplay policies — `docs/sound-layer-device-checklist.md` is the manual
pass for Ravi/Monica. Not built: no `<audio preload>` anywhere (the engine fetches
only after unlock), no fallback tone use.

## Data model (Supabase — `supabase/schema.sql`)

Fresh installs run `schema.sql` **then** `supabase/migrations/20260819_refactor.sql`
(adds products.pdf_url/vastu_note, `interests`, `enquiries`, `posts`, `connections` +
RLS + placeholder seeds; existing DBs run just the migration), then
`20260820_artworks.sql` (catalogue), then `20260821_mandala_templates.sql`
(Studio starter templates, public-read starters + admin write), then
`20260821_workshop_events.sql` (upcoming workshops + seeds), then
`20260825_event_enquiries.sql` (kind='event' + event_date/venue/guest_count on enquiries),
then `20260914_vastu_placement.sql` (**Vastu placement compass, Phase 1 2026-09-14**:
`products.secondary_direction` / `placement_note` VARCHAR(140) / `placement_detail`
+ CHECK constraints on both direction columns (nine values, `direction`'s is
NOT VALID so pre-existing rows aren't re-checked), and the
`vastu_direction_profiles` table — one row per direction: label, sanskrit_name,
guardian, element, essence, description, sort_order clockwise from North with
Centre 9th, `shows_artworks` FALSE for Centre/Brahmasthana, `edited_at` set by
/admin so the seed's upsert skips edited rows. Public read, authenticated write.
Generated by `npm run vastu:sql` from `PraShree-Products-Metadata/vastu-profiles.json`
(profiles) + the placement keys in `items.json` (backfill of the 6 mapped pieces;
Kubera left out as money-manifestation line). Fallback module `src/data/vastu.js`
(profiles, DIRECTIONS, slug helpers) is Vitest-covered. Decisions: keep
`direction` text column (no rename), brief's primaries that differ from the live
catalogue became secondaries (Kavach→SW, Sarasvati→E, Svadhisthana→W, Ananda→NW;
Kavach's South and Svadhisthana's North-West were dropped), no gold accent —
selection state is ink on paper. Compass content). **Phase 6 (finish, 2026-09-16) ✅:** verified 390/768/1280 (no
horizontal overflow; rim labels 16.1 px / Centre 15.2 px at 390), keyboard-only
walk (13 Tabs to the wheel, all nine stops selectable, first Tab after the wheel
lands on the first artwork link, exits to footer), reduced motion (0 s
transitions, instant rotation), money line absent from all eight directions on
the live page, contrast (ink/paper 18.3:1, graphite/white 8.9:1 — no gold; the
brief's gold on cream would be 2.8:1). README gained a "Vastu placement compass"
section. Open: the reused ProductCard's 10 px chips and 14 px meta predate the
compass; no direction is empty today but South-East, South and West each rest on
one piece; only 6 of 26 eligible artworks have a placement note; the `.env`-less
checkout means admin screens were not exercised in a browser. **Phase 5 (integration, 2026-09-16):**
ProductDetail's Vastu block now shows `placement_detail` (falling back to
`vastu_note`) plus "See what else belongs on a <dir> wall →" links to
`/placement?direction=<slug>` for primary and secondary. Catalogue `dir` filter
matches primary OR secondary (`catalog.js` passes/facetCounts/facetValues, tested).
Nav: "Placement" after Artworks; desktop nav now from **xl** (nine links + the
sound toggle need 1280; Home is dropped from the desktop row, the logo is Home)
with `gap-5` (the 1200 px content cap leaves no room for more), hamburger below xl; footer Explore gained "Find your direction" and its grid is
`sm:2 lg:4` (the md:4 grid pushed the email link past 768 px). Admin:
`/admin/placement` (`AdminPlacement.jsx`, sidebar "Placement") edits the nine
profiles (no add/delete — directions are fixed; a missing row can be created from
the bundled draft via `createDirectionProfile`); `/admin/products` gained Second
direction, Placement note (140 live counter, `PLACEMENT_NOTE_MAX`) and Placement
detail. SEO: `public/images/og-placement.jpg` (1200×630, composed from the live
wheel by a scratch Playwright script — regenerate by hand if the wheel changes);
`npm run build` now runs `scripts/prerender-placement.mjs` → `dist/placement.html`
= built shell with the nine readings inside `#root` + page-specific title/
description/OG/canonical, and `vercel.json` rewrites `/placement` to it so crawlers
get text without JS (copy = bundled draft, refreshed per deploy). Sitemap gained
`/placement`. **Phase 4 (reading panel, 2026-09-16):**
`src/components/PlacementReading.jsx` — direction block (label, Sanskrit name in
**Great Vibes** via new `--font-script` token / `font-script`, added to the Google
Fonts link; "Guardian X · Element Y" eyebrow; description at max 60ch), then the
artworks as `ProductCard`s with `placement_note` in italic beneath (only the 6
mapped pieces have one so far), or the empty state → `EnquiryModal` kind=contact
subject "A piece for a <direction> wall"; Centre (`shows_artworks=false`) shows the
block only. Page now uses `loadPlacement` (spinner in the panel until it resolves;
wheel shows bundled labels meanwhile) and the live line gains "· n artworks".
Layout: ≥lg two columns with the wheel `sticky top-24`; below lg the wheel
wrapper is `sticky top-20 overflow-hidden` and `useStickyBand` shrinks its height
by the overscroll past the nav (floor 168 px = marker + selected sector, margin-
bottom compensates, hairline when clipped, ResizeObserver re-measures) so the
selected sector stays pinned above the results. Card hover border transition is
neutralised in the grid (`[&_article]:transition-none`); the house-rule image
colour reveal stays. **Phase 3 (the compass, 2026-09-16):**
`src/components/VastuCompass.jsx` — one inline SVG (viewBox 400, centre 200/208,
outer rule r188 @2.75, tick band 180–186.5 with 3° ticks, inner ring r102, hairline
r78, disc r50; label radius 138 at 18 units so an upright "North-West" clears both
rings at 45°). Props `profiles/value/onChange`. Fixed marker at top; `.compass-rotor`
rotates via CSS transform (700 ms, `rotationTo` in `src/lib/compassGeometry.js`
accumulates the shortest way round; labels counter-rotate; reduced-motion →
`transition: none`). Eight annular-sector `role=radio` paths + the Centre disc as
the ninth stop; the `<svg>` is the single tab stop (`role=radiogroup`,
`aria-activedescendant`, arrows step / Home / End, Enter or Space selects, 2px ink
cursor ring with paper core). Selection = solid ink fill, paper label (no gold —
brand is monochrome). `src/pages/Placement.jsx` at `/placement` reads/writes
`?direction=<slug>` (replace, no scroll reset); the line under the wheel is the
polite live region. Page uses a plain header, not SectionHeading, because that
component has a scroll-in entrance. Known pre-existing: desktop nav overflows
horizontally at 768 px on every page (scrollWidth 901). **Phase 2 (data access):** `src/lib/placement.js`
(pure, Vitest: `isMoneyLine` by form/series regex, `eligibleForPlacement` = has
form + listed + not money-line, sold kept; `buildDirectionMap` → { direction:
[primary A–Z, then secondary A–Z], each row tagged `match` }; `emptyDirections`),
`src/lib/loadPlacement.js` (profiles + catalogue in parallel, 4 s race, falls back
to bundled data, returns { profiles, directions, byDirection, source }), and
supabase helpers `getDirectionProfiles` / `updateDirectionProfile` (stamps
`edited_at`) / `getPlacementProducts`. Whole map ≈ 12 KB — no API route.

- `categories` (id uuid, name, slug, description, image_url, display_order) — seeded with the 20 art categories
- `products` (id, category_id FK→categories CASCADE, name, slug, description, price numeric, sale_price, images text[], is_featured, is_available, timestamps)
- `orders` (id, order_number, customer_*, items jsonb, total_amount, razorpay_order_id/payment_id, payment_status pending|paid|failed, shipping_address, status received|processing|shipped|delivered|cancelled, notes)
- `media` (file metadata; **unused by the app** — AdminMedia lists storage directly)
- `gallery` (category_id FK, title, image_url, description, display_order)

RLS: public read on categories/products/gallery/media; public INSERT on orders;
authenticated (any logged-in user) full write everywhere. `updated_at` triggers on
products/orders. Storage buckets are inconsistent across docs: DEPLOYMENT.md says
`artworks` + `products`; schema comments mention products/categories/gallery/media;
AdminMedia hardcodes `artworks`; AdminCategories uploads to `artworks`, AdminProducts to `products`.

## Design system (Phase 1, 2026-08)

Tailwind v4 `@theme` in `src/index.css`: **ink** #0a0a0a, **charcoal** #1f1f1f,
**graphite** #4a4a4a, **ash** #9a9a9a, **mist** #e6e6e6, **paper** #f7f6f3 (+ legacy
aliases primary/secondary/accent/muted/light/lighter/surface/border remapped onto these —
remove at final audit). Fonts: **Cormorant Garamond** (display) + **Karla** (body) via
Google Fonts link in `index.html`. Type scale tokens: `text-display-xl/display/display-sm`
(64/48/36), `text-h2` 32, `text-h3` 24, `text-body` 17/1.65, `text-small` 14;
`tracking-label` 0.18em for uppercase eyebrows; `max-w-content` = 1200px.
Base styles live in `@layer base` (must stay layered or they override utilities);
`.hairline`, `.treat-grayscale` (grayscale→color on hover, also triggered by parent
`.group:hover`/`a:hover`), `.treat-duotone` (warm-grey) in `@layer components`.

Component kit: `Button` (variant solid|outline|link; renders Link/a/button),
`Photo` (treatment grayscale|duotone|plain, `base` prop builds srcset from -800/-1600/-2400
derivatives, `position` for watermark-dodging crops), `Form.jsx` (underline-style
Label/Input/Textarea/Select/Field), `UI.jsx` SectionHeading (eyebrow + serif title, align).

## Images & assets

- Logo (rebuilt 2026-09): the mark is Monica's **Ananda · Smile of Contentment**
  mandala with a black disc carrying the Kannada wordmark ಪ್ರಶ್ರೀ. The old asset was a
  431 px scan (blurry, blue cast); it is now rebuilt from the 3000 px artwork master
  by `npm run logo` (`scripts/build-logo.mjs`) — square-cropped on the detected
  mandala circle, paper lifted to white, disc at 0.46 of the mandala radius,
  wordmark at 0.776 of the disc diameter, circular alpha outside. The wordmark is a
  potrace vectorisation of the original lettering, kept at
  `brand/prashree-kannada-wordmark.svg` for creatives. Source master lives at
  `images-src/logo-source-mandala.jpg` (gitignored; regenerate with `pdfimages` from
  the original Ananda PDF — see the script header). Outputs, all transparent PNG:
  `public/images/logo/prashree-logo-print.png` (3000 px, marketing/print),
  `prashree-logo.png` (1024), `prashree-logo-192.png`, `src/assets/logo.png` (1024,
  imported by Navbar/Footer/Home/AdminLogin), `public/logo.png` (512, favicon + OG).
  Footer inverts it with plain `invert` (the old `brightness-200` blew out the new
  detail). `public/favicon.svg` is a simplified mark echoing the same silhouette.
- `public/images/artwork-1.jpg … artwork-3.jpg` — used on Home/About/Workshops heroes.
- **Image pipeline**: camera originals (5–28 MB) live in gitignored `images-src/`;
  `npm run images` (scripts/optimize-images.mjs, sharp) emits `-800/-1600/-2400.jpg`
  derivatives into `public/images/monica/{portraits,teaching,decor}/` per the map in the
  script. 14 photos processed (incl. IMG20260819191222, a clean 962×1280 studio
  shot of Monica before her framed mandala wall, used in Home's Artworks section;
  the script caps derivative sizes at native resolution for small originals).
  **Watermark policy (2026-08-20): the NeeRav Arts Village watermark is Monica's
  own brand and STAYS in frame** — all crop values in the script MAP are 0 and
  derivatives are full-frame. Portrait placements pass `position="center top"`
  (banners 1958/4718 use `center 20%`) so heads always keep full headroom.
  The brief references files **not yet supplied**:
  `DSC07336.jpeg`, `IMG_5730.JPG` (connections), `public/images/products/*` shadow-box photos.

## Analytics & consent (2026-09-07)

`src/lib/analytics.js` wraps GA4: the measurement ID comes from
**`VITE_GA_MEASUREMENT_ID`** (Vercel env var, baked in at build — unset means
every call is a no-op, so dev and previews never pollute the property).
`ConsentProvider` (`src/context/ConsentContext.jsx`) stores granted/denied in
localStorage; `<CookieConsent />` shows the banner only while the choice is
null **and** an ID is configured; `<Analytics />` injects gtag after consent and
fires a `page_view` per react-router navigation (`send_page_view: false`,
/admin excluded). Conversion events: `interest_submitted`, `enquiry_submitted`,
`catalogue_download`.

## Existing integrations

- **Razorpay**: client-side modal only. No server endpoint, no signature verification.
- **Supabase Auth**: email/password for admin; any authenticated user has full write via RLS.
- **No Google Form booking and no WhatsApp link exist in the code** (the brief assumed they did).
  Contact = phone `tel:` + `mailto:` + a form that silently discards submissions.

## Fragile / half-done / inconsistent

1. ~~Contact form fakes success~~ — fixed in Phase 6 (submits to `enquiries`).
2. ~~Cart/Razorpay~~ — removed in Phase 3 (files deleted; `orders` table kept as history).
3. ~~Fake product fabrication~~ — fixed in Phase 3 (honest 404s, no invented prices).
4. ~~Fallback demo data on Home~~ — removed in Phase 2.
5. ~~Admin status colors~~ — fixed in Phase 4 (monochrome badges everywhere).
6. `media` table unused; storage bucket naming inconsistent (see above).
7. Old root CLAUDE.md claimed React 18; package.json is React 19. `.nvmrc`=18, env runs 24.
8. `react-helmet-async@3` with React 19 — works but peer-dep pressure; consider replacing.
   Placeholders resolved 2026-08-20: Instagram = @prashreearts (Contact + Footer),
   location = "NeeRav Arts Village, Bengaluru", learn.js durations (Mandala 2.5–3 h,
   Meditation 45 min, Janur 3 h; materials provided). Still open: connections
   descriptions (page parked), photos DSC07336/IMG_5730.
9. ~~SEO gaps~~ — full SEO layer (2026-08-20): SEO.jsx takes keywords/type/jsonLd
   props (+ og:site_name/locale, meta keywords); index.html carries crawler-visible
   defaults + an ArtGallery JSON-LD (@id …/#org). Structured data: Person (About),
   ItemList (Products + Learn Courses), Product+BreadcrumbList (detail),
   BlogPosting (posts). `npm run seo:sitemap` regenerates sitemap.xml from
   items.json (7 routes + 28 artwork URLs). Canonicals/sitemap/JSON-LD all point
   at **https://prashreearts.com** — the custom domain must be connected in Vercel
   (or SITE_URL in SEO.jsx + index.html + sitemap script updated).
10. New photos are unoptimized multi-MB originals; several carry a third-party watermark.
    Launch checklist audited 2026-09-07: privacy/terms/FAQ/404 added, GA + cookie
    consent added, one `<h1>` per page (SectionHeading takes `as`), skip-link in
    Layout, bundled logo dropped 1024→512 px (home 648→476 kB). Open: [[ ]] in
    Terms/FAQ (delivery, cancellation, GST), no social share buttons (OG/Twitter
    cards are in place), 404 returns HTTP 200 by design of the SPA rewrite.
11. npm optional-deps bug can break fresh builds (rolldown binding — fix above).

## Refactor decisions (approved 2026-08-19)

1. **Keep Vite + React + Supabase** — no Next.js migration; brief's Prisma models become
   Supabase tables.
2. **Interest-form-only commerce** — cart/Razorpay to be removed entirely (Phase 3);
   buyers express interest, Monica follows up.
3. **IA**: keep `/sacred-geometry`; drop `/categories` pages (categories become a products
   filter; art forms stay on About); `/workshops` → `/learn`.
4. **No Google Form / WhatsApp** — bookings + enquiries via the site's own Supabase-backed
   forms, surfaced in `/admin`.
5. Phase plan: (1) design system+layout ✅, (2) Home+About, (3) Products+Interest,
   (4) Admin ✅, (5) Learn+Connections ✅, (6) Blog+Contact+audit ✅ — refactor complete.
   Legacy color-token aliases are gone; the palette is only ink/charcoal/graphite/ash/
   mist/paper. All pages verified 0px horizontal overflow at 375px. Home's latest-blog
   section renders only when published posts exist. `marked` + `dompurify` render blog
   bodies (admin-authored, sanitized).
   Phases 2–3 ✅ likewise. Lint is fully clean as of Phase 4.

Known remaining lint debt (pre-existing, resolved as phases touch them): react-refresh
warnings in Auth/CartContext, setState-in-effect in CategoryDetail/ProductDetail.

## Brand rules (apply to all future work)

Strictly monochrome (no accent colors — including status badges), serif display + humanist
sans body, generous whitespace, hairline dividers, subtle 200–300ms motion. **Every image on
the site is grayscale at rest and reveals its true colour on hover** (2026-09 house rule —
applies to product/artwork photos too; the earlier 'product photos untouched' rule and the
duotone treatment are retired). Artwork images and catalogue PDFs are watermarked at build
time (`npm run watermark:images`, `npm run watermark:pdfs`) and, for anything
uploaded from /admin, in the browser by `src/lib/watermark.js` (same treatment;
pdf-lib is a runtime dep, lazily imported, and the PDF keyword tag makes
re-stamping a no-op). Never invent prices, product names,
or biographical facts; wrap placeholder copy in `[[ ]]`.
