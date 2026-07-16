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
HOST=127.0.0.1 PORT=4274 node .output/server/index.mjs &
eve_pid=$!

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
