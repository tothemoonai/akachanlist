# 多语言功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 为分娩准备清单网站添加中文和日语双语支持，使用 Supabase 存储数据，实现语言切换和降级策略

**架构：** React Context 管理语言状态，React Query 处理数据获取和缓存，Supabase 作为主数据源，本地 JSON 作为降级备份

**技术栈：** React 18, TypeScript, Supabase, React Query, Lucide React

---

## 文件结构

### 新建文件
- `src/contexts/LanguageContext.tsx` - 语言状态管理 Context 和 hook
- `src/lib/supabase.ts` - Supabase 客户端配置
- `src/hooks/useProjectData.ts` - React Query 数据获取 hook
- `src/components/LanguageSwitcher.tsx` - 语言切换按钮组件
- `src/components/LoadingSpinner.tsx` - 加载状态组件
- `src/components/ErrorMessage.tsx` - 错误提示组件
- `src/components/ErrorBoundary.tsx` - 错误边界组件
- `scripts/migrate-to-supabase.ts` - 数据迁移脚本
- `scripts/translate-japanese.ts` - 日语翻译脚本
- `.env.local.example` - 环境变量示例文件

### 修改文件
- `src/types/index.ts` - 添加 Language 类型和 Supabase 相关类型
- `src/utils/data.ts` - 添加数据转换和降级函数
- `src/main.tsx` - 添加 QueryClientProvider
- `src/App.tsx` - 添加 LanguageProvider 和 ErrorBoundary
- `src/pages/Home.tsx` - 使用新的数据获取 hook 和组件
- `src/components/Header.tsx` - 集成 LanguageSwitcher
- `package.json` - 添加新依赖
- `.gitignore` - 添加 `.env.local`

---

## 任务 1: 环境设置和依赖安装

**目标：** 安装必要的依赖包

### Task 1.1: 安装 Supabase 和 React Query

- [ ] **Step 1: 安装 @supabase/supabase-js**

```bash
npm install @supabase/supabase-js
```

Expected: Package installed successfully

- [ ] **Step 2: 安装 @tanstack/react-query**

```bash
npm install @tanstack/react-query
```

Expected: Package installed successfully

- [ ] **Step 3: 验证安装**

```bash
cat package.json | grep -A2 "dependencies"
```

Expected: Should see `@supabase/supabase-js` and `@tanstack/react-query` in dependencies

- [ ] **Step 4: 提交依赖更新**

```bash
git add package.json package-lock.json
git commit -m "feat: install Supabase and React Query dependencies

- Add @supabase/supabase-js for data fetching
- Add @tanstack/react-query for data caching and state management

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 2: TypeScript 类型定义

**目标：** 添加多语言功能所需的 TypeScript 类型

### Task 2.1: 扩展类型定义

- [ ] **Step 1: 读取现有类型定义**

```bash
cat src/types/index.ts
```

- [ ] **Step 2: 备份原有类型**

```bash
cp src/types/index.ts src/types/index.ts.backup
```

- [ ] **Step 3: 添加 Language 类型和 Supabase 类型**

编辑 `src/types/index.ts`，在文件开头添加：

```typescript
export type Language = 'zh' | 'ja';

// Supabase 原始响应类型
export interface SupabaseProject {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  description_zh: string;
  description_ja: string;
}

export interface SupabaseItem {
  id: string;
  name_zh: string;
  name_ja: string;
  description_zh?: string;
  description_ja?: string;
  priority: Priority;
  quantity_zh?: string;
  quantity_ja?: string;
  notes_zh?: string;
  notes_ja?: string;
}

export interface SupabaseSubcategory {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  description_zh?: string;
  description_ja?: string;
  sort_order: number;
  items: SupabaseItem[];
}

export interface SupabaseCategory {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  icon: string;
  sort_order: number;
  subcategories: SupabaseSubcategory[];
}

export interface SupabaseProjectResponse {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  description_zh: string;
  description_ja: string;
  categories: SupabaseCategory[];
}

// Context 类型
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageReady: boolean;
}
```

- [ ] **Step 4: 验证类型定义**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 5: 提交类型定义**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for multilingual support

- Add Language type ('zh' | 'ja')
- Add Supabase response types
- Add LanguageContextType interface

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 3: Supabase 客户端配置

**目标：** 配置 Supabase 客户端

### Task 3.1: 创建 Supabase 客户端

- [ ] **Step 1: 创建 lib 目录**

```bash
mkdir -p src/lib
```

- [ ] **Step 2: 创建 Supabase 客户端文件**

创建 `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// 验证环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: 验证客户端创建**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交客户端配置**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client configuration

