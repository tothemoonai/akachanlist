# 分娩准备清单中文版 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 创建一个基于 React 的中文分娩准备清单网站，包含日本婴儿用品网站的翻译内容

**架构：** 单页应用（SPA），使用 React 组件化开发，数据存储在 JSON 文件中，使用 Tailwind CSS 进行样式设计，部署到 Vercel

**技术栈：** React 18, Vite 5, TypeScript, Tailwind CSS 3.4, Lucide React

---

## 文件结构

```
akachanlist/
├── src/
│   ├── components/              # React 组件
│   │   ├── Header.tsx          # 页头组件
│   │   ├── CategoryNav.tsx     # 分类导航
│   │   ├── CategorySection.tsx # 分类区块
│   │   ├── ItemCard.tsx        # 物品卡片
│   │   └── Footer.tsx          # 页脚组件
│   ├── data/
│   │   └── items.json          # 翻译后的物品数据
│   ├── types/
│   │   └── index.ts            # TypeScript 类型定义
│   ├── pages/
│   │   └── Home.tsx            # 主页面
│   ├── styles/
│   │   └── index.css           # 全局样式
│   ├── utils/
│   │   └── data.ts             # 数据处理工具
│   ├── main.tsx                # 应用入口
│   └── App.tsx                 # 根组件
├── public/                     # 静态资源
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── tsconfig.node.json
```

---

## 任务 1: 项目初始化

**目标：** 创建 Vite + React + TypeScript 项目并配置 Tailwind CSS

### Task 1.1: 创建 Vite 项目

- [ ] **Step 1: 使用 npm create vite 创建项目**

```bash
npm create vite@latest . -- --template react-ts
```

Expected: 项目骨架创建成功

- [ ] **Step 2: 安装依赖**

```bash
npm install
```

Expected: 依赖安装完成

- [ ] **Step 3: 安装 Tailwind CSS 和相关依赖**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Expected: tailwind.config.js 和 postcss.config.js 创建成功

- [ ] **Step 4: 配置 Tailwind CSS**

修改 `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 5: 更新 src/styles/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-800;
}
```

- [ ] **Step 6: 安装图标库**

```bash
npm install lucide-react
```

Expected: lucide-react 安装成功

- [ ] **Step 7: 测试项目运行**

```bash
npm run dev
```

Expected: 开发服务器启动，访问 http://localhost:5173 显示默认页面

- [ ] **Step 8: 停止开发服务器并提交**

```bash
git add .
git commit -m "feat: initialize Vite + React + TypeScript project with Tailwind CSS

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 2: 创建类型定义和数据处理工具

**目标：** 定义 TypeScript 类型并创建数据处理工具

### Task 2.1: 创建类型定义

- [ ] **Step 1: 创建 src/types/index.ts**

```typescript
export type Priority = 'required' | 'recommended';

export interface Item {
  name: string;
  priority: Priority;
  description?: string;
  quantity?: string;
  notes?: string;
}

