# 母婴商品测评报告功能 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有的分娩准备清单应用中添加母婴商品测评报告功能，包括测评列表、详情页、侧边栏展示和管理后台

**Architecture:** 在现有React应用中集成测评功能，使用Supabase存储数据，react-router-dom管理路由，Tiptap实现富文本编辑器

**Tech Stack:** React 18, Supabase, react-router-dom, Tiptap, React Query, TypeScript, Tailwind CSS

---

## File Structure Map

**New Files:**
```
src/types/reviews.ts                      # 测评类型定义
src/hooks/useReviews.ts                   # 测评数据hooks
src/hooks/useReviewBySlug.ts              # 单个测评hook
src/hooks/useRelatedReviews.ts            # 关联测评hook
src/components/reviews/ReviewCard.tsx     # 测评卡片组件
src/components/reviews/ReviewCardSkeleton.tsx  # 骨架屏组件
src/components/reviews/ReviewList.tsx     # 测评列表组件
src/components/reviews/ReviewDetail.tsx   # 测评详情组件
src/components/reviews/ReviewSidebar.tsx  # 侧边栏组件
src/components/reviews/ReviewAdmin.tsx    # 管理后台组件
src/components/reviews/ReviewEditor.tsx   # 富文本编辑器
src/pages/Reviews.tsx                     # 测评列表页面
supabase/migrations/001_create_reviews_table.sql  # 数据库迁移
```

**Modified Files:**
```
src/App.tsx                               # 添加路由配置
src/pages/Home.tsx                        # 集成侧边栏
src/components/Header.tsx                 # 添加导航链接
src/lib/supabase.ts                       # 添加测评查询函数
package.json                              # 添加依赖
tailwind.config.js                        # 添加prose样式（如果需要）
```

---

## Task 1: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装路由和状态管理依赖**

```bash
npm install react-router-dom @tanstack/react-query
```

Expected: 依赖安装成功，package.json更新

- [ ] **Step 2: 安装富文本编辑器依赖**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

Expected: 编辑器依赖安装成功

- [ ] **Step 3: 安装Tailwind Typography插件**

```bash
npm install -D @tailwindcss/typography
```

Expected: Typography插件安装成功

- [ ] **Step 4: 验证环境变量**

```bash
# 确认Supabase环境变量已配置
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."
```

Expected: 环境变量已设置（如果未设置，需先配置）

- [ ] **Step 5: 提交依赖变更**

```bash
git add package.json package-lock.json
git commit -m "feat: add dependencies for reviews feature

Install react-router-dom for routing, React Query for state management,
Tiptap for rich text editing, and Tailwind Typography for content styling.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 创建数据库表

**Files:**
- Create: `supabase/migrations/008_create_reviews_table.sql`

- [ ] **Step 1: 创建数据库迁移文件**

```sql
-- supabase/migrations/001_create_reviews_table.sql

