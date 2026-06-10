#!/bin/sh
set -e

API_PORT="${API_INTERNAL_PORT:-5000}"
NGINX_PORT="${PORT:-10000}"

mkdir -p /var/uploads /run/nginx /etc/nginx/http.d

cleanup() {
  echo "Shutting down CRS..."
  if [ -n "$NODE_PID" ]; then
    kill -TERM "$NODE_PID" 2>/dev/null || true
    wait "$NODE_PID" 2>/dev/null || true
  fi
  nginx -s quit 2>/dev/null || true
}

trap cleanup TERM INT

echo "Starting API on port ${API_PORT}..."
PORT="$API_PORT" node /app/server/dist/server.js &
NODE_PID=$!

echo "Waiting for API readiness..."
ready=0
i=0
while [ "$i" -lt 60 ]; do
  if wget -qO- "http://127.0.0.1:${API_PORT}/api/v1/health/live" >/dev/null 2>&1; then
    ready=1
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "API failed to become ready within 60s"
  cleanup
  exit 1
fi

export PORT="$NGINX_PORT"
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/http.d/crs.conf

echo "Starting nginx on port ${NGINX_PORT}..."
nginx -g 'daemon off;' &
NGINX_PID=$!

wait "$NGINX_PID"