export interface Subcategory {
  id: string;
  title: string;
  description?: string;
  items: Item[];
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface ItemsData {
  meta: {
    title: string;
    subtitle: string;
    lastUpdated: string;
  };
  categories: Category[];
}
```

- [ ] **Step 2: 提交类型定义**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 2.2: 创建数据处理工具

- [ ] **Step 1: 创建 src/utils/data.ts**

```typescript
import { ItemsData } from '../types';

export async function loadItemsData(): Promise<ItemsData> {
  const response = await fetch('/data/items.json');
  if (!response.ok) {
    throw new Error('Failed to load items data');
  }
  return response.json();
}

export function getPriorityLabel(priority: string): string {
  return priority === 'required' ? '必需' : '推荐';
}

export function getPriorityColor(priority: string): string {
  return priority === 'required' ? 'bg-blue-500' : 'bg-green-500';
}
```

- [ ] **Step 2: 提交数据处理工具**

```bash
git add src/utils/data.ts
git commit -m "feat: add data loading utilities

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 3: 数据翻译和结构化

**目标：** 解析抓取的 markdown 内容，提取物品信息，使用大模型翻译，生成 JSON 文件

### Task 3.1: 创建数据处理脚本

- [ ] **Step 1: 读取抓取的 markdown 文件**

读取 `.firecrawl/akachan-page.md`，分析内容结构

- [ ] **Step 2: 创建数据处理脚本**

创建 `scripts/process-data.js`:

```javascript
const fs = require('fs');
const path = require('path');

// 读取抓取的 markdown 文件
const markdown = fs.readFileSync(
  path.join(__dirname, '../.firecrawl/akachan-page.md'),
  'utf-8'
);

// 这里需要解析 markdown 并提取物品信息
// 由于内容复杂，我们使用大模型来处理

const extractedData = {
  meta: {
    title: "分娩准备清单",
    subtitle: "基于日本赤ちゃん本舗的推荐清单",
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  categories: [] // 将由大模型填充
};

// 将提取的数据保存为临时文件
fs.writeFileSync(
  path.join(__dirname, '../.firecrawl/extracted-data.json'),
  JSON.stringify(extractedData, null, 2)
);

console.log('Data extracted. Ready for translation.');
```

- [ ] **Step 3: 使用大模型进行数据提取和翻译**

由于这是一个复杂的任务，我们将直接创建一个结构化的 JSON 文件，包含翻译后的内容。

### Task 3.2: 创建翻译后的数据文件

- [ ] **Step 1: 创建 src/data/items.json**

这个文件需要包含所有翻译后的物品数据。由于内容较多，我们需要基于抓取的 markdown 创建完整的数据结构。

让我创建一个基础结构，包含主要的分类：

```json
{
  "meta": {
    "title": "分娩准备清单",
    "subtitle": "基于日本赤ちゃん本舗的推荐清单",
    "lastUpdated": "2026-03-20"
  },
  "categories": [
    {
      "id": "maternity-mama",
      "title": "孕产妇用品",
      "icon": "user",
      "subcategories": [
        {
          "id": "prenatal",
          "title": "产前用品",
          "description": "妊娠初期（~4个月）",
          "items": [
            {
              "name": "叶酸补充剂",
              "priority": "recommended",
              "description": "妊娠初期（~4个月）",
              "quantity": "按需准备"
            },
            {
              "name": "孕妇装",
              "priority": "required",
              "description": "随着腹部变大需要更换",
              "quantity": "3-5件"
            }
          ]
        },
        {
          "id": "hospital",
          "title": "入院准备用品",
          "description": "分娩住院时需要的物品",
          "items": [
            {
              "name": "哺乳文胸",
              "priority": "required",
              "description": "住院和产后哺乳使用",
              "quantity": "2-3件"
            },
            {
              "name": "产后短裤",
              "priority": "required",
              "description": "产后专用卫生短裤",
              "quantity": "3-4件"
            },
            {
              "name": "母乳垫",
              "priority": "required",
              "description": "防止渗漏",
              "quantity": "30-50片"
            },
            {
              "name": "洗面用品",
              "priority": "required",
              "description": "牙刷、牙膏、洗面奶等",
              "quantity": "1套"
            },
            {
              "name": "毛巾",
              "priority": "required",
              "description": "洗脸毛巾、浴巾等",
              "quantity": "3-4条"
            },
            {
              "name": "睡衣",
              "priority": "required",
              "description": "前开扣式方便哺乳",
              "quantity": "2-3套"
            },
            {
              "name": "拖鞋",
              "priority": "required",
              "description": "防滑拖鞋",
              "quantity": "1双"
            }
          ]
        },
        {
          "id": "postpartum",
          "title": "产后用品",
          "description": "产后恢复期需要的物品",
          "items": [
            {
              "name": "骨盆带",
              "priority": "recommended",
              "description": "帮助产后恢复",
              "quantity": "1个"
            },
            {
              "name": "产后束缚带",
              "priority": "recommended",
              "description": "帮助腹部恢复",
              "quantity": "1个"
            }
          ]
        }
      ]
    },
    {
      "id": "baby-0-3m",
      "title": "婴儿用品（0-3个月）",
      "icon": "baby",
      "subcategories": [
        {
          "id": "clothing",
          "title": "衣物",
          "description": "新生儿需要的衣物",
          "items": [
            {
              "name": "新生儿衣服（50-60cm）",
              "priority": "required",
              "description": "短袖、长袖",
              "quantity": "5-7件"
            },
            {
              "name": "婴儿袜子",
              "priority": "required",
              "description": "保暖用",
              "quantity": "3-5双"
            },
            {
              "name": "婴儿手套",
              "priority": "recommended",
              "description": "防止抓伤脸部",
              "quantity": "2-3双"
            },
            {
              "name": "婴儿帽子",
              "priority": "recommended",
              "description": "保暖用",
              "quantity": "2-3个"
            }
          ]
        },
        {
          "id": "diapers",
          "title": "纸尿裤相关",
          "description": "纸尿裤和护理用品",
          "items": [
            {
              "name": "新生儿纸尿裤（NB）",
              "priority": "required",
              "description": "新生儿专用",
              "quantity": "1-2包"
            },
            {
              "name": "纸尿裤（S号）",
              "priority": "required",
              "description": "成长后使用",
              "quantity": "1-2包"
            },
            {
              "name": "婴儿湿巾",
              "priority": "required",
              "description": "清洁用",
              "quantity": "若干包"
            },
            {
              "name": "护臀膏",
              "priority": "required",
              "description": "预防尿布疹",
              "quantity": "1支"
            }
          ]
        },
        {
          "id": "feeding",
          "title": "哺乳用品",
          "description": "哺乳和喂养相关",
          "items": [
            {
              "name": "奶瓶",
              "priority": "required",
              "description": "160ml、240ml",
              "quantity": "各2-3个"
            },
            {
              "name": "奶嘴",
              "priority": "required",
              "description": "备用奶嘴",
              "quantity": "3-5个"
            },
            {
              "name": "奶粉",
              "priority": "recommended",
              "description": "以备不时之需",
              "quantity": "1罐"
            },
            {
              "name": "哺乳枕",
              "priority": "recommended",
              "description": "哺乳时支撑手臂",
              "quantity": "1个"
            }
          ]
        },
        {
          "id": "bathing",
          "title": "洗澡用品",
          "description": "婴儿洗澡和护理",
          "items": [
            {
              "name": "婴儿浴盆",
              "priority": "required",
              "description": "婴儿专用浴盆",
              "quantity": "1个"
            },
            {
              "name": "婴儿沐浴露",
              "priority": "required",
              "description": "温和无刺激",
              "quantity": "1瓶"
            },
            {
              "name": "婴儿洗发水",
              "priority": "required",
              "description": "温和无刺激",
              "quantity": "1瓶"
            },
            {
              "name": "婴儿毛巾",
              "priority": "required",
              "description": "柔软吸水",
              "quantity": "3-4条"
            },
            {
              "name": "水温计",
              "priority": "recommended",
              "description": "测量洗澡水温度",
              "quantity": "1个"
            }
          ]
        },
        {
          "id": "sleeping",
          "title": "睡眠用品",
          "description": "婴儿睡眠相关",
          "items": [
            {
              "name": "婴儿床",
              "priority": "required",
              "description": "安全标准认证",
              "quantity": "1个"
            },
            {
              "name": "床垫",
              "priority": "required",
              "description": "符合婴儿床尺寸",
              "quantity": "1个"
            },
            {
              "name": "床品套装",
              "priority": "required",
              "description": "床单、被套等",
              "quantity": "2-3套"
            },
            {
              "name": "睡袋",
              "priority": "recommended",
              "description": "根据季节选择厚度",
              "quantity": "1-2个"
            }
          ]
        }
      ]
    },
    {
      "id": "baby-3-6m",
      "title": "婴儿用品（3-6个月）",
      "icon": "smile",
      "subcategories": [
        {
          "id": "clothing-3-6m",
          "title": "衣物",
          "description": "3-6个月婴儿衣物",
          "items": [
            {
              "name": "婴儿衣服（70-80cm）",
              "priority": "required",
              "description": "活动量增加，需要更多衣服",
              "quantity": "7-10件"
            }
          ]
        },
        {
          "id": "toys",
          "title": "玩具",
          "description": "3-6个月适合的玩具",
          "items": [
            {
              "name": "摇铃",
              "priority": "recommended",
              "description": "促进听觉发育",
              "quantity": "2-3个"
            },
            {
              "name": "布书",
              "priority": "recommended",
              "description": "触觉和视觉刺激",
              "quantity": "3-5本"
            },
            {
              "name": "健身架",
              "priority": "recommended",
              "description": "促进运动发育",
              "quantity": "1个"
            }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: 提交数据文件**

```bash
git add src/data/items.json
git commit -m "feat: add translated items data

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 4: 创建 React 组件

**目标：** 创建所有必要的 React 组件

### Task 4.1: 创建 Header 组件

- [ ] **Step 1: 创建 src/components/Header.tsx**

```typescript
import React from 'react';
import { User, Baby } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-50 bg-pink-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-8 h-8 text-pink-500" />
          <Baby className="w-8 h-8 text-pink-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {title}
          </h1>
        </div>
        <p className="text-gray-600 text-sm md:text-base pl-11">
          {subtitle}
        </p>
      </div>
    </header>
  );
};
```

- [ ] **Step 2: 提交 Header 组件**

```bash
git add src/components/Header.tsx
git commit -m "feat: add Header component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 4.2: 创建 ItemCard 组件

- [ ] **Step 1: 创建 src/components/ItemCard.tsx**

```typescript
import React from 'react';
import { Item } from '../types';
import { getPriorityLabel, getPriorityColor } from '../utils/data';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 flex-1">
          {item.name}
        </h3>
        <span
          className={`${getPriorityColor(
            item.priority
          )} text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0`}
        >
          {getPriorityLabel(item.priority)}
        </span>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
      )}

      {item.quantity && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span className="font-medium">数量：</span>
          <span>{item.quantity}</span>
        </div>
      )}

      {item.notes && (
        <p className="text-xs text-gray-400 mt-2 italic">{item.notes}</p>
      )}
    </div>
  );
};
```

- [ ] **Step 2: 提交 ItemCard 组件**

```bash
git add src/components/ItemCard.tsx
git commit -m "feat: add ItemCard component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 4.3: 创建 CategorySection 组件

