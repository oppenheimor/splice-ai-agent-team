#!/usr/bin/env bash
set -euo pipefail

image_ref="${1:?用法: deploy-production.sh <不可变镜像引用>}"
compose_file="${COMPOSE_FILE:-docker-compose.yml}"
candidate_container="agent-team-nextjs-candidate"
production_container="agent-team-nextjs"
reverse_proxy_container="${REVERSE_PROXY_CONTAINER:-nginx}"
image_retention_count="${DEPLOY_IMAGE_RETENTION_COUNT:-3}"

if ! [[ "$image_retention_count" =~ ^[1-9][0-9]*$ ]]; then
  echo "❌ DEPLOY_IMAGE_RETENTION_COUNT 必须是大于 0 的整数"
  exit 1
fi

cleanup_candidate() {
  docker rm -f "$candidate_container" >/dev/null 2>&1 || true
}

print_container_logs() {
  local container_name="$1"
  docker logs --tail 200 "$container_name" 2>&1 || true
}

wait_for_candidate() {
  local deadline=$(( $(date +%s) + 1020 ))

  until docker exec "$candidate_container" node -e "Promise.all([fetch('http://127.0.0.1:4274/eve/v1/health'),fetch('http://127.0.0.1:3000/agent-team/',{redirect:'manual'})]).then(([eve,next])=>process.exit(eve.ok&&next.status<500?0:1)).catch(()=>process.exit(1))"; do
    local state
    state="$(docker inspect --format '{{.State.Status}}' "$candidate_container" 2>/dev/null || true)"
    if [[ "$state" != "running" ]]; then
      echo "❌ 候选容器在健康检查通过前退出，当前状态：${state:-missing}"
      print_container_logs "$candidate_container"
      return 1
    fi

    if (( $(date +%s) >= deadline )); then
      echo "❌ 候选容器未在 17 分钟内通过 Eve 与 Next.js 健康检查"
      print_container_logs "$candidate_container"
      return 1
    fi
    sleep 2
  done
}

wait_for_production() {
  local deadline=$(( $(date +%s) + 1200 ))

  while true; do
    local state health restart_count
    state="$(docker inspect --format '{{.State.Status}}' "$production_container" 2>/dev/null || true)"
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$production_container" 2>/dev/null || true)"
    restart_count="$(docker inspect --format '{{.RestartCount}}' "$production_container" 2>/dev/null || true)"

    if [[ "$state" == "running" && "$health" == "healthy" ]]; then
      return 0
    fi

    if [[ "$state" != "running" || "${restart_count:-0}" -gt 0 ]]; then
      echo "❌ 正式容器启动失败，状态：${state:-missing}，重启次数：${restart_count:-unknown}"
      print_container_logs "$production_container"
      return 1
    fi

    if (( $(date +%s) >= deadline )); then
      echo "❌ 正式容器未在 20 分钟内变为 healthy，当前健康状态：${health:-missing}"
      print_container_logs "$production_container"
      return 1
    fi
    sleep 5
  done
}

image_id_is_retained() {
  local image_id="$1"
  shift
  local retained_image_id
  for retained_image_id in "$@"; do
    [[ "$image_id" == "$retained_image_id" ]] && return 0
  done
  return 1
}

prune_old_application_images() {
  local image_repository="${image_ref%:*}"
  local current_image_id
  if ! current_image_id="$(docker inspect --format '{{.Image}}' "$production_container")"; then
    echo "⚠️ 无法读取正式容器镜像，跳过历史镜像清理"
    return 0
  fi

  local -a image_candidates=()
  # docker image ls 默认按创建时间倒序；按镜像 ID 去重，避免多个标签占用回滚名额。
  while IFS= read -r image_candidate; do
    image_candidates+=("$image_candidate")
  done < <(docker image ls "$image_repository" --format '{{.Repository}}:{{.Tag}}')

  local -a retained_image_ids=("$current_image_id")
  local image_candidate image_id

  for image_candidate in "${image_candidates[@]}"; do
    [[ "$image_candidate" == *':<none>' ]] && continue
    image_id="$(docker image inspect --format '{{.Id}}' "$image_candidate" 2>/dev/null || true)"
    [[ -z "$image_id" ]] && continue
    image_id_is_retained "$image_id" "${retained_image_ids[@]}" && continue

    if (( ${#retained_image_ids[@]} < image_retention_count )); then
      retained_image_ids+=("$image_id")
    fi
  done

  for image_candidate in "${image_candidates[@]}"; do
    [[ "$image_candidate" == *':<none>' ]] && continue
    image_id="$(docker image inspect --format '{{.Id}}' "$image_candidate" 2>/dev/null || true)"
    [[ -z "$image_id" ]] && continue
    image_id_is_retained "$image_id" "${retained_image_ids[@]}" && continue

    echo "Removing expired application image: $image_candidate"
    if ! docker image rm "$image_candidate"; then
      echo "⚠️ 历史镜像清理失败，保留该镜像并继续完成发布：$image_candidate"
    fi
  done

  if ! docker image prune -f >/dev/null; then
    echo "⚠️ dangling 镜像清理失败，不影响本次发布结果"
  fi
  echo "✅ 本机最多保留 ${image_retention_count} 个应用镜像版本"
}

trap cleanup_candidate EXIT

echo "Pulling immutable image: $image_ref"
docker pull "$image_ref"

# 候选容器不挂载生产卷，真实验证全新镜像能完成 Eve sandbox 预热和 Next.js 启动。
cleanup_candidate
docker run -d \
  --name "$candidate_container" \
  --env-file .env \
  --env NODE_ENV=production \
  --env EVE_NEXT_PRODUCTION_PORT=4274 \
  --network app-network \
  "$image_ref" >/dev/null

echo "Waiting for candidate image health check..."
wait_for_candidate
echo "✅ 候选镜像已通过 Eve 预热与 Next.js 健康检查"
cleanup_candidate
trap - EXIT

# Nginx 在 reload 时重新解析 Docker 容器名。必须在切换前验证配置，
# 否则无效的其他 upstream 会阻止 reload，并让 Nginx 继续访问旧容器 IP。
echo "Validating reverse proxy configuration..."
docker exec "$reverse_proxy_container" nginx -t
echo "✅ Nginx 配置允许安全 reload"

# migration 独立于应用启动。失败时脚本立即退出，现有正式容器不会被替换。
# 为保证迁移执行期间旧版本仍可服务，生产迁移必须遵循先扩展、后收缩的 expand/contract 规则。
echo "Running database migration gate..."
docker run --rm \
  --env-file .env \
  --network app-network \
  --entrypoint /app/node_modules/.bin/prisma \
  "$image_ref" migrate deploy
echo "✅ 数据库 migration 已通过"

echo "Switching production container to: $image_ref"
AGENT_TEAM_IMAGE="$image_ref" docker compose -f "$compose_file" up -d --remove-orphans --pull never

wait_for_production
echo "✅ 正式容器已通过健康检查"

# Docker Compose recreate 会更换容器 IP；reload 让 Nginx 重新解析服务名，避免继续代理旧 IP。
echo "Reloading reverse proxy upstream..."
docker exec "$reverse_proxy_container" nginx -s reload
docker exec "$reverse_proxy_container" wget -q -O /dev/null -T 10 \
  "http://${production_container}:3000/agent-team/"
echo "✅ Nginx 已切换到新的正式容器"

prune_old_application_images
