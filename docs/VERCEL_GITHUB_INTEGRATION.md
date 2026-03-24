# Vercel 与 GitHub 集成配置

## 📋 概述

项目通过 Git 工作流连接到 Vercel，实现自动部署。

## 🔗 连接配置

### GitHub 仓库
- **仓库**: https://github.com/tothemoonai/akachanlist
- **主分支**: `master`
- **功能分支**: `feature/item-notes-and-icons`

### Vercel 项目
- **项目名**: akachanlist
- **团队**: tothemoonais-projects
- **生产域名**: https://akachanlist.vercel.app

## 🚀 部署流程

### 1. Production 部署（主分支）

```bash
# 切换到主分支
git checkout master

# 合并功能分支
git merge feature/item-notes-and-icons

# 推送到 GitHub
git push origin master
```

**自动触发**: Vercel 自动部署到 Production 环境

**部署 URL**:
- 主域名: https://akachanlist.vercel.app
- 部署 URL: https://akachanlist-{hash}-tothemoonais-projects.vercel.app

---

### 2. Preview 部署（功能分支）

```bash
# 在功能分支上工作
git checkout feature/item-notes-and-icons

# 进行更改并提交
git add .
git commit -m "feat: some feature"

# 推送到 GitHub
git push origin feature/item-notes-and-icons
```

**自动触发**: Vercel 自动创建 Preview 部署

**部署 URL**:
- Preview: https://akachanlist-{hash}-tothemoonais-projects.vercel.app

---

### 3. 本地部署到 Production

```bash
# 使用 Vercel CLI 直接部署到生产环境
vercel --prod
```

**注意**: 这会绕过 GitHub，直接部署到 Vercel

---

## 📊 部署环境对比

| 环境 | 触发方式 | URL 格式 | 用途 |
|------|---------|---------|------|
| **Production** | 推送到 `master` 分支 | `akachanlist.vercel.app` | 生产环境，用户访问 |
| **Preview** | 推送到功能分支 | `akachanlist-{hash}.vercel.app` | 预览环境，测试新功能 |

---

## 🔍 查看部署状态

### 使用 Vercel CLI

```bash
# 列出所有部署
vercel ls

# 查看最新部署
vercel ls --yes

# 查看特定部署的日志
vercel inspect {deployment-url}
```

### 使用 Vercel Dashboard

访问: https://vercel.com/tothemoonais-projects/akachanlist/deployments

---

## 🛠️ 当前配置

### Git 工作流

1. **功能开发** → `feature/item-notes-and-icons` 分支
2. **测试验证** → Preview 部署自动创建
3. **合并到主分支** → 推送到 `master`
4. **生产部署** → Production 自动更新

### 环境变量

| 变量名 | 用途 | 环境 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase API 地址 | All |
| `VITE_SUPABASE_ANON_KEY` | Supabase 公开密钥 | All |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase 管理密钥 | Local only |

---

## 📝 最佳实践

### ✅ 推荐做法

1. **功能分支工作流**
   - 在功能分支开发新功能
   - 使用 Preview 部署测试
   - 确认无误后合并到主分支

2. **提交信息规范**
   ```bash
   feat: 新功能
   fix: 修复问题
   docs: 文档更新
   ```

3. **部署前检查**
   - 本地测试通过
   - 代码审查完成
   - 环境变量配置正确

### ❌ 避免做法

1. ❌ 直接推送到 `master` 分支（跳过测试）
2. ❌ 在生产环境测试新功能
3. ❌ 提交敏感信息到 Git

---

## 🔗 相关链接

- **Vercel Dashboard**: https://vercel.com/tothemoonais-projects/akachanlist
- **GitHub 仓库**: https://github.com/tothemoonai/akachanlist
- **生产环境**: https://akachanlist.vercel.app

---

## 📚 相关文档

- [Vercel Git 集成](https://vercel.com/docs/deployments/overview)
- [Git 工作流程](./GIT_WORKFLOW.md)
- [环境变量配置](./ENV_SETUP.md)

---

## 🔄 更新历史

- 2026-03-24: 创建文档，记录 Vercel 与 GitHub 集成配置
- 2026-03-24: 添加图标更新功能，使用独立商品图标