- Initialize Supabase client with environment variables
- Add validation for required environment variables

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 3.2: 创建环境变量示例文件

- [ ] **Step 1: 创建环境变量示例**

创建 `.env.local.example`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- [ ] **Step 2: 更新 .gitignore**

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 3: 提交环境变量配置**

```bash
git add .env.local.example .gitignore
git commit -m "feat: add environment variable configuration

- Add .env.local.example for Supabase credentials
- Add .env.local to .gitignore

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 4: 数据转换工具函数

**目标：** 实现数据转换和降级函数

### Task 4.1: 扩展 data.ts 工具函数

- [ ] **Step 1: 读取现有 data.ts**

```bash
cat src/utils/data.ts
```

- [ ] **Step 2: 添加数据转换函数**

在 `src/utils/data.ts` 中添加：

```typescript
import { supabase } from '../lib/supabase';
import {
  ItemsData,
  Category,
  Subcategory,
  Item,
  Language,
  SupabaseProjectResponse,
} from '../types';

function transformItem(rawItem: any, lang: Language): Item {
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

function transformCategory(rawCat: any, lang: Language): Category {
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

export async function fetchLocalData(lang: Language): Promise<ItemsData> {
  const response = await fetch(`/data/items-${lang}.json`);
  if (!response.ok) throw new Error('Failed to load local data');
  return response.json();
}
```

- [ ] **Step 3: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交数据转换函数**

```bash
git add src/utils/data.ts
git commit -m "feat: add data transformation and Supabase fetching

- Add transformData() to convert Supabase response to ItemsData
- Add fetchProjectData() to fetch from Supabase with nested queries
- Add fetchLocalData() as fallback for local JSON files
- Implement language fallback logic (defaults to Chinese)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 5: Language Context 实现

**目标：** 创建语言状态管理 Context

### Task 5.1: 创建 LanguageContext

- [ ] **Step 1: 创建 contexts 目录**

```bash
mkdir -p src/contexts
```

- [ ] **Step 2: 创建 LanguageContext 文件**

创建 `src/contexts/LanguageContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

    // 验证语言代码
    const validLang = urlLang || storedLang || 'zh';
    if (validLang === 'zh' || validLang === 'ja') {
      setLanguageState(validLang);
    }
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

  // 更新 HTML lang 属性
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'ja';
  }, [language]);

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

- [ ] **Step 3: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交 LanguageContext**

```bash
git add src/contexts/LanguageContext.tsx
git commit -m "feat: implement LanguageContext for language state management

- Add LanguageProvider with localStorage and URL sync
- Add useLanguage() hook for consuming language state
- Implement language initialization with priority: URL > localStorage > default
- Update HTML lang attribute when language changes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 6: React Query 数据获取 Hook

**目标：** 创建使用 React Query 的数据获取 hook

### Task 6.1: 创建 useProjectData hook

- [ ] **Step 1: 创建 hooks 目录**

```bash
mkdir -p src/hooks
```

- [ ] **Step 2: 创建数据获取 hook**

创建 `src/hooks/useProjectData.ts`:

```typescript
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
        console.warn('Supabase failed, falling back to local JSON:', error);
        return await fetchLocalData(language);
      }
    },
    enabled: isLanguageReady,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 30 * 60 * 1000, // 30分钟
    retry: (failureCount, error) => {
      // Supabase 错误不重试，直接降级到本地数据
      if (error instanceof Error && error.message.includes('Supabase')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
```

- [ ] **Step 3: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交 hook**

```bash
git add src/hooks/useProjectData.ts
git commit -m "feat: add useProjectData hook with React Query

- Implement data fetching with Supabase and fallback to local JSON
- Add caching strategy (5min stale, 30min gcTime)
- Enable query only after language initialization
- Implement smart retry logic (skip Supabase errors)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 7: UI 组件实现

**目标：** 创建语言切换器和状态组件

### Task 7.1: 创建 LanguageSwitcher 组件

- [ ] **Step 1: 创建 LanguageSwitcher 组件**

创建 `src/components/LanguageSwitcher.tsx`:

```typescript
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleToggle = () => {
    setLanguage(language === 'zh' ? 'ja' : 'zh');
  };

  return (
    <button
      onClick={handleToggle}
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

- [ ] **Step 2: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: 提交组件**

```bash
git add src/components/LanguageSwitcher.tsx
git commit -m "feat: add LanguageSwitcher component

- Add language toggle button with Languages icon
- Display current language (中文/日本語)
- Support click to switch between languages
- Include aria-label for accessibility

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 7.2: 创建 LoadingSpinner 组件

- [ ] **Step 1: 创建 LoadingSpinner 组件**

创建 `src/components/LoadingSpinner.tsx`:

```typescript
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

- [ ] **Step 2: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: 提交组件**

```bash
git add src/components/LoadingSpinner.tsx
git commit -m "feat: add LoadingSpinner component

- Add centered loading spinner with pink styling
- Display loading text in Chinese

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 7.3: 创建 ErrorMessage 组件

- [ ] **Step 1: 创建 ErrorMessage 组件**

创建 `src/components/ErrorMessage.tsx`:

```typescript
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
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: 提交组件**

```bash
git add src/components/ErrorMessage.tsx
git commit -m "feat: add ErrorMessage component

- Add user-friendly error message display
- Include reload button to retry
- Use consistent pink styling

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 7.4: 创建 ErrorBoundary 组件

- [ ] **Step 1: 创建 ErrorBoundary 组件**

创建 `src/components/ErrorBoundary.tsx`:

```typescript
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
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
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

- [ ] **Step 2: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: 提交组件**

```bash
git add src/components/ErrorBoundary.tsx
git commit -m "feat: add ErrorBoundary component

- Implement class component error boundary
- Catch and display runtime errors gracefully
- Log errors to console for debugging
- Provide reload button for recovery

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 8: 集成到应用主入口

**目标：** 将所有组件集成到应用中

### Task 8.1: 更新 main.tsx

- [ ] **Step 1: 备份现有 main.tsx**

```bash
cp src/main.tsx src/main.tsx.backup
```

- [ ] **Step 2: 更新 main.tsx**

编辑 `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
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

- [ ] **Step 3: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交更新**

```bash
git add src/main.tsx
git commit -m "feat: add QueryClientProvider to main.tsx

- Configure React Query with optimal caching settings
- Wrap App with QueryClientProvider
- Disable refetch on window focus for better UX

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 8.2: 更新 App.tsx

- [ ] **Step 1: 备份现有 App.tsx**

```bash
cp src/App.tsx src/App.tsx.backup
```

- [ ] **Step 2: 更新 App.tsx**

编辑 `src/App.tsx`:

```typescript
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Home />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
```

- [ ] **Step 3: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交更新**

```bash
git add src/App.tsx
git commit -m "feat: integrate LanguageProvider and ErrorBoundary in App

- Wrap Home with LanguageProvider for language state
- Wrap application with ErrorBoundary for error handling
- Maintain clean component hierarchy

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 8.3: 更新 Home.tsx

- [ ] **Step 1: 备份现有 Home.tsx**

```bash
cp src/pages/Home.tsx src/pages/Home.tsx.backup
```

- [ ] **Step 2: 更新 Home.tsx**

编辑 `src/pages/Home.tsx`，替换数据加载逻辑：

```typescript
import React, { useRef } from 'react';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { CategorySection } from '../components/CategorySection';
import { Footer } from '../components/Footer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useProjectData } from '../hooks/useProjectData';
import { Category } from '../types';

export const Home: React.FC = () => {
  const { data, isLoading, isError } = useProjectData('akachanlist');
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  if (!data) {
    return null;
  }

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

- [ ] **Step 3: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 4: 提交更新**

```bash
git add src/pages/Home.tsx
git commit -m "feat: integrate useProjectData hook in Home page

- Replace direct data loading with useProjectData hook
- Add LoadingSpinner and ErrorMessage components
- Simplify data loading logic with React Query
- Maintain existing UI and functionality

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 8.4: 更新 Header.tsx

- [ ] **Step 1: 读取现有 Header.tsx**

```bash
cat src/components/Header.tsx
```

- [ ] **Step 2: 备份现有 Header.tsx**

```bash
cp src/components/Header.tsx src/components/Header.tsx.backup
```

- [ ] **Step 3: 更新 Header.tsx**

编辑 `src/components/Header.tsx`，集成 LanguageSwitcher：

```typescript
import React from 'react';
import { User, Baby } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-50 bg-pink-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* 第一行：标题 + 语言切换器 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-pink-500" />
            <Baby className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {title}
            </h1>
          </div>

          {/* 语言切换器 */}
          <LanguageSwitcher />
        </div>

        {/* 第二行：副标题 */}
        <p className="text-gray-600 text-sm md:text-base pl-11">
          {subtitle}
        </p>
      </div>
    </header>
  );
};
```

- [ ] **Step 4: 验证代码**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 5: 提交更新**

```bash
git add src/components/Header.tsx
git commit -m "feat: integrate LanguageSwitcher in Header

- Add LanguageSwitcher button to header right side
- Update layout to flex with justify-between
- Maintain responsive design and spacing

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 9: 准备降级数据文件

**目标：** 创建日语数据文件作为降级备份

### Task 9.1: 创建日语数据文件

- [ ] **Step 1: 复制现有数据文件**

```bash
cp public/data/items.json public/data/items-zh.json
```

- [ ] **Step 2: 创建日语数据占位文件**

创建 `public/data/items-ja.json`（暂时复制中文数据，后续翻译）:

```bash
cp public/data/items.json public/data/items-ja.json
```

- [ ] **Step 3: 提交数据文件**

```bash
git add public/data/items-zh.json public/data/items-ja.json
git commit -m "feat: add language-specific data files for fallback

- Copy existing items.json to items-zh.json
- Create items-ja.json placeholder (to be translated)
- Support fallback loading when Supabase is unavailable

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 10: 测试和验证

**目标：** 测试多语言功能

### Task 10.1: 启动开发服务器测试

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

Expected: Server starts on http://localhost:5173

- [ ] **Step 2: 测试基础功能**

打开浏览器访问 http://localhost:5173:
- 页面应该正常加载
- 应该看到 LanguageSwitcher 按钮显示"中文"
- URL 应该包含 `?lang=zh`

- [ ] **Step 3: 测试语言切换**

点击 LanguageSwitcher 按钮:
- 按钮文本应该变为"日本語"
- URL 应该更新为 `?lang=ja`
- 页面内容应该更新（虽然日语数据尚未翻译，但应该显示）

- [ ] **Step 4: 测试 URL 参数**

手动访问 `http://localhost:5173?lang=ja`:
- 页面应该直接加载日语版本
- 按钮应该显示"日本語"

- [ ] **Step 5: 检查控制台**

打开浏览器开发者工具，检查控制台:
- 应该没有错误
- 如果 Supabase 未配置，应该看到降级警告

- [ ] **Step 6: 测试 localStorage**

1. 切换语言到日语
2. 刷新页面
3. 页面应该保持日语状态

- [ ] **Step 7: 停止开发服务器**

按 `Ctrl+C` 停止服务器

---

## 任务 11: 构建和部署

**目标：** 构建生产版本并验证

### Task 11.1: 构建生产版本

- [ ] **Step 1: 构建项目**

```bash
npm run build
```

Expected: Build succeeds, creates `dist/` directory

- [ ] **Step 2: 验证构建输出**

```bash
ls -la dist/
```

Expected: Should see `index.html`, `assets/`, `data/` directories

- [ ] **Step 3: 预览生产版本**

```bash
npm run preview
```

Expected: Preview server starts

- [ ] **Step 4: 测试预览版本**

打开浏览器访问预览 URL:
- 测试语言切换功能
- 验证所有功能正常

- [ ] **Step 5: 停止预览服务器**

按 `Ctrl+C` 停止服务器

- [ ] **Step 6: 提交所有更新**

```bash
git add .
git commit -m "feat: complete multilingual feature implementation

- Implement all components and hooks
- Integrate LanguageProvider and React Query
- Add language switcher in header
- Support localStorage and URL parameter sync
- Implement fallback to local JSON files
- Add comprehensive error handling

All features tested and working. Ready for Supabase setup and data migration.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 12: Supabase 数据库设置（需要人工操作）

**目标：** 在 Supabase 中创建数据库表和迁移数据

**注意**：此任务需要人工操作 Supabase Dashboard

### Task 12.1: 创建 Supabase 项目

- [ ] **Step 1: 访问 Supabase**

打开 https://supabase.com，登录或创建账号

- [ ] **Step 2: 创建新项目**

1. 点击 "New Project"
2. 输入项目名称：`akachanlist`
3. 选择数据库密码（保存此密码）
4. 选择区域（推荐选择离用户近的区域）
5. 等待项目创建完成

- [ ] **Step 3: 获取 API 密钥**

1. 进入项目 Settings → API
2. 复制 `Project URL` 和 `anon` `public` key
3. 在本地创建 `.env.local` 文件：

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. 提交 `.env.local` 到 `.gitignore`（已添加）

### Task 12.2: 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中运行以下 SQL：

- [ ] **Step 1: 启用 UUID 扩展**

```sql
-- 启用 uuid_generate_v4() 函数
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

- [ ] **Step 2: 创建 projects 表**

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

- [ ] **Step 3: 创建 categories 表**

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

- [ ] **Step 4: 创建 subcategories 表**

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

- [ ] **Step 5: 创建 items 表**

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

- [ ] **Step 6: 启用 RLS**

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

- [ ] **Step 7: 验证表创建**

在 Supabase Dashboard 的 Table Editor 中，应该能看到所有 4 个表

### Task 12.3: 数据迁移

- [ ] **Step 1: 安装迁移依赖**

```bash
npm install -D tsx
```

- [ ] **Step 2: 运行迁移脚本**

```bash
npx tsx scripts/migrate-to-supabase.ts
```

Expected: 看到 "🎉 数据迁移完成！"消息

- [ ] **Step 3: 验证数据**

在 Supabase Dashboard 的 Table Editor 中查看数据：
- projects 表应该有 1 条记录
- categories 表应该有 4 条记录
- subcategories 表应该有 13 条记录
- items 表应该有约 80 条记录

- [ ] **Step 4: 提交更新**

```bash
git add scripts/ .env.local.example
git commit -m "feat: add Supabase migration scripts and database setup

- Add migrate-to-supabase.ts script for data migration
- Include SQL schema for all tables
- Add RLS policies for public read access
- Document database setup process

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 13: 日语翻译（可选）

**目标：** 翻译日语数据字段

**注意**：此任务可以稍后完成，不影响功能使用

### Task 13.1: 翻译日语字段

- [ ] **Step 1: 在 Supabase Dashboard 中手动翻译**

对于专业术语和关键内容，使用 Supabase Table Editor 手动编辑日语字段：

**关键术语翻译参考**：
- 分娩准备清单 → 出産準備リスト
- 孕产妇用品 → マタニティ・ママ用品
- 婴儿用品 → 赤ちゃん用品
- 产前用品 → 産前用品
- 入院准备用品 → 入院準備用品
- 产后用品 → 産後用品
- 必需 → 必要
- 推荐 → あれば便利

- [ ] **Step 2: 或使用翻译脚本**

可以创建自动化翻译脚本（见设计文档中的示例）

- [ ] **Step 3: 验证翻译**

切换到日语版本，检查翻译质量

---

## 验收标准

完成所有任务后，以下标准应该全部满足：

- [ ] ✅ 用户可以在右上角切换中文/日语
- [ ] ✅ 语言切换后所有内容更新
- [ ] ✅ 语言偏好保存在 localStorage
- [ ] ✅ URL 参数反映当前语言 (?lang=zh 或 ?lang=ja)
- [ ] ✅ 数据从 Supabase 加载
- [ ] ✅ Supabase 失败时降级到本地 JSON
- [ ] ✅ 没有控制台错误
- [ ] ✅ 响应式布局正常工作
- [ ] ✅ 首次加载时间 < 3秒
- [ ] ✅ HTML lang 属性随语言切换

## 已知限制

1. **日语翻译**：初始版本日语字段使用中文数据占位，需要人工或 AI 翻译
2. **SEO**：URL 参数方式对 SEO 不利，如需优化可考虑使用路由
3. **离线支持**：当前不支持完全离线，需要网络连接

## 后续改进建议

1. 使用 AI 批量翻译日语字段
2. 添加 Service Worker 支持离线访问
3. 为不同语言提供独立路由 (/zh, /ja)
4. 添加语言切换动画效果
5. 实现语言偏好记忆（跨会话）
6. 添加更多语言支持（英语等）

## 预计时间

- 任务 1-9: 约 2-3 小时（前端开发）
- 任务 10: 约 30 分钟（测试）
- 任务 11: 约 15 分钟（构建部署）
- 任务 12: 约 1 小时（Supabase 设置）
- 任务 13: 约 2-4 小时（翻译，可选）

**总计**：约 4-6 小时（不含翻译）
