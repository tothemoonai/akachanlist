-- Migration: Fix and update item icons
-- Date: 2026-03-24

-- 首先检查当前数据
SELECT id, name_zh, name_ja, icon FROM items LIMIT 10;

-- 为所有物品设置默认图标
UPDATE items SET icon = 'package' WHERE icon IS NULL;

-- 根据分类更新图标（使用更通用的匹配规则）
-- 孕产妇用品
UPDATE items SET icon = 'heart'
WHERE name_zh LIKE '%产妇%' OR name_zh LIKE '%孕妇%' OR name_ja LIKE '%マタニティ%';

UPDATE items SET icon = 'shirt'
WHERE name_zh LIKE '%服%' OR name_ja LIKE '%服%' OR name_zh LIKE '%衣%' OR name_ja LIKE '%衣%';

UPDATE items SET icon = 'bed'
WHERE name_zh LIKE '%寝具%' OR name_ja LIKE '%寝具%' OR name_zh LIKE '%床%' OR name_ja LIKE '%ベッド%';

-- 婴儿用品
UPDATE items SET icon = 'baby'
WHERE name_zh LIKE '%婴儿%' OR name_zh LIKE '%宝宝%' OR name_ja LIKE '%赤ちゃん%' OR name_ja LIKE '%ベビー%';

UPDATE items SET icon = 'package'
WHERE name_zh LIKE '%纸尿裤%' OR name_zh LIKE '%尿布%' OR name_ja LIKE '%おむつ%';

UPDATE items SET icon = 'book'
WHERE name_zh LIKE '%手册%' OR name_zh LIKE '%书%' OR name_ja LIKE '%手帳%' OR name_ja LIKE '%本%';

UPDATE items SET icon = 'pill'
WHERE name_zh LIKE '%药%' OR name_ja LIKE '%薬%';

UPDATE items SET icon = 'thermometer'
WHERE name_zh LIKE '%体温计%' OR name_ja LIKE '%体温計%';

UPDATE items SET icon = 'stethoscope'
WHERE name_zh LIKE '%听诊器%' OR name_ja LIKE '%聴診器%';

UPDATE items SET icon = 'bottle'
WHERE name_zh LIKE '%奶瓶%' OR name_zh LIKE '%哺乳瓶%' OR name_ja LIKE '%哺乳瓶%';

UPDATE items SET icon = 'car'
WHERE name_zh LIKE '%车%' OR name_ja LIKE '%カー%' OR name_ja LIKE '%車%';

UPDATE items SET icon = 'shoppingBag'
WHERE name_zh LIKE '%包%' OR name_ja LIKE '%バッグ%';

UPDATE items SET icon = 'clock'
WHERE name_zh LIKE '%钟%' OR name_ja LIKE '%時計%';

UPDATE items SET icon = 'calendar'
WHERE name_zh LIKE '%日历%' OR name_ja LIKE '%カレンダー%';

UPDATE items SET icon = 'home'
WHERE name_zh LIKE '%房%' OR name_ja LIKE '%部屋%' OR name_jh LIKE '%家%';

UPDATE items SET icon = 'bottle'
WHERE name_zh LIKE '%奶嘴%' OR name_zh LIKE '%乳头%' OR name_ja LIKE '%乳首%';

UPDATE items SET icon = 'shirt'
WHERE name_zh LIKE '%纱布%' OR name_ja LIKE '%ガーゼ%';

UPDATE items SET icon = 'bed'
WHERE name_zh LIKE '%被子%' OR name_ja LIKE '%布団%' OR name_zh LIKE '%毛布%';

-- 验证更新结果
SELECT
  icon,
  COUNT(*) as count,
  ARRAY_AGG(name_zh ORDER BY name_zh LIMIT 3) as sample_items
FROM items
GROUP BY icon
ORDER BY count DESC;
