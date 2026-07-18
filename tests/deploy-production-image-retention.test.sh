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

last_line_number() {
  local pattern="$1"
  local match
  match="$(grep -nF "$pattern" "$script_path" | tail -n 1 || true)"
  if [[ -z "$match" ]]; then
    echo "部署脚本缺少必要命令：${pattern}" >&2
    exit 1
  fi
  printf '%s\n' "${match%%:*}"
}

line_number 'image_retention_count="${DEPLOY_IMAGE_RETENTION_COUNT:-3}"' >/dev/null
line_number 'current_image_id="$(docker inspect' >/dev/null
line_number 'docker image ls "$image_repository"' >/dev/null
line_number 'docker image rm "$image_candidate"' >/dev/null

nginx_switched_line="$(line_number 'echo "✅ Nginx 已切换到新的正式容器"')"
image_cleanup_line="$(last_line_number 'prune_old_application_images')"

if (( image_cleanup_line <= nginx_switched_line )); then
  echo "历史镜像只能在新容器和 Nginx 都验证成功后清理" >&2
  exit 1
fi

if grep -qF 'docker image prune -af' "$script_path"; then
  echo "禁止在生产部署中全局删除其他应用的未使用镜像" >&2
  exit 1
fi

test_image_repository="registry.example.com/example/application"
test_image_ref="${test_image_repository}:current"
removed_images_file="$(mktemp)"
functions_file="$(mktemp)"
trap 'rm -f "$removed_images_file" "$functions_file"' EXIT

# 只加载函数定义，使用假的 docker 输出验证当前版本和最近两个历史版本不会被删除。
sed '/^trap cleanup_candidate EXIT/,$d' "$script_path" > "$functions_file"
source "$functions_file" "$test_image_ref"

docker() {
  if [[ "$1" == "inspect" ]]; then
    printf '%s\n' 'sha256:current'
    return 0
  fi

  if [[ "$1 $2" == "image ls" ]]; then
    printf '%s\n' \
      "${test_image_repository}:current" \
      "${test_image_repository}:previous-1" \
      "${test_image_repository}:previous-1-alias" \
      "${test_image_repository}:previous-2" \
      "${test_image_repository}:expired"
    return 0
  fi

  if [[ "$1 $2" == "image inspect" ]]; then
    case "${*: -1}" in
      "${test_image_repository}:current") printf '%s\n' 'sha256:current' ;;
      "${test_image_repository}:previous-1"|"${test_image_repository}:previous-1-alias")
        printf '%s\n' 'sha256:previous-1'
        ;;
      "${test_image_repository}:previous-2") printf '%s\n' 'sha256:previous-2' ;;
      "${test_image_repository}:expired") printf '%s\n' 'sha256:expired' ;;
      *) return 1 ;;
    esac
    return 0
  fi

  if [[ "$1 $2" == "image rm" ]]; then
    printf '%s\n' "${*: -1}" >> "$removed_images_file"
    return 0
  fi

  if [[ "$1 $2" == "image prune" ]]; then
    return 0
  fi

  echo "测试遇到未模拟的 docker 命令：$*" >&2
  return 1
}

prune_old_application_images >/dev/null

if [[ "$(cat "$removed_images_file")" != "${test_image_repository}:expired" ]]; then
  echo "镜像保留策略删除了错误的版本：$(cat "$removed_images_file")" >&2
  exit 1
fi

echo "deploy-production-image-retention-ok"
