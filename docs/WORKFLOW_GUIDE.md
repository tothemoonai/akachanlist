# 🚀 开发工作流程指南

## 📋 工作流程概述

```
┌─────────────────┐
│  feature/*      │ ← 开发新功能
│  (Preview)      │ ← 自动创建预览部署
└────────┬────────┘
         │ 测试通过
         ↓
┌─────────────────┐
│  staging        │ ← 集成测试环境
│  (Preview)      │ ← 团队内部测试
└────────┬────────┘
         │ 测试通过
         ↓
┌─────────────────┐
│  master         │ ← 生产环境
│  (Production)   │ ← https://akachanlist.vercel.app
└─────────────────┘
```

## 🎯 核心原则

### 1. 生产环境保持稳定
- ✅ **master 分支**：生产环境，永远保持可用
- ✅ **不直接在 master 开发**：所有开发都在 feature 分支
- ✅ **通过 PR 合并**：代码审查后合并

### 2. 新功能先在 Preview 测试
- ✅ **feature 分支**：自动创建预览部署
- ✅ **预览 URL 测试**：功能验证后再合并
- ✅ **不影响生产**：预览环境独立运行

### 3. 分层测试
- **Preview 环境**：功能开发测试
- **Staging 环境**：集成测试
- **Production 环境**：面向用户

## 🔄 标准开发流程

### 步骤 1：创建功能分支

```bash
# 确保本地 staging 是最新的
git checkout staging
git pull origin staging

# 创建功能分支
git checkout -b feature/your-feature-name

# 示例：
git checkout -b feature/add-user-favorites
git checkout -b feature/improve-mobile-layout
git checkout -b fix/shopping-list-sync
```

### 步骤 2：开发和本地测试

```bash
# 进行开发...
# 修改文件、添加功能等

# 本地测试
npm run dev

# 提交更改
git add .
git commit -m "feat: 描述你的功能"
```

### 步骤 3：推送到远程（自动创建 Preview 部署）

```bash
git push origin feature/your-feature-name
```

**Vercel 会自动：**
- ✅ 检测到新的分支推送
- ✅ 创建预览部署
- ✅ 生成预览 URL：`https://akachanlist-xxx.vercel.app`
- ✅ 在 PR 中添加评论（如果创建了 PR）

### 步骤 4：在预览环境测试

1. **查看预览 URL**
   ```bash
   vercel ls | grep Preview
   ```

2. **访问预览环境**
   - 使用预览 URL 测试新功能
   - 验证功能正常工作
   - 检查是否有 bug

3. **修复问题**（如果需要）
   ```bash
   # 继续在功能分支开发
   git add .
   git commit -m "fix: 修复问题"
   git push origin feature/your-feature-name
   # 预览部署会自动更新
   ```

### 步骤 5：创建 Pull Request（可选但推荐）

```bash
# 使用 GitHub CLI 创建 PR
gh pr create --title "feat: 添加用户收藏功能" \
  --body "## 功能说明

- 添加用户收藏物品功能
- 可以收藏常用物品
- 收藏列表独立管理

## 测试

- [x] 预览环境测试通过
- [x] 功能正常工作
- [x] 无明显 bug

## 截图

（添加截图或演示）

" \
  --base staging
```

### 步骤 6：合并到 Staging

**方式 A：通过 PR 合并**
```bash
# 在 PR 页面点击 "Merge pull request"
# 或使用 CLI
gh pr merge --squash
```

**方式 B：直接合并**
```bash
git checkout staging
git merge feature/your-feature-name
git push origin staging
```

### 步骤 7：Staging 环境测试

Staging 分支也会创建预览部署，用于集成测试：
- 多个功能集成测试
- 验证功能之间没有冲突
- 完整的用户流程测试

### 步骤 8：发布到生产

**只有在 staging 测试通过后才能合并到 master：**

```bash
git checkout master
git merge staging
git push origin master
```

**这会自动部署到生产环境：**
- ✅ https://akachanlist.vercel.app
- ✅ 面向所有用户

### 步骤 9：清理

```bash
# 删除已合并的功能分支
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 📝 Commit 消息规范

使用约定式提交格式：

```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

