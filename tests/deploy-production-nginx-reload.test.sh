#!/usr/bin/env bash
set -euo pipefail

script_path="${1:-scripts/deploy-production.sh}"

line_number() {
  local pattern="$1"
  local match
  match="$(grep -nF "$pattern" "$script_path" | head -n 1 || true)"
  if [[ -z "$match" ]]; then
    echo "部署脚本缺少必要命令：${pattern}" >&2
    exit 1
  fi
  printf '%s\n' "${match%%:*}"
}

nginx_validate_line="$(line_number 'nginx -t')"
production_switch_line="$(line_number 'docker compose -f "$compose_file" up')"
production_health_line="$(line_number 'echo "✅ 正式容器已通过健康检查"')"
nginx_reload_line="$(line_number 'nginx -s reload')"

if (( nginx_validate_line >= production_switch_line )); then
  echo "Nginx 配置必须在正式容器切换前校验" >&2
  exit 1
fi

if (( nginx_reload_line <= production_health_line )); then
  echo "Nginx 必须在正式容器健康后 reload" >&2
  exit 1
fi

echo "deploy-production-nginx-reload-order-ok"
