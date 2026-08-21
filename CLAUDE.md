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
| `/` | `pages/Home.jsx` — **rebuilt Phase 2**: split hero (logo + 2199 portrait), statement band, Artworks/Learn/Décor/Founder/Community sections, enquiry CTA. All static; no Supabase fallbacks. Latest-blog section deferred to Phase 6. CTAs point at `/categories`+`/workshops` until Phases 3/5 rename them | static |
| `/about` | `pages/About.jsx` — **rebuilt Phase 2**: 1984 hero, why-B&W + 1132 inset, credentials grid, teaching (7546), décor (4718), beyond-the-studio strip (0812/1516/1862), 20 art-form chips, NeeRav band | static |
| `/products` | `pages/Products.jsx` — **catalogue rebuilt 2026-08-19**: sticky filter bar (art form/series/size/price-band/Vastu direction selects with live `(n)` facet counts + disabled-at-0, 200 ms-debounced search over name+intent+pdf+series+form, sort Name/Price↑↓/Size, reset, "n of total" count), all state in the URL query (`useSearchParams`, replace, no scroll jump), mobile bottom-sheet for filters, load-more at 24. Data: `getProducts` filtered to rows with `form`; falls back to `src/data/artworks.js` (built from `PraShree-Products-Metadata/items.json`) when the DB is unreachable/unseeded. Pure logic in `src/lib/catalog.js` (Vitest-covered: `npm test`) | `getProducts` |
| `/products/:slug` | `pages/ProductDetail.jsx` — framed image, intent, form/series/direction chips, pricing strip (original+range/USD/prints/size/hours), vastu note, availability-checked catalogue-PDF button+viewer (`usePdfAvailable` HEAD-checks content-type because the SPA rewrite 200s missing files), Express-interest modal, JSON-LD Product, per-artwork OG image, "You may also like" (same series → same form, 4). Fallback to local data by slug | `getProductBySlug`, `createInterest` |
| `/categories`, `/categories/:slug`, `/cart` | redirects → `/products` (legacy shop-era URLs) | — |
| `/learn` | `pages/Learn.jsx` — 7529 hero, three offering cards (data in `src/data/learn.js`, [[ ]] for unknown durations/needs), 6 residential-workshop cards, **`#doorstep` dark section** (Janur Art / sound healing / Mandala Art Therapy at the host's venue — cards for residential societies, corporate offices, and studios/space owners on revenue share; data `doorstepAudiences` in learn.js), community strip; every card opens `EnquiryModal` (kind=booking → `enquiries` table, distinct subject per audience) | `createEnquiry` |
| `/connections` | **parked 2026-08-20** (user request): route redirects → `/about`; nav/footer links removed. `pages/Connections.jsx` + `src/data/connections.js` + the `connections` table are kept for revival | — |
| `/workshops` | `pages/WorkshopEvents.jsx` — **Upcoming Workshops (2026-08-21)**: announcement page for recurring/one-off workshops (flyer image or placeholder, schedule, venue, description, Reserve-a-spot → EnquiryModal kind=booking subject "Workshop: <title>"), Event JSON-LD. Data: `workshop_events` table (migration `20260821_workshop_events.sql`, seeded with the two Sunday workshops at Eco Cottage, Kalyan Nagar) via `getActiveWorkshops`, falling back to `src/data/workshopEvents.js` after a 4 s race timeout. Managed at `/admin/workshops` (CRUD + flyer upload to `artworks` bucket, active toggle, display order). Nav gained "Workshops"; Sacred Geometry left the navbar (still in footer + Studio CTA) to fit | `getActiveWorkshops`, `createEnquiry` |
| `/sacred-geometry` | `pages/SacredGeometry.jsx` — educational sections; the old simple generator was retired in favour of a Studio CTA | static |
| `/studio` | **Mandala Studio (2026-08-21)** — teaching-first drafting tool built in six phases. mm-true SVG stage (viewBox = paper), stepper mirroring the taught order (paper → centre → circles → radial lines → patterns → download). Pure logic in `src/lib/mandala/` (geometry, state+50-step undo/redo history with tweak coalescing, templates, exporter, patterns) — 37 Vitest tests incl. per-motif rotation-symmetry proofs and mm→pt scaling. 31 tileable motifs in 5 families; A/B sector alternation; per-ring weights fine/medium/bold; **density-aware tiling** (repeatsForCell keeps motif cells ~square, so outer rings carry more repeats — always a multiple of the sector count — instead of stretching). Export: vector PDF (jsPDF+svg2pdf, exact paper MediaBox), PNG 300 DPI, SVG; guides-only "print and fill by hand" is first-class. Templates: localStorage + JSON file import/export + autosave/resume + **PraShree starters** from `mandala_templates` (migration `20260821_mandala_templates.sql`, curated in `/admin/templates`). Examples strip links the 10 reference artworks. UI in `src/components/studio/` (canvas w/ zoom-pan + draggable centre + annulus ring hit areas, panels, pattern bottom-sheet on mobile) | `getStarterTemplates` |
| `/blog` | `pages/Blog.jsx` — **new Phase 6**: editorial list of published posts (cover, date, tags, excerpt); EmptyState until posts exist | `getPublishedPosts` |
| `/blog/:slug` | `pages/BlogPost.jsx` — serif reading layout (`.prose-post`), markdown via `marked` + `DOMPurify`, keyed remount per slug | `getPostBySlug` |
| `/contact` | `pages/Contact.jsx` — **rebuilt Phase 6**: 7387 portrait, tel/mailto/Instagram ([[INSTAGRAM_URL]] placeholder)/location, real `EnquiryForm` (kind=contact) → `enquiries` table | `createEnquiry` |
| `/admin/login` | Supabase email/password sign-in (monochrome) | Supabase Auth |
| `/admin/*` | **reworked Phase 4** — `AdminLayout` (auth-guarded, desktop sidebar + mobile top-nav) → index = `AdminInterests` (filters by product/status, tel:/mailto links, status New/Called/Follow-up/Closed, expandable notes), `AdminEnquiries`, `AdminProducts` (+pdf_url/vastu_note fields), `AdminPosts` (markdown body, cover upload, publish toggle), `AdminCategories`, `AdminMedia`. Dashboard & Orders pages deleted. Shared bits in `admin/adminUi.js` + `admin/StatusBadge.jsx` — all badges monochrome | `lib/supabase.js` helpers |

## Components (`src/components/`)

`Layout`, `Navbar` (sticky, mobile drawer; no cart), `Footer` (ink bg; contact:
+91 93534 64363, info@prashreearts.com, "Bengaluru · NeeRav Arts Village"), `SEO`,
`ScrollToTop`, `UI.jsx` (SectionHeading/MandalaOrnament/MandalaHeroBg/LoadingSpinner/
EmptyState), `Button`, `Photo`, `Form.jsx`, `ProductCard` (plain-treatment photo, inline
SVG placeholder, formatPrice), `PdfViewer` (object + download fallback), `InterestForm` +
`InterestModal` (Indian-phone validation `/^(\+91[-\s]?)?[6-9]\d{9}$/`),
`EnquiryForm` + `EnquiryModal` (kind contact|booking|decor; requires phone OR email),
`SacredGeometryInfoSection`, `PatternGenerator`, `MandalaCanvas`.

Contexts: `AuthContext` (Supabase session) — CartContext deleted with the shop flow.
Libs: `lib/supabase.js` (client + query/CRUD helpers incl. interests/enquiries/posts/
connections), `lib/format.js` (`formatPrice`). Razorpay is fully removed.

## Artworks catalogue (2026-08-19)

`PraShree-Products-Metadata/items.json` is the source of truth for the 27
artworks (id/name/size/size_code/price/price_range/usd/prints/hours/series/
form/intent/direction/pdf/thumb). `npm run artworks:sql` regenerates
`supabase/migrations/20260820_artworks.sql` (ALTER products + idempotent
upserts by slug; also deletes the old `sample-%` seeds). Thumbs are committed
at `public/images/products/thumbs/<id>.jpg`. Catalogue PDFs: originals
(200 MB, gitignored) in `src/assets/artworks/pdf/`; ghostscript-compressed
copies (`gs -dPDFSETTINGS=/printer`, ~1.5 MB each) are committed in
`public/catalogues/` under the exact `pdf`-field names — the UI HEAD-checks
availability, so new PDFs go live by just adding the file. Products table gained: size, size_code, price_range,
usd, prints, hours, series, form, intent, direction (+ indexes on form/series/
size_code/price). Filter reference behaviour ported from
`PraShree-Products-Metadata/prashree-products-catalog.html`; decisions
(2026-08-19): monochrome (no plum/gold), keep Vite+Supabase, keep site's own
interest forms (no WhatsApp/Google Form).

## Data model (Supabase — `supabase/schema.sql`)

Fresh installs run `schema.sql` **then** `supabase/migrations/20260819_refactor.sql`
(adds products.pdf_url/vastu_note, `interests`, `enquiries`, `posts`, `connections` +
RLS + placeholder seeds; existing DBs run just the migration), then
`20260820_artworks.sql` (catalogue), then `20260821_mandala_templates.sql`
(Studio starter templates, public-read starters + admin write), then
`20260821_workshop_events.sql` (upcoming workshops + seeds).

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

- Logo: hand-drawn B&W mandala with "ಪ್ರಶ್ರೀ" centre. Trimmed (431×431, transparent) at
  `public/images/logo/prashree-logo.png` (+ -192 variant) and `src/assets/logo.png`
  (imported in Navbar/Footer/Home/AdminLogin; Footer inverts via CSS filter).
  Untrimmed original stays at `public/logo.png` (favicon/og references). `public/favicon.svg`.
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
   items.json (7 routes + 27 artwork URLs). Canonicals/sitemap/JSON-LD all point
   at **https://prashreearts.com** — the custom domain must be connected in Vercel
   (or SITE_URL in SEO.jsx + index.html + sitemap script updated).
10. New photos are unoptimized multi-MB originals; several carry a third-party watermark.
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
sans body, generous whitespace, hairline dividers, subtle 200–300ms motion, grayscale-at-rest /
color-on-hover photo treatment, product photos untouched. Never invent prices, product names,
or biographical facts; wrap placeholder copy in `[[ ]]`.
