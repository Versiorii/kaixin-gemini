#!/bin/bash

# Kaixin Gemini Cloudflare 部署脚本
# 用法: bash deploy-cloudflare.sh

echo "🚀 Kaixin Gemini - Cloudflare 部署脚本"
echo "========================================"
echo ""

# 设置环境变量
export CLOUDFLARE_EMAIL="<YOUR_CLOUDFLARE_EMAIL>"
export CLOUDFLARE_API_KEY="<YOUR_CLOUDFLARE_GLOBAL_API_KEY>"

# 第一步：验证 Cloudflare 凭证
echo "✓ 步骤 1: 验证 Cloudflare 凭证"
ACCOUNTS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: application/json")

ACCOUNT_ID=$(echo $ACCOUNTS | jq -r '.result[0].id' 2>/dev/null)
if [ -z "$ACCOUNT_ID" ] || [ "$ACCOUNT_ID" = "null" ]; then
  echo "❌ 无法连接到 Cloudflare，请检查 API 密钥"
  exit 1
fi

echo "✅ 账户验证成功，ID: $ACCOUNT_ID"
echo ""

# 第二步：查询或创建 D1 数据库
echo "✓ 步骤 2: 配置 D1 数据库"
DATABASES=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: application/json")

DB_ID=$(echo $DATABASES | jq -r '.result[0].uuid' 2>/dev/null)
if [ -z "$DB_ID" ] || [ "$DB_ID" = "null" ]; then
  echo "⏳ 创建 D1 数据库..."
  DB_CREATE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name":"kaixin_gemini_db"}')

  DB_ID=$(echo $DB_CREATE | jq -r '.result.uuid' 2>/dev/null)
  echo "✅ D1 数据库创建成功，ID: $DB_ID"
else
  echo "✅ D1 数据库已存在，ID: $DB_ID"
fi
echo ""

# 第三步：查询或创建 KV 命名空间
echo "✓ 步骤 3: 配置 KV 缓存"
NAMESPACES=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: application/json")

KV_ID=$(echo $NAMESPACES | jq -r '.result[] | select(.title=="CHAT_KV") | .id' 2>/dev/null)
if [ -z "$KV_ID" ] || [ "$KV_ID" = "null" ]; then
  echo "⏳ 创建 KV 命名空间..."
  KV_CREATE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"title":"CHAT_KV"}')

  KV_ID=$(echo $KV_CREATE | jq -r '.result.id' 2>/dev/null)
  echo "✅ KV 命名空间创建成功，ID: $KV_ID"
else
  echo "✅ KV 命名空间已存在，ID: $KV_ID"
fi
echo ""

# 第四步：查询或创建 R2 存储桶
echo "✓ 步骤 4: 配置 R2 存储"
BUCKETS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/r2/buckets" \
  -H "Authorization: Bearer $CLOUDFLARE_API_KEY" \
  -H "Content-Type: application/json")

R2_BUCKET=$(echo $BUCKETS | jq -r '.result.buckets[]? | select(.name=="kaixin-gemini-uploads") | .name' 2>/dev/null)
if [ -z "$R2_BUCKET" ]; then
  echo "⏳ 创建 R2 存储桶..."
  # 注意：R2 创建需要特殊的 API 端点
  echo "✅ 请在 Cloudflare 控制面板手动创建 R2 存储桶 'kaixin-gemini-uploads'"
else
  echo "✅ R2 存储桶已存在"
fi
echo ""

# 第五步：更新 wrangler.jsonc 配置
echo "✓ 步骤 5: 更新配置文件"
cat > wrangler.jsonc << EOF
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
    "database_id": "$DB_ID",
    "migrations_dir": "migrations"
  }],
  "kv_namespaces": [{
    "binding": "CHAT_KV",
    "id": "$KV_ID"
  }],
  "r2_buckets": [{
    "binding": "CHAT_UPLOADS",
    "bucket_name": "kaixin-gemini-uploads"
  }]
}
EOF

echo "✅ wrangler.jsonc 已更新"
echo ""

# 第六步：构建项目
echo "✓ 步骤 6: 构建项目"
npm run cf:build || { echo "❌ 构建失败"; exit 1; }
echo "✅ 构建成功"
echo ""

# 第七步：部署到 Cloudflare Pages
echo "✓ 步骤 7: 部署到 Cloudflare Pages"
echo "⏳ 部署中... (这需要几分钟)"
npm run deploy || { echo "❌ 部署失败"; exit 1; }
echo "✅ 部署成功"
echo ""

# 第八步：设置自定义域名
echo "✓ 步骤 8: 配置自定义域名"
echo "请手动完成以下步骤："
echo "1. 访问 Cloudflare 控制面板: https://dash.cloudflare.com/"
echo "2. 进入 Pages > kaixin-gemini"
echo "3. 点击 'Settings' > 'Custom domains'"
echo "4. 添加自定义域名: gemini.566622.xyz"
echo "5. 按照提示完成 DNS 配置"
echo ""

echo "🎉 部署配置完成！"
echo ""
echo "下一步:"
echo "1. 运行: bash deploy-cloudflare.sh"
echo "2. 设置自定义域名"
echo "3. 配置 Secrets: JWT_SECRET, CONFIG_ENCRYPTION_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
echo ""
