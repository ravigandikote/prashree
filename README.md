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

## Sound layer

Each artwork can carry one paired tone (a singing bowl note from Monica's
sound sessions); the site also keeps a few shared sounds (the gong strikes
for "Two minutes of stillness"). Sound is off by default everywhere and
nothing downloads until a visitor switches it on in the header.

**Adding a tone to an artwork**

1. Get the recording from Monica as WAV (what to ask for is in
   [docs/audio-spec-for-monica.md](docs/audio-spec-for-monica.md)).
2. Compress it: `npm run audio:compress -- path/to/Aditya.wav` (needs ffmpeg,
   `brew install ffmpeg`). This writes `aditya.m4a` next to it — mono AAC,
   under 300 KB for a 30 s tone — and prints the loop length in seconds.
   Use `--gong` for the gong strikes (fuller bitrate).
3. In `/admin/products`, open the artwork and use the **Sound** fieldset:
   choose the `.m4a` (it uploads to `products/audio/<slug>.m4a` on save and
   warns if over 300 KB), add the tone title and credit. The loop length is
   read from the file; type it only if you want to override.
4. Visitors see the title and credit under the picture with a play/pause
   control; the tone fades in a second after the page settles once sound is on.
5. Shared sounds (the gong that opens and closes "Two minutes of stillness")
   are filled in at `/admin/sounds`: upload the compressed file (use
   `--gong` when compressing) and add a title and credit. Without a file the
   practice simply runs in silence.

Audio files are never committed to the repo. Schema:
`supabase/migrations/20260916_sound_layer.sql`.

## Two minutes of stillness

The persistent button bottom-right opens a full-screen 4-7-8 breathing
practice: six cycles (114 s), a breathing ring, one word per phase, a gong at
the start and end when sound is on and a gong is uploaded at `/admin/sounds`.
It works in silence and under reduced motion. Timing lives in
`src/lib/stillness.js`; the overlay in `src/components/stillness/`. The device
checklist for the sound layer is in
[docs/sound-layer-device-checklist.md](docs/sound-layer-device-checklist.md).

## The Studio and Sound Healing

`/studio` lists the studio activities (`src/data/studio.js`): Sound Healing and
the Mandala Studio today. Add an entry there to add an activity.

Sound Healing plays a timed session on the shared sound engine: the chosen
chakra bowl(s), then rain stick, ocean drum, a gong, and a raga alaap fading
in last. The sounds it ships with are **synthesised stand-ins**, generated
into `public/sounds/` by `npm run sounds:generate` (this also runs before
`dev` and `build`; the folder is gitignored). Each bowl is tuned to its
chakra's note (root C 256 Hz up to crown B 480 Hz).

To replace a stand-in with a real recording: compress it
(`npm run audio:compress -- file.wav`), then upload it against the matching
row at `/admin/sounds` (`bowl-root` … `bowl-crown`, `rain-stick`,
`ocean-drum`, `gong-healing`, `raga-alaap`; rows come from
`supabase/migrations/20260918_healing_sounds.sql`). The site prefers the
uploaded file and falls back to the stand-in.

The copy on that screen describes practice, never treatment: intentions are
"what you'd like to sit with", and chakra notes are given as tradition holds
them. Keep it that way when editing.
