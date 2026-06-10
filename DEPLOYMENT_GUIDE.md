# 🚀 Kaixin Gemini - Cloudflare 部署指南

本指南将逐步引导你部署 Kaixin Gemini 到 Cloudflare Pages，并配置自定义域名 `gemini.566622.xyz`。

## 📋 前置条件

- ✅ Cloudflare 账户
- ✅ Global API Key（已有）
- ✅ 自定义域名 DNS 指向 Cloudflare（已有）
- ✅ Git 和 Node.js 18+
- ✅ GitHub 仓库（已推送）

## 🔧 部署步骤

### 步骤 1：准备本地环境

```bash
# 克隆仓库（如果还没有的话）
git clone https://github.com/Versiorii/kaixin-gemini.git
cd kaixin-gemini

# 安装依赖
npm install

# 验证构建工具已安装
npm list wrangler
```

### 步骤 2：登录 Cloudflare

```bash
# 使用 Wrangler 登录（如果还没有）
npx wrangler login

# 或者，设置环境变量（推荐用于脚本自动化）
export CLOUDFLARE_EMAIL="<YOUR_CLOUDFLARE_EMAIL>"
export CLOUDFLARE_API_KEY="<YOUR_CLOUDFLARE_GLOBAL_API_KEY>"
```

### 步骤 3：创建 Cloudflare 资源

#### 创建 D1 数据库

```bash
# 使用 Wrangler 创建 D1 数据库
npx wrangler d1 create kaixin_gemini_db

# 记录返回的 database_id
# 示例: database_id = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### 创建 KV 命名空间

```bash
# 创建 KV 命名空间用于缓存
npx wrangler kv:namespace create CHAT_KV

# 记录返回的 id
# 示例: id = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 创建 R2 存储桶

```bash
# 创建 R2 存储桶用于文件上传
npx wrangler r2 bucket create kaixin-gemini-uploads
```

### 步骤 4：配置 wrangler.jsonc

编辑 `wrangler.jsonc`，填入上一步获取的 ID：

```jsonc
{
  "name": "kaixin-gemini",
  "compatibility_date": "2026-06-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".open-next/assets",
  "vars": {
    "APP_URL": "https://gemini.566622.xyz",
    "JWT_ISSUER": "kaixin-gemini"
  },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "kaixin_gemini_db",
    "database_id": "YOUR_D1_DATABASE_ID",     // 替换为实际的 ID
    "migrations_dir": "migrations"
  }],
  "kv_namespaces": [{
    "binding": "CHAT_KV",
    "id": "YOUR_KV_NAMESPACE_ID"              // 替换为实际的 ID
  }],
  "r2_buckets": [{
    "binding": "CHAT_UPLOADS",
    "bucket_name": "kaixin-gemini-uploads"
  }]
}
```

### 步骤 5：运行数据库迁移

```bash
# 本地运行迁移（开发环境）
npm run db:local

# 或者远程运行迁移（生产环境）
npm run db:remote
```

### 步骤 6：构建项目

```bash
# 构建 Next.js 应用
npm run build

# 为 Cloudflare 构建
npm run cf:build
```

输出应该在 `.open-next/` 目录中生成。

### 步骤 7：部署到 Cloudflare Pages

#### 方式 A：使用 Wrangler CLI（推荐）

```bash
# 推送到 Cloudflare Pages
npm run deploy

# 或者手动：
npx wrangler pages deploy .open-next/assets
```

#### 方式 B：使用 GitHub Actions（自动化）

1. 连接 GitHub 仓库到 Cloudflare Pages
2. Cloudflare 将自动部署每个推送

### 步骤 8：配置自定义域名

#### 在 Cloudflare 控制面板中：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** > **kaixin-gemini**
3. 点击 **Settings** > **Custom domains**
4. 点击 **Add custom domain**
5. 输入 `gemini.566622.xyz`
6. 按照提示完成 DNS 配置

#### DNS 配置：

Cloudflare Pages 会给你一个 CNAME 记录：

```
记录类型: CNAME
名称: gemini.566622.xyz
内容: kaixin-gemini.pages.dev
```

如果 DNS 已指向 Cloudflare，这会自动完成。

### 步骤 9：设置 Secrets

部署后，在 Cloudflare Dashboard 中设置环境变量：

1. Pages > kaixin-gemini > Settings > Environment variables
2. 添加以下 Secrets：

