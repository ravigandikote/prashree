-- ============================================================================
-- Sound Healing library rows (run once in the Supabase SQL editor, after
-- 20260916_sound_layer.sql). One site_audio row per sound the studio activity
-- uses. audio_url stays NULL until a recording is uploaded at /admin/sounds;
-- while NULL the site plays the synthesised stand-in at /sounds/<slug>.wav.
-- Idempotent: re-running never touches a filled row.
-- ============================================================================
INSERT INTO site_audio (slug, label, purpose) VALUES
  ('bowl-root',         'Singing bowl — Root (C, 256 Hz)',         'Sound Healing: the root chakra bowl.'),
  ('bowl-sacral',       'Singing bowl — Sacral (D, 288 Hz)',       'Sound Healing: the sacral chakra bowl.'),
  ('bowl-solar-plexus', 'Singing bowl — Solar plexus (E, 320 Hz)', 'Sound Healing: the solar plexus bowl.'),
  ('bowl-heart',        'Singing bowl — Heart (F, 341 Hz)',        'Sound Healing: the heart chakra bowl.'),
  ('bowl-throat',       'Singing bowl — Throat (G, 384 Hz)',       'Sound Healing: the throat chakra bowl.'),
  ('bowl-third-eye',    'Singing bowl — Third eye (A, 427 Hz)',    'Sound Healing: the third-eye bowl.'),
  ('bowl-crown',        'Singing bowl — Crown (B, 480 Hz)',        'Sound Healing: the crown chakra bowl.'),
  ('rain-stick',        'Rain stick',                              'Sound Healing: enters after the bowls. Loopable, 10–20 s.'),
  ('ocean-drum',        'Ocean drum',                              'Sound Healing: enters after the rain stick. Loopable, 15–30 s.'),
  ('gong-healing',      'Gong — healing session',                  'Sound Healing: one strike before the alaap and one to close.'),
  ('raga-alaap',        'Raga alaap',                              'Sound Healing: fades in last. Tanpura + alaap, loopable, 45–90 s.')
ON CONFLICT (slug) DO NOTHING;
