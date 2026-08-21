-- ============================================================================
-- Upcoming workshops (run once in the Supabase SQL editor)
-- Announced on /workshops; managed by Monica at /admin/workshops.
-- ============================================================================

CREATE TABLE IF NOT EXISTS workshop_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  schedule      TEXT NOT NULL,          -- e.g. 'Every Sunday · 3 – 5 pm'
  venue         TEXT,
  flyer_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workshop_events_active ON workshop_events(is_active);

DROP TRIGGER IF EXISTS trg_workshop_events_updated_at ON workshop_events;
CREATE TRIGGER trg_workshop_events_updated_at
  BEFORE UPDATE ON workshop_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE workshop_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active workshops" ON workshop_events
  FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated select on workshop_events" ON workshop_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on workshop_events" ON workshop_events
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on workshop_events" ON workshop_events
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete on workshop_events" ON workshop_events
  FOR DELETE TO authenticated USING (true);

-- Seed the two current recurring workshops
INSERT INTO workshop_events (title, description, schedule, venue, display_order)
SELECT 'Janur Art Workshop',
  'Hands-on coconut-leaf art — from first weave to a finished piece you take home. All materials provided.',
  'Every Sunday · 10 am – 12 pm',
  'Eco Cottage, Kalyan Nagar, Bengaluru', 1
WHERE NOT EXISTS (SELECT 1 FROM workshop_events WHERE title = 'Janur Art Workshop');

INSERT INTO workshop_events (title, description, schedule, venue, display_order)
SELECT 'Mandala Art Therapy Workshop',
  'Therapeutic mandala drawing with Monica — centre, circles, and patterns at a calm, guided pace. All materials provided.',
  'Every Sunday · 3 – 5 pm',
  'Eco Cottage, Kalyan Nagar, Bengaluru', 2
WHERE NOT EXISTS (SELECT 1 FROM workshop_events WHERE title = 'Mandala Art Therapy Workshop');
