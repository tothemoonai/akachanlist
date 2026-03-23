# 🚀 Supabase 快速设置指南

## ✅ 您使用的是正确的 Key 格式！

**您的 key：** `sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_`

**这是 Supabase 2025 年的新 API key 模型：**
- ✅ **publishable key** (`sb_publishable_...`) - 客户端使用
- ✅ **secret key** - 服务端使用

**旧的 `anon` key（`eyJ` 开头）正在被淘汰。**

参考：[Supabase API Keys 文档](https://supabase.com/docs/guides/api/api-keys)

---

## 📋 当前状态检查

### ✅ 本地开发环境

`.env.local` 文件已正确配置：

```bash
VITE_SUPABASE_URL=https://wnyrinifinvgagbtlpwb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_
```

### ⚠️ 需要检查

1. **重启开发服务器**（重要！）
   ```bash
   # 停止当前服务器（Ctrl+C）
   npm run dev
   ```

2. **确认环境变量已加载**
   - 打开浏览器控制台（F12）
   - 输入：`import.meta.env.VITE_SUPABASE_ANON_KEY`
   - 应该显示：`sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_`

---

## 🔧 Vercel 生产环境配置

### 步骤 1：在 Vercel 中配置环境变量

1. **打开 Vercel Dashboard：**
   - 访问：https://vercel.com/tothemoonais-projects/akachanlist/settings/environment-variables

2. **添加环境变量：**

   **变量 1：**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://wnyrinifinvgagbtlpwb.supabase.co`
   - **Environments**: 选择 **Production**, **Preview**, **Development**
   - 点击 "Save"

   **变量 2：**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_`
   - **Environments**: 选择 **Production**, **Preview**, **Development**
   - 点击 "Save"

3. **重新部署：**
   - 添加环境变量后，Vercel 会自动重新部署
   - 或者点击 "Redeploy" 按钮

---

## 📧 启用 Supabase 内置邮件服务

Supabase 提供免费的内置邮件服务，**无需 SMTP 配置**！

### 步骤 2：配置认证

1. **打开认证设置：**
   - 访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/templates

2. **确认 Email Provider 已启用：**
   - 找到 "Email Provider" 部分
   - 确认状态为 "Enabled"

3. **配置重定向 URL（必需！）：**
   - 在左侧菜单，找到 **"URL Configuration"**
   - 在 **"Allowed Redirect URLs"** 中添加：

     ```
     http://localhost:5173/**
     https://akachanlist.vercel.app/**
     ```

   - 点击 **"Save"**

**重要：** `/**` 是必需的，它允许所有路径！

---

## 🧪 测试登录功能

### 本地测试

1. **重启开发服务器：**
   ```bash
   npm run dev
   ```

2. **访问应用：**
   - http://localhost:5173

3. **发送测试邮件：**
   - 点击右上角 **"登录"** 按钮
   - 输入您的邮箱地址（使用真实邮箱，如 Gmail、Outlook）
   - 点击 **"发送链接"**

4. **检查邮箱：**
   - 查找来自 Supabase 的邮件
   - 发件人：`noreply@mail.supabase.io` 或类似
   - 主题："登录链接" 或 "Magic Link"
   - **如果没有收到，检查垃圾邮件文件夹！** 📧

5. **点击邮件中的链接：**
   - 自动跳转回应用
   - 验证登录成功：
     - 右上角显示您的邮箱
     - "登录"按钮变成"登出"
     - 显示"我的清单"按钮
     - 显示购物车图标

### 生产环境测试

1. **访问生产环境：**
   - https://akachanlist.vercel.app

2. **重复上述测试步骤**

---

## 🔍 故障排除

### 问题 1：仍然提示 "Supabase未配置"

**解决方案：**

1. **确认环境变量已加载：**
   ```bash
   # 在浏览器控制台输入
   import.meta.env.VITE_SUPABASE_URL
   import.meta.env.VITE_SUPABASE_ANON_KEY
   ```

   如果显示 `undefined`：
   - 确认 `.env.local` 文件存在且格式正确
   - 重启开发服务器（Ctrl+C 然后 `npm run dev`）
   - 清除浏览器缓存（Ctrl+Shift+R）

2. **检查 .env.local 文件：**
   - 确保文件名是 `.env.local`（不是 `.env` 或其他）
   - 确保在项目根目录
   - 确保没有多余的空格或引号

### 问题 2：收不到邮件

**解决方案：**

1. **检查垃圾邮件文件夹** 📧
2. **确认邮箱地址拼写正确**
3. **等待 1-2 分钟**
4. **使用主要邮箱服务商**（Gmail、Outlook、Yahoo 等）
5. **检查 Supabase 邮件日志：**
   - 访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/reports

### 问题 3：点击链接后没有登录

**解决方案：**

1. **确认重定向 URL 配置正确**（包括 `/**`）
2. **检查链接是否完整**（没有被截断）
3. **手动复制链接到浏览器**
4. **检查浏览器控制台是否有错误**

### 问题 4：Key 格式不对

**正确的格式：**

**新版（2025）：**
- ✅ `sb_publishable_...` （publishable key）
- ✅ `sb_secret_...` （secret key）

**旧版（已弃用）：**
- ⚠️ `eyJhbGci...` （anon key - JWT 格式）

**您应该使用新版格式！**

---

## 📚 Supabase API Keys 说明

### 2025 新模型

**Publishable Key：**
- 格式：`sb_publishable_...`
- 用途：客户端（浏览器、移动应用）
- 安全：可以公开暴露
- 限制：只能访问启用了 RLS 的数据

**Secret Key：**
- 格式：`sb_secret_...`
- 用途：服务端（API 路由、服务器函数）
- 安全：**绝不能暴露给客户端**
- 权限：绕过 RLS，完全访问权限

### 旧模型（已弃用）

**Anon Key：**
- 格式：`eyJhbGci...` （JWT）
- 状态：正在被淘汰
- 替代：使用 publishable key

**Service Role Key：**
- 格式：`eyJhbGci...` （JWT）
- 状态：正在被淘汰
- 替代：使用 secret key

**参考文档：**
- [Understanding API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Upcoming changes to API Keys](https://github.com/orgs/supabase/discussions/29260)
- [Supabase Security 2025 Retro](https://supabase.com/blog/supabase-security-2025-retro)

---

## ✅ 验证清单

完成以下检查：

### 本地环境
- [ ] `.env.local` 文件存在
- [ ] `VITE_SUPABASE_ANON_KEY` 是 `sb_publishable_...` 格式
- [ ] 开发服务器已重启（`npm run dev`）
- [ ] 浏览器控制台能读取环境变量
- [ ] Email Provider 已启用
- [ ] 重定向 URL 已配置（包括 `/**`）
- [ ] 能收到魔法链接邮件
- [ ] 点击邮件链接后成功登录

### 生产环境
- [ ] Vercel 环境变量已配置
- [ ] Vercel 已重新部署
- [ ] 生产环境能正常登录
- [ ] 邮件功能正常工作

---

## 🎯 下一步

完成上述步骤后：

1. **测试认证功能** ✅
   - 登录/登出
   - 邮件魔法链接

2. **执行数据库迁移** 📊
   - 参考：`SUPABASE_MIGRATION_INSTRUCTIONS.md`

3. **测试清单管理** 📝
   - 创建清单
   - 添加物品
   - 购物清单

4. **完整测试** 🧪
   - 参考：`TESTING_GUIDE.md`

---

## 📞 需要帮助？

**Supabase 文档：**
- [Auth](https://supabase.com/docs/guides/auth)
- [Email Auth](https://supabase.com/docs/guides/auth/social-login/auth-magic-link)
- [API Keys](https://supabase.com/docs/guides/api/api-keys)

**项目文档：**
- `IMPLEMENTATION_COMPLETE.md` - 完整项目总结
- `DEPLOYMENT_SUMMARY.md` - 部署信息
- `TESTING_GUIDE.md` - 测试指南
- `SUPABASE_MIGRATION_INSTRUCTIONS.md` - 数据库迁移

---

*最后更新: 2026-03-23*
*项目: akachanlist*
*Supabase API Keys 版本: 2025 新模型（publishable/secret）*
