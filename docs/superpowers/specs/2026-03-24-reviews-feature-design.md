# 母婴商品测评报告功能 - 设计文档

**项目名称：** akachanlist - 测评报告功能
**日期：** 2026-03-24
**设计者：** Claude
**状态：** 设计阶段

---

## 1. 项目概述

### 1.1 目标
在现有的分娩准备清单应用中添加母婴商品测评报告功能，聚合外部测评内容来辅助用户的购买决策。

### 1.2 需求总结
- **内容来源：** 从外部网站聚合测评内容
- **内容规模：** 中等规模（30-100篇）
- **更新频率：** 定期更新（每周/每月）
- **展示方式：** 详细文章式测评
- **数据存储：** 使用现有Supabase数据库
- **展示位置：** 混合方式（主导航 + 首页侧边栏）

### 1.3 核心功能
1. 测评列表页 - 展示所有已发布的测评报告
2. 测评详情页 - 显示完整的测评内容（新窗口打开）
3. 首页侧边栏 - 桌面端显示精选测评，移动端折叠
4. 管理后台 - 创建、编辑、管理测评内容
5. 商品关联 - 测评与物品清单中的商品关联

---

## 2. 技术架构

### 2.1 技术栈
- **前端框架：** React 18（现有）
- **路由：** react-router-dom（新增）
- **富文本编辑器：** Tiptap（新增）
- **数据库：** Supabase PostgreSQL（扩展现有）
- **部署：** Vercel（现有）
- **状态管理：** React Query/SWR（新增）

### 2.2 项目结构扩展
```
src/
├── components/
│   ├── reviews/
│   │   ├── ReviewSidebar.tsx      # 侧边栏精选测评
│   │   ├── ReviewCard.tsx          # 测评卡片
│   │   ├── ReviewList.tsx          # 测评列表页
│   │   ├── ReviewDetail.tsx        # 测评详情页
│   │   ├── ReviewAdmin.tsx         # 测评管理后台
│   │   ├── ReviewEditor.tsx        # 富文本编辑器
│   │   └── ReviewCardSkeleton.tsx  # 加载骨架屏
│   └── ...
├── pages/
│   ├── Home.tsx                    # 添加测评侧边栏
│   └── Reviews.tsx                 # 测评列表页面
├── hooks/
│   └── useReviews.ts               # 测评数据hooks
├── lib/
│   └── supabase.ts                 # 添加测评相关查询
├── types/
│   └── reviews.ts                  # 测评类型定义
└── utils/
    └── editor.ts                   # 编辑器工具函数
```

### 2.3 路由设计
```
/                    # 首页（物品清单 + 侧边栏测评）
/reviews             # 测评列表页
/reviews/:slug       # 测评详情页（新窗口打开）
/admin/reviews       # 测评管理（需登录）
```

---

## 3. 数据库设计

### 3.1 表结构

**reviews 表（测评主表）：**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,                    -- 简短摘要
  content TEXT NOT NULL,           -- 富文本HTML内容
  cover_image TEXT,                -- 封面图URL

  -- 商品关联
  item_name TEXT,                  -- 商品名称（用于匹配）
  item_id UUID,                    -- 关联items.json中的商品（可选）
  category TEXT,                   -- 商品分类

  -- 元数据
  rating DECIMAL(2,1),             -- 综合评分 (0-5.0)
  source_url TEXT,                 -- 原始文章链接
  source_site TEXT,                -- 来源网站

  -- 状态管理
  status TEXT DEFAULT 'draft',     -- draft/published/archived
  featured BOOLEAN DEFAULT false,  -- 是否精选

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_featured ON reviews(featured) WHERE featured = true;
CREATE INDEX idx_reviews_category ON reviews(category);
CREATE INDEX idx_reviews_slug ON reviews(slug);

-- RLS策略
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布的测评
CREATE POLICY "Public read published reviews"
ON reviews FOR SELECT
USING (status = 'published');

-- 认证用户可管理测评
CREATE POLICY "Authenticated users can manage reviews"
ON reviews FOR ALL
USING (auth.uid() IS NOT NULL);
```

**review_tags 表（标签表，可选）：**
```sql
CREATE TABLE review_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(review_id, tag)
);

CREATE INDEX idx_review_tags_review ON review_tags(review_id);
CREATE INDEX idx_review_tags_tag ON review_tags(tag);
```

### 3.2 TypeScript类型定义

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
}
```

---

## 4. UI组件设计

### 4.1 首页侧边栏

**ReviewSidebar.tsx - 响应式侧边栏：**

桌面端：
- 固定在右侧（width: 320px）
- 显示3-5篇精选测评
- 独立滚动区域

移动端：
- 折叠到页面右下角
- 浮动按钮触发
- 底部弹出或全屏模态

### 4.2 测评卡片

**ReviewCard.tsx 设计要素：**

布局：
- 封面图（可选）
- 商品标签 + 关联标签
- 标题 + 评分
- 来源网站 + 发布日期
- 摘要（2-3行截断）
- "阅读全文"按钮

样式：
- 圆角卡片
- hover阴影加深
- 响应式宽度

