# Kaixin Gemini — Neon Arcade

一个运行在 Cloudflare 上的 Vaporwave 风格 AI 对话平台。基于 Next.js 15、React 19、TypeScript、Tailwind CSS，使用 Cloudflare D1 数据库、KV 缓存和 R2 对象存储。

![Vaporwave UI](https://img.shields.io/badge/UI-Vaporwave-ff4fd8?style=for-the-badge&labelColor=120022)
![Next.js](https://img.shields.io/badge/Next.js-15-000?style=for-the-badge&logo=next.js)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-37f7ff?style=for-the-badge&logo=cloudflare)

## 功能特性

### 对话核心
- 多模型切换、启用/禁用、排序和默认模型设置
- SSE 流式输出与非流式输出
- 会话记录、搜索、Token 用量统计
- 文件上传（R2 存储）
- Markdown、代码高亮、LaTeX 数学公式、Mermaid 图表

### 认证与权限
- 注册、登录、JWT HttpOnly Cookie 认证
- 管理员与普通用户角色分离
- 初始管理员通过环境变量自动创建

### 管理后台 (`/admin`)
- 玩家管理、模型管理、API 配置、系统设置
- 实时状态面板（玩家数、会话数、Token 用量、请求数）

### OpenAI 兼容接口
- `POST /api/v1/chat/completions` — 兼容 OpenAI SDK，支持流式/非流式

### 视觉设计
- Vaporwave / 赛博复古主题：霓虹日落、透视网格地面、CRT 噪点、VHS 色偏
- 粉紫/青蓝渐变天空、浅黄高对比主文案
- Hover 霓虹加亮 + 轻色差位移、Active 轻缩放
- 慢速扫描线与噪点闪烁动画（已控制频率，不会刺眼）

---

## 项目结构

```
kaixin-gemini/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局、metadata、主题色
│   ├── globals.css               # 全局 Vaporwave 视觉系统
│   ├── page.tsx                  # 首页（聊天）
│   ├── login/page.tsx            # 登录页
│   ├── register/page.tsx         # 注册页
│   ├── admin/page.tsx            # 管理后台（需 admin 权限）
│   ├── manifest.ts               # PWA manifest
│   └── api/                      # API 路由
│       ├── chat/route.ts         # 站内聊天接口
│       ├── conversations/        # 会话 CRUD
│       ├── files/route.ts        # 文件上传
│       ├── auth/                 # 登录/注册/登出/当前用户
│       ├── v1/chat/completions/  # OpenAI 兼容接口
│       └── admin/                # 管理后台 API
├── components/
│   ├── chat/                     # 聊天主界面 + Markdown 渲染
│   ├── auth/                     # 认证表单
│   ├── admin/                    # 管理后台界面
│   └── ui/                       # 通用 UI 组件（Button、Input）
├── lib/
│   ├── auth.ts                   # 认证逻辑（JWT、密码、会话）
│   ├── crypto.ts                 # 加密、哈希、JWT 签名
│   ├── db.ts                     # D1 数据库访问层
│   ├── env.ts                    # Cloudflare 环境变量读取
│   ├── models.ts                 # 模型管理
│   ├── openai-compatible.ts      # OpenAI 兼容代理
│   ├── settings.ts               # API 配置 + 系统设置
│   ├── token.ts                  # Token 估算
│   ├── types.ts                  # TypeScript 类型定义
│   ├── utils.ts                  # cn() 工具函数
│   └── validation.ts             # 请求解析 + 错误处理
├── migrations/
│   ├── 0001_initial.sql          # 建表 + 索引
│   └── 0002_seed_models.sql      # 种子模型 + 系统设置
├── public/
│   ├── sw.js                     # Service Worker
│   └── icons/                    # PWA 图标
├── tailwind.config.ts            # Tailwind + Vaporwave token
├── next.config.mjs               # Next.js 配置
├── open-next.config.ts           # OpenNext Cloudflare 配置
├── wrangler.jsonc                # Cloudflare Wrangler 配置
├── .env.example                  # 环境变量示例
└── package.json
```

---

## 快速开始

### 1. 克隆与安装

```bash
git clone <your-repo-url>
cd kaixin-gemini
npm install
```

### 2. 配置环境变量

复制示例文件并编辑：

```bash
cp .env.example .env.local
```

`.env.local` 内容：

```env
APP_URL=http://localhost:3000
JWT_ISSUER=kaixin-gemini
JWT_SECRET=change-me-to-a-long-random-secret
CONFIG_ENCRYPTION_KEY=32-byte-minimum-random-secret-value
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

> **重要**：`JWT_SECRET` 和 `CONFIG_ENCRYPTION_KEY` 在生产环境必须使用强随机字符串，且通过 `wrangler secret` 设置，不要写入代码仓库。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`，注册账号后进入聊天界面。

首次访问 `/admin` 时，系统会用 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 自动创建初始管理员。

---

## Cloudflare 部署指南

### 前置条件

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare 账号](https://dash.cloudflare.com/)
- 已安装 Wrangler CLI：`npm install -g wrangler`

### 第一步：登录 Cloudflare

```bash
npx wrangler login
```

### 第二步：创建 Cloudflare 资源

```bash
# 创建 D1 数据库
npx wrangler d1 create kaixin_gemini_db
# 记录输出的 database_id

# 创建 KV 命名空间（可选，用于缓存）
npx wrangler kv namespace create CHAT_KV
# 记录输出的 id

# 创建 R2 存储桶（可选，用于文件上传）
npx wrangler r2 bucket create kaixin-gemini-uploads
```

### 第三步：更新 wrangler.jsonc

将第二步获取的 ID 填入配置：

```jsonc
{
  "name": "kaixin-gemini",
  "compatibility_date": "2026-06-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".open-next/assets",
  "vars": {
    "APP_URL": "https://your-domain.pages.dev",
    "JWT_ISSUER": "kaixin-gemini"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kaixin_gemini_db",
      "database_id": "你的 D1 数据库 ID",
      "migrations_dir": "migrations"
    }
  ],
  "kv_namespaces": [
    { "binding": "CHAT_KV", "id": "你的 KV 命名空间 ID" }
  ],
  "r2_buckets": [
    { "binding": "CHAT_UPLOADS", "bucket_name": "kaixin-gemini-uploads" }
  ]
}
```

### 第四步：设置 Secrets

```bash
npx wrangler secret put JWT_SECRET
# 输入一个长随机字符串

npx wrangler secret put CONFIG_ENCRYPTION_KEY
# 输入至少 32 字节的随机字符串

npx wrangler secret put ADMIN_EMAIL
# 输入管理员邮箱

npx wrangler secret put ADMIN_PASSWORD
# 输入管理员密码
```

### 第五步：运行数据库迁移

```bash
# 本地开发
npm run db:local

# 远程生产
npm run db:remote
```

### 第六步：构建与部署

```bash
# 本地预览
npm run cf:build
npm run preview

# 部署到 Cloudflare Pages
npm run deploy
```

### 第七步：配置 API

登录管理后台 `/admin`，进入 **Signal Key** 标签页，配置：

- **API BASE URL**：你的上游 API 地址（如 `https://generativelanguage.googleapis.com/v1beta/openai`）
- **API KEY**：上游 API 密钥
- **DEFAULT SYNTH**：默认模型名称

配置完成后即可在首页开始对话。

---

## 本地开发常用命令

```bash
npm run dev          # 启动开发服务器 (localhost:3000)
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint 代码检查
npm run build        # Next.js 生产构建
npm run db:local     # 运行本地数据库迁移
npm run cf:build     # Cloudflare 构建
npm run preview      # 本地 Cloudflare 预览
npm run deploy       # 部署到 Cloudflare Pages
```

---

## 环境变量参考

| 名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `APP_URL` | Wrangler var | 是 | 站点完整 URL（如 `https://xxx.pages.dev`） |
| `JWT_ISSUER` | Wrangler var | 否 | JWT issuer 标识，默认 `kaixin-gemini` |
| `JWT_SECRET` | Secret | 是 | JWT 签名密钥，建议 64+ 字符随机字符串 |
| `CONFIG_ENCRYPTION_KEY` | Secret | 是 | API Key AES-GCM 加密密钥，至少 32 字节 |
| `ADMIN_EMAIL` | Secret | 否 | 初始管理员邮箱（首次访问 `/admin` 时自动创建） |
| `ADMIN_PASSWORD` | Secret | 否 | 初始管理员密码 |

---

## OpenAI 兼容接口

站内提供 OpenAI SDK 兼容的聊天接口，可直接用 OpenAI SDK 调用：

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://your-domain.pages.dev/api/v1",
  apiKey: "任意非空字符串",
});

