# 多语言功能设计文档

**项目**: 分娩准备清单 (akachanlist)
**日期**: 2026-03-23
**作者**: Claude Sonnet 4.6
**状态**: 设计阶段

## 概述

为分娩准备清单网站添加日语版本，支持用户在中文和日语之间切换。使用 Supabase 作为数据库，便于未来扩展更多项目和语言。

## 目标

1. 支持中文和日语两种语言
2. 用户可以在右上角切换语言
3. 语言偏好保存在 localStorage 并同步到 URL 参数
4. 使用 Supabase 存储数据，便于管理和扩展
5. 实现 Supabase 失败时的降级策略

## 技术方案

### 整体架构

采用**独立数据文件 + React Context + Supabase**方案：

- 使用 Supabase 存储多语言数据（多项目表结构）
- React Context 管理全局语言状态
- React Query 管理数据获取和缓存
- **不使用 React Router**：使用浏览器原生 URLSearchParams API 和 History API
- localStorage + URL 参数同步语言偏好
- 降级策略：Supabase 失败时使用本地 JSON 文件

### 路由策略

**决定**：不使用 React Router，使用浏览器原生 API。

**理由**：
- 项目是单页应用，不需要复杂的路由
- URL 参数仅用于语言状态，不需要路由功能
- 减少依赖，简化项目结构
- 使用 `URLSearchParams` 和 `window.history.pushState()` 实现参数同步

## 数据库设计

### 表结构

#### 1. projects 表
存储项目基本信息。

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_zh TEXT,
  description_ja TEXT,
  default_language TEXT DEFAULT 'zh',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
```

#### 2. categories 表
存储项目分类。

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_project ON categories(project_id, sort_order);
```

#### 3. subcategories 表
存储子分类。

```sql
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_zh TEXT,
  description_ja TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_subcategories_category ON subcategories(category_id, sort_order);
```

#### 4. items 表
存储物品信息。

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_zh TEXT,
  description_ja TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('required', 'recommended')),
  quantity_zh TEXT,
  quantity_ja TEXT,
  notes_zh TEXT,
  notes_ja TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_items_subcategory ON items(subcategory_id, sort_order);
```

### RLS 策略

允许公开读取数据：

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON items FOR SELECT USING (true);
```

## TypeScript 类型定义

### 核心类型

```typescript
// types/index.ts
export type Language = 'zh' | 'ja';
export type Priority = 'required' | 'recommended';

// 基础物品接口
export interface Item {
  name: string;
  priority: Priority;
  description?: string;
  quantity?: string;
  notes?: string;
}

// 子分类接口
export interface Subcategory {
  id: string;
  title: string;
  description?: string;
  items: Item[];
}

// 分类接口
export interface Category {
  id: string;
  title: string;
  icon: string;
  subcategories: Subcategory[];
}

// 数据结构接口
export interface ItemsData {
  meta: {
    title: string;
    subtitle: string;
    lastUpdated: string;
  };
  categories: Category[];
}

// Supabase 原始响应类型
interface SupabaseProject {
  id: string;
  slug: string;
  [key: `name_${Language}`]: string;
  [key: `description_${Language}`]: string;
}

interface SupabaseItem {
  id: string;
  [key: `name_${Language}`]: string;
  [key: `description_${Language}`]: string;
  priority: Priority;
  [key: `quantity_${Language}`]: string;
  [key: `notes_${Language}`]: string;
}

interface SupabaseSubcategory {
  id: string;
  slug: string;
  [key: `name_${Language}`]: string;
  [key: `description_${Language}`]: string;
  sort_order: number;
  items: SupabaseItem[];
}

interface SupabaseCategory {
  id: string;
  slug: string;
  [key: `name_${Language}`]: string;
  icon: string;
  sort_order: number;
  subcategories: SupabaseSubcategory[];
}

interface SupabaseProjectResponse {
  id: string;
  slug: string;
  [key: `name_${Language}`]: string;
  [key: `description_${Language}`]: string;
  categories: SupabaseCategory[];
}
```

### Context 类型

```typescript
// contexts/LanguageContext.tsx
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageReady: boolean;
}
```

## 前端实现

### 1. 语言状态管理

#### LanguageContext

管理全局语言状态，协调 localStorage、URL 参数和内部状态。

