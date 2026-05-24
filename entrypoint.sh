#!/bin/sh
set -e

# TODO: 需要数据库的时候把它打开
# echo "Running database migration..."
# ./node_modules/.bin/prisma db push --skip-generate

echo "Starting server..."
exec node server.js