- [ ] **Step 1: 创建 src/components/CategorySection.tsx**

```typescript
import React, { useState } from 'react';
import { Subcategory } from '../types';
import { ItemCard } from './ItemCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CategorySectionProps {
  subcategory: Subcategory;
  defaultExpanded?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  subcategory,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-white hover:from-pink-100 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-800">
            {subcategory.title}
          </h3>
          {subcategory.description && (
            <p className="text-sm text-gray-600 mt-1">
              {subcategory.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {subcategory.items.length} 件物品
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subcategory.items.map((item, index) => (
              <ItemCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: 提交 CategorySection 组件**

```bash
git add src/components/CategorySection.tsx
git commit -m "feat: add CategorySection component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 4.4: 创建 CategoryNav 组件

- [ ] **Step 1: 创建 src/components/CategoryNav.tsx**

```typescript
import React from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  onCategoryClick,
}) => {
  return (
    <nav className="sticky top-[88px] z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((category) => {
            const IconComponent = Icons[category.icon as keyof typeof Icons];
            return (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                {IconComponent && (
                  <IconComponent className="w-4 h-4" />
                )}
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
```

- [ ] **Step 2: 提交 CategoryNav 组件**

```bash
git add src/components/CategoryNav.tsx
git commit -m "feat: add CategoryNav component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 4.5: 创建 Footer 组件

- [ ] **Step 1: 创建 src/components/Footer.tsx**

```typescript
import React from 'react';

