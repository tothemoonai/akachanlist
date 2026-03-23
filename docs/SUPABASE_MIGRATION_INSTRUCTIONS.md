# 🔧 Supabase 数据库迁移指南

## ✅ 环境变量检查

您的 `.env.local` 文件已正确配置：
- ✅ `VITE_SUPABASE_URL`: https://wnyrinifinvgagbtlpwb.supabase.co
- ✅ `VITE_SUPABASE_ANON_KEY`: 已设置

---

## 📋 手动步骤（需要您完成）

### 步骤 1: 执行数据库迁移

1. **打开 Supabase SQL 编辑器：**
   - 访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/sql/new

2. **复制并执行迁移脚本：**
   - 打开文件：`supabase/migrations/003_add_user_lists.sql`
   - 复制全部内容（127行）
   - 粘贴到 Supabase SQL 编辑器
   - 点击 "Run" 按钮执行

3. **验证迁移成功：**
   在 SQL 编辑器中运行：
   ```sql
   SELECT COUNT(*) FROM user_lists;
   SELECT COUNT(*) FROM user_list_items;
   ```
   两条查询都应该返回 `0`（表已创建但为空）

---

### 步骤 2: 配置 Supabase 认证

1. **打开认证设置：**
   - 访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/templates

2. **验证邮件提供商已启用：**
   - 确认 "Email Provider" 状态为 "Enabled"

3. **检查邮件模板：**
   - 点击 "Email Templates" → "Magic Link" 或 "Email Link"
   - 确认模板配置正确

4. **配置重定向 URL：**

   在 **Authentication → URL Configuration** 中添加：

   **生产环境：**
   ```
   https://akachanlist.vercel.app/**
   ```

   **开发环境：**
   ```
   http://localhost:5173/**
   ```

   确保这两个 URL 都在 "Allowed Redirect URLs" 列表中。

5. **测试邮件发送（可选）：**
   - 如果有测试功能，发送一封测试邮件确认能收到

---

## 📝 迁移内容摘要

执行 `003_add_user_lists.sql` 将创建：

### 新增表：
1. **user_lists** - 用户清单表
   - 存储用户的个人清单
   - 支持公开分享（share_token）

2. **user_list_items** - 清单物品表
   - 存储每个清单中的物品
   - 记录优先级、数量、购买状态

### 安全策略（RLS）：
- ✅ 用户只能访问自己的清单
- ✅ 公开清单可通过 share_token 访问
- ✅ 所有操作都需要认证

### 索引优化：
- user_lists: user_id, share_token
- user_list_items: user_list_id, item_id, (user_list_id, is_purchased)

---

## 🔍 验证清单

完成上述步骤后，确认：

- [ ] SQL 迁移已执行成功
- [ ] `user_lists` 表存在且为空
- [ ] `user_list_items` 表存在且为空
- [ ] Email Provider 已启用
- [ ] 重定向 URL 已配置（生产 + 开发）
- [ ] .env.local 变量正确

---

## ✅ 完成后

完成这些步骤后，您可以：

1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:5173
3. 测试完整的用户认证和清单管理功能

---

## 🆘 遇到问题？

**迁移失败：**
- 检查是否有语法错误
- 确认之前的迁移（001, 002）已执行

**认证不工作：**
- 确认重定向 URL 正确（包括末尾的 `/**`）
- 检查垃圾邮件文件夹查找魔法链接邮件

**权限错误：**
- 验证 RLS 策略已创建
- 检查 Supabase 项目设置中的认证配置

---

*创建时间: 2026-03-23*
*项目: akachanlist - 分娩准备清单*