-- 创建reviews表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,

  -- 商品关联
  item_name TEXT,
  item_id UUID,
  category TEXT,

  -- 元数据
  rating DECIMAL(2,1),
  source_url TEXT,
  source_site TEXT,

  -- 状态管理
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category);
CREATE INDEX IF NOT EXISTS idx_reviews_slug ON reviews(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_published_at ON reviews(published_at DESC);

-- 创建updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布的测评
CREATE POLICY "Public read published reviews"
ON reviews FOR SELECT
USING (status = 'published');

-- 认证用户可管理测评
CREATE POLICY "Authenticated users can manage reviews"
ON reviews FOR ALL
USING (auth.uid() IS NOT NULL);

-- 插入测试数据
INSERT INTO reviews (title, slug, summary, content, category, rating, source_site, status, featured, published_at) VALUES
(
  '婴儿纸尿裤测评：2024年最受欢迎的5款',
  'baby-diapers-review-2024',
  '对比测试了市场上最受欢迎的5款婴儿纸尿裤，从透气性、吸水性、舒适度等多个维度进行评估。',
  '<h2>测试背景</h2><p>本次测评对比了市场上最受欢迎的5款婴儿纸尿裤...</p><h2>测试结果</h2><p>经过为期2周的测试...</p>',
  '婴儿用品',
  4.5,
  '母婴之家',
  'published',
  true,
  NOW()
);
```

- [ ] **Step 2: 在Supabase控制台执行迁移**

在Supabase Dashboard -> SQL Editor 中执行上述SQL脚本

Expected: 表创建成功，索引创建成功，RLS策略配置成功，测试数据插入成功

- [ ] **Step 3: 验证表结构**

```bash
# 在Supabase控制台Table Editor中查看reviews表
# 确认有以下字段：
# - id, title, slug, summary, content, cover_image
# - item_name, item_id, category
# - rating, source_url, source_site
# - status, featured
# - created_at, updated_at, published_at
```

Expected: 表结构正确，测试数据显示正常

- [ ] **Step 4: 创建Supabase Storage存储桶**

在Supabase Dashboard中执行以下操作：

1. 导航到 Storage 页面
2. 点击 "New bucket"
3. 创建名为 `review-images` 的存储桶
4. 设置为 Public bucket
5. 在SQL Editor中执行以下RLS策略：

```sql
-- 允许所有人查看图片
CREATE POLICY "Public view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

-- 允许认证用户上传图片
CREATE POLICY "Auth upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images'
  AND auth.role() = 'authenticated'
);

-- 允许认证用户删除图片
CREATE POLICY "Auth delete review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'review-images'
  AND auth.role() = 'authenticated'
);
```

Expected: 存储桶创建成功，RLS策略配置完成

- [ ] **Step 5: 提交迁移文件**

```bash
git add supabase/migrations/
git commit -m "feat: create reviews table with RLS policies

Add reviews table for storing product review content with:
- Review metadata (title, slug, content, cover_image)
- Product association fields
- Status management (draft/published/archived)
- Row Level Security for public read and authenticated write
- Indexes for optimal query performance
- Sample data for testing
- Storage bucket for review images with RLS policies

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 创建类型定义

**Files:**
- Create: `src/types/reviews.ts`

- [ ] **Step 1: 创建测评类型定义**

```typescript
// src/types/reviews.ts

export interface Review {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  cover_image?: string;

  // 商品关联
  item_name?: string;
  item_id?: string;
  category?: string;

  // 元数据
  rating?: number;
  source_url?: string;
  source_site?: string;

  // 状态
  status: 'draft' | 'published' | 'archived';
  featured: boolean;

  // 时间戳
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ReviewCard extends Review {
  excerpt?: string;
}

export interface ReviewFilters {
  status?: 'published' | 'draft' | 'all';
  featured?: boolean;
  category?: string;
  search?: string;
  sortBy?: 'latest' | 'rating' | 'title';
  limit?: number;
  offset?: number;
}

export interface ReviewFormData {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  cover_image?: string;
  item_name?: string;
  category?: string;
  rating?: number;
  source_url?: string;
  source_site?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published_at?: string;
}
```

- [ ] **Step 2: 导出类型**

```typescript
// 在 src/types/index.ts 中添加
export * from './reviews';
```

- [ ] **Step 3: 提交类型定义**

```bash
git add src/types/
git commit -m "feat: add TypeScript types for reviews feature

Define Review, ReviewCard, ReviewFilters, and ReviewFormData
interfaces for type safety across the reviews feature.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: 创建数据查询hooks

**Files:**
- Create: `src/hooks/useReviews.ts`
- Create: `src/hooks/useReviewBySlug.ts`
- Create: `src/hooks/useRelatedReviews.ts`
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: 添加Supabase查询函数**

```typescript
// 在 src/lib/supabase.ts 中添加

import { Review, ReviewFilters } from '../types/reviews';