```typescript
// contexts/LanguageContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, LanguageContextType } from '../types';

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化：从 URL → localStorage → 默认值
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang') as Language | null;
    const storedLang = localStorage.getItem('preferred-lang') as Language | null;

    const initialLang = urlLang || storedLang || 'zh';
    setLanguageState(initialLang);
    setIsReady(true);
  }, []); // 仅在组件挂载时执行一次

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-lang', lang);

    // 更新 URL 参数而不刷新页面
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url.toString());
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageReady: isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定义 hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

### 2. 数据获取

#### Supabase 查询函数

使用嵌套查询一次获取所有数据：

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

#### 数据转换函数

将 Supabase 响应转换为应用的数据结构：

```typescript
// utils/data.ts
import { ItemsData, Category, Subcategory, Item, Language } from '../types';
import { SupabaseProjectResponse } from '../types';

function transformItem(
  rawItem: any,
  lang: Language
): Item {
  return {
    name: rawItem[`name_${lang}`] || rawItem.name_zh,
    priority: rawItem.priority,
    description: rawItem[`description_${lang}`] || rawItem.description_zh,
    quantity: rawItem[`quantity_${lang}`] || rawItem.quantity_zh,
    notes: rawItem[`notes_${lang}`] || rawItem.notes_zh,
  };
}

function transformSubcategory(
  rawSub: any,
  lang: Language
): Subcategory {
  return {
    id: rawSub.slug,
    title: rawSub[`name_${lang}`] || rawSub.name_zh,
    description: rawSub[`description_${lang}`] || rawSub.description_zh,
    items: rawSub.items.map((item: any) => transformItem(item, lang)),
  };
}

function transformCategory(
  rawCat: any,
  lang: Language
): Category {
  return {
    id: rawCat.slug,
    title: rawCat[`name_${lang}`] || rawCat.name_zh,
    icon: rawCat.icon,
    subcategories: rawCat.subcategories.map((sub: any) =>
      transformSubcategory(sub, lang)
    ),
  };
}

export function transformData(
  rawData: SupabaseProjectResponse,
  lang: Language
): ItemsData {
  return {
    meta: {
      title: rawData[`name_${lang}`] || rawData.name_zh,
      subtitle: rawData[`description_${lang}`] || rawData.description_zh,
      lastUpdated: new Date().toISOString().split('T')[0],
    },
    categories: rawData.categories.map((cat) => transformCategory(cat, lang)),
  };
}

export async function fetchProjectData(
  projectSlug: string,
  lang: Language
): Promise<ItemsData> {
  const langField = lang === 'zh' ? 'name_zh' : 'name_ja';

  const { data, error } = await supabase

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      slug,
      name_zh,
      name_ja,
      description_zh,
      description_ja,
      categories (
        id,
        slug,
        name_zh,
        name_ja,
        icon,
        sort_order,
        subcategories (
          id,
          slug,
          name_zh,
          name_ja,
          description_zh,
          description_ja,
          sort_order,
          items (
            id,
            name_zh,
            name_ja,
            description_zh,
            description_ja,
            priority,
            quantity_zh,
            quantity_ja,
            notes_zh,
            notes_ja,
            sort_order
          )
        )
      )
    `)
    .eq('slug', projectSlug)
    .order('sort_order', { referencedTable: 'categories' })
    .order('sort_order', { referencedTable: 'subcategories' })
    .order('sort_order', { referencedTable: 'items' })
    .single();

  if (error) throw error;
  return transformData(data as SupabaseProjectResponse, lang);
}
```

#### React Query 集成

```typescript
// hooks/useProjectData.ts
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchProjectData, fetchLocalData } from '../utils/data';

export function useProjectData(projectSlug: string) {
  const { language, isLanguageReady } = useLanguage();

  return useQuery({
    queryKey: ['project', projectSlug, language],
    queryFn: async () => {
      try {
        return await fetchProjectData(projectSlug, language);
      } catch (error) {
        // 降级到本地 JSON
        console.warn('Supabase failed, falling back to local JSON');
        return await fetchLocalData(language);
      }
    },
    enabled: isLanguageReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Supabase')) return false;
      return failureCount < 2;
    },
  });
}
```

#### 应用入口配置

在 `main.tsx` 中配置 QueryClientProvider：

```typescript
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟内认为数据新鲜
      gcTime: 30 * 60 * 1000,   // 30分钟后清理缓存
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

在 `App.tsx` 中添加 LanguageProvider：

```typescript
// App.tsx
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { Home } from './pages/Home';
import './styles/index.css';

function App() {
  return (
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  );
}

export default App;
```

### 3. UI 组件

#### LanguageSwitcher 组件

语言切换按钮，位于 Header 右上角。

```typescript
// components/LanguageSwitcher.tsx
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'zh' ? 'ja' : 'zh')}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-pink-100
                 rounded-full shadow-sm transition-colors duration-200"
      aria-label="Switch language"
    >
      <Languages className="w-4 h-4 text-pink-500" />
      <span className="text-sm font-medium text-gray-700">
        {language === 'zh' ? '中文' : '日本語'}
      </span>
    </button>
  );
};
```

#### Header 更新

集成语言切换器：

```typescript
// components/Header.tsx
export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-50 bg-pink-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-pink-500" />
            <Baby className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {title}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p className="text-gray-600 text-sm md:text-base pl-11">
          {subtitle}
        </p>
      </div>
    </header>
  );
};
```

### 4. 错误处理

#### LoadingSpinner 组件

显示加载状态：

```typescript
// components/LoadingSpinner.tsx
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  );
};
```

#### ErrorMessage 组件

显示错误信息：

```typescript
// components/ErrorMessage.tsx
import React from 'react';

