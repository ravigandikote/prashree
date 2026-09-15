# PraShree Arts

Portfolio and studio site for **Monica Prakash** — Mandala Art Therapist,
Janur (coconut-leaf) artist, and founder of PraShree Arts. Strictly black &
white, in keeping with the brand.

- **Stack**: React 19 + Vite SPA · Tailwind CSS v4 · Supabase (Postgres/Auth/Storage) · Vercel
- **Docs**: [DEPLOYMENT.md](DEPLOYMENT.md) for setup & deploy, [CLAUDE.md](CLAUDE.md) for the codebase knowledge base
- **Commands**: `npm run dev` · `npm run build` · `npm run lint` · `npm run images`

Visitors browse artworks and express interest (no online payment); bookings and
contact messages land in a Supabase-backed admin at `/admin`.

## Adding a new artwork

1. Drop the framed image at `public/images/products/thumbs/<id>.jpg` and the
   2-page catalogue PDF at `public/catalogues/<Name>_2page.pdf`.
2. Add a row to `PraShree-Products-Metadata/items.json` (same fields as the
   existing 27 entries; `id` becomes the slug).
3. Run `npm run artworks:sql` and execute the regenerated
   `supabase/migrations/20260820_artworks.sql` in the Supabase SQL editor —
   it upserts by slug, so re-running is safe.

Or skip the JSON entirely and add/edit the piece in `/admin/products`
(the Catalogue details fieldset covers form, series, size, prices, hours,
intent, and Vastu direction).

## Vastu placement compass (`/placement`)

Visitors pick a direction on an eight-sector wheel (plus the centre,
Brahmasthana) and see which artworks belong on that wall, each with a
one-line reason. Money-manifestation pieces never appear there.

**Where the copy lives**

- Direction copy (label, Sanskrit name, guardian, element, essence, description)
  is edited at `/admin/placement`. No deploy needed; saving marks the row as
  edited so the seed below never overwrites it.
- Per-artwork placement (second direction, the one-line placement note, the
  longer placement detail shown on the artwork page) is edited on each piece
  at `/admin/products`, under "Size, time & Vastu".

**Seed and backfill**

- `PraShree-Products-Metadata/vastu-profiles.json` holds the nine draft
  profiles; the placement keys on entries in `items.json` hold the draft
  artwork mappings. Both are the version-controlled source of the drafts.
- `npm run vastu:sql` regenerates
  `supabase/migrations/20260914_vastu_placement.sql` from those files: schema,
  the profile seed, and the artwork backfill. Run it in the Supabase SQL
  editor after `20260820_artworks.sql`. It is safe to re-run: profiles edited
  in the admin are skipped, and the backfill only touches the three placement
  columns.
- The same JSON files are bundled as the read-only fallback when the database
  is unreachable, and feed the crawler-visible `dist/placement.html` that
  `npm run build` writes (served for `/placement` by the Vercel rewrite), so
  copy edited in the admin reaches crawlers on the next deploy.

The compass's OG image is `public/images/og-placement.jpg`; regenerate it if the
wheel's look changes.
