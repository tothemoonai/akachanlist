# 🚀 Supabase 快速设置指南

## ⚠️ 当前问题

**错误提示：** "Supabase未配置"

**原因：** `.env.local` 中的 `VITE_SUPABASE_ANON_KEY` 格式不正确

---

## 📝 步骤 1：获取正确的 API Keys

### 1.1 打开 Supabase API Settings

访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/settings/api

### 1.2 复制 Keys

您会看到三个 key：

1. **Project URL** ✅
   ```
   https://wnyrinifinvgagbtlpwb.supabase.co
   ```

2. **anon public** ⭐ **重要！复制这个！**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...（很长）
   ```
   - 以 `eyJ` 开头
   - 约 200-300 字符
   - 这是用于客户端的公开 key

3. **service_role** ❌ **不要复制！**
   - 这是管理员 key，不要用在客户端！

### 1.3 更新 .env.local

打开文件：`.env.local`

替换为：

```bash
VITE_SUPABASE_URL=https://wnyrinifinvgagbtlpwb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZXYiLCJyZWYiOiJ3bnlyaW5pZmludmFnYWd0bHB3YiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM5MTUyMjQwLCJleHAiOjIwOTQ3Mjg0NDB9.YOUR_ACTUAL_KEY_HERE
```

**注意：** 将 `YOUR_ACTUAL_KEY_HERE` 替换为您从 Dashboard 复制的完整 key！

### 1.4 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

---

## 📧 步骤 2：启用 Supabase 内置邮件服务

Supabase 提供免费的内置邮件服务，**无需配置 SMTP**！

### 2.1 打开认证设置

访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/templates

### 2.2 验证 Email Provider

确认 **"Email Provider"** 状态为 **"Enabled"**

如果未启用：
1. 找到 "Email Provider" 部分
2. 点击 "Enable"
3. 确认启用

### 2.3 配置邮件模板（可选但推荐）

#### 2.3.1 Magic Link 邮件模板

1. 点击 **"Email Templates"**
2. 选择 **"Magic Link"** 或 **"Email Link"**
3. 您会看到默认模板

#### 2.3.2 自定义邮件内容（可选）

**中文版示例：**

**Subject:**
```
登录链接 - 赤ちゃんリスト
```

**Body:**
```html
<h2>欢迎回来！</h2>

<p>点击下面的按钮登录：</p>

<p><a href="{{ .ConfirmationURL }}">点击这里登录</a></p>

<p>或者复制此链接到浏览器：</p>
<p>{{ .ConfirmationURL }}</p>

<p>此链接将在 24 小时后过期。</p>

<hr>
<p>如果您没有请求此邮件，请忽略它。</p>
```

**日文版示例：**

**Subject:**
```
ログインリンク - 赤ちゃんリスト
```

**Body:**
```html
<h2>おかえりなさい！</h2>

<p>下のボタンをクリックしてログインしてください：</p>

<p><a href="{{ .ConfirmationURL }}">ここをクリックしてログイン</a></p>

<p>または、このリンクをブラウザにコピーしてください：</p>
<p>{{ .ConfirmationURL }}</p>

<p>このリンクは24時間後に期限切れになります。</p>

<hr>
<p>このメールをリクエストしていない場合は、無視してください。</p>
```

4. 点击 **"Save"** 保存

### 2.4 配置重定向 URL（必需！）

1. 在左侧菜单，找到 **"URL Configuration"**
2. 在 **"Allowed Redirect URLs"** 中添加：

   ```
   http://localhost:5173/**
   https://akachanlist.vercel.app/**
   ```

3. 点击 **"Save"**

**重要：** `/**` 是必需的，它允许所有路径！

---

## 🧪 步骤 3：测试邮件登录

### 3.1 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5173

### 3.2 发送测试邮件

1. 点击右上角 **"登录"** 按钮
2. 输入您的邮箱地址
   - 建议：使用真实邮箱（Gmail、Outlook 等）
   - 不要使用临时邮箱（可能收不到）
3. 点击 **"发送登录链接"**

### 3.3 检查邮箱

1. 打开您的邮箱
2. 查找来自 Supabase 的邮件
   - 发件人：`noreply@mail.supabase.io` 或类似
   - 主题："登录链接" 或 "Magic Link"
3. 如果没收到：
   - 检查垃圾邮件文件夹 📧
   - 等待 1-2 分钟
   - 确认邮箱地址正确

### 3.4 点击链接登录

1. 点击邮件中的链接或按钮
2. 自动跳转到应用
3. 验证登录成功：
   - 右上角显示您的邮箱
   - "登录"按钮变成"登出"
   - 显示"我的清单"按钮
   - 显示购物车图标

---

## ✅ 验证清单

完成以下检查：

- [ ] `.env.local` 中的 `VITE_SUPABASE_ANON_KEY` 以 `eyJ` 开头且很长
- [ ] 开发服务器已重启（`npm run dev`）
- [ ] Supabase Dashboard 中 Email Provider 已启用
- [ ] 重定向 URL 已配置（包括 `/**`）
- [ ] 能成功发送魔法链接邮件
- [ ] 能收到邮件（检查垃圾邮件）
- [ ] 点击邮件链接后成功登录

---

## 🆘 常见问题

### Q1: 仍然提示 "Supabase未配置"

**解决方案：**
1. 确认 `.env.local` 中的 key 正确（以 `eyJ` 开头）
2. 重启开发服务器（Ctrl+C 停止，然后 `npm run dev`）
3. 清除浏览器缓存（Ctrl+Shift+R）

### Q2: 收不到邮件

**解决方案：**
1. 检查垃圾邮件文件夹
2. 确认邮箱地址拼写正确
3. 等待 1-2 分钟
4. 尝试使用 Gmail 或 Outlook 等主要邮箱服务商
5. 在 Supabase Dashboard 查看邮件发送日志（Authentication → Reports）

### Q3: 点击链接后没有登录

**解决方案：**
1. 确认重定向 URL 配置正确（包括 `/**`）
2. 检查链接是否完整（没有被截断）
3. 尝试在浏览器中手动打开链接
4. 检查浏览器控制台是否有错误

### Q4: 想用自己的 SMTP 服务器

**可选配置：**
1. 访问：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/templates
2. 在 "Email Provider" 部分
3. 选择 "Custom SMTP"
4. 输入您的 SMTP 服务器信息

**但对于测试，内置邮件服务已经足够！**

---

## 📊 Supabase 免费邮件限制

**免费计划：**
- **每天：** 3-4 封邮件/小时（约 100 封/天）
- **用于测试：** 完全足够
- **生产环境：** 可考虑升级或使用自定义 SMTP

**邮件发送状态：**
- 查看日志：https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/reports

---

## 🎯 下一步

完成上述步骤后：

1. **测试认证功能** - 确保登录正常工作
2. **执行数据库迁移** - 创建 user_lists 表
3. **测试清单管理** - 创建和管理个人清单
4. **测试购物清单** - 添加物品和购买追踪

**详细指南：**
- `SUPABASE_MIGRATION_INSTRUCTIONS.md` - 数据库迁移
- `TESTING_GUIDE.md` - 完整测试清单

---

## 📞 需要帮助？

**Supabase 文档：**
- Auth: https://supabase.com/docs/guides/auth
- Email Auth: https://supabase.com/docs/guides/auth/social-login/auth-magic-link

**项目文档：**
- `IMPLEMENTATION_COMPLETE.md` - 完整项目总结
- `DEPLOYMENT_SUMMARY.md` - 部署信息

---

*最后更新: 2026-03-23*
*项目: akachanlist*
