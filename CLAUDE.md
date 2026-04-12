# PraShree Arts

## Project Overview
PraShree Arts is a handcrafted art e-commerce and portfolio website for Monica Prakash, a Mandala Art Therapist and founder. Built with React 18 + Vite, Supabase backend, and Razorpay payments.

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS v4
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Razorpay Checkout
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Playfair Display (headings), Inter (body)

## Design Theme
- Black & white mandala-inspired theme
- No bright colors — intentionally monochrome for therapeutic calm
- Mandala borders and dividers as decorative elements
- Grayscale image hover effects

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
│   └── admin/      # Admin dashboard pages
├── lib/            # Supabase client, Razorpay helpers
├── context/        # React contexts (Auth, Cart)
├── hooks/          # Custom React hooks
└── assets/         # Static assets
```

## Key Commands
```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run preview   # Preview production build
```

## Environment Variables
Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Supabase Setup
- Run the SQL schema in `supabase/schema.sql` against your Supabase project
- Create storage buckets: `artworks` (public), `products` (public)
- Enable Email auth for admin login

## Art Categories (20 total)
Mandala Art, Janur Art, DIY Best Out of Waste, Thread Work, Wall Arts, Home Décor, Abstract Paintings, Mandalas on Abstract, Doodle Art, Ceramic Wall Décor, Frame Works, Glue Gun Art, Dry Flower/Leaf Arrangements, Event Background Decoration, Table Arrangements, Customized Drawings/Gifts, T-Shirt Printing, Bamboo Art, Coconut Shell Art, Jewellery Making

## Node Version
Requires Node.js >= 18. Use `nvm use 18` or `nvm use 24`.