**示例：**
```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve shopping list sync issue"
git commit -m "docs: update deployment guide"
```

## 🚨 紧急修复流程

如果生产环境出现紧急问题：

```bash
# 1. 从 master 创建 hotfix 分支
git checkout master
git checkout -b hotfix/critical-fix

# 2. 快速修复
# ... 修复代码 ...

# 3. 推送并创建 PR（或直接合并）
git push origin hotfix/critical-fix

# 4. 快速审查后合并到 master
gh pr create --title "hotfix: 紧急修复" --body "紧急修复生产环境问题"
gh pr merge --squash

# 5. 事后合并回 staging
git checkout staging
git merge master
git push origin staging

# 6. 删除 hotfix 分支
git branch -d hotfix/critical-fix
git push origin --delete hotfix/critical-fix
```

## 🔍 常用命令

### 查看部署状态
```bash
# 查看所有部署
vercel ls

# 只看 Preview 部署
vercel ls | grep Preview

# 查看最新部署
vercel ls | head -5
```

### Pull Request 操作
```bash
# 创建 PR
gh pr create --base staging

# 查看 PR
gh pr view

# 列出所有 PR
gh pr list

# 合并 PR
gh pr merge --squash

# 关闭 PR
gh pr close
```

### 分支操作
```bash
# 查看所有分支
git branch -a

# 创建新分支
git checkout -b feature/new-feature

# 删除本地分支
git branch -d feature/old-feature

# 删除远程分支
git push origin --delete feature/old-feature
```

## ⚠️ 注意事项

### DO（推荐做法）✅
- ✅ 每个功能使用单独的分支
- ✅ 分支命名清晰：`feature/功能描述`
- ✅ 在预览环境充分测试
- ✅ 提交消息清晰明确
- ✅ 及时删除已合并的分支
- ✅ 保持 staging 和 master 的稳定性

### DON'T（不推荐做法）❌
- ❌ 不要直接在 master 开发
- ❌ 不要在功能分支上开发其他功能
- ❌ 不要跳过预览测试直接合并
- ❌ 不要推送未测试的代码到 master
- ❌ 不要使用模糊的 commit 消息

## 🎯 不同场景的工作流程

### 场景 1：新功能开发
```bash
git checkout staging
git checkout -b feature/new-feature
# ... 开发 ...
git push origin feature/new-feature
# 测试预览部署
git checkout staging
git merge feature/new-feature
git push origin staging
# Staging 测试
git checkout master
git merge staging
git push origin master
```

### 场景 2：Bug 修复
```bash
git checkout staging
git checkout -b fix/bug-description
# ... 修复 ...
git push origin fix/bug-description
# 测试预览部署
git checkout staging
git merge fix/bug-description
git push origin staging
git checkout master
git merge staging
git push origin master
```

### 场景 3：文档更新
```bash
git checkout master
git checkout -b docs/update-guide
# ... 更新文档 ...
git push origin docs/update-guide
# 创建 PR
gh pr create --base master
gh pr merge
```

### 场景 4：重构代码
```bash
git checkout staging
git checkout -b refactor/code-structure
# ... 重构 ...
git push origin refactor/code-structure
# 测试预览部署（确保重构没破坏功能）
git checkout staging
git merge refactor/code-structure
git push origin staging
```

## 📚 相关文档

- **[Git 工作流程详解](./GIT_WORKFLOW.md)** - 完整的 Git 工作流程
- **[Vercel 连接指南](./VERCEL_GIT_SETUP.md)** - 如何连接 Vercel 到 GitHub
- **[测试指南](./TESTING_GUIDE.md)** - 功能测试清单
- **[项目实现总结](./IMPLEMENTATION_COMPLETE.md)** - 项目功能说明

## 🔗 快速链接

- **生产环境**：https://akachanlist.vercel.app
- **GitHub 仓库**：https://github.com/tothemoonai/akachanlist
- **Vercel Dashboard**：https://vercel.com/tothemoonais-projects/akachanlist

---

**创建时间：** 2026-03-24
**项目：** akachanlist
**版本：** 1.0
**工作流程：** Preview → Staging → Production
