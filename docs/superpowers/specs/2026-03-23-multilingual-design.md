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
- localStorage + URL 参数同步语言偏好
- 降级策略：Supabase 失败时使用本地 JSON 文件

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

## 前端实现

### 1. 语言状态管理

#### LanguageContext

管理全局语言状态，协调 localStorage、URL 参数和内部状态。

```typescript
// contexts/LanguageContext.tsx
interface LanguageContextType {
  language: 'zh' | 'ja';
  setLanguage: (lang: 'zh' | 'ja') => void;
  isLanguageReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'zh' | 'ja'>('zh');
  const [isReady, setIsReady] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const urlLang = searchParams.get('lang') as 'zh' | 'ja' | null;
    const storedLang = localStorage.getItem('preferred-lang') as 'zh' | 'ja' | null;
    const initialLang = urlLang || storedLang || 'zh';
    setLanguageState(initialLang);
    setIsReady(true);
  }, []);

  const setLanguage = useCallback((lang: 'zh' | 'ja') => {
    setLanguageState(lang);
    localStorage.setItem('preferred-lang', lang);
    setSearchParams({ lang: lang }, { replace: true });
  }, [setSearchParams]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
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

// utils/data.ts
export async function fetchProjectData(
  projectSlug: string,
  lang: 'zh' | 'ja'
): Promise<ItemsData> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      slug,
      name_${lang},
      description_${lang},
      categories (
        id,
        slug,
        name_${lang},
        icon,
        sort_order,
        subcategories (
          id,
          slug,
          name_${lang},
          description_${lang},
          sort_order,
          items (
            id,
            name_${lang},
            description_${lang},
            priority,
            quantity_${lang},
            notes_${lang},
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
  return transformData(data, lang);
}
```

#### React Query 集成

```typescript
// hooks/useProjectData.ts
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

### 3. UI 组件

#### LanguageSwitcher 组件

语言切换按钮，位于 Header 右上角。

```typescript
// components/LanguageSwitcher.tsx
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

#### ErrorBoundary

捕获运行时错误：

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  // ... 实现
}
```

#### 降级策略

Supabase 失败时使用本地 JSON：

```typescript
// utils/fallback.ts
async function fetchLocalData(lang: 'zh' | 'ja'): Promise<ItemsData> {
  const response = await fetch(`/data/items-${lang}.json`);
  if (!response.ok) throw new Error('Failed to load local data');
  return response.json();
}
```

## 数据迁移

### 初始数据导入

从现有 JSON 文件导入到 Supabase：

1. 创建项目脚本 `scripts/migrate-to-supabase.ts`
2. 读取现有的 `items.json` 文件
3. 解析数据并插入到 Supabase 表
4. 为日语数据创建翻译

### 环境变量

```bash
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

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

## 风险和注意事项

1. **数据一致性**: 确保中日语数据结构一致
2. **性能优化**: 监控 Supabase 查询性能，考虑添加缓存
3. **SEO 影响**: URL 参数可能影响 SEO，未来考虑使用路由
4. **维护成本**: 需要维护两套数据（中日语）

## 参考资料

- [Supabase 文档](https://supabase.com/docs)
- [React Query 文档](https://tanstack.com/query/latest)
- [Lucide React 图标](https://lucide.dev/)
