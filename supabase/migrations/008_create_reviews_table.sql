-- ============================================
-- Reviews Table Migration
-- Date: 2026-03-25
-- Description: Create reviews table for product reviews with RLS policies
-- ============================================

-- ============================================
-- Reviews Table
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_name TEXT,
  author_avatar TEXT,

  -- Product association
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,

  -- SEO metadata
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],

  -- Status management
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

  -- Source information
  source_url TEXT,
  source_site TEXT,

  -- Metadata
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_slug ON reviews(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_status_featured ON reviews(status, featured) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_subcategory ON reviews(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_status_published ON reviews(status, published_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for published reviews
CREATE POLICY "Allow public read access to published reviews"
  ON reviews FOR SELECT
  USING (status = 'published');

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Updated At Trigger
-- ============================================
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Test Data
-- ============================================
INSERT INTO reviews (user_id, title, slug, excerpt, content, cover_image, author_name, author_avatar, category_id, subcategory_id, item_id, meta_title, meta_description, keywords, status, featured, rating, source_url, source_site, published_at) VALUES
(
  NULL,
  '新生儿汽车座椅购买指南：如何选择最适合的安全座椅',
  'newborn-car-seat-buying-guide',
  '选择合适的新生儿汽车座椅至关重要。本文将详细介绍如何根据宝宝的年龄、体重和车型来选择最安全的汽车座椅。',
  '# 新生儿汽车座椅购买指南

## 为什么需要专门的汽车座椅？

新生儿汽车座椅不仅仅是出行工具，更是保护宝宝安全的重要设备。正确选择和使用汽车座椅可以在紧急情况下减少80%以上的伤亡风险。

## 选择要点

### 1. 根据年龄和体重选择
- **0-15个月**：使用后向式座椅
- **9个月-4岁**：可转换为前向式
- **4-12岁**：使用增高垫

### 2. 安装方式
- ISOFIX接口（推荐）
- 安全带固定
- 底座+座椅组合

### 3. 舒适度考虑
- 透气性
- 头枕调节
- 躺角调节

## 推荐品牌

1. **Cybex** - 德国品牌，安全性出色
2. **Graco** - 性价比高
3. **Aprica** - 日本品牌，适合亚洲宝宝

## 使用注意事项

- 确保安装牢固
- 定期检查安全带
- 不要过早转向前向式
- 冬季注意保暖但不要过厚',
  '/images/reviews/car-seat-cover.jpg',
  '育儿专家',
  '/images/authors/expert-avatar.jpg',
  (SELECT id FROM categories WHERE slug = 'clothing-diapering' LIMIT 1),
  (SELECT id FROM subcategories WHERE slug = 'clothing' LIMIT 1),
  (SELECT id FROM items WHERE name_zh = '汽车座椅' LIMIT 1),
  '新生儿汽车座椅购买指南 - 如何选择最安全的安全座椅',
  '详细的新生儿汽车座椅选购指南，包括选择要点、推荐品牌和使用注意事项',
  ARRAY['汽车座椅', '新生儿', '安全座椅', '购车指南', '宝宝出行'],
  'published',
  true,
  4.8,
  'https://example.com/car-seat-guide',
  '宝宝育儿网',
  NOW()
),
(
  NULL,
  '纸尿裤品牌对比：帮宝适vs大王vs花王',
  'diaper-brand-comparison',
  '本文详细对比了市面上最受欢迎的三大纸尿裤品牌：帮宝适、大王和花王，从价格、透气性、吸水性等多个维度进行分析。',
  '# 纸尿裤品牌对比评测

作为新生儿用品中消耗最大的单品，纸尿裤的选择直接关系到宝宝的舒适度和家庭的预算。本文将对比三大主流品牌。

## 对比维度

### 1. 价格（片/元）
- 帮宝适：2.5-3.5元
- 大王：3-4元
- 花王：2.8-3.8元

### 2. 透气性
- 帮宝适：★★★★☆
- 大王：★★★★★
- 花王：★★★★☆

### 3. 吸水性
- 帮宝适：★★★★★
- 大王：★★★★☆
- 花王：★★★★★

### 4. 柔软度
- 帮宝适：★★★★☆
- 大王：★★★★★
- 花王：★★★★☆

## 使用建议

- **新生儿期**：推荐大王，柔软度最好
- **白天活动**：推荐帮宝适，吸水性强
- **夜间使用**：推荐花王，防漏效果好

## 购买渠道

- 官方旗舰店（最放心）
- 大型商超（可查看实物）
- 电商平台（价格优惠）',
  '/images/reviews/diaper-comparison.jpg',
  '宝妈达人',
  '/images/authors/mom-avatar.jpg',
  (SELECT id FROM categories WHERE slug = 'clothing-diapering' LIMIT 1),
  (SELECT id FROM subcategories WHERE slug = 'diapering' LIMIT 1),
  (SELECT id FROM items WHERE name_zh = '纸尿裤' LIMIT 1),
  '纸尿裤品牌对比：帮宝适vs大王vs花王全方位评测',
  '详细对比帮宝适、大王、花王三大纸尿裤品牌的价格、透气性、吸水性和柔软度',
  ARRAY['纸尿裤', '帮宝适', '大王', '花王', '品牌对比'],
  'published',
  true,
  4.5,
  'https://example.com/diaper-comparison',
  '母婴评测社',
  NOW() - INTERVAL '2 days'
),
(
  NULL,
  '初为人母：待产包清单大全',
  'hospital-bag-checklist',
  '待产包应该准备什么？本文为您整理了最全面的待产包清单，包括妈妈用品、宝宝用品、证件等重要物品。',
  '# 待产包清单大全

临产前准备一个完善的待产包，可以让入院生产更加从容。以下是经过多位宝妈验证的完整清单。

## 妈妈用品

### 证件类
- 身份证
- 医保卡
- 产检资料
- 结婚证
- 户口本

### 卫生用品
- 产妇卫生巾（LXL各1包）
- 一次性内裤（30条）
- 产褥垫（20片）
- 卫生纸（3卷）
- 湿巾（1包）

### 贴身衣物
- 哺乳内衣（3件）
- 产妇睡衣（2套）
- 产妇帽（1个）
- 袜子（3双）
- 拖鞋（1双）

## 宝宝用品

### 贴身用品
- 新生儿衣服（3-5套）
- 纸尿裤（NB号1包）
- 护臀膏（1支）
- 湿纸巾（1包）
- 口水巾（5条）

### 喂养用品
- 小勺小碗（1套）
- 配方奶粉（小罐1个）

### 其他
- 包被（2条）
- 袜子（2双）
- 帽子（1个）

## 其他必备
- 手机充电器
- 相机
- 零食
- 饮水杯
- 洗漱用品

## 打包技巧

1. 分类装袋，贴好标签
2. 常用物品放在外层
3. 提前1个月准备好
4. 放在固定位置，方便随时拿取',
  '/images/reviews/hospital-bag.jpg',
  '产科护士',
  '/images/authors/nurse-avatar.jpg',
  NULL,
  NULL,
  NULL,
  '初为人母：待产包清单大全 - 医院待产包准备指南',
  '完整的待产包清单，包括妈妈用品、宝宝用品、证件等重要物品及打包技巧',
  ARRAY['待产包', '孕妇准备', '生产准备', '入院清单', '新生儿准备'],
  'published',
  false,
  4.2,
  'https://example.com/hospital-bag-checklist',
  '产科护理之家',
  NOW() - INTERVAL '1 week'
);

-- ============================================
-- Verification Queries (commented out)
-- ============================================
-- SELECT COUNT(*) FROM reviews; -- Should return 3
-- SELECT title, status FROM reviews; -- Should show 3 reviews with published status
-- SELECT * FROM reviews WHERE status = 'published'; -- Should show all 3 reviews
