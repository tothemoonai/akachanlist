-- Update all item icons to use local PNG category icons
-- This migration updates the icon field in the items table based on their category

-- Update items in maternity-mama category (孕产妇用品)
UPDATE items
SET icon = '/icons/maternity-mama.png'
WHERE subcategory_id IN (
  SELECT s.id FROM subcategories s
  JOIN categories c ON s.category_id = c.id
  WHERE c.slug = 'maternity-mama'
);

-- Update items in baby-0-3m category (婴儿用品 0-3个月)
UPDATE items
SET icon = '/icons/baby-wear.png'
WHERE subcategory_id IN (
  SELECT s.id FROM subcategories s
  JOIN categories c ON s.category_id = c.id
  WHERE c.slug = 'baby-0-3m'
);

-- Update items in baby-3-6m category (婴儿用品 3-6个月)
UPDATE items
SET icon = '/icons/baby-wear.png'
WHERE subcategory_id IN (
  SELECT s.id FROM subcategories s
  JOIN categories c ON s.category_id = c.id
  WHERE c.slug = 'baby-3-6m'
);

-- Update items in outing category (外出用品)
UPDATE items
SET icon = '/icons/odekake.png'
WHERE subcategory_id IN (
  SELECT s.id FROM subcategories s
  JOIN categories c ON s.category_id = c.id
  WHERE c.slug = 'outing'
);

-- Note: Additional category mappings that may exist:
-- sleep -> /icons/nenne-oheya.png
-- bath-care -> /icons/ofuro-baby-care.png
-- toilet-training -> /icons/omutu-kaeta.png
-- memorial -> /icons/memorial-ceremony.png
