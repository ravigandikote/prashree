# PraShree Arts — Deployment Guide

## Prerequisites
- Node.js >= 18 (use `nvm use 18` or `nvm use 24`)
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account
- A [Vercel](https://vercel.com) account (for hosting)

---

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon/public API key** from Settings > API

### Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Run the entire SQL script — this creates tables, indexes, RLS policies, and seeds 20 art categories

### Create Storage Buckets
1. Go to Storage in your Supabase dashboard
2. Create a bucket named `artworks` (set to **Public**)
3. Create a bucket named `products` (set to **Public**)

### Enable Authentication
1. Go to Authentication > Providers
2. Ensure **Email** provider is enabled
3. Create an admin user via Authentication > Users > "Add User"
   - Email: `admin@prashreearts.com`
   - Password: your chosen password

---

## 2. Razorpay Setup

### Test Mode
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings > API Keys
3. Generate a **Test** key pair
4. Note the **Key ID** (starts with `rzp_test_`)

### Production Server Endpoint
For production payments, you need a server endpoint to create Razorpay orders:

**Option A: Supabase Edge Function**
Create a Supabase Edge Function at `supabase/functions/create-razorpay-order/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

serve(async (req) => {
  const { amount, currency, receipt } = await req.json()

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
    },
    body: JSON.stringify({ amount, currency: currency || 'INR', receipt }),
  })

  const order = await response.json()
  return new Response(JSON.stringify(order), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Deploy with: `supabase functions deploy create-razorpay-order`

**Option B: Vercel API Route**
Create `api/create-razorpay-order.js` for a Vercel serverless function.

---

## 3. Environment Variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens at http://localhost:3000
```

---

## 5. Deploy to Vercel

### Via CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Via GitHub
1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Set **Framework Preset** to `Vite`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
5. Deploy

### SPA Routing Fix
Create `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

## 6. Custom Domain

1. In Vercel, go to Project Settings > Domains
2. Add `prashreearts.com`
3. Update DNS records as instructed by Vercel
4. SSL is automatically provisioned

---

## 7. Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test Razorpay payment flow (use test card: 4111 1111 1111 1111)
- [ ] Upload artwork images via Admin > Media
- [ ] Add products via Admin > Products
- [ ] Verify category pages display correctly
- [ ] Test mobile responsiveness
- [ ] Set up Razorpay webhook for payment confirmations
- [ ] Switch Razorpay to **Live** mode when ready
- [ ] Update `VITE_RAZORPAY_KEY_ID` to live key

---

## Tech Stack Summary

| Layer    | Technology           |
| -------- | -------------------- |
| Frontend | React 18 + Vite      |
| Styling  | TailwindCSS v4       |
| Backend  | Supabase             |
| Auth     | Supabase Auth        |
| Database | Supabase PostgreSQL  |
| Storage  | Supabase Storage     |
| Payments | Razorpay             |
| Hosting  | Vercel               |
| Fonts    | Google Fonts         |
| Icons    | Lucide React         |
| Animate  | Framer Motion        |