### 4.3 测评列表页

**Reviews.tsx 结构：**

```
Header（标题 + 描述）
    ↓
FilterBar（分类筛选 + 排序）
    ↓
ReviewGrid（1-3列响应式网格）
    ↓
Pagination（分页控件）
```

### 4.4 测评详情页

**ReviewDetail.tsx 结构：**

```
Breadcrumb（面包屑导航）
    ↓
Header（标题 + 元数据栏）
    ↓
CoverImage（封面图）
    ↓
RelatedItemCard（关联商品卡片，可选）
    ↓
Content（富文本内容）
    ↓
Footer（原文链接 + 操作按钮）
```

### 4.5 管理后台

**ReviewAdmin.tsx 功能：**

列表视图：
- 表格展示所有测评
- 状态标签（草稿/已发布/已归档）
- 批量操作
- 快速编辑

编辑器：
- 富文本编辑器（Tiptap）
- 实时预览
- 自动保存草稿
- 图片上传

---

## 5. 数据流和状态管理

### 5.1 自定义Hooks

**useReviews - 测评数据管理：**
```typescript
interface UseReviewsOptions {
  status?: 'published' | 'draft' | 'all';
  featured?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}

function useReviews(options: UseReviewsOptions) {
  // 返回 { reviews, loading, error, count, refetch }
}
```

**useReviewBySlug - 单个测评查询：**
```typescript
function useReviewBySlug(slug: string) {
  // 返回 { review, loading, error }
}
```

**useRelatedReviews - 关联测评查询：**
```typescript
function useRelatedReviews(itemId: string) {
  // 返回该商品相关的所有测评
}
```

### 5.2 数据流

```
用户操作
    ↓
组件调用 useReviews() hook
    ↓
hook 查询 Supabase
    ↓
Supabase 返回数据
    ↓
组件重新渲染显示数据
    ↓
用户点击"阅读全文"
    ↓
window.open() 打开新窗口
    ↓
新窗口加载 /reviews/:slug
    ↓
ReviewDetail 组件通过 useReviewBySlug() 获取详情
```

### 5.3 缓存策略

使用React Query实现：
- 5分钟内数据视为新鲜
- 10分钟缓存时间
- 离线时显示缓存内容
- 自动重新验证

---

## 6. 富文本编辑器

### 6.1 技术选择

**Tiptap** - 基于ProseMirror的现代化编辑器

优势：
- TypeScript原生支持
- 模块化扩展
- 优秀的移动端支持
- 活跃的社区

### 6.2 编辑器功能

**基础功能：**
- 标题（H1-H6）
- 段落格式
- 文本样式（粗体、斜体、下划线）
- 列表（有序/无序）
- 链接插入和编辑
- 图片上传和调整

**高级功能（可选）：**
- 代码块
- 表格
- 视频嵌入
- 撤销/重做历史
- 键盘快捷键

### 6.3 图片上传

流程：
1. 用户选择图片
2. 上传到Supabase Storage（review-images bucket）
3. 获取公开URL
4. 插入到编辑器中

自动优化：
- 限制图片大小（最大2MB）
- 自动压缩
- 生成缩略图
- WebP格式转换

### 6.4 自动保存

- 编辑时每2秒自动保存草稿
- 离开页面时提示未保存的更改
- 显示"已保存"状态提示

---

## 7. 商品关联逻辑

### 7.1 关联方式

**强关联：**
- 测评有明确的 item_id
- 在物品卡片上显示测评数量和链接
- 在测评详情页显示关联商品卡片

**弱关联：**
- 测评只有 item_name
- 通过搜索匹配找到相关商品
- 不在物品卡片上显示

### 7.2 匹配逻辑

```typescript
// 模糊匹配商品名称
function findRelatedItems(review: Review): Item[] {
  const allItems = getAllItems(); // 从items.json

  return allItems.filter(item =>
    item.name.includes(review.item_name) ||
    review.item_name?.includes(item.name) ||
    review.title.includes(item.name)
  );
}
```

### 7.3 UI展示

**在ItemCard中显示：**
```tsx
{reviewCount > 0 && (
  <Link href={`/reviews?search=${itemName}`} className="text-sm">
    {reviewCount} 篇测评 →
  </Link>
)}
```