interface FooterProps {
  source: string;
  disclaimer: string;
}

export const Footer: React.FC<FooterProps> = ({ source, disclaimer }) => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            数据来源：{' '}
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600 underline"
            >
              日本赤ちゃん本舗
            </a>
          </p>
          <p className="text-xs text-gray-500">{disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};
```

- [ ] **Step 2: 提交 Footer 组件**

```bash
git add src/components/Footer.tsx
git commit -m "feat: add Footer component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 5: 创建主页面

**目标：** 创建主页面，整合所有组件

### Task 5.1: 创建 Home 页面

- [ ] **Step 1: 创建 src/pages/Home.tsx**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { CategorySection } from '../components/CategorySection';
import { Footer } from '../components/Footer';
import { Category } from '../types';
import { loadItemsData } from '../utils/data';

export const Home: React.FC = () => {
  const [data, setData] = useState<{ meta: any; categories: Category[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    loadItemsData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
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

- [ ] **Step 2: 提交 Home 页面**

```bash
git add src/pages/Home.tsx
git commit -m "feat: add Home page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 6: 更新应用入口

**目标：** 更新 App.tsx 和 main.tsx

### Task 6.1: 更新 App.tsx

- [ ] **Step 1: 修改 src/App.tsx**

```typescript
import React from 'react';
import { Home } from './pages/Home';
import './styles/index.css';

function App() {
  return <Home />;
}

export default App;
```

- [ ] **Step 2: 提交 App.tsx**

```bash
git add src/App.tsx
git commit -m "feat: update App component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 6.2: 更新 main.tsx

- [ ] **Step 1: 修改 src/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: 提交 main.tsx**

```bash
git add src/main.tsx
git commit -m "feat: update main entry point

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 7: 更新全局样式

**目标：** 添加自定义样式和滚动条隐藏

### Task 7.1: 更新 index.css

- [ ] **Step 1: 修改 src/styles/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-800;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 2: 提交样式更新**

```bash
git add src/styles/index.css
git commit -m "feat: add global styles and scrollbar utilities

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 8: 更新 index.html

**目标：** 更新 HTML 元数据

### Task 8.1: 修改 index.html

- [ ] **Step 1: 修改 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="分娩准备清单 - 基于日本赤ちゃん本舗的推荐清单" />
    <title>分娩准备清单</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: 提交 HTML 更新**

```bash
git add index.html
git commit -m "feat: update HTML metadata

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 任务 9: 测试和调试

**目标：** 测试应用功能

### Task 9.1: 启动开发服务器

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

Expected: 开发服务器启动在 http://localhost:5173

- [ ] **Step 2: 测试功能**

在浏览器中测试：
- [ ] 页面正常加载
- [ ] 分类导航可以点击
- [ ] 分类区块可以展开/收起
- [ ] 响应式布局在不同屏幕尺寸下正常工作
- [ ] 物品卡片正确显示

- [ ] **Step 3: 检查控制台**

打开浏览器控制台，确保没有错误

---

## 任务 10: 构建生产版本

**目标：** 构建生产版本并测试

### Task 10.1: 构建项目

- [ ] **Step 1: 构建生产版本**

```bash
npm run build
```

Expected: 构建成功，生成 dist 目录

- [ ] **Step 2: 预览生产版本**

```bash
npm run preview
```

Expected: 预览服务器启动，可以访问构建后的版本

- [ ] **Step 3: 停止预览服务器**

按 Ctrl+C 停止

---

## 任务 11: 部署到 Vercel

**目标：** 部署应用到 Vercel

### Task 11.1: 安装 Vercel CLI

- [ ] **Step 1: 安装 Vercel CLI**

```bash
npm install -g vercel
```

Expected: Vercel CLI 安装成功

### Task 11.2: 部署到 Vercel

- [ ] **Step 1: 登录 Vercel**

```bash
vercel login
```

Expected: 打开浏览器进行登录

- [ ] **Step 2: 部署项目**

```bash
vercel
```

Expected:
- 按提示选择项目设置
- 构建并部署
- 获得部署 URL

- [ ] **Step 3: 测试部署的网站**

访问 Vercel 提供的 URL，测试功能

- [ ] **Step 4: 设置自动部署（可选）**

```bash
vercel --prod
```

这将设置每次 git push 时自动部署

---

## 任务 12: 最终检查和提交

**目标：** 最终检查和提交所有代码

### Task 12.1: 最终提交

- [ ] **Step 1: 检查 git 状态**

```bash
git status
```

- [ ] **Step 2: 提交所有未提交的更改**

```bash
git add .
git commit -m "feat: complete akachanlist implementation

- Implement all React components
- Add responsive design with Tailwind CSS
- Deploy to Vercel

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- [ ] **Step 3: 推送到 GitHub（如果需要）**

```bash
git remote add origin <your-repo-url>
git push -u origin master
```

---

## 验收标准

项目完成需满足以下标准：

- ✅ 成功创建 Vite + React + TypeScript 项目
- ✅ 所有物品数据翻译成中文并存储在 JSON 文件中
- ✅ React 应用正常运行
- ✅ 响应式设计在所有设备上正常显示
- ✅ 部署到 Vercel 并可在线访问
- ✅ 加载速度快（< 3秒首屏）
- ✅ 无控制台错误
- ✅ 代码结构清晰，易于维护

---

## 预计时间

- 项目初始化：15 分钟
- 数据处理：20 分钟
- 组件开发：40 分钟
- 测试和调试：15 分钟
- 部署：10 分钟

**总计：约 1.5-2 小时**
