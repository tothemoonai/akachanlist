# 分娩准备清单中文版 - 设计文档

**项目名称：** akachanlist
**日期：** 2026-03-20
**设计者：** Claude
**状态：** 设计阶段

---

## 1. 项目概述

### 1.1 目标
复制日本婴儿用品网站"赤ちゃん本舗"（akachan.jp）的分娩准备清单页面，创建一个中文版静态网站，用于个人参考。

### 1.2 需求总结
- **用途：** 个人参考使用
- **翻译：** 使用大模型进行机器翻译
- **样式：** 重新设计，现代化的 UI
- **技术：** React + Tailwind CSS + Vite
- **部署：** Vercel 在线部署
- **特性：** 响应式设计，适配所有设备

### 1.3 原始网站
- URL: `https://www.akachan.jp/junbilist/childbirth/`
- 内容：分娩准备物品清单，包含产前用品、入院准备、产后用品、婴儿用品等
- 数据量：已抓取，239KB markdown 内容

---

## 2. 技术架构

### 2.1 技术栈
- **前端框架：** React 18
- **构建工具：** Vite 5
- **样式系统：** Tailwind CSS 3.4
- **图标库：** Lucide React
- **部署平台：** Vercel
- **版本控制：** Git

### 2.2 项目结构
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
│   ├── pages/
│   │   └── Home.tsx            # 主页面
│   ├── styles/
│   │   └── index.css           # Tailwind 入口
│   ├── main.tsx                # 应用入口
│   └── App.tsx                 # 根组件
├── public/                     # 静态资源
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 2.3 设计原则
1. **组件化：** 每个 UI 区块都是独立的可复用组件
2. **数据驱动：** 所有物品数据存储在 JSON 文件中，易于修改和更新
3. **响应式优先：** 使用 Tailwind 的移动优先断点系统
4. **性能优化：** 代码分割、懒加载、资源压缩
5. **简洁性：** 避免过度工程化，保持代码简单清晰

---

## 3. 数据处理流程

### 3.1 数据流程图
```
原始网页
    ↓
Firecrawl 抓取 → .firecrawl/akachan-page.md (239KB)
    ↓
解析和结构化 → 提取物品信息（名称、分类、优先级）
    ↓
大模型批量翻译 → 一次性发送所有内容进行翻译
    ↓
生成 JSON → src/data/items.json
    ↓
React 组件渲染
```

### 3.2 数据结构设计
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
              "quantity": "按需准备",
              "notes": ""
            }
          ]
        }
      ]
    }
  ]
}
```

### 3.3 翻译策略

#### 翻译提示词
```
请将以下日本婴儿用品清单翻译成简体中文：

翻译要求：
1. 保持专业术语的准确性
   - "マタニティブラ" → "哺乳文胸"
   - "産褥ショーツ" → "产后短裤"
   - "おむつ" → "纸尿裤"
2. 优先级标识：
   - "必要" → "必需"（priority: "required"）
   - "あれば便利" → "推荐"（priority: "recommended"）
3. 保持语气友好、适合父母阅读
4. 保留物品的数量和分类信息
5. 如果某些品牌名称没有中文翻译，保留原文

待翻译内容：
[在此处插入从 markdown 中提取的所有文本]
```

#### 翻译质量保证
- 保存翻译前后的对比文件
- 标记无法翻译的专有名词
- 如果翻译失败，保留原文并标记

---

## 4. UI/UX 设计

### 4.1 设计风格
- **整体风格：** 温馨、柔和、现代、适合父母阅读
- **视觉语言：** 扁平化设计，轻微阴影，圆角卡片
- **交互反馈：** Hover 效果，平滑滚动，骨架屏加载

### 4.2 颜色方案
```css
/* Tailwind CSS 类名映射 */
主背景色：    bg-pink-50     #fdf2f8  /* 极淡粉色 */
次背景色：    bg-white       #ffffff  /* 纯白卡片 */
主要文字：    text-gray-800  #1f2937  /* 深灰 */
次要文字：    text-gray-600  #4b5563  /* 中灰 */

必需标签：    bg-blue-500    #3b82f6  /* 蓝色 */
推荐标签：    bg-green-500   #22c55e  /* 绿色 */

主色调：      pink-500       #ec4899  /* 粉色 */
辅助色：      amber-500      #f59e0b  /* 琥珀色 */
```

### 4.3 响应式断点
```
移动端（默认）:  < 640px   单列布局，横向滚动导航
平板（sm:）:     ≥ 640px   两列网格布局
桌面（lg:）:     ≥ 1024px  三列网格布局，固定导航
大屏（xl:）:     ≥ 1280px  四列网格布局
```

### 4.4 页面布局结构
```
┌─────────────────────────────────────┐
│  Header (固定顶部)                   │
│  ├─ 标题：分娩准备清单               │
│  └─ 副标题：基于日本...              │
├─────────────────────────────────────┤
│  CategoryNav (粘性导航)              │
│  [产前] [入院] [产后] [婴儿0-3月]... │
├─────────────────────────────────────┤
│                                     │
│  CategorySection (可折叠区块)        │
│  ├─ 分类标题 + 物品数量              │
│  ├─ 物品网格 (ItemCard)              │
│  │   ├─ 优先级标签                   │
│  │   ├─ 物品名称                     │
│  │   ├─ 描述信息                     │
│  │   └─ 数量建议                     │
│  └─ [展开/收起] 按钮                 │
│                                     │
└─────────────────────────────────────┘
│  Footer                              │
│  └─ 免责声明 + 数据来源              │
└─────────────────────────────────────┘
```

---

## 5. 组件设计

### 5.1 Header 组件
```tsx
interface HeaderProps {
  title: string;
  subtitle: string;
}

