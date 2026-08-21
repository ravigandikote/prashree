-- ============================================================================
-- Mandala Studio templates (run once in the Supabase SQL editor)
-- Starter templates curated in /admin appear for everyone in the studio's
-- "PraShree starters" tab. owner_key is reserved for future public accounts.
-- ============================================================================

CREATE TABLE IF NOT EXISTS mandala_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  config_json JSONB NOT NULL,
  is_starter  BOOLEAN NOT NULL DEFAULT FALSE,
  owner_key   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mandala_templates_starter ON mandala_templates(is_starter);

ALTER TABLE mandala_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read starters; only the authenticated admin can manage rows.
CREATE POLICY "Public read starter templates" ON mandala_templates
  FOR SELECT USING (is_starter = true);
CREATE POLICY "Authenticated select on mandala_templates" ON mandala_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on mandala_templates" ON mandala_templates
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on mandala_templates" ON mandala_templates
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete on mandala_templates" ON mandala_templates
  FOR DELETE TO authenticated USING (true);

-- A pleasant default starter: A4, 8 rings, 12 sectors
INSERT INTO mandala_templates (name, config_json, is_starter)
SELECT '12-sector A4, 8 rings',
  '{"version":1,"name":"12-sector A4, 8 rings","paper":{"preset":"a4p","w":210,"h":297},"margin":10,"centre":{"x":105,"y":148.5},"rings":{"mode":"uniform","count":8,"gap":11,"radii":[11,22,33,44,55,66,77,88]},"lines":{"step":30,"sectors":12,"innerRing":0,"outerRing":7,"offset":0},"guides":{"circles":true,"lines":true,"centre":true,"margin":true},"fills":{}}'::jsonb,
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM mandala_templates WHERE name = '12-sector A4, 8 rings');
