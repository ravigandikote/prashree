# PraShree Arts — Deployment Guide

## Prerequisites
- Node.js >= 18
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (hosting)

---

## 1. Supabase Setup

### Create Project
1. Create a project at [supabase.com](https://supabase.com)
2. Note your **Project URL** and **anon/public API key** (Settings > API)

### Run Database Schema
In the SQL Editor, run in order:
1. `supabase/schema.sql` — core tables (categories/products/gallery/orders/media),
   RLS, and the 20 seeded art categories
2. `supabase/migrations/20260819_refactor.sql` — catalogue fields
   (pdf_url/vastu_note), `interests`, `enquiries`, `posts`, `connections`,
   RLS, and placeholder seeds

Existing databases that already ran `schema.sql` only need step 2.

### Create Storage Buckets (Storage > New bucket, both **Public**)
- `artworks` — media library, category images, blog covers
- `products` — product photos

### Enable Authentication
1. Authentication > Providers → ensure **Email** is enabled
2. Authentication > Users > "Add User" → create Monica's admin login
   (e.g. `admin@prashreearts.com` + a strong password). Any authenticated
   user has full admin access via RLS, so create only this one user.

---

## 2. Environment Variables

Create `.env` in the project root (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

---

## 3. Local Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run lint
npm run images     # regenerate optimized photos from images-src/ (needs originals)
```

If a fresh `npm install` breaks `vite build` with "Cannot find native binding",
run `npm install --no-save @rolldown/binding-linux-x64-gnu` (npm optional-deps bug).

---

## 4. Content

- **Products**: add via `/admin/products` (photos upload to the `products`
  bucket). Catalogue PDFs go in `public/pdfs/` (reference as `/pdfs/name.pdf`)
  or any public URL in the product's "Catalogue PDF URL" field.
- **Blog**: write via `/admin/posts` (Markdown body, cover uploads to `artworks`).
- **Connections**: rows in the `connections` table (SQL editor) — the page
  falls back to `src/data/connections.js` when the table is empty.
- **Interest requests & enquiries** arrive in `/admin` and `/admin/enquiries`.
- Placeholder copy across site and seeds is wrapped in `[[ ]]` — search and replace.

---

## 5. Deploy to Vercel

1. Push to GitHub and import at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Vite**
3. Add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. `vercel.json` already rewrites all non-`/api` routes to `index.html` (SPA)

### Custom Domain
Project Settings > Domains → add `prashreearts.com`; follow DNS instructions.

---

## 6. Post-Deployment Checklist

- [ ] All pages load at 375px and 1440px
- [ ] Admin login works; interests/enquiries appear after a test submission
- [ ] Replace `[[ ]]` placeholder copy (site + product/connection seeds)
- [ ] Set the Instagram URL in `src/pages/Contact.jsx`
- [ ] Supply clean (un-watermarked) originals to re-run `npm run images` without crops

---

## Tech Stack Summary

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 19 + Vite                  |
| Styling  | Tailwind CSS v4 (monochrome design system) |
| Backend  | Supabase (Postgres/Auth/Storage) |
| Hosting  | Vercel (static SPA)              |
| Fonts    | Cormorant Garamond + Karla (Google Fonts) |
| Icons    | Lucide React                     |
| Motion   | Framer Motion                    |