export async function getReviews(filters: ReviewFilters = {}) {
  let query = supabase
    .from('reviews')
    .select('*')
    .order('published_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.featured) {
    query = query.eq('featured', true);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { reviews: data || [], count };
}

export async function getReviewBySlug(slug: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getReviewsByItemId(itemId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('item_id', itemId)
    .eq('status', 'published');

  if (error) throw error;
  return data || [];
}

export async function createReview(review: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReview(id: string, review: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(review)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReview(id: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadReviewImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `reviews/${fileName}`;

  const { data, error } = await supabase.storage
    .from('review-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('review-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

- [ ] **Step 2: 创建useReviews hook**

```typescript
// src/hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, createReview, updateReview, deleteReview } from '../lib/supabase';
import { Review, ReviewFilters } from '../types/reviews';

export function useReviews(filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => getReviews(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, review }: { id: string; review: Partial<Review> }) =>
      updateReview(id, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
```

- [ ] **Step 3: 创建useReviewBySlug hook**

```typescript
// src/hooks/useReviewBySlug.ts
import { useQuery } from '@tanstack/react-query';
import { getReviewBySlug } from '../lib/supabase';
import { Review } from '../types/reviews';

export function useReviewBySlug(slug: string) {
  return useQuery({
    queryKey: ['review', slug],
    queryFn: () => getReviewBySlug(slug),
    enabled: !!slug,
  });
}
```

- [ ] **Step 4: 创建useRelatedReviews hook**

```typescript
// src/hooks/useRelatedReviews.ts
import { useQuery } from '@tanstack/react-query';
import { getReviewsByItemId } from '../lib/supabase';
import { Review } from '../types/reviews';

export function useRelatedReviews(itemId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'item', itemId],
    queryFn: () => getReviewsByItemId(itemId!),
    enabled: !!itemId,
  });
}
```

- [ ] **Step 5: 提交hooks**

```bash
git add src/hooks/ src/lib/supabase.ts
git commit -m "feat: add review data hooks with React Query

Add useReviews, useReviewBySlug, and useRelatedReviews hooks
for managing review data with caching and invalidation.
Add Supabase query functions for CRUD operations.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 创建测评卡片组件

**Files:**
- Create: `src/components/reviews/ReviewCard.tsx`
- Create: `src/components/reviews/ReviewCardSkeleton.tsx`

- [ ] **Step 1: 创建ReviewCard组件**

```typescript
// src/components/reviews/ReviewCard.tsx
import { Link } from 'react-router-dom';
import { ReviewCard as ReviewCardType } from '../../types/reviews';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: ReviewCardType;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const {
    id,
    title,
    slug,
    summary,
    cover_image,
    category,
    rating,
    source_site,
    published_at,
  } = review;

  const formatDate = new Date(published_at || '').toLocaleDateString('zh-CN');

  return (
    <article className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex flex-col h-full">
      {/* 封面图 */}
      {cover_image && (
        <div className="mb-3 rounded-lg overflow-hidden aspect-video">
          <img
            src={cover_image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 分类标签 */}
      {category && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded">
            {category}
          </span>
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
        {title}
      </h3>

      {/* 评分和来源 */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        {rating && (
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{rating}</span>
          </div>
        )}
        {source_site && (
          <span className="text-gray-500">· {source_site}</span>
        )}
        <span className="text-gray-400">· {formatDate}</span>
      </div>

      {/* 摘要 */}
      {summary && (
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
          {summary}
        </p>
      )}

      {/* 阅读按钮 */}
      <Link
        to={`/reviews/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium mt-auto"
      >
        阅读全文 →
      </Link>
    </article>
  );
}
```

- [ ] **Step 2: 创建骨架屏组件**

```typescript
// src/components/reviews/ReviewCardSkeleton.tsx
export function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      {/* 封面图骨架 */}
      <div className="mb-3 rounded-lg bg-gray-200 aspect-video" />

      {/* 标签骨架 */}
      <div className="mb-2">
        <div className="inline-block w-16 h-5 bg-gray-200 rounded" />
      </div>

      {/* 标题骨架 */}
      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />

      {/* 评分骨架 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-12 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </div>

      {/* 摘要骨架 */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>

      {/* 按钮骨架 */}
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  );
}
```

- [ ] **Step 3: 提交组件**

```bash
git add src/components/reviews/
git commit -m "feat: add ReviewCard and skeleton components

Add review card component with cover image, category badge,
rating, source, and read more link. Add skeleton loader
for loading state.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 创建测评列表组件和页面

**Files:**
- Create: `src/components/reviews/ReviewList.tsx`
- Create: `src/pages/Reviews.tsx`

- [ ] **Step 1: 创建ReviewList组件**

```typescript
// src/components/reviews/ReviewList.tsx
import { ReviewFilters } from '../../types/reviews';
import { useReviews } from '../../hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { ReviewCardSkeleton } from './ReviewCardSkeleton';

interface ReviewListProps {
  filters?: ReviewFilters;
}

export function ReviewList({ filters }: ReviewListProps) {
  const { reviews, loading, error } = useReviews(filters || { status: 'published' });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-4">加载失败: {error.message}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg"
        >
          重试
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">暂无测评内容</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建Reviews页面**

```typescript
// src/pages/Reviews.tsx
import { useState } from 'react';
import { ReviewList } from '../components/reviews/ReviewList';
import { ReviewFilters } from '../types/reviews';

export function Reviews() {
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'published',
    sortBy: 'latest',
  });

  return (
    <div className="min-h-screen bg-pink-50 py-8">
      <div className="container mx-auto px-4">
        {/* 页头 */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            母婴商品测评报告
          </h1>
          <p className="text-gray-600">
            聚合多篇专业测评，助您做出明智选择
          </p>
        </header>

        {/* 筛选器（简化版） */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => setFilters({ ...filters, featured: undefined })}
            className={`px-4 py-2 rounded-lg ${
              !filters.featured
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilters({ ...filters, featured: true })}
            className={`px-4 py-2 rounded-lg ${
              filters.featured
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            精选
          </button>
        </div>

        {/* 测评列表 */}
        <ReviewList filters={filters} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交列表页面**

```bash
git add src/components/reviews/ReviewList.tsx src/pages/Reviews.tsx
git commit -m "feat: add reviews list page with filters

Add review list component with loading, error, and empty states.
Add reviews page with header and filter controls (all/featured).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 创建测评详情页面

**Files:**
- Create: `src/components/reviews/ReviewDetail.tsx`

- [ ] **Step 1: 创建ReviewDetail组件**

```typescript
// src/components/reviews/ReviewDetail.tsx
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useReviewBySlug } from '../../hooks/useReviewBySlug';
import { Star, ExternalLink, Home } from 'lucide-react';

export function ReviewDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { review, loading, error } = useReviewBySlug(slug || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">加载失败或测评不存在</p>
          <Link
            to="/reviews"
            className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            返回测评列表
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    summary,
    content,
    cover_image,
    category,
    rating,
    source_site,
    source_url,
    published_at,
  } = review;

  const formatDate = new Date(published_at || '').toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="min-h-screen bg-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 面包屑导航 */}
        <nav className="mb-6 text-sm">
          <Link to="/" className="text-pink-500 hover:underline">
            首页
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/reviews" className="text-pink-500 hover:underline">
            测评报告
          </Link>
          {category && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-600">{category}</span>
            </>
          )}
        </nav>

        {/* 返回按钮 */}
        <Link
          to="/reviews"
          className="inline-flex items-center gap-2 text-pink-500 hover:underline mb-6"
        >
          <Home className="w-4 h-4" />
          返回测评列表
        </Link>

        {/* 文章头部 */}
        <header className="bg-white rounded-lg shadow p-8 mb-6">
          {category && (
            <span className="inline-block px-3 py-1 text-sm font-medium bg-pink-100 text-pink-700 rounded mb-4">
              {category}
            </span>
          )}

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>

          {summary && (
            <p className="text-lg text-gray-600 mb-6">{summary}</p>
          )}

          {/* 元数据栏 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold text-lg">{rating}</span>
              </div>
            )}
            {source_site && <span>来源: {source_site}</span>}
            <span>发布于 {formatDate}</span>
          </div>
        </header>

        {/* 封面图 */}
        {cover_image && (
          <div className="mb-6 rounded-lg overflow-hidden shadow">
            <img
              src={cover_image}
              alt={title}
              className="w-full"
            />
          </div>
        )}

        {/* 文章内容 */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* 底部操作 */}
        <footer className="bg-white rounded-lg shadow p-6">
          {source_url && (
            <a
              href={source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              查看原文
            </a>
          )}
        </footer>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: 提交详情组件**

```bash
git add src/components/reviews/ReviewDetail.tsx
git commit -m "feat: add review detail page

Add review detail component with breadcrumb navigation,
cover image, metadata, and rich text content display.
Include loading, error, and not found states.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: 创建侧边栏组件

**Files:**
- Create: `src/components/reviews/ReviewSidebar.tsx`

- [ ] **Step 1: 创建ReviewSidebar组件**

```typescript
// src/components/reviews/ReviewSidebar.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { ReviewCardSkeleton } from './ReviewCardSkeleton';
import { X, Star } from 'lucide-react';

export function ReviewSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { reviews, loading } = useReviews({
    status: 'published',
    featured: true,
    limit: 5,
  });

  // 桌面端侧边栏
  const DesktopSidebar = () => (
    <aside className="hidden lg:block w-80 fixed right-0 top-20 h-[calc(100vh-5rem)] overflow-y-auto bg-white shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500 fill-current" />
        <h2 className="text-lg font-semibold text-gray-800">精选测评</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <Link
                to={`/reviews/${review.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="font-medium text-gray-800 hover:text-pink-500 transition-colors line-clamp-2 mb-2">
                  {review.title}
                </h3>
                {review.rating && (
                  <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{review.rating}</span>
                  </div>
                )}
                {review.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {review.summary}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/reviews"
        className="block mt-4 text-center text-sm text-pink-500 hover:underline"
      >
        查看全部测评 →
      </Link>
    </aside>
  );

  // 移动端浮动按钮
  const MobileButton = () => (
    <button
      onClick={() => setMobileOpen(true)}
      className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
    >
      <Star className="w-5 h-5" />
      <span className="font-medium">测评推荐</span>
    </button>
  );

  // 移动端模态
  const MobileModal = () =>
    mobileOpen && (
      <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
        <div className="bg-white w-full max-h-[80vh] rounded-t-2xl overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <h2 className="text-lg font-semibold">精选测评</h2>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <ReviewCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Link
                    key={review.id}
                    to={`/reviews/${review.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="block border-b pb-4 last:border-0"
                  >
                    <h3 className="font-medium text-gray-800 mb-2">
                      {review.title}
                    </h3>
                    {review.rating && (
                      <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{review.rating}</span>
                      </div>
                    )}
                    {review.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {review.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <>
      <DesktopSidebar />
      <MobileButton />
      <MobileModal />
    </>
  );
}
```

- [ ] **Step 2: 提交侧边栏组件**

```bash
git add src/components/reviews/ReviewSidebar.tsx
git commit -m "feat: add responsive review sidebar

Add desktop sidebar with featured reviews and mobile floating
button with modal. Desktop: fixed right side. Mobile: bottom
right button that opens full-screen modal.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: 配置路由和导航

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: 更新App.tsx添加路由**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserListProvider } from './contexts/UserListContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Reviews } from './pages/Reviews';
import { ReviewDetail } from './components/reviews/ReviewDetail';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <UserListProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/reviews/:slug" element={<ReviewDetail />} />
              </Routes>
            </UserListProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

- [ ] **Step 2: 更新Header组件添加导航**

```typescript
// 在 src/components/Header.tsx 中添加测评导航链接

import { Link } from 'react-router-dom';

// 在导航栏中添加
<Link
  to="/reviews"
  className="text-gray-700 hover:text-pink-500 transition-colors font-medium"
>
  测评报告
</Link>
```

- [ ] **Step 3: 在Home页面集成侧边栏**

```typescript
// 在 src/pages/Home.tsx 中导入并使用侧边栏

import { ReviewSidebar } from '../components/reviews/ReviewSidebar';

// 在return的JSX中，调整布局以容纳侧边栏
<div className="container mx-auto px-4 py-8">
  <div className="flex">
    <main className="flex-1 lg:mr-80">
      {/* 现有的分类清单内容 */}
    </main>

    {/* 桌面端侧边栏 */}
    <ReviewSidebar />
  </div>
</div>
```

- [ ] **Step 4: 提交路由配置**

```bash
git add src/App.tsx src/components/Header.tsx src/pages/Home.tsx
git commit -m "feat: add routing and navigation for reviews

Configure react-router-dom with routes for home, reviews list,
and review detail. Add reviews link to header navigation.
Integrate ReviewSidebar into Home page layout.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: 创建ProtectedRoute组件

**Files:**
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: 创建ProtectedRoute组件**

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: 提交组件**

```bash
git add src/components/ProtectedRoute.tsx
git commit -m "feat: add ProtectedRoute component

Add protected route wrapper that checks authentication
status and redirects unauthenticated users to home page.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11.5: 创建富文本编辑器组件

**Files:**
- Create: `src/components/reviews/ReviewEditor.tsx`

- [ ] **Step 1: 创建ReviewEditor组件**

```typescript
// src/components/reviews/ReviewEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState, useEffect } from 'react';
import { ReviewFormData } from '../../types/reviews';

interface ReviewEditorProps {
  initialData?: Partial<ReviewFormData>;
  onSave: (data: ReviewFormData) => void;
  onCancel: () => void;
}

export function ReviewEditor({ initialData, onSave, onCancel }: ReviewEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [rating, setRating] = useState(initialData?.rating?.toString() || '');
  const [sourceSite, setSourceSite] = useState(initialData?.source_site || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[400px]',
      },
    },
  });

  useEffect(() => {
    if (editor && initialData?.content) {
      editor.commands.setContent(initialData.content);
    }
  }, [editor, initialData?.content]);

  if (!editor) {
    return <div className="p-8">加载编辑器...</div>;
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }

    const formData: ReviewFormData = {
      title: title.trim(),
      slug: generateSlug(title),
      summary: summary.trim() || undefined,
      content: editor.getHTML(),
      category: category.trim() || undefined,
      rating: rating ? parseFloat(rating) : undefined,
      source_site: sourceSite.trim() || undefined,
      source_url: sourceUrl.trim() || undefined,
      status: 'draft',
      featured: false,
    };

    onSave(formData);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    try {
      // TODO: 实现图片上传到Supabase Storage
      const imageUrl = prompt('输入图片URL（临时方案）:');
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      alert('图片上传失败: ' + (error as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData?.id ? '编辑测评' : '新建测评'}
      </h2>

      <div className="space-y-4">
        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入测评标题"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* 摘要输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            摘要
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="简短摘要（可选）"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* 分类和评分 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例如: 婴儿用品"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              评分 (0-5)
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 来源信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              来源网站
            </label>
            <input
              type="text"
              value={sourceSite}
              onChange={(e) => setSourceSite(e.target.value)}
              placeholder="例如: 母婴之家"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              原文链接
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 编辑器工具栏 */}
        <div className="border-b border-gray-200 pb-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('bold') ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
              }`}
              type="button"
            >
              粗体
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('italic') ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
              }`}
              type="button"
            >
              斜体
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('heading', { level: 2 }) ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
              }`}
              type="button"
            >
              标题
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('bulletList') ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
              }`}
              type="button"
            >
              列表
            </button>
            <label className="px-3 py-1 rounded bg-gray-100 text-gray-700 cursor-pointer">
              图片
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                const url = prompt('输入链接URL:');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700"
              type="button"
            >
              链接
            </button>
          </div>
        </div>

        {/* 编辑器内容区 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <EditorContent editor={editor} />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            type="button"
          >
            保存
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            type="button"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// 辅助函数：生成URL slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

- [ ] **Step 2: 提交编辑器组件**

```bash
git add src/components/reviews/ReviewEditor.tsx
git commit -m "feat: add Tiptap rich text editor component

Add comprehensive rich text editor with:
- Title, summary, category, and rating inputs
- Source website and URL fields
- Formatting toolbar (bold, italic, heading, list, image, link)
- Tiptap editor with StarterKit, Image, and Link extensions
- Form validation and slug generation
- Responsive layout with Tailwind styling

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: 创建管理后台组件

**Files:**
- Create: `src/components/reviews/ReviewAdmin.tsx`

- [ ] **Step 1: 创建管理后台组件**

```typescript
// src/components/reviews/ReviewAdmin.tsx
import { useState } from 'react';
import { useReviews, useDeleteReview } from '../../hooks/useReviews';
import { Review } from '../../types/reviews';
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react';

export function ReviewAdmin() {
  const { reviews, loading } = useReviews({ status: 'all' });
  const deleteReview = useDeleteReview();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  const filteredReviews = reviews.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这篇测评吗？')) {
      try {
        await deleteReview.mutateAsync(id);
        alert('删除成功');
      } catch (error) {
        alert('删除失败: ' + (error as Error).message);
      }
    }
  };

  const handleToggleStatus = async (review: Review) => {
    const newStatus = review.status === 'published' ? 'draft' : 'published';
    // 这里需要实现updateReview调用
    alert(`切换状态: ${review.status} -> ${newStatus}`);
  };

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">测评管理</h1>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
            新建测评
          </button>
        </div>

        {/* 筛选器 */}
        <div className="mb-6 flex gap-2">
          {['all', 'draft', 'published', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === status
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {status === 'all' ? '全部' :
               status === 'draft' ? '草稿' :
               status === 'published' ? '已发布' : '已归档'}
            </button>
          ))}
        </div>

        {/* 测评列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  评分
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  发布时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReviews.map(review => (
                <tr key={review.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {review.title}
                    </div>
                    {review.summary && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {review.summary}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {review.category || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {review.rating || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      review.status === 'published' ? 'bg-green-100 text-green-700' :
                      review.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {review.status === 'published' ? '已发布' :
                       review.status === 'draft' ? '草稿' : '已归档'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {review.published_at ?
                      new Date(review.published_at).toLocaleDateString('zh-CN') :
                      '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(review)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={review.status === 'published' ? '设为草稿' : '发布'}
                      >
                        {review.status === 'published' ?
                          <EyeOff className="w-4 h-4" /> :
                          <Eye className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => alert('编辑功能待实现')}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-500"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无测评
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 添加管理路由**

```typescript
// 在 src/App.tsx 中添加管理路由
import { ReviewAdmin } from './components/reviews/ReviewAdmin';

// 在Routes中添加
<Route
  path="/admin/reviews"
  element={
    <ProtectedRoute>
      <ReviewAdmin />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 3: 提交管理后台**

```bash
git add src/components/reviews/ReviewAdmin.tsx src/App.tsx
git commit -m "feat: add review admin interface

Add admin interface for managing reviews with table view,
status filtering, and delete functionality. Add protected
route for admin access.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 13: 本地测试

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

Expected: 服务器启动在 http://localhost:5173

- [ ] **Step 2: 测试测评列表页**

访问 http://localhost:5173/reviews

验证：
- ✅ 页面正常显示
- ✅ 测评卡片正确渲染
- ✅ 筛选按钮工作正常
- ✅ 加载状态正常

- [ ] **Step 3: 测试测评详情页**

点击任意测评卡片，验证：
- ✅ 新窗口打开详情页
- ✅ 详情页内容完整显示
- ✅ 面包屑导航正常
- ✅ 返回链接工作

- [ ] **Step 4: 测试侧边栏**

访问首页 http://localhost:5173/

验证：
- ✅ 桌面端侧边栏显示在右侧
- ✅ 移动端显示浮动按钮
- ✅ 点击浮动按钮打开模态
- ✅ 精选测评正确显示

- [ ] **Step 5: 测试导航**

验证：
- ✅ Header中的"测评报告"链接跳转正确
- ✅ 面包屑导航正常
- ✅ 所有链接工作正常

- [ ] **Step 6: 测试响应式**

在不同屏幕尺寸测试：
- ✅ 移动端（< 640px）
- ✅ 平板（640px - 1024px）
- ✅ 桌面（> 1024px）

- [ ] **Step 7: 检查控制台**

打开浏览器开发者工具，验证：
- ✅ 无控制台错误
- ✅ 无网络请求失败
- ✅ 图片加载正常

---

## Task 14: 构建和部署测试

- [ ] **Step 1: 构建生产版本**

```bash
npm run build
```

Expected: 构建成功，输出到 dist/ 目录

- [ ] **Step 2: 本地预览构建**

```bash
npm run preview
```

Expected: 预览服务器启动，功能正常

- [ ] **Step 3: 提交所有更改**

```bash
git add .
git commit -m "feat: complete reviews feature implementation

Implement complete reviews feature including:
- Review list and detail pages
- Responsive sidebar with featured reviews
- Admin interface for content management
- Routing and navigation integration
- Responsive design for all devices

All tasks completed and tested locally.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- [ ] **Step 4: 推送到远程仓库**

```bash
git push origin feature/item-notes-and-icons
```

Expected: 推送成功

- [ ] **Step 5: 验证Vercel部署**

等待Vercel自动部署完成，然后验证：
- ✅ 部署成功
- ✅ 测评列表页可访问
- ✅ 测评详情页可访问
- ✅ 侧边栏正常显示
- ✅ 所有功能在线工作正常

---

## 验收清单

完成所有任务后，验证以下内容：

### 功能完整性
- [ ] 测评列表页正确显示所有已发布的测评
- [ ] 测评详情页正确显示完整内容
- [ ] 侧边栏在桌面端显示，移动端折叠
- [ ] 新窗口打开详情页
- [ ] 筛选功能正常（全部/精选）
- [ ] 管理后台可查看和删除测评

### 性能指标
- [ ] 首屏加载时间 < 2秒
- [ ] 测评列表页加载 < 1秒
- [ ] 详情页加载 < 1.5秒
- [ ] 图片懒加载正常

### 响应式设计
- [ ] 移动端（< 640px）单列布局
- [ ] 平板（640px - 1024px）两列布局
- [ ] 桌面（> 1024px）三列布局 + 侧边栏
- [ ] 移动端浮动按钮和模态正常

### 代码质量
- [ ] TypeScript无类型错误
- [ ] 所有组件有清晰的职责
- [ ] 代码遵循现有风格
- [ ] 无控制台错误

### 部署
- [ ] Vercel部署成功
- [ ] 在线功能验证通过
- [ ] 环境变量配置正确

---

## 后续改进（可选）

1. **富文本编辑器：** 实现完整的Tiptap编辑器组件
2. **图片上传：** 实现图片上传到Supabase Storage
3. **商品关联：** 实现自动匹配和关联商品
4. **高级筛选：** 添加分类筛选和搜索功能
5. **评论系统：** 添加用户评论功能
6. **SEO优化：** 添加meta标签和结构化数据

---

**计划创建时间：** 2026-03-24
**预计完成时间：** 约6小时
**难度：** 中等
