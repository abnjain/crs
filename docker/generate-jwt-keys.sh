#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
PRIVATE_PEM="${OUT_DIR}/jwt-private.pem"
PUBLIC_PEM="${OUT_DIR}/jwt-public.pem"

openssl genrsa -out "$PRIVATE_PEM" 2048
openssl rsa -in "$PRIVATE_PEM" -pubout -out "$PUBLIC_PEM"

private_oneline=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$PRIVATE_PEM")
public_oneline=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$PUBLIC_PEM")

echo ""
echo "=== Render env vars (paste into Dashboard → Environment) ==="
echo ""
echo "JWT_PRIVATE_KEY=\"${private_oneline}\""
echo ""
echo "JWT_PUBLIC_KEY=\"${public_oneline}\""
echo ""
echo "PEM files written to ${PRIVATE_PEM} and ${PUBLIC_PEM} (gitignored via .dockerignore)"
