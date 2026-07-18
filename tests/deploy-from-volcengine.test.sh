#!/usr/bin/env bash
set -euo pipefail

script_path="${1:-scripts/deploy-from-volcengine.sh}"
script_dir="$(cd "$(dirname "$script_path")" && pwd)"
script_path="$script_dir/$(basename "$script_path")"

bash -n "$script_path"

temp_dir="$(mktemp -d "${TMPDIR:-/tmp}/deploy-from-volcengine-test.XXXXXX")"
cleanup() {
  rm -rf -- "$temp_dir"
}
trap cleanup EXIT

mock_bin="$temp_dir/bin"
command_log="$temp_dir/commands.log"
mkdir -p "$mock_bin"

ssh-keygen -q -t ed25519 -N '' -f "$temp_dir/deploy_key"
server_ssh_key="$(base64 < "$temp_dir/deploy_key" | tr -d '[:space:]')"

cat > "$mock_bin/ssh-keyscan" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' 'server.example ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITestOnlyHostKey'
MOCK

cat > "$mock_bin/ssh" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf 'ssh' >> "$COMMAND_LOG"
printf ' %q' "$@" >> "$COMMAND_LOG"
printf '\n' >> "$COMMAND_LOG"
cat >/dev/null
MOCK

cat > "$mock_bin/scp" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf 'scp' >> "$COMMAND_LOG"
printf ' %q' "$@" >> "$COMMAND_LOG"
printf '\n' >> "$COMMAND_LOG"
MOCK

chmod +x "$mock_bin/ssh-keyscan" "$mock_bin/ssh" "$mock_bin/scp"

if SERVER_HOST=server.example \
  SERVER_USER=deploy \
  SERVER_SSH_KEY="$server_ssh_key" \
  SCM_COMMIT_ID=invalid \
  PATH="$mock_bin:$PATH" \
  COMMAND_LOG="$command_log" \
  bash "$script_path" >"$temp_dir/invalid-sha.log" 2>&1; then
  echo "非法 SCM_COMMIT_ID 必须阻止部署" >&2
  exit 1
fi

grep -qF 'SCM_COMMIT_ID 必须是完整的 40 位 commit SHA' "$temp_dir/invalid-sha.log"

commit_sha="0123456789abcdef0123456789abcdef01234567"
SERVER_HOST=server.example \
  SERVER_USER=deploy \
  SERVER_SSH_KEY="$server_ssh_key" \
  SCM_COMMIT_ID="$commit_sha" \
  PATH="$mock_bin:$PATH" \
  COMMAND_LOG="$command_log" \
  bash "$script_path" >"$temp_dir/success.log"

grep -qF "deployed-image=splice-ai-cn-shanghai.cr.volces.com/splice-ai/agent-team-nextjs:${commit_sha}" "$temp_dir/success.log"
grep -qF 'docker-compose.yml' "$command_log"
grep -qF 'scripts/deploy-production.sh' "$command_log"
grep -qF 'deploy@server.example:/home/deploy/agent-team/' "$command_log"
grep -qF 'DEEPSEEK_API_KEY' "$command_log"
grep -qF 'DATABASE_URL' "$command_log"
grep -qF 'TAVILY_API_KEY' "$command_log"

ssh_call_count="$(grep -c '^ssh ' "$command_log")"
if [[ "$ssh_call_count" != "2" ]]; then
  echo "部署编排必须只执行一次预检 SSH 和一次部署 SSH，实际：${ssh_call_count}" >&2
  exit 1
fi

build_datetime="20260719042105"
release_tag="${commit_sha}-${build_datetime}"
: > "$command_log"

SERVER_HOST=server.example \
  SERVER_USER=deploy \
  SERVER_SSH_KEY="$server_ssh_key" \
  SCM_COMMIT_ID="$commit_sha" \
  DEPLOY_IMAGE_TAG="$release_tag" \
  PATH="$mock_bin:$PATH" \
  COMMAND_LOG="$command_log" \
  bash "$script_path" >"$temp_dir/unique-release.log"

grep -qF "deployed-image=splice-ai-cn-shanghai.cr.volces.com/splice-ai/agent-team-nextjs:${release_tag}" "$temp_dir/unique-release.log"

if SERVER_HOST=server.example \
  SERVER_USER=deploy \
  SERVER_SSH_KEY="$server_ssh_key" \
  SCM_COMMIT_ID="$commit_sha" \
  DEPLOY_IMAGE_TAG="ffffffffffffffffffffffffffffffffffffffff-${build_datetime}" \
  PATH="$mock_bin:$PATH" \
  COMMAND_LOG="$command_log" \
  bash "$script_path" >"$temp_dir/mismatched-release.log" 2>&1; then
  echo "不属于当前 commit 的发布版本必须阻止部署" >&2
  exit 1
fi

grep -qF 'DEPLOY_IMAGE_TAG 必须是当前 commit SHA' "$temp_dir/mismatched-release.log"

# 迁移前已经发布的 32 位流水线运行 ID 标签仍可用于回滚。
legacy_pipeline_run_id="89abcdef0123456789abcdef01234567"
SERVER_HOST=server.example \
  SERVER_USER=deploy \
  SERVER_SSH_KEY="$server_ssh_key" \
  SCM_COMMIT_ID="$commit_sha" \
  DEPLOY_IMAGE_TAG="${commit_sha}-${legacy_pipeline_run_id}" \
  PATH="$mock_bin:$PATH" \
  COMMAND_LOG="$command_log" \
  bash "$script_path" >"$temp_dir/legacy-release.log"

echo "deploy-from-volcengine-ok"
