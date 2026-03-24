# 🔗 连接 Vercel 到 GitHub - 启用 Preview 部署

## 🎯 目标

将 Vercel 项目连接到 GitHub 仓库，实现：
- ✅ 自动创建 Preview 部署
- ✅ 每次 push 自动部署
- ✅ PR 自动显示预览 URL

## 📋 当前状态

- ✅ GitHub 仓库已创建：https://github.com/tothemoonai/akachanlist
- ✅ 代码已推送
- ✅ Pull Request 已创建：#1
- ⏳ Vercel 还未连接到 GitHub

## 🔗 连接步骤

### 步骤 1：打开 Vercel 项目设置

**方式 A：直接链接**
```
https://vercel.com/tothemoonais-projects/akachanlist/settings/git
```

**方式 B：通过 Dashboard**
1. 访问 https://vercel.com/dashboard
2. 选择 `tothemoonais-projects` 组织
3. 选择 `akachanlist` 项目
4. 点击 **Settings** 标签
5. 点击 **Git** 选项卡

### 步骤 2：连接 GitHub

1. **查找 Git 集成部分**
   - 如果显示 "Connect to GitHub"，点击它
   - 如果显示 "View All"，点击查看所有仓库

2. **选择仓库**
   - 在列表中找到 `tothemoonai/akachanlist`
   - 点击 **Connect** 或 **Import**

3. **确认连接**
   - Vercel 可能会请求 GitHub 权限
   - 点击 **Authorize** 或 **同意**

### 步骤 3：配置分支（可选）

连接后，可以配置：

**Production Branch（生产分支）**
- 设置为：`master`
- 这个分支的部署会自动成为生产环境

**Preview Branches（预览分支）**
- 可以留空（默认所有非 master 分支都是预览）
- 或者指定：`staging`, `feature/*`, `fix/*`

**Protected Branches（受保护分支）**
- 可以选择需要审查才能部署的分支

### 步骤 4：验证连接成功

连接成功后，你会看到：

1. **在 Dashboard 中**
   - Git Integration 部分显示：✅ Connected
   - 显示仓库：`tothemoonai/akachanlist`

2. **在 Pull Request #1 中**
   - Vercel 机器人会自动添加评论
   - 评论包含预览部署 URL
   - 格式类似：`https://akachanlist-xxx.vercel.app`

3. **在 Deployments 列表中**
   ```
   vercel ls
   ```
   会看到新的部署，Environment 显示为 "Preview"

## 🧪 测试 Preview 部署

连接成功后，等待 2-5 分钟：

1. **检查 PR #1**
   - 访问：https://github.com/tothemoonai/akachanlist/pull/1
   - 查看是否有 Vercel 的评论
   - 评论会包含预览 URL

2. **访问预览 URL**
   - 点击评论中的链接
   - 验证网站可以访问
   - 检查 PREVIEW_TEST.md 文件是否存在

3. **验证自动部署**
   ```bash
   # 修改文件
   echo "Test update" >> PREVIEW_TEST.md

   # 提交并推送
   git add PREVIEW_TEST.md
   git commit -m "test: update preview test file"
   git push
   ```

4. **查看自动更新**
   - 等待 1-2 分钟
   - 再次访问预览 URL
   - 验证内容已更新

## 🎯 预期结果

### 成功标志

✅ **Vercel Dashboard**
- Settings → Git 显示 "Connected"
- 显示 GitHub 仓库信息

✅ **GitHub PR**
- PR 页面有 Vercel 机器人评论
- 评论包含预览 URL

✅ **部署列表**
```bash
vercel ls
```
显示类似：
```
Age   Environment   URL
2m    Preview       https://akachanlist-abc123.vercel.app
1h    Production    https://akachanlist.vercel.app
```

### 常见问题

**Q: 连接后没有立即看到预览部署？**
A: 等待 2-5 分钟，Vercel 需要时间检测和部署

**Q: 找不到 "Connect to GitHub" 按钮？**
A: 可能已经连接了，检查是否显示 "Connected" 状态

**Q: 连接失败？**
A: 检查：
- GitHub 权限是否足够
- 仓库是否为 public
- Vercel 是否有访问权限

**Q: 预览部署一直处于 building 状态？**
A: 检查：
- 构建日志是否有错误
- `npm run build` 是否能成功
- 环境变量是否配置正确

## 🚀 下一步

连接成功后，你可以：

1. **测试完整工作流程**
   - 创建 feature 分支
   - 推送代码
   - 查看 PR 的预览 URL

2. **合并 PR #1**
   ```bash
   gh pr merge 1 --squash --delete-branch
   ```

3. **开始正常开发**
   - 使用 `feature/*` 分支开发新功能
   - 每次推送自动创建预览部署
   - 测试通过后合并到 staging
   - staging 测试通过后合并到 master

## 📚 相关文档

- [Git 工作流程](./GIT_WORKFLOW.md)
- [测试指南](./TESTING_GUIDE.md)
- [Vercel Git 集成文档](https://vercel.com/docs/deployments/overview)

---

**创建时间：** 2026-03-24
**项目：** akachanlist
**PR：** #1
