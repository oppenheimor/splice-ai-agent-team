#!/usr/bin/env bash
set -euo pipefail

# 火山引擎命令任务的系统 home 是 /nonexistent。所有 SSH 状态都放进本次任务的
# 临时目录，避免并发任务互相覆盖，也避免在工作区残留私钥和 known_hosts。
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
ssh_dir="$(mktemp -d "${TMPDIR:-/tmp}/splice-ai-deploy.XXXXXX")"
ssh_key_path="$ssh_dir/deploy_key"
known_hosts_path="$ssh_dir/known_hosts"

image_repository="splice-ai-cn-shanghai.cr.volces.com/splice-ai/agent-team-nextjs"
remote_deploy_dir="/home/deploy/agent-team"
production_env_file="$remote_deploy_dir/.env"
production_network="app-network"

cleanup() {
  if [[ -d "$ssh_dir" ]]; then
    rm -rf -- "$ssh_dir"
  fi
}
trap cleanup EXIT

: "${SERVER_HOST:?缺少 SERVER_HOST}"
: "${SERVER_USER:?缺少 SERVER_USER}"
: "${SERVER_SSH_KEY:?缺少 SERVER_SSH_KEY}"
: "${SCM_COMMIT_ID:?缺少 SCM_COMMIT_ID}"

if [[ ! "$SCM_COMMIT_ID" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "SCM_COMMIT_ID 必须是完整的 40 位 commit SHA" >&2
  exit 1
fi

cd "$repo_root"

test -f docker-compose.yml
test -f scripts/deploy-production.sh

image_ref="${image_repository}:${SCM_COMMIT_ID}"
deploy_target="${SERVER_USER}@${SERVER_HOST}"

# SERVER_SSH_KEY 保存的是单行 Base64。解码后只验证私钥格式，不输出私钥内容。
printf '%s' "$SERVER_SSH_KEY" \
  | tr -d '[:space:]' \
  | base64 -d > "$ssh_key_path"
chmod 600 "$ssh_key_path"

grep -qx -- '-----BEGIN OPENSSH PRIVATE KEY-----' \
  <(head -n 1 "$ssh_key_path")
grep -qx -- '-----END OPENSSH PRIVATE KEY-----' \
  <(tail -n 1 "$ssh_key_path")
ssh-keygen -y -f "$ssh_key_path" >/dev/null

# 当前沿用已验证的首次信任模型：本次任务扫描主机公钥，后续 SSH/SCP 都只信任
# 这个临时 known_hosts。若未来增加固定指纹变量，可在这里升级为主机密钥钉扎。
ssh-keyscan -T 10 -H "$SERVER_HOST" > "$known_hosts_path" 2>/dev/null
test -s "$known_hosts_path"
chmod 600 "$known_hosts_path"

ssh_options=(
  -F /dev/null
  -i "$ssh_key_path"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o ConnectTimeout=15
  -o ServerAliveInterval=15
  -o ServerAliveCountMax=3
  -o StrictHostKeyChecking=yes
  -o UserKnownHostsFile="$known_hosts_path"
  -o GlobalKnownHostsFile=/dev/null
  -o UpdateHostKeys=no
)

echo "部署前检查镜像：$image_ref"

# 部署前只验证生产配置、Docker 运行时和镜像权限，不修改服务器状态或下载镜像。
ssh "${ssh_options[@]}" \
  "$deploy_target" \
  bash -s -- "$image_ref" "$production_env_file" "$production_network" <<'PREFLIGHT'
set -euo pipefail

image_ref="$1"
env_file="$2"
production_network="$3"

test -f "$env_file"
test -r "$env_file"

for variable_name in \
  DEEPSEEK_API_KEY \
  DATABASE_URL \
  TAVILY_API_KEY
do
  variable_value="$(
    sed -n "s/^[[:space:]]*${variable_name}=//p" "$env_file" |
      tail -n 1 |
      tr -d '\r'
  )"

  if [[ -z "$variable_value" ||
        "$variable_value" == '""' ||
        "$variable_value" == "''" ]]; then
    echo "生产环境变量缺失或为空：${variable_name}" >&2
    exit 1
  fi
done

docker version >/dev/null
docker compose version >/dev/null
docker network inspect "$production_network" >/dev/null
docker manifest inspect "$image_ref" >/dev/null

echo "production-preflight-ok"
PREFLIGHT

echo "上传生产部署文件"
scp "${ssh_options[@]}" \
  docker-compose.yml \
  scripts/deploy-production.sh \
  "$deploy_target:$remote_deploy_dir/"

echo "开始部署不可变镜像：$image_ref"

# 服务器脚本负责候选预热、migration、正式切换、健康检查和历史镜像清理。
ssh "${ssh_options[@]}" \
  "$deploy_target" \
  bash -s -- "$image_ref" "$remote_deploy_dir" <<'DEPLOY'
set -euo pipefail

image_ref="$1"
remote_deploy_dir="$2"

cd "$remote_deploy_dir"
chmod +x deploy-production.sh
bash ./deploy-production.sh "$image_ref"
DEPLOY

echo "production-deployment-completed"
echo "deployed-image=$image_ref"
