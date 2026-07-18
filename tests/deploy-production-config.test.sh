#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-docker-compose.yml}"
deploy_script="${2:-scripts/deploy-production.sh}"

if grep -qF 'AUTH_COOKIE_SECURE' "$compose_file" "$deploy_script"; then
  echo "生产配置禁止覆盖 AUTH_COOKIE_SECURE，NODE_ENV=production 必须使用安全 Cookie 默认值" >&2
  exit 1
fi

if grep -qF 'agent-team-nextjs:latest' "$compose_file"; then
  echo "生产 Compose 禁止回退到 latest，必须使用不可变镜像版本" >&2
  exit 1
fi

if ! grep -qF 'AGENT_TEAM_IMAGE:?必须通过 AGENT_TEAM_IMAGE 指定不可变镜像版本' "$compose_file"; then
  echo "生产 Compose 必须强制要求 AGENT_TEAM_IMAGE" >&2
  exit 1
fi

if [[ -f .github/workflows/deploy.yml ]]; then
  echo "旧 GitHub Actions 生产发布入口必须删除" >&2
  exit 1
fi

echo "deploy-production-config-ok"