export const ErrorMessage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          加载数据时出错
        </h2>
        <p className="text-gray-600 mb-4">
          请检查您的网络连接或稍后重试
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          重新加载
        </button>
      </div>
    </div>
  );
};
```

#### ErrorBoundary

捕获运行时错误：

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              应用出错了
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || '未知错误'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 降级策略

Supabase 失败时使用本地 JSON：

```typescript
// utils/fallback.ts
import { ItemsData, Language } from '../types';

export async function fetchLocalData(lang: Language): Promise<ItemsData> {
  const response = await fetch(`/data/items-${lang}.json`);
  if (!response.ok) throw new Error('Failed to load local data');
  return response.json();
}
```

## 数据迁移

### 迁移脚本实现

创建 `scripts/migrate-to-supabase.ts` 脚本：

```typescript
// scripts/migrate-to-supabase.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface LocalData {
  meta: any;
  categories: any[];
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function migrate() {
  // 1. 读取本地数据
  const localData: LocalData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/data/items.json'), 'utf-8')
  );

  console.log('📦 读取本地数据成功');

  try {
    // 2. 创建项目
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug: 'akachanlist',
        name_zh: '分娩准备清单',
        name_ja: '出産準備リスト',
        description_zh: '基于日本赤ちゃん本舗的推荐清单',
        description_ja: '赤ちゃん本舗の推荐リスト',
        default_language: 'zh',
      })
      .select()
      .single();

    if (projectError) throw projectError;
    console.log('✅ 项目创建成功:', project.slug);

    // 3. 创建分类和子分类
    for (const cat of localData.categories) {
      const { data: category, error: catError } = await supabase
        .from('categories')
        .insert({
          project_id: project.id,
          slug: cat.id,
          name_zh: cat.title,
          name_ja: cat.title, // 需要翻译
          icon: cat.icon,
          sort_order: localData.categories.indexOf(cat),
        })
        .select()
        .single();

      if (catError) throw catError;
      console.log(`  ✅ 分类: ${category.name_zh}`);

      // 4. 创建子分类和物品
      for (const sub of cat.subcategories) {
        const { data: subcategory, error: subError } = await supabase
          .from('subcategories')
          .insert({
            category_id: category.id,
            slug: sub.id,
            name_zh: sub.title,
            name_ja: sub.title, // 需要翻译
            description_zh: sub.description,
            description_ja: sub.description, // 需要翻译
            sort_order: cat.subcategories.indexOf(sub),
          })
          .select()
          .single();

        if (subError) throw subError;
        console.log(`    ✅ 子分类: ${subcategory.name_zh}`);

        // 5. 创建物品
        for (const item of sub.items) {
          const { error: itemError } = await supabase
            .from('items')
            .insert({
              subcategory_id: subcategory.id,
              name_zh: item.name,
              name_ja: item.name, // 需要翻译
              description_zh: item.description,
              description_ja: item.description, // 需要翻译
              priority: item.priority,
              quantity_zh: item.quantity,
              quantity_ja: item.quantity, // 需要翻译
              notes_zh: item.notes,
              notes_ja: item.notes, // 需要翻译
              sort_order: sub.items.indexOf(item),
            });

          if (itemError) throw itemError;
        }
        console.log(`      ✅ 物品: ${sub.items.length} 件`);
      }
    }

    console.log('🎉 数据迁移完成！');
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

