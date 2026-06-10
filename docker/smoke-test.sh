#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"
BASE_URL="${BASE_URL%/}"

echo "Smoke testing CRS at ${BASE_URL}"

code_spa=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/")
if [ "$code_spa" != "200" ]; then
  echo "FAIL: SPA returned HTTP ${code_spa}"
  exit 1
fi
echo "OK: SPA HTTP 200"

health=$(curl -s "${BASE_URL}/api/v1/health")
echo "$health" | grep -q '"success":true' || { echo "FAIL: health check"; exit 1; }
echo "$health" | grep -q '"mongodb":"connected"' || echo "WARN: MongoDB not connected in health response"

code_live=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/health/live")
if [ "$code_live" != "200" ]; then
  echo "FAIL: live health returned HTTP ${code_live}"
  exit 1
fi
echo "OK: /api/v1/health/live HTTP 200"

socket=$(curl -s "${BASE_URL}/socket.io/?EIO=4&transport=polling")
echo "$socket" | grep -q '"sid"' || { echo "FAIL: Socket.IO polling"; exit 1; }
echo "OK: Socket.IO polling handshake"

echo "All smoke checks passed."