```env
JWT_SECRET=your-long-random-secret-string-minimum-64-chars
CONFIG_ENCRYPTION_KEY=your-32-byte-random-string-for-aes-gcm
ADMIN_EMAIL=admin@gemini.566622.xyz
ADMIN_PASSWORD=your-strong-admin-password
```

### 步骤 10：验证部署

```bash
# 检查部署状态
npx wrangler pages list

# 查看最新部署
npx wrangler pages deployments list

# 或直接访问
# https://gemini.566622.xyz
```

## 🔐 安全检查清单

部署前，请确保：

- [ ] JWT_SECRET 是强随机字符串（64+ 字符）
- [ ] CONFIG_ENCRYPTION_KEY 至少 32 字节
- [ ] ADMIN_PASSWORD 是强密码
- [ ] API Key 和邮箱信息已从脚本中删除
- [ ] GitHub 仓库 `.env` 文件已加入 `.gitignore`
- [ ] Cloudflare 防火墙规则已配置
- [ ] 二次认证已启用

## 📊 验证部署

### 检查应用状态

```bash
# 访问应用
curl https://gemini.566622.xyz

# 应该收到 HTML 响应（不是错误）
```

### 查看日志

```bash
# 查看实时日志
npx wrangler tail

# 或在 Cloudflare Dashboard 中查看
```

### 数据库验证

```bash
# 连接到 D1 数据库
npx wrangler d1 execute kaixin_gemini_db --command "SELECT * FROM users LIMIT 1;" --remote
```

## 🚨 故障排除

### 部署失败

**错误**: `Failed to deploy`

**解决方案**:
1. 检查 wrangler.jsonc 中的 ID 是否正确
2. 确保所有环境变量都已设置
3. 运行 `npm run cf:build` 验证构建

### 域名不工作

**错误**: `ERR_NAME_NOT_RESOLVED` 或 `CNAME mismatch`

**解决方案**:
1. 确认 DNS 记录已添加：
   ```bash
   dig gemini.566622.xyz
   ```
2. 等待 DNS 传播（可能需要 24 小时）
3. 在 Cloudflare 控制面板验证 CNAME 状态

### 数据库连接错误

**错误**: `D1_BINDING_UNDEFINED` 或 `Connection refused`

**解决方案**:
1. 验证 wrangler.jsonc 中的 database_id 是否正确
2. 运行迁移：`npm run db:remote`
3. 检查数据库是否已创建

### 环境变量缺失

**错误**: `undefined` 或 `SECRET_NOT_FOUND`

**解决方案**:
1. 在 Cloudflare Dashboard 中验证 Secrets
2. 重新部署以应用新变量
3. 检查变量名称是否与代码中的匹配

## 📈 监控和维护

### 实时监控

```bash
# 查看实时请求日志
npx wrangler tail --format pretty

# 过滤特定日志
npx wrangler tail --format json | grep "error"
```

### 性能监控

在 Cloudflare Dashboard 中查看：
- Analytics > Requests
- Analytics > Performance
- Real Experience Monitoring (RUM)

### 更新部署

```bash
# 做出更改后
git add .
git commit -m "your change message"
git push origin main

# 如果使用自动部署（推荐），Cloudflare 会自动部署
# 如果手动部署：
npm run cf:build && npm run deploy
```

## 🎯 完整检查清单

- [ ] Cloudflare 账户已创建
- [ ] D1 数据库已创建并记录 ID
- [ ] KV 命名空间已创建并记录 ID
- [ ] R2 存储桶已创建
- [ ] wrangler.jsonc 已配置所有 ID
- [ ] 环境变量已在 Cloudflare 中设置
- [ ] 数据库迁移已运行
- [ ] 项目已成功构建
- [ ] Pages 已部署
- [ ] 自定义域名已配置
- [ ] DNS 记录已验证
- [ ] 应用在 gemini.566622.xyz 上运行正常

## 🔗 有用的链接

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)

## 📞 获取帮助

如果遇到问题：

1. 检查 [Cloudflare Status](https://www.cloudflarestatus.com/)
2. 查看 [Cloudflare Community](https://community.cloudflare.com/)
3. 参考项目 GitHub Issues

---

**祝部署顺利！🎉**

如有问题，请参考本指南的故障排除部分或创建 GitHub Issue。
