-- ============================================================================
-- Event enquiries (run once in the Supabase SQL editor)
-- Adds the 'event' kind plus event fields to enquiries, for /events.
-- ============================================================================

ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_kind_check;
ALTER TABLE enquiries ADD CONSTRAINT enquiries_kind_check
  CHECK (kind IN ('contact', 'booking', 'decor', 'event'));

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS event_date  DATE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS venue       TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS guest_count INTEGER;
