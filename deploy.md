# Deploy CRS (AWS + DigitalOcean)

This guide deploys the CRS client and server to Kubernetes on AWS (EKS) or DigitalOcean (DOKS) with RS256 JWT, HttpOnly cookies, CSRF protection, and Sealed Secrets.

## 1) Prerequisites

- Kubernetes cluster (EKS or DOKS)
- Nginx Ingress Controller
- Metrics Server (for HPA)
- cert-manager (for TLS)
- Sealed Secrets controller
- kubectl + kustomize
- Container registry (GHCR, ECR, or DOCR)

Note: NetworkPolicies assume the ingress controller namespace is named ingress-nginx. If yours differs, update server/cloud-infra/k8s/base/networkpolicy.yaml.

## 2) Generate JWT keys

Generate a private/public key pair for RS256:

```
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out jwt-private.pem
openssl rsa -pubout -in jwt-private.pem -out jwt-public.pem
```

Convert to single-line values for env/sealed secrets (replace newlines with \n).

If you want to use HS256 in local dev, set JWT_ALG=HS256 and JWT_SECRET, but production should use RS256.

## 3) Create Sealed Secrets

Create a Kubernetes Secret locally, then seal it per environment namespace.

Example (replace values):

```
kubectl -n crs-aws-dev create secret generic crs-app-secrets \
  --from-file=JWT_PRIVATE_KEY=jwt-private.pem \
  --from-file=JWT_PUBLIC_KEY=jwt-public.pem \
  --from-literal=MONGO_URI='mongodb://crs-root:STRONG_PASS@mongo:27017/crs?authSource=admin' \
  --from-literal=REDIS_URL='redis://:STRONG_PASS@redis:6379' \
  --from-literal=SMTP_HOST='' \
  --from-literal=SMTP_USER='' \
  --from-literal=SMTP_PASS='' \
  --from-literal=SMTP_FROM='' \
  --from-literal=S3_BUCKET='' \
  --from-literal=S3_ACCESS_KEY_ID='' \
  --from-literal=S3_SECRET_ACCESS_KEY='' \
  --dry-run=client -o yaml | \
  kubeseal --format=yaml --cert /path/to/sealed-secrets-cert.pem > crs-app-secrets.sealed.yaml
```

Apply sealed secrets to the namespace:

```
kubectl apply -f crs-app-secrets.sealed.yaml
```

Repeat for:

- crs-mongo-secret (root username/password)
- crs-redis-secret (password)

## 4) Configure overlays

Update these files before deployment:

- server/cloud-infra/k8s/overlays/*/ingress-patch.yaml (domain + TLS secret)
- server/cloud-infra/k8s/overlays/*/configmap-patch.yaml (CORS + cookie secure)
- server/cloud-infra/k8s/base/configmap-app.yaml (if you need custom settings)

## 5) Deploy with kubectl (manual)

Dev:

```
kubectl apply -k server/cloud-infra/k8s/overlays/aws-dev
# or
kubectl apply -k server/cloud-infra/k8s/overlays/do-dev
```

Prod:

```
kubectl apply -k server/cloud-infra/k8s/overlays/aws-prod
# or
kubectl apply -k server/cloud-infra/k8s/overlays/do-prod
```

## 6) GitHub Actions (recommended)

Set these repository secrets:

- KUBE_CONFIG_DEV and KUBE_CONFIG_PROD (base64 kubeconfig)
- K8S_OVERLAY_DEV and K8S_OVERLAY_PROD (overlay path)
- K8S_NAMESPACE_DEV and K8S_NAMESPACE_PROD (namespace name)

Push to:

- dev branch -> deploys dev overlay
- main branch -> deploys prod overlay

## 7) Verify

- Health:
  - https://YOUR_DOMAIN/api/v1/health/live
  - https://YOUR_DOMAIN/api/v1/health/ready
- Login and ensure cookies are set:
  - crs_token (HttpOnly)
  - crs_csrf (readable by JS)
- State-changing requests require the X-CSRF-Token header (handled by the frontend).

## 8) Backup and Restore

Backups are scheduled by CronJobs:

- mongo-backup
- redis-backup

Restore (manual):

```
kubectl apply -f server/cloud-infra/k8s/ops/restore-mongo-job.yaml
kubectl apply -f server/cloud-infra/k8s/ops/restore-redis-job.yaml
```

## 9) Rollback

```
kubectl -n <namespace> rollout undo deployment/crs-api
kubectl -n <namespace> rollout undo deployment/crs-web
```