const stream = await client.chat.completions.create({
  model: "gemini-3.5-flash",
  messages: [{ role: "user", content: "你好" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

---

## 生产注意事项

- **Secrets 安全**：`JWT_SECRET` 和 `CONFIG_ENCRYPTION_KEY` 必须通过 `wrangler secret` 设置，不要提交到代码仓库。
- **资源 ID**：部署前替换 `wrangler.jsonc` 中所有 `YOUR_*` 占位符。
- **R2 可选**：未配置 R2 时，文件上传返回 501，聊天功能不受影响。
- **Token 估算**：上游流式响应无 usage 字段时，系统会做近似 Token 估算。
- **注册控制**：可在管理后台 **VHS Setup** 中设置 `allow_registration` 为 `false` 关闭公开注册。

---

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 框架 | Next.js 15 (App Router) + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 3.4 + 自定义 Vaporwave 视觉系统 |
| 数据库 | Cloudflare D1 (SQLite) |
| 缓存 | Cloudflare KV（可选） |
| 存储 | Cloudflare R2（可选） |
| 认证 | 自研 JWT + PBKDF2 密码哈希 |
| 加密 | Web Crypto API (AES-GCM, HMAC-SHA256) |
| 部署 | Cloudflare Pages via OpenNext |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| 数学公式 | KaTeX（动态加载） |
| 图表 | Mermaid（动态加载） |