migrate();
```

### 运行迁移脚本

```bash
# 设置环境变量
export SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_KEY=your-service-key

# 运行脚本
npx tsx scripts/migrate-to-supabase.ts
```

### 翻译处理策略

**决策**：使用**选项 2（AI 翻译）+ 人工校验**的方式。

**实施步骤**：
1. 运行初始迁移脚本，将所有日语字段设置为与中文相同的值
2. 创建翻译脚本，使用 Anthropic Claude API 批量翻译日语字段
3. 在 Supabase Dashboard 中人工校验和修正关键翻译
4. 对于专业术语（如"哺乳文胸"、"产褥垫"等）保留专业翻译

**翻译脚本示例**：

```typescript
// scripts/translate-japanese.ts
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function translateToJapanese(text: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Translate this Chinese text to natural Japanese (母国語レベル):\n\n${text}`
    }]
  });

  return response.content[0].type === 'text' ? response.content[0].text : text;
}
```

### 环境变量

```bash
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# 验证必需的环境变量
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}
```

### 可访问性考虑

为确保多语言功能对所有用户友好：

1. **HTML lang 属性**
   ```typescript
   useEffect(() => {
     document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'ja';
   }, [language]);
   ```

2. **ARIA 标签**
   - 语言切换器使用 `aria-label="Switch language"`
   - 添加 `aria-live="polite"` 在内容更新时通知屏幕阅读器

3. **焦点管理**
   - 切换语言后焦点保持在切换按钮上
   - 避免意外的焦点移动

4. **屏幕阅读器支持**
   - 语言切换时添加屏幕阅读器通知（可选）

## 依赖项

新增依赖：

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0"
  }
}
```

## 文件结构

```
akachanlist/
├── contexts/
│   └── LanguageContext.tsx      # 语言上下文
├── lib/
│   └── supabase.ts              # Supabase 客户端
├── hooks/
│   └── useProjectData.ts        # 数据获取 hook
├── components/
│   ├── LanguageSwitcher.tsx     # 语言切换器
│   ├── ErrorBoundary.tsx        # 错误边界
│   ├── LoadingSpinner.tsx       # 加载状态
│   └── ErrorMessage.tsx         # 错误信息
├── utils/
│   ├── data.ts                  # 数据获取和转换
│   ├── fallback.ts              # 降级策略
│   └── errorHandler.ts          # 错误处理
├── scripts/
│   └── migrate-to-supabase.ts   # 数据迁移脚本
└── public/data/
    ├── items-zh.json            # 中文备份
    └── items-ja.json            # 日语备份
