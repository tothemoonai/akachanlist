-- Migration: Add user notes and item icons
-- Date: 2026-03-24
-- Depends on: 003_add_user_lists.sql

-- Add user_notes field to user_list_items
ALTER TABLE user_list_items
ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Add icon field to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Update some sample items with icons (using lucide-react icon names)
UPDATE items SET icon = 'baby' WHERE name_zh LIKE '%婴儿%' OR name_ja LIKE '%赤ちゃん%';
UPDATE items SET icon = 'shirt' WHERE name_zh LIKE '%服%' OR name_ja LIKE '%服%';
UPDATE items SET icon = 'home' WHERE name_zh LIKE '%寝具%' OR name_ja LIKE '%寝具%';
UPDATE items SET icon = 'book' WHERE name_zh LIKE '%手册%' OR name_ja LIKE '%手帳%';
UPDATE items SET icon = 'pill' WHERE name_zh LIKE '%药%' OR name_ja LIKE '%薬%';
UPDATE items SET icon = 'bottle' WHERE name_zh LIKE '%奶瓶%' OR name_ja LIKE '%哺乳瓶%';
UPDATE items SET icon = 'thermometer' WHERE name_zh LIKE '%体温计%' OR name_ja LIKE '%体温計%';
UPDATE items SET icon = 'stethoscope' WHERE name_zh LIKE '%听诊器%' OR name_ja LIKE '%聴診器%';
UPDATE items SET icon = 'heart' WHERE name_zh LIKE '%产妇%' OR name_ja LIKE '%マタニティ%';
UPDATE items SET icon = 'package' WHERE name_zh LIKE '%纸尿裤%' OR name_ja LIKE '%おむつ%';

-- Create index on user_notes for searching
CREATE INDEX IF NOT EXISTS idx_user_list_items_notes
ON user_list_items(user_list_id)
WHERE user_notes IS NOT NULL;
