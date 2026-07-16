#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

eve_pid=""
next_pid=""

cleanup() {
  trap - INT TERM EXIT
  [ -n "$next_pid" ] && kill -TERM "$next_pid" 2>/dev/null || true
  [ -n "$eve_pid" ] && kill -TERM "$eve_pid" 2>/dev/null || true
  [ -n "$next_pid" ] && wait "$next_pid" 2>/dev/null || true
  [ -n "$eve_pid" ] && wait "$eve_pid" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "Starting Eve server on 127.0.0.1:4274..."
./node_modules/.bin/eve start --host 127.0.0.1 --port 4274 &
eve_pid=$!

# `eve start` 会先预热沙盒模板再启动 HTTP 服务；等待健康检查通过，避免 Next.js 提前接收无法转发的请求。
echo "Waiting for Eve sandbox prewarm and health check..."
startup_started_at=$(date +%s)
until node -e "fetch('http://127.0.0.1:4274/eve/v1/health', { signal: AbortSignal.timeout(2000) }).then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"; do
  if ! kill -0 "$eve_pid" 2>/dev/null; then
    echo "Eve server exited before becoming healthy." >&2
    set +e
    wait "$eve_pid"
    status=$?
    set -e
    [ "$status" -eq 0 ] && status=1
    exit "$status"
  fi

  # Eve 的模板锁恢复窗口最长 15 分钟，再为 HTTP 就绪预留 1 分钟，避免重启循环反复打断锁恢复。
  startup_elapsed_seconds=$(($(date +%s) - startup_started_at))
  if [ "$startup_elapsed_seconds" -ge 960 ]; then
    echo "Eve server did not become healthy within 960 seconds." >&2
    exit 1
  fi
  sleep 1
done
echo "Eve server is healthy; sandbox cache path is /app/.eve/sandbox-cache."

echo "Starting Next.js server on 0.0.0.0:3000..."
HOSTNAME=0.0.0.0 PORT=3000 node server.js &
next_pid=$!

# 两个服务属于同一应用边界；任一进程退出都终止容器，让编排器按策略重启完整实例。
while kill -0 "$eve_pid" 2>/dev/null && kill -0 "$next_pid" 2>/dev/null; do
  sleep 2
done

if ! kill -0 "$eve_pid" 2>/dev/null; then
  set +e
  wait "$eve_pid"
  status=$?
  set -e
  [ "$status" -eq 0 ] && status=1
  exit "$status"
fi
set +e
wait "$next_pid"
status=$?
set -e
[ "$status" -eq 0 ] && status=1
exit "$status"