```

## 与现有代码的集成

### Home.tsx 更新

将现有的 Home 组件迁移到使用新的数据获取 hook：

```typescript
// pages/Home.tsx
import React from 'react';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { CategorySection } from '../components/CategorySection';
import { Footer } from '../components/Footer';
import { Category } from '../types';
import { useProjectData } from '../hooks/useProjectData';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const Home: React.FC = () => {
  const { data, isLoading, isError } = useProjectData('akachanlist');
  const categoryRefs = React.useRef<{ [key: string]: HTMLElement | null }>({});

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={data.meta.title} subtitle={data.meta.subtitle} />
      <CategoryNav
        categories={data.categories}
        onCategoryClick={handleCategoryClick}
      />

      <main className="container mx-auto px-4 py-8">
        {data.categories.map((category) => (
          <div
            key={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className="mb-8 scroll-mt-40"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-pink-500">{category.title}</span>
            </h2>

            {category.subcategories.map((subcategory) => (
              <CategorySection
                key={subcategory.id}
                subcategory={subcategory}
                defaultExpanded={category.subcategories.indexOf(subcategory) === 0}
              />
            ))}
          </div>
        ))}
      </main>

      <Footer
        source="https://www.akachan.jp/junbilist/childbirth/"
        disclaimer="本清单仅供参考，具体需求请根据个人情况调整。内容翻译自日本网站，部分物品可能需要根据当地情况调整。"
      />
    </div>
  );
};
```

### 无需修改的组件

以下组件**无需修改**，因为它们接收 props 并不关心数据来源：

- `ItemCard.tsx` - 接收 `Item` props
- `CategorySection.tsx` - 接收 `Subcategory` props
- `CategoryNav.tsx` - 接收 `Category[]` props
- `Footer.tsx` - 接收字符串 props

### 向后兼容

保留现有的 `src/utils/data.ts` 作为降级策略的一部分，确保 Supabase 不可用时应用仍能工作。

## 实施步骤

1. **设置 Supabase**
   - 创建项目
   - 创建表和索引
   - 配置 RLS 策略
   - 获取 API 密钥

2. **数据迁移**
   - 编写迁移脚本
   - 导入中文数据
   - 准备日语数据

3. **前端开发**
   - 安装依赖
   - 实现 LanguageContext
   - 集成 Supabase 客户端
   - 实现数据获取和缓存
   - 创建 LanguageSwitcher 组件
   - 更新 Header 组件
   - 实现错误处理和降级

4. **测试**
   - 测试语言切换功能
   - 测试数据加载
   - 测试错误处理
   - 测试降级策略
   - 测试响应式布局

5. **部署**
   - 更新环境变量
   - 部署到 Vercel
   - 验证生产环境

## 未来扩展

1. **更多语言**: 添加英语等其他语言
2. **更多项目**: 添加其他类型的清单项目
3. **用户偏好**: 记住用户选择的语言偏好
4. **离线支持**: 使用 Service Worker 缓存数据
5. **SEO 优化**: 为不同语言提供独立的 URL

## 验收标准

- [ ] 用户可以在右上角切换中文/日语
- [ ] 语言切换后所有内容更新
- [ ] 语言偏好保存在 localStorage
- [ ] URL 参数反映当前语言 (?lang=zh 或 ?lang=ja)
- [ ] 数据从 Supabase 加载
- [ ] Supabase 失败时降级到本地 JSON
- [ ] 没有控制台错误
- [ ] 响应式布局正常工作
- [ ] 首次加载时间 < 3秒

## 测试策略

### 单元测试

使用 Vitest 测试关键函数和组件：

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**测试用例**：

1. **数据转换函数** (`utils/data.test.ts`)
   - `transformData()` 正确转换 Supabase 响应
   - 缺失语言字段时降级到中文
   - 正确处理嵌套结构

2. **LanguageContext** (`contexts/LanguageContext.test.ts`)
   - 初始化语言顺序：URL → localStorage → 默认
   - `setLanguage()` 更新 state、localStorage、URL
   - `isLanguageReady` 状态正确

3. **LanguageSwitcher** (`components/LanguageSwitcher.test.ts`)
   - 点击切换语言
   - 显示当前语言文本
   - 正确调用 `setLanguage`

### 集成测试

测试组件集成：

```typescript
// Home.integration.test.tsx
describe('Home Page Integration', () => {
  it('loads data for correct language', async () => {
    // 测试语言切换后数据重新加载
  });

  it('shows loading state', () => {
    // 测试加载状态显示
  });

  it('handles errors gracefully', () => {
    // 测试错误处理
  });
});
```

### E2E 测试

使用 Playwright 测试完整用户流程：

```typescript
// e2e/language-switching.spec.ts
test('language switching flow', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 默认显示中文
  await expect(page.locator('h1')).toContainText('分娩准备清单');

  // 点击语言切换器
  await page.click('[aria-label="Switch language"]');

  // 切换到日语
  await expect(page.locator('h1')).toContainText('出産準備リスト');

  // URL 更新
  expect(page.url()).toContain('lang=ja');

  // 刷新页面，保持日语
  await page.reload();
  await expect(page.locator('h1')).toContainText('出産準備リスト');
});
```

### 性能测试

使用 Lighthouse 测试性能指标：

- 首次内容绘制 (FCP) < 1.5s
- 最大内容绘制 (LCP) < 2.5s
- 累积布局偏移 (CLS) < 0.1

## 风险和注意事项

1. **数据一致性**: 确保中日语数据结构一致
2. **性能优化**: 监控 Supabase 查询性能，考虑添加缓存
3. **SEO 影响**: URL 参数可能影响 SEO，未来考虑使用路由
4. **维护成本**: 需要维护两套数据（中日语）

## 参考资料

- [Supabase 文档](https://supabase.com/docs)
- [React Query 文档](https://tanstack.com/query/latest)
- [Lucide React 图标](https://lucide.dev/)
