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
| `/categories` | `pages/Categories.jsx` — grid of 20 categories | `getCategories` + fallback list |
| `/categories/:slug` | `pages/CategoryDetail.jsx` — products/gallery tabs | `getCategoryBySlug`, `getProducts`, `getGalleryByCategory` |
| `/products/:slug` | `pages/ProductDetail.jsx` — gallery, qty, Add to Cart, Buy Now (Razorpay) | `getProductBySlug` (fabricates a fake product on error!) |
| `/workshops` | `pages/Workshops.jsx` — 6 hard-coded workshop cards, links to /contact | static |
| `/sacred-geometry` | `pages/SacredGeometry.jsx` — educational sections + interactive SVG mandala generator (`PatternGenerator` + `MandalaCanvas`, golden-ratio math) | static |
| `/contact` | `pages/Contact.jsx` — info + form that **fakes success** (setTimeout, message discarded) | none |
| `/cart` | `pages/Cart.jsx` — localStorage cart, checkout form, Razorpay | `createOrder`, `updateOrderPayment` |
| `/admin/login` | Supabase email/password sign-in | Supabase Auth |
| `/admin/*` | `AdminLayout` (auth-guarded) → Dashboard, Products, Categories, Orders, Media — CRUD tables/modals | `lib/supabase.js` helpers |

## Components (`src/components/`)

`Layout`, `Navbar` (sticky, mobile drawer, cart badge), `Footer` (black bg, links, contact:
+91 93534 64363, info@prashreearts.com, "NeeRav Arts Village"), `SEO`, `ScrollToTop`,
`UI.jsx` (SectionHeading + MandalaOrnament + MandalaHeroBg + LoadingSpinner + EmptyState),
`CategoryCard`, `ProductCard` (quick-add, sale badge), `GalleryGrid` (masonry + lightbox),
`RazorpayButton`, `SacredGeometryInfoSection`, `PatternGenerator`, `MandalaCanvas`.

Contexts: `AuthContext` (Supabase session), `CartContext` (localStorage `prashree_cart`).
Libs: `lib/supabase.js` (client + all query/CRUD helpers), `lib/razorpay.js` (script loader,
checkout modal, order-number generator, and a `createRazorpayOrder` that POSTs to a
**nonexistent** `/api/create-razorpay-order`).

## Data model (Supabase — `supabase/schema.sql`)

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
  script. 13 photos processed. The watermark (top-left OR top-right, includes a long
  script swash tail) is **cropped out at derivative time** via per-image `cropTop`
  fractions in the script's MAP (0.095–0.30, visually verified) — derivatives in
  public/images are watermark-free, so components never need defensive positioning.
  The brief references files **not yet supplied**:
  `DSC07336.jpeg`, `IMG_5730.JPG` (connections), `public/images/products/*` shadow-box photos.

## Existing integrations

- **Razorpay**: client-side modal only. No server endpoint, no signature verification.
- **Supabase Auth**: email/password for admin; any authenticated user has full write via RLS.
- **No Google Form booking and no WhatsApp link exist in the code** (the brief assumed they did).
  Contact = phone `tel:` + `mailto:` + a form that silently discards submissions.

## Fragile / half-done / inconsistent

1. Contact form fakes success and drops the message.
2. `Cart.jsx` checkout creates a Supabase order but never opens payment (comment: "In
   production…"); `handlePaymentSuccess` calls `updateOrderPayment(razorpay_order_id, …)`
   but that helper filters `eq('id', …)` (row uuid) — the update can never match. `ProductDetail`
   "Buy Now" opens Razorpay with no `order_id` and no server verification.
3. `ProductDetail`/`CategoryDetail` fabricate fake products/categories on fetch failure —
   any slug "exists" with an invented ₹2,500 price.
4. Fallback demo data on Home/Categories masks Supabase misconfiguration.
5. Admin UI uses green/red/yellow/blue/amber status colors — violates the monochrome brand.
6. `media` table unused; storage bucket naming inconsistent (see above).
7. Old root CLAUDE.md claimed React 18; package.json is React 19. `.nvmrc`=18, env runs 24.
8. `react-helmet-async@3` with React 19 — works but peer-dep pressure; consider replacing.
9. No sitemap, no robots.txt, og:image = logo.png only.
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
   (4) Admin, (5) Learn+Connections, (6) Blog+Contact+audit. Commit per phase.

Known remaining lint debt (pre-existing, resolved as phases touch them): react-refresh
warnings in Auth/CartContext, setState-in-effect in CategoryDetail/ProductDetail.

## Brand rules (apply to all future work)

Strictly monochrome (no accent colors — including status badges), serif display + humanist
sans body, generous whitespace, hairline dividers, subtle 200–300ms motion, grayscale-at-rest /
color-on-hover photo treatment, product photos untouched. Never invent prices, product names,
or biographical facts; wrap placeholder copy in `[[ ]]`.
