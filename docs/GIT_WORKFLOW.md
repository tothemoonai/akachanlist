# 🌿 Git 工作流程 - Preview 部署

## 📋 分支策略

```
master (生产)
  ↑
  │
staging (测试)
  ↑
  │
feature/* (功能开发)
```

## 🎯 分支说明

### `master` 分支
- **用途**：生产环境
- **部署**：https://akachanlist.vercel.app
- **规则**：
  - 只接受从 `staging` 合并的代码
  - 不直接在此分支开发
  - 合并前必须通过 staging 测试

### `staging` 分支
- **用途**：测试环境
- **部署**：https://akachanlist.staging-vercel.app（自动创建）
- **规则**：
  - 接受从 `feature/*` 分支合并的代码
  - 用于集成测试
  - 稳定后合并到 `master`

### `feature/*` 分支
- **用途**：功能开发
- **部署**：每次 push 自动创建预览 URL
- **命名规则**：`feature/功能描述`
- **规则**：
  - 从 `staging` 创建
  - 开发完成后合并回 `staging`
  - 可以删除

## 🚀 工作流程

### 1. 开始新功能开发

```bash
# 确保本地 staging 是最新的
git checkout staging
git pull origin staging

# 创建功能分支
git checkout -b feature/功能名称

# 示例：
git checkout -b feature/user-profile
git checkout -b feature/shopping-cart
git checkout -b feature/mobile-optimization
```

### 2. 开发和测试

```bash
# 进行开发...
# 修改文件、添加功能等

# 提交更改
git add .
git commit -m "feat: 描述你的功能"

# 推送到远程（自动创建预览部署）
git push origin feature/功能名称
```

**Vercel 会自动创建预览 URL**：
- 格式：`https://akachanlist-[随机字符串].vercel.app`
- 在 GitHub/GitLab 的 PR 中会显示预览链接
- 可以在 Vercel Dashboard 查看所有预览部署

### 3. 测试预览部署

1. **查看预览 URL**
   ```bash
   vercel ls
   ```

2. **在预览环境测试**
   - 访问预览 URL
   - 测试新功能
   - 检查是否有问题

3. **修复问题**
   ```bash
   # 继续在功能分支开发
   git add .
   git commit -m "fix: 修复问题"
   git push origin feature/功能名称
   # 每次推送都会更新预览部署
   ```

### 4. 合并到 Staging

```bash
# 切换到 staging
git checkout staging

# 合并功能分支
git merge feature/功能名称

# 推送到远程（部署到 staging 环境）
git push origin staging
```

### 5. Staging 测试

1. 访问 staging 环境 URL
2. 进行完整的功能测试
3. 测试各功能模块的集成
4. 如有问题，创建新的 feature 分支修复

### 6. 发布到生产

```bash
# 切换到 master
git checkout master

# 合并 staging
git merge staging

# 推送到远程（部署到生产环境）
git push origin master
```

### 7. 清理

```bash
# 删除已合并的功能分支（可选）
git branch -d feature/功能名称
git push origin --delete feature/功能名称
```

## 📝 Commit 消息规范

使用约定式提交（Conventional Commits）：

```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

**示例**：
```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve shopping list sync issue"
git commit -m "docs: update deployment guide"
```

## 🎯 实际例子

### 例子 1：添加新功能

```bash
# 1. 创建功能分支
git checkout staging
git pull origin staging
git checkout -b feature/add-favorite-items

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交并推送
git add .
git commit -m "feat: add favorite items functionality"
git push origin feature/add-favorite-items

# 4. 测试预览部署
# Vercel 自动创建：https://akachanlist-abc123.vercel.app
# 在预览环境测试功能

# 5. 合并到 staging
git checkout staging
git merge feature/add-favorite-items
git push origin staging

# 6. Staging 测试通过后，发布到生产
git checkout master
git merge staging
git push origin master

# 7. 清理
git branch -d feature/add-favorite-items
git push origin --delete feature/add-favorite-items
```

### 例子 2：修复 Bug

```bash
# 1. 创建修复分支
git checkout staging
git pull origin staging
git checkout -b fix/shopping-list-sync

# 2. 修复 bug
# ... 修复代码 ...

# 3. 提交并推送
git add .
git commit -m "fix: resolve shopping list real-time sync issue"
git push origin fix/shopping-list-sync

# 4. 测试预览部署
# 验证修复有效

# 5. 合并到 staging
git checkout staging
git merge fix/shopping-list-sync
git push origin staging

# 6. 发布到生产
git checkout master
git merge staging
git push origin master
```

## 🔍 查看部署状态

```bash
# 查看所有部署
vercel ls

# 查看特定部署的详细信息
vercel inspect [deployment-url]

# 查看 GitHub 中的预览链接
# 在 Pull Request 页面查看
```

## ⚠️ 注意事项

1. **永远不要直接在 master 分支开发**
2. **每个功能使用单独的分支**
3. **保持提交消息清晰**
4. **合并前确保测试通过**
5. **及时清理已合并的分支**

## 🚨 紧急修复流程

如果生产环境出现紧急问题：

```bash
# 1. 从 master 创建 hotfix 分支
git checkout master
git checkout -b hotfix/紧急修复

# 2. 快速修复
# ... 修复代码 ...

# 3. 直接合并到 master（跳过 staging）
git checkout master
git merge hotfix/紧急修复
git push origin master

# 4. 事后合并回 staging
git checkout staging
git merge hotfix/紧急修复
git push origin staging

# 5. 删除 hotfix 分支
git branch -d hotfix/紧急修复
```

---

## 📚 相关文档

- [Vercel 部署文档](./VERCEL_DEPLOYMENT.md)
- [测试指南](./TESTING_GUIDE.md)
- [项目实现总结](./IMPLEMENTATION_COMPLETE.md)

---

**创建日期：** 2026-03-24
**项目：** akachanlist
**版本：** 1.0