**在ReviewDetail中显示：**
```tsx
{relatedItem && (
  <RelatedItemCard item={relatedItem}>
    <Link to={`/items#item-${relatedItem.id}`}>
      查看商品详情 →
    </Link>
  </RelatedItemCard>
)}
```

---

## 8. 错误处理和加载状态

### 8.1 加载状态

- 骨架屏代替传统loading spinner
- 保持布局稳定性
- 渐进式加载内容

### 8.2 错误处理

- 网络错误：显示友好提示 + 重试按钮
- 404错误：引导用户返回列表页
- 权限错误：提示登录或联系管理员
- 离线状态：显示缓存内容并标记

### 8.3 空状态

- 无测评时显示友好的空状态插图
- 引导用户浏览其他分类
- 管理员可快速创建新测评

---

## 9. 性能优化

### 9.1 代码分割

- 懒加载测评相关组件
- 按路由分割代码
- 预加载关键资源

### 9.2 图片优化

- 使用Supabase图片转换API
- 响应式图片（srcset）
- 懒加载图片
- WebP格式优先

### 9.3 数据库优化

- 复合索引优化查询
- 只查询需要的字段
- 分页减少数据量
- 缓存热门查询

### 9.4 缓存策略

- React Query缓存数据
- Service Worker离线缓存
- CDN缓存静态资源

---

## 10. 响应式设计

### 10.1 断点系统

```
移动端（默认）:  < 640px   单列布局
平板（sm:）:     ≥ 640px   两列布局
桌面（lg:）:     ≥ 1024px  三列布局 + 侧边栏
大屏（xl:）:     ≥ 1280px  四列布局
```

### 10.2 侧边栏响应式

**桌面端（≥1024px）：**
- 固定在右侧
- 独立滚动
- 始终可见

**移动端（<1024px）：**
- 折叠到浮动按钮
- 底部弹出模态
- 全屏查看

---

## 11. 部署和配置

### 11.1 环境变量

```bash
# 现有变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# 无需新增变量
```

### 11.2 Supabase配置

1. 创建reviews表
2. 配置RLS策略
3. 创建review-images存储桶
4. 设置存储权限

### 11.3 Vercel部署

- 无需额外配置
- 自动构建和部署
- 使用现有CI/CD流程

---

## 12. 实施计划

### 12.1 开发阶段

**阶段1：数据库和基础设施（30分钟）**
- 创建Supabase表结构
- 配置RLS策略
- 设置存储桶

**阶段2：核心组件开发（2小时）**
- 实现ReviewCard组件
- 实现ReviewList组件
- 实现ReviewDetail组件
- 实现ReviewSidebar组件

**阶段3：路由和导航（30分钟）**
- 添加react-router-dom
- 配置路由
- 更新导航栏

**阶段4：管理后台（1.5小时）**
- 实现ReviewAdmin组件
- 集成Tiptap编辑器
- 实现CRUD操作
- 图片上传功能

**阶段5：集成和优化（1小时）**
- 与现有物品清单集成
- 商品关联逻辑
- 性能优化
- 响应式适配

**阶段6：测试和部署（30分钟）**
- 功能测试
- 性能测试
- 部署到Vercel
- 在线验证

**总计：约6小时**

### 12.2 优先级

**MVP（最小可行产品）：**
1. 数据库表结构
2. 测评列表页
3. 测评详情页
4. 基础管理功能

**第二阶段：**
1. 侧边栏集成
2. 商品关联
3. 富文本编辑器优化

**第三阶段：**
1. 高级筛选
2. 搜索功能
3. 评论系统（可选）

---

## 13. 验收标准

### 13.1 功能完整性

- ✅ 测评列表页正确显示所有已发布的测评
- ✅ 测评详情页正确显示完整内容
- ✅ 侧边栏在桌面端显示，移动端折叠
- ✅ 新窗口打开详情页
- ✅ 商品关联正确显示
- ✅ 筛选和排序功能正常
- ✅ 管理后台可创建、编辑、删除测评

### 13.2 性能指标

- 首屏加载时间 < 2秒
- 测评列表页加载 < 1秒
- 详情页加载 < 1.5秒
- Lighthouse性能分数 > 90

### 13.3 兼容性

- 支持所有现代浏览器
- 响应式设计适配所有设备
- 无控制台错误

### 13.4 代码质量

- TypeScript类型完整
- 组件职责清晰
- 代码可维护性高
- 遵循现有代码风格

---

## 14. 风险和限制

### 14.1 风险

1. **内容版权：** 聚合外部测评需注意版权问题，建议使用摘要 + 链接原文
2. **数据质量：** 需要人工审核和维护内容质量
3. **性能问题：** 富文本内容可能影响加载速度
4. **维护成本：** 需要定期更新和维护内容

### 14.2 限制

1. **功能范围：** 初期不支持用户评论和互动
2. **内容规模：** 适合中小规模内容（<500篇）
3. **编辑器功能：** 基础富文本功能，高级功能需后期扩展
4. **搜索功能：** 初期只支持基础搜索，全文搜索需额外配置

### 14.3 缓解措施

1. **版权：** 使用摘要 + 原文链接，标注来源
2. **质量：** 建立内容审核流程
3. **性能：** 图片优化、代码分割、缓存策略
4. **维护：** 建立内容更新计划，使用自动化工具

---

## 15. 未来改进（可选）

### 15.1 功能扩展

- 用户评论和评分
- 用户投稿测评
- 测评分享功能
- 个性化推荐
- 测评对比功能

### 15.2 技术优化

- 全文搜索（Elasticsearch/PGVector）
- 图片CDN优化
- PWA支持（离线访问）
- 服务端渲染（Next.js SSR）

### 15.3 内容增强

- 视频测评支持
- 多语言测评
- AI辅助内容生成
- 自动内容聚合

---

**文档版本：** 1.0
**最后更新：** 2026-03-24
