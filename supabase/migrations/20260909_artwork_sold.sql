-- ============================================================================
-- Sold originals (run once in the Supabase SQL editor)
-- An artwork stays listed when its original sells: the card and detail page
-- show "Original sold", and visitors can still enquire about a fine-art print.
-- Toggle per artwork at /admin/products.
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sold BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE products SET is_sold = TRUE WHERE slug IN ('manipura', 'ananda');
