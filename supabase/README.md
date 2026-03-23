# Supabase 数据库设置指南

本指南将帮助你设置 Supabase 数据库以支持 akachanlist 项目的多语言功能。

## 前置要求

- Supabase 账号（免费即可）
- Node.js 已安装

## 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写信息：
   - **Name**: akachanlist (或任意名称)
   - **Database Password**: 设置一个强密码（保存好，后续需要）
   - **Region**: 选择距离你最近的区域（如 Northeast Asia (Tokyo)）
4. 点击 "Create new project"
5. 等待项目创建完成（约 2-3 分钟）

## 步骤 2: 获取 API 密钥

1. 在 Supabase Dashboard 中，进入你的项目
2. 点击左侧菜单的 **Settings** → **API**
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...`

## 步骤 3: 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase Configuration
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

示例：
```bash
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 步骤 4: 执行数据库迁移

### 方法 1: 使用 Supabase Dashboard（推荐）

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 "New Query"
3. 复制 `supabase/migrations/001_initial_schema.sql` 文件的内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 或按 `Ctrl+Enter`
6. 等待执行完成（应该看到 "Success" 消息）

### 方法 2: 使用 CLI（可选）

如果你安装了 Supabase CLI：

```bash
# 安装 Supabase CLI（如果没有）
npm install -g supabase

# 链接到你的项目
supabase link --project-ref 你的项目ID

# 执行迁移
supabase db push
```

## 步骤 5: 导入数据

### 准备工作

需要获取 **service_role** 密钥（有完全访问权限）：

1. 在 Supabase Dashboard → **Settings** → **API**
2. 找到 **Project API keys** 部分
3. 复制 **service_role** 密钥（注意：这个密钥有完全权限，要保密！）

### 执行数据迁移脚本

```bash
# 安装依赖（如果还没有）
npm install

# 设置 service role 密钥（临时）
export SUPABASE_SERVICE_KEY=你的service_role密钥

# 运行迁移脚本
npx tsx supabase/scripts/migrate.ts
```

或者在 Windows PowerShell 中：

```powershell
$env:SUPABASE_SERVICE_KEY="你的service_role密钥"
npx tsx supabase/scripts/migrate.ts
```

## 步骤 6: 验证安装

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:5173

3. 打开浏览器控制台（F12），应该看到：
   - ✅ 没有 "Missing required Supabase environment variables" 错误
   - ✅ 数据从 Supabase 正常加载

4. 测试语言切换功能：
   - 点击右上角语言按钮
   - URL 应该更新（`?lang=zh` / `?lang=ja`）
   - 页面内容应该正确切换

## 步骤 7: 在 Supabase 中查看数据

1. 在 Supabase Dashboard 中，点击 **Table Editor**
2. 你应该看到 4 个表：
   - `projects` (1 条记录)
   - `categories` (4 条记录)
   - `subcategories` (13 条记录)
   - `items` (63 条记录)

3. 点击任意表查看数据：
   - 所有字段都有中英文版本
   - `name_zh` / `name_ja`
   - `description_zh` / `description_ja`
   - 等等

## 常见问题

### Q: 迁移脚本失败 "Permission denied"
**A:** 确保使用的是 `service_role` 密钥，而不是 `anon` 密钥。`service_role` 有绕过 RLS 的完全访问权限。

### Q: 页面显示空白
**A:** 检查浏览器控制台错误。常见原因：
- 环境变量未正确设置
- Supabase 项目未创建
- 数据库表未创建
- RLS 策略阻止了访问

### Q: 如何更新数据？
**A:** 有两种方法：
1. **通过 Supabase Dashboard**: Table Editor → 手动编辑
2. **通过 SQL**: SQL Editor → 编写 UPDATE 语句
3. **通过脚本**: 修改 `migrate.ts` 并重新运行（会插入重复数据，需要先清理）

### Q: 如何备份/恢复数据？
**A:**
- **备份**: Supabase Dashboard → Database → Backups → 创建备份
- **恢复**: 从备份点恢复
- **导出**: SQL Editor → 导出表数据为 SQL

### Q: 数据可以离线使用吗？
**A:** 可以！应用有自动降级机制：
- 如果 Supabase 不可用，自动使用本地 JSON 文件
- 本地文件位于 `public/data/items-zh.json` 和 `public/data/items-ja.json`

## 安全建议

1. **永远不要**在客户端代码中使用 `service_role` 密钥
2. **永远不要**将 `.env.local` 提交到 Git
3. 确保 `.gitignore` 包含 `*.local` 和 `.env*`
4. 定期更新 Supabase 项目密码
5. 监控 Supabase 项目的使用情况

## 下一步

完成设置后，你可以：
- ✅ 通过 Supabase Dashboard 管理数据
- ✅ 添加实时订阅功能
- ✅ 添加用户认证
- ✅ 设置数据库备份
- ✅ 查看使用分析

## 需要帮助？

如果遇到问题：
1. 检查 Supabase Dashboard 中的日志
2. 查看浏览器控制台错误
3. 检查网络请求（Network 标签）
4. 参考 Supabase 文档: https://supabase.com/docs

---

**提示**: 完成设置后，你可以删除或忽略 `supabase/` 目录中的脚本文件。应用已经配置好使用 Supabase 了！
