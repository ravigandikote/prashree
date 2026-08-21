-- ============================================================================
-- Storage buckets (run once in the Supabase SQL editor)
-- Fixes "Bucket not found" on uploads from /admin (workshop flyers, blog
-- covers, product photos, media library).
--   artworks — media library, category images, blog covers, workshop flyers
--   products — product photos
-- Both public-read; only the authenticated admin can write.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Object policies (drop-then-create so re-running is safe)
DROP POLICY IF EXISTS "Public read site buckets"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload site buckets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update site buckets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete site buckets" ON storage.objects;

CREATE POLICY "Public read site buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('artworks', 'products'));

CREATE POLICY "Authenticated upload site buckets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('artworks', 'products'));

CREATE POLICY "Authenticated update site buckets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('artworks', 'products'))
  WITH CHECK (bucket_id IN ('artworks', 'products'));

CREATE POLICY "Authenticated delete site buckets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('artworks', 'products'));
