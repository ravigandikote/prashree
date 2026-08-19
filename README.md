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
