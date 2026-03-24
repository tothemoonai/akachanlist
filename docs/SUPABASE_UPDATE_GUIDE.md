# 使用 Node.js 更新 Supabase 数据库指南

## 📋 概述

本文档记录如何使用 Node.js 脚本直接更新 Supabase 数据库中的数据。

## 🔑 密钥说明

### Publishable Key (公开密钥)
- 格式：`sb_publishable_...`
- 用途：**前端使用**（React 应用、网页）
- 权限：受 RLS 保护，只能读取公开数据
- 安全性：✅ 可以安全地暴露在代码中

### Secret Key (私密密钥)
- 格式：`sb_secret_...`
- 用途：**仅后端使用**（Node.js 脚本、服务器、API）
- 权限：绕过 RLS，完全访问数据库
- 安全性：❌ **绝不要**提交到 Git 或公开暴露
- 示例：`sb_secret_YOUR_KEY_HERE` (不要在文档中使用真实密钥)

## 📂 目录结构

```
akachanlist/
├── .env.local                    # 本地环境变量（不提交到 Git）
├── scripts/
│   ├── update-supabase-icons.js  # 更新商品图标
│   ├── check-supabase-data.js    # 检查数据库内容
│   └── test-update.js            # 测试单个更新
└── docs/
    └── SUPABASE_UPDATE_GUIDE.md  # 本文档
```

## 🔧 环境配置

### 1. 设置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...        # 前端使用
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_...     # 后端脚本使用
```

### 2. 确保 .gitignore 包含

```gitignore
.env.local
.env*.local
```

## 📝 使用脚本

### 更新商品图标

```bash
# 设置环境变量（如果未设置）
export VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# 运行更新脚本
node scripts/update-supabase-icons.js
```

### 检查数据库内容

```bash
node scripts/check-supabase-data.js
```

### 测试单个更新

```bash
node scripts/test-update.js
```

## 💡 脚本示例

### 基本结构

```javascript
import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// 创建客户端（使用 Secret Key）
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateData() {
  // 读取数据
  const { data, error } = await supabase
    .from('table_name')
    .select('*');

  if (error) {
    console.error('查询失败:', error);
    return;
  }

  // 更新数据
  for (const item of data) {
    await supabase
      .from('table_name')
      .update({ field: 'new_value' })
      .eq('id', item.id);
  }
}

updateData();
```

## ⚠️ 安全注意事项

### ✅ 正确做法

1. **Secret Key 只在本地使用**
   ```bash
   # 本地运行脚本
   node scripts/update-supabase-icons.js
   ```

2. **从环境变量读取**
   ```javascript
   const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
   ```

3. **提交前检查**
   ```bash
   # 确认 .env.local 在 .gitignore 中
   grep .env.local .gitignore
   ```

### ❌ 错误做法

1. ❌ 硬编码 Secret Key
   ```javascript
   // 错误！不要这样做
   const key = 'sb_secret_YOUR_SECRET_KEY_HERE';
   ```

2. ❌ 提交到 Git
   ```bash
   # 确保不会发生
   git add .env.local  # ❌ 永远不要这样做
   ```

3. ❌ 在前端代码中使用
   ```javascript
   // src/lib/supabase.ts
   // 错误！前端应该使用 ANON_KEY
   const key = 'sb_secret_...';
   ```

## 🔍 常见问题

### Q1: 为什么更新请求返回成功，但数据没变？

**A**: 你可能使用的是 Publishable Key 而不是 Secret Key。Publishable Key 受 RLS 限制，无法更新数据。

**解决**: 确保使用 `VITE_SUPABASE_SERVICE_ROLE_KEY`。

### Q2: 如何验证 Secret Key 是否泄露？

**A**: 运行以下命令检查：

```bash
# 检查 Git 历史
git log --all --full-history -S "sb_secret_" --source

# 检查前端代码
grep -r "sb_secret_" src/
```

如果没有任何输出，说明 Secret Key 安全。

### Q3: 生产环境如何使用？

**A**: 生产环境不需要 Secret Key：

- **前端**：使用 Publishable Key 读取数据
- **后端脚本**：在本地或服务器上运行更新脚本
- **Edge Functions**：在 Vercel 环境变量中配置 Secret Key

## 📚 相关资源

- [Supabase 密钥文档](https://supabase.com/docs/guides/platform/api-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [环境变量最佳实践](https://create.t3.gg/en/usage/env-variables)

## 🔄 历史记录

- 2026-03-24: 创建文档，记录商品图标更新流程
