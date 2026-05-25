#!/bin/sh
set -e

echo "Running database migration..."
./node_modules/.bin/prisma db push

echo "Starting server..."
exec node server.js
