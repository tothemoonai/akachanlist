-- Migration: Update category icons to use akachan.jp PNG icons
-- Date: 2026-03-24
-- Description: Update category icons from lucide-react names to PNG icon paths

-- Update category icons to use new PNG icons from akachan.jp
-- Mapping based on category names and purposes

-- Maternity & Mama -> maternity-mama.png
UPDATE categories
SET icon = '/icons/maternity-mama.png'
WHERE slug = 'maternity-mama';

-- Baby categories -> baby-wear.png (for baby related categories)
UPDATE categories
SET icon = '/icons/baby-wear.png'
WHERE slug IN ('baby-0-3m', 'baby-3-6m');

-- Outing -> odekake.png
UPDATE categories
SET icon = '/icons/odekake.png'
WHERE slug = 'outing';

-- If there are other categories, add appropriate mappings
-- For example, if you have a sleep/bedding category:
-- UPDATE categories SET icon = '/icons/nenne-oheya.png' WHERE slug = 'sleeping';
-- UPDATE categories SET icon = '/icons/junnyu-cho-nyu.png' WHERE slug = 'feeding';
-- UPDATE categories SET icon = '/icons/omutu-kaeta.png' WHERE slug = 'diapers';
-- UPDATE categories SET icon = '/icons/ofuro-baby-care.png' WHERE slug = 'bathing';
-- UPDATE categories SET icon = '/icons/memorial-ceremony.png' WHERE slug = 'memorial';

-- Verify the updates
SELECT
  slug,
  name_zh,
  name_ja,
  icon
FROM categories
ORDER BY sort_order;
