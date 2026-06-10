#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "CRS production deploy helper"
echo ""
echo "=== GitHub Actions (push to main) ==="
echo ""
echo "Repository VARIABLE (Settings → Secrets and variables → Actions → Variables):"
echo "  DEPLOY_TARGET = render   → deploy to Render (single Docker image)"
echo "  DEPLOY_TARGET = k8s      → deploy to Kubernetes (split crs-api + crs-web images)"
echo ""
echo "Secrets required when DEPLOY_TARGET=render:"
echo "  RENDER_DEPLOY_HOOK  — Render → crs service → Settings → Deploy Hook"
echo ""
echo "Secrets required when DEPLOY_TARGET=k8s:"
echo "  KUBE_CONFIG_PROD, K8S_OVERLAY_PROD, K8S_NAMESPACE_PROD"
echo ""
echo "Workflow: .github/workflows/deploy-prod.yml"
echo "  validate_target → ci → deploy_render OR deploy_k8s"
echo ""
echo "=== Render one-time setup (when DEPLOY_TARGET=render) ==="
echo ""
echo "1. Provision MongoDB Atlas and set MONGO_URI (see docker/render.env.example)"
echo "2. Generate JWT keys: ./docker/generate-jwt-keys.sh"
echo "3. Render Dashboard → New Blueprint → connect repo (render.yaml)"
echo "   autoDeploy is false — deploys are triggered by GitHub Actions only"
echo "4. Set Render env secrets: MONGO_URI, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY"
echo "5. Custom domain: crs.abnjain.me CNAME → <service>.onrender.com"
echo "6. Add RENDER_DEPLOY_HOOK to GitHub Secrets"
echo "7. Set DEPLOY_TARGET=render in GitHub Variables"
echo "8. After deploy: ./docker/smoke-test.sh https://crs.abnjain.me"
echo "9. Create admin: Render Shell → node /app/server/dist/scripts/createUser.js --name \"Admin\" --email you@example.com --password \"...\" --role superadmin"
echo ""

if command -v render >/dev/null 2>&1; then
  echo "Render CLI detected. Run: render blueprint apply"
else
  echo "Install Render CLI: https://render.com/docs/cli"
fi
