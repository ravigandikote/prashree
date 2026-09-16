-- ============================================================================
-- Sound layer (run once in the Supabase SQL editor, after 20260914_vastu_placement.sql)
-- Each artwork may carry one paired tone; site_audio holds the shared assets
-- (gong strikes, optional fallback tone). Files live in Storage under
-- products/audio/ — see README "Sound layer" and docs/audio-spec-for-monica.md.
-- Idempotent and re-runnable.
-- ============================================================================

-- ── Per-artwork tone ──
ALTER TABLE products ADD COLUMN IF NOT EXISTS audio_url          TEXT;          -- public Storage URL of the compressed .m4a
ALTER TABLE products ADD COLUMN IF NOT EXISTS audio_title        TEXT;          -- "Singing bowl in C, Monica Prakash"
ALTER TABLE products ADD COLUMN IF NOT EXISTS audio_credit       TEXT;          -- performer, instrument, where/when recorded
ALTER TABLE products ADD COLUMN IF NOT EXISTS audio_loop_seconds NUMERIC(6,2);  -- loop length, for crossfade timing

-- ── Shared site audio, keyed by slug ──
CREATE TABLE IF NOT EXISTS site_audio (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug               TEXT NOT NULL UNIQUE,   -- gong-open | gong-close | fallback-tone
  label              TEXT NOT NULL,          -- shown in /admin only
  purpose            TEXT,                   -- what the site uses it for (admin hint)
  audio_url          TEXT,                   -- NULL until a file is uploaded
  audio_title        TEXT,
  audio_credit       TEXT,
  audio_loop_seconds NUMERIC(6,2),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_site_audio_updated_at ON site_audio;
CREATE TRIGGER trg_site_audio_updated_at
  BEFORE UPDATE ON site_audio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE site_audio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site audio" ON site_audio;
CREATE POLICY "Public read site audio" ON site_audio
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert on site audio" ON site_audio;
CREATE POLICY "Authenticated insert on site audio" ON site_audio
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update on site audio" ON site_audio;
CREATE POLICY "Authenticated update on site audio" ON site_audio
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete on site audio" ON site_audio;
CREATE POLICY "Authenticated delete on site audio" ON site_audio
  FOR DELETE TO authenticated USING (true);

-- ── The three shared slots exist from the start (empty) so Monica fills them
--    from /admin without a deploy. Re-running never touches a filled row. ──
INSERT INTO site_audio (slug, label, purpose) VALUES
  ('gong-open',     'Gong — opening strike', 'Strikes once when Two minutes of stillness begins.'),
  ('gong-close',    'Gong — closing strike', 'Strikes once when the practice completes (softer). Falls back to the opening strike if empty.'),
  ('fallback-tone', 'Fallback tone',         'Not used yet: reserved for artworks without a tone of their own, only if switched on later.')
ON CONFLICT (slug) DO NOTHING;
