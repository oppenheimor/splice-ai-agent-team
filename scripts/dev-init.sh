#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> 检查本地环境变量文件"
if [ ! -f ".env" ]; then
  cp ".env.example" ".env"
  echo "已从 .env.example 创建 .env，请按需补充 DEEPSEEK_API_KEY 等敏感配置。"
else
  echo ".env 已存在，跳过创建。"
fi

echo "==> 安装依赖"
if [ ! -d "node_modules" ]; then
  pnpm install
else
  echo "node_modules 已存在，跳过 pnpm install。"
fi

echo "==> 启动本地 PostgreSQL 容器"
docker compose -f docker-compose.dev.yml up -d postgres

echo "==> 等待 PostgreSQL 就绪"
for attempt in {1..30}; do
  if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d splice_agent_team >/dev/null 2>&1; then
    echo "PostgreSQL 已就绪。"
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "PostgreSQL 启动超时，请运行 docker compose -f docker-compose.dev.yml logs postgres 查看日志。" >&2
    exit 1
  fi

  sleep 1
done

echo "==> 生成 Prisma Client"
pnpm db:generate

echo "==> 执行 Prisma 迁移"
pnpm db:migrate

echo "==> 本地开发环境初始化完成"
echo "下一步运行：pnpm dev"
