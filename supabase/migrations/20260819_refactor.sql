-- ============================================================================
-- PraShree Arts refactor migration (run once in the Supabase SQL editor)
-- Adds: product catalogue fields, interests (express-interest requests),
-- enquiries (contact/booking form), posts (blog), connections (community).
-- The legacy orders/cart flow is retired; the orders table is left untouched
-- as historical data.
-- ============================================================================

-- ── Products: catalogue additions ──
ALTER TABLE products ADD COLUMN IF NOT EXISTS pdf_url    TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vastu_note TEXT;

-- ── Interests: "Express interest" requests tied to a product ──
CREATE TABLE IF NOT EXISTS interests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  city        TEXT,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'called', 'follow_up', 'closed')),
  admin_notes TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interests_product_id ON interests(product_id);
CREATE INDEX IF NOT EXISTS idx_interests_status     ON interests(status);

-- ── Enquiries: contact + workshop/booking messages ──
CREATE TABLE IF NOT EXISTS enquiries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind        TEXT NOT NULL DEFAULT 'contact'
                CHECK (kind IN ('contact', 'booking', 'decor')),
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'replied', 'closed')),
  admin_notes TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

-- ── Posts: blog, editable from /admin ──
CREATE TABLE IF NOT EXISTS posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  cover_image  TEXT,
  body         TEXT NOT NULL DEFAULT '',
  tags         TEXT[] DEFAULT '{}',
  published    BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- ── Connections: community & partnership entries ──
CREATE TABLE IF NOT EXISTS connections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  role          TEXT,
  description   TEXT,
  logo_url      TEXT,
  url           TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── updated_at triggers ──
DROP TRIGGER IF EXISTS trg_interests_updated_at ON interests;
CREATE TRIGGER trg_interests_updated_at
  BEFORE UPDATE ON interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_enquiries_updated_at ON enquiries;
CREATE TRIGGER trg_enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──
ALTER TABLE interests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Public may submit interests/enquiries; only authenticated may read/manage.
CREATE POLICY "Public insert on interests" ON interests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated select on interests" ON interests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update on interests" ON interests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete on interests" ON interests
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public insert on enquiries" ON enquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated select on enquiries" ON enquiries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update on enquiries" ON enquiries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete on enquiries" ON enquiries
  FOR DELETE TO authenticated USING (true);

-- Blog: public reads published posts only; authenticated full access.
CREATE POLICY "Public read published posts" ON posts
  FOR SELECT USING (published = true);
CREATE POLICY "Authenticated select on posts" ON posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on posts" ON posts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on posts" ON posts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete on posts" ON posts
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public read on connections" ON connections
  FOR SELECT USING (true);
CREATE POLICY "Authenticated insert on connections" ON connections
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on connections" ON connections
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete on connections" ON connections
  FOR DELETE TO authenticated USING (true);

-- ── Seed: placeholder products (replace names/prices — [[ ]] marks copy to
--    swap; price 0 renders as "Price on request" on the site) ──
INSERT INTO products (name, slug, description, price, is_featured, is_available)
VALUES
  ('[[Sample Product — Mandala Wall Piece]]', 'sample-mandala-wall-piece',
   '[[Replace with the real product description.]]', 0, true, true),
  ('[[Sample Product — Janur Creation]]', 'sample-janur-creation',
   '[[Replace with the real product description.]]', 0, true, true),
  ('[[Sample Product — Shadow-Box Frame]]', 'sample-shadow-box-frame',
   '[[Replace with the real product description.]]', 0, false, true),
  ('[[Sample Product — Custom Gift]]', 'sample-custom-gift',
   '[[Replace with the real product description.]]', 0, false, true)
ON CONFLICT (slug) DO NOTHING;

-- ── Seed: connections ──
INSERT INTO connections (name, role, description, display_order) VALUES
  ('NeeRav Arts Village', 'Creative Director',
   'A space dedicated to nurturing creativity through residential workshops and events, in a serene natural setting.', 1),
  ('HEF Community', 'Secretary',
   '[[Short description of the HEF community and Monica''s work there.]]', 2),
  ('Eat Raja Sir', 'Social-service partnership',
   '[[Short description of this partnership.]]', 3),
  ('Sampige Foundation', 'Social-service partnership',
   '[[Short description of this partnership.]]', 4)
ON CONFLICT DO NOTHING;