功能：
- 固定在页面顶部 (sticky top-0)
- 包含主标题和副标题
- 淡粉色背景，底部阴影
- z-index: 50，确保在其他内容之上
```

### 5.2 CategoryNav 组件
```tsx
interface CategoryNavProps {
  categories: Category[];
  onCategoryClick: (id: string) => void;
}

功能：
- 粘性导航 (sticky)
- 移动端：横向滚动，隐藏滚动条
- 桌面端：自动换行
- 点击平滑滚动到对应分类
- 高亮当前可见的分类
```

### 5.3 CategorySection 组件
```tsx
interface CategorySectionProps {
  category: Category;
  defaultExpanded?: boolean;
}

功能：
- 可折叠的分类区块
- 显示分类标题和物品数量
- 折叠/展开动画
- 默认展开第一个分类
```

### 5.4 ItemCard 组件
```tsx
interface ItemCardProps {
  item: Item;
}

功能：
- 显示优先级标签（必需/推荐）
- 物品名称（加粗）
- 描述信息（次要文字）
- 数量建议
- hover 效果（阴影加深）
- 响应式宽度（根据断点）
```

### 5.5 Footer 组件
```tsx
interface FooterProps {
  source: string;
  disclaimer: string;
}

功能：
- 显示数据来源
- 免责声明（仅供参考）
- 简洁的设计
```

---

## 6. 错误处理和加载状态

### 6.1 数据加载状态
```tsx
// 加载中
<SkeletonLoader count={6} />

// 加载失败
<ErrorAlert
  message="无法加载数据"
  onRetry={handleRetry}
/>

// 空数据
<EmptyState
  message="暂无物品数据"
  icon="package"
/>
```

### 6.2 翻译错误处理
- 保存原始日文内容
- 标记翻译失败的条目
- 提供手动翻译的接口

### 6.3 网络错误
- 显示友好的错误提示
- 提供重试按钮
- 离线时显示缓存内容（如果可用）

---

## 7. 性能优化

### 7.1 代码分割
```tsx
// 使用 React.lazy 进行懒加载
const CategorySection = lazy(() => import('./components/CategorySection'));
```

### 7.2 图片优化
- 使用现代图片格式（WebP）
- 懒加载图片
- 响应式图片（srcset）

### 7.3 CSS 优化
- Tailwind 自动清除未使用的样式
- CSS 代码分割
- 关键 CSS 内联

### 7.4 构建优化
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react']
        }
      }
    }
  }
}
```

---

## 8. 部署策略

### 8.1 Vercel 部署
```bash
# 构建命令
npm run build

# 输出目录
dist/

# 环境变量（无需配置）

# 自动部署
git push → Vercel 自动构建和部署
```

### 8.2 域名配置
- 使用 Vercel 提供的免费域名：`akachanlist.vercel.app`
- 可选：绑定自定义域名

### 8.3 性能监控
- Vercel Analytics（可选）
- Web Vitals 监控

---

## 9. 实施计划

### 9.1 开发阶段
1. **阶段 1：项目初始化**
   - 创建 Vite + React 项目
   - 配置 Tailwind CSS
   - 设置项目结构

2. **阶段 2：数据处理**
   - 解析抓取的 markdown 内容
   - 提取物品信息并结构化
   - 使用大模型翻译内容
   - 生成 items.json

3. **阶段 3：组件开发**
   - 实现 Header 组件
   - 实现 CategoryNav 组件
   - 实现 CategorySection 组件
   - 实现 ItemCard 组件
   - 实现 Footer 组件

4. **阶段 4：样式和响应式**
   - 应用 Tailwind 样式
   - 实现响应式布局
   - 添加动画和过渡效果

5. **阶段 5：测试和优化**
   - 测试所有设备尺寸
   - 性能优化
   - 错误处理测试

6. **阶段 6：部署**
   - 部署到 Vercel
   - 验证在线功能
   - 配置自定义域名（可选）

### 9.2 时间估算
- 总计：2-3 小时
- 项目初始化：30 分钟
- 数据处理：30 分钟
- 组件开发：1 小时
- 样式和测试：30 分钟

---

## 10. 风险和限制

### 10.1 风险
1. **翻译质量：** 机器翻译可能不准确，需要人工校对
2. **版权问题：** 内容来自日本网站，仅限个人使用
3. **数据更新：** 原网站更新后，需要重新抓取和翻译

### 10.2 限制
1. **功能限制：** 无登录、购买、保存等功能
2. **语言限制：** 仅中文版，无日文/英文切换
3. **浏览器兼容性：** 现代浏览器（Chrome, Firefox, Safari, Edge）

---

## 11. 未来改进（可选）

- 添加搜索功能
- 添加物品筛选功能
- 添加"已购买"标记功能
- 支持导出为 PDF
- 添加物品链接（如果需要）
- 多语言支持
- PWA 支持（离线访问）

---

## 12. 验收标准

项目完成需满足以下标准：

1. ✅ 成功抓取原始网站内容
2. ✅ 所有内容翻译成中文
3. ✅ React 应用正常运行
4. ✅ 响应式设计在所有设备上正常显示
5. ✅ 部署到 Vercel 并可在线访问
6. ✅ 加载速度快（< 3秒首屏）
7. ✅ 无控制台错误
8. ✅ 代码结构清晰，易于维护

---

**文档版本：** 1.0
**最后更新：** 2026-03-20
