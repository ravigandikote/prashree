-- ============================================================================
-- PraShree Arts - Supabase Database Schema
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT UNIQUE NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  image_url     TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Products
-- ----------------------------------------------------------------------------
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  sale_price    NUMERIC(10,2),
  images        TEXT[] DEFAULT '{}',
  is_featured   BOOLEAN DEFAULT FALSE,
  is_available  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Orders
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        TEXT UNIQUE NOT NULL,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT NOT NULL,
  customer_phone      TEXT,
  items               JSONB NOT NULL,
  total_amount        NUMERIC(10,2) NOT NULL,
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  payment_status      TEXT DEFAULT 'pending'
                        CHECK (payment_status IN ('pending', 'paid', 'failed')),
  shipping_address    TEXT,
  status              TEXT DEFAULT 'received'
                        CHECK (status IN ('received', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. Media
-- ----------------------------------------------------------------------------
CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_type   TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. Gallery
-- ----------------------------------------------------------------------------
CREATE TABLE gallery (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  title         TEXT,
  image_url     TEXT NOT NULL,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_categories_slug       ON categories(slug);
CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_category_id  ON products(category_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_gallery_category_id   ON gallery(category_id);
CREATE INDEX idx_media_category_id     ON media(category_id);
CREATE INDEX idx_media_product_id      ON media(product_id);

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE media      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery    ENABLE ROW LEVEL SECURITY;

-- ---- Public read policies (anonymous + authenticated) ----------------------

CREATE POLICY "Public read access on categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public read access on products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Public read access on gallery"
  ON gallery FOR SELECT
  USING (true);

-- ---- Authenticated write policies ------------------------------------------

-- Categories
CREATE POLICY "Authenticated insert on categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update on categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete on categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products
CREATE POLICY "Authenticated insert on products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update on products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete on products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders (public can insert orders, authenticated can do everything)
CREATE POLICY "Public insert on orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated select on orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated update on orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete on orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Media
CREATE POLICY "Public read access on media"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert on media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update on media"
  ON media FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete on media"
  ON media FOR DELETE
  TO authenticated
  USING (true);

-- Gallery
CREATE POLICY "Authenticated insert on gallery"
  ON gallery FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update on gallery"
  ON gallery FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete on gallery"
  ON gallery FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- STORAGE BUCKETS (run via Supabase Dashboard or uncomment below)
-- ============================================================================

-- These statements use the storage API and are typically configured via the
-- Supabase Dashboard under Storage. Included here for reference.

-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies (public read, authenticated upload)
-- CREATE POLICY "Public read on products bucket"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'products');

-- CREATE POLICY "Authenticated upload to products bucket"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'products');

-- CREATE POLICY "Public read on categories bucket"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'categories');

-- CREATE POLICY "Authenticated upload to categories bucket"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'categories');

-- CREATE POLICY "Public read on gallery bucket"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'gallery');

-- CREATE POLICY "Authenticated upload to gallery bucket"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'gallery');

-- CREATE POLICY "Public read on media bucket"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'media');

-- CREATE POLICY "Authenticated upload to media bucket"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'media');

-- ============================================================================
-- SEED DATA - Categories
-- ============================================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
(
  'Mandala Art',
  'mandala-art',
  'Intricate and mesmerizing mandala designs crafted with precision and creativity, perfect for wall decor and gifting.',
  1
),
(
  'Janur Art (Coconut Leaf Art)',
  'janur-art-coconut-leaf-art',
  'Traditional and contemporary art made from coconut leaves (janur), showcasing the beauty of natural materials.',
  2
),
(
  'DIY - Best Out of Waste',
  'diy-best-out-of-waste',
  'Creative do-it-yourself art pieces crafted from recycled and upcycled materials, turning waste into beautiful decor.',
  3
),
(
  'Thread Work (Frames / Boards)',
  'thread-work-frames-boards',
  'Vibrant and colorful thread art on frames and boards, featuring geometric patterns, portraits, and decorative motifs.',
  4
),
(
  'Wall Arts (Mandala or Warli)',
  'wall-arts-mandala-or-warli',
  'Stunning wall art pieces featuring traditional mandala patterns and Warli tribal art, handcrafted for elegant interiors.',
  5
),
(
  'Home Decor',
  'home-decor',
  'A curated collection of handcrafted home decor items including vases, candle holders, trays, and accent pieces.',
  6
),
(
  'Abstract Paintings',
  'abstract-paintings',
  'Bold and expressive abstract paintings using acrylics and mixed media, adding a modern artistic touch to any space.',
  7
),
(
  'Mandalas on Abstract Paintings',
  'mandalas-on-abstract-paintings',
  'A unique fusion of detailed mandala work layered over abstract painted backgrounds, blending tradition with modernity.',
  8
),
(
  'Doodle Art',
  'doodle-art',
  'Fun and intricate doodle illustrations full of character and detail, available as prints, originals, and custom pieces.',
  9
),
(
  'Ceramic Wall Decor',
  'ceramic-wall-decor',
  'Hand-painted and sculpted ceramic wall hangings and plates, adding texture and artisan charm to your walls.',
  10
),
(
  'Frame Works',
  'frame-works',
  'Custom and decorative frames designed to complement and elevate artwork, photographs, and memorabilia.',
  11
),
(
  'Glue Gun Art',
  'glue-gun-art',
  'Innovative 3D art created using hot glue techniques, producing textured sculptures and wall pieces with a unique aesthetic.',
  12
),
(
  'Dry Flower / Leaf Arrangements',
  'dry-flower-leaf-arrangements',
  'Elegant arrangements of dried flowers and preserved leaves, offering long-lasting natural beauty for home and events.',
  13
),
(
  'Event Background Decoration',
  'event-background-decoration',
  'Custom-designed decorative backdrops and setups for weddings, birthdays, baby showers, and other special occasions.',
  14
),
(
  'Table Arrangements (Natural Materials)',
  'table-arrangements-natural-materials',
  'Handcrafted table centerpieces and arrangements using natural materials like wood, dried botanicals, and stones.',
  15
),
(
  'Customized Drawings / Gifts',
  'customized-drawings-gifts',
  'Personalized hand-drawn portraits, caricatures, and bespoke gift items tailored to your specifications.',
  16
),
(
  'T-Shirt Printing',
  't-shirt-printing',
  'Custom hand-painted and printed t-shirts featuring original art designs, mandalas, doodles, and personalized graphics.',
  17
),
(
  'Bamboo Art',
  'bamboo-art',
  'Eco-friendly art and craft pieces made from bamboo, including wall hangings, functional decor, and sculptural works.',
  18
),
(
  'Coconut Shell Art',
  'coconut-shell-art',
  'Creative and sustainable art carved and crafted from coconut shells, including lamps, bowls, and decorative items.',
  19
),
(
  'Jewellery Making',
  'jewellery-making',
  'Handmade jewellery pieces including earrings, necklaces, and bracelets crafted from beads, clay, resin, and natural materials.',
  20
);
