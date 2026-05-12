# CRS Cloud Infra

This folder contains Kubernetes manifests, backup/restore jobs, and CI/CD guidance for deploying the CRS client and server to AWS or DigitalOcean.

## Structure

- k8s/base: shared workloads (api, web, mongo, redis, backups)
- k8s/overlays: provider and environment overlays
- k8s/ops: manual restore jobs (run only when needed)

## Prerequisites

- A Kubernetes cluster (DOKS or EKS)
- Nginx Ingress Controller
- Metrics Server (for HPA)
- A default StorageClass
- A container registry (GHCR, ECR, or DOCR)

## Deploy

Choose one overlay and apply it:

- Dev (AWS):
  kubectl apply -k server/cloud-infra/k8s/overlays/aws-dev
- Prod (AWS):
  kubectl apply -k server/cloud-infra/k8s/overlays/aws-prod
- Dev (DigitalOcean):
  kubectl apply -k server/cloud-infra/k8s/overlays/do-dev
- Prod (DigitalOcean):
  kubectl apply -k server/cloud-infra/k8s/overlays/do-prod

Update these placeholders before deploy:

- Ingress hosts and TLS secret names in each overlay
- Images in base deployments (or let GitHub Actions set them)
- Secrets in base manifests (JWT, Mongo, Redis, S3, SMTP)

## GitHub Actions

Workflows are in .github/workflows and deploy on branch pushes:

- dev branch -> Deploy Dev
- main branch -> Deploy Prod

Set these repo secrets:

- KUBE_CONFIG_DEV and KUBE_CONFIG_PROD (base64 kubeconfig)
- K8S_OVERLAY_DEV and K8S_OVERLAY_PROD
  - Example: server/cloud-infra/k8s/overlays/aws-dev
  - Example: server/cloud-infra/k8s/overlays/aws-prod
- K8S_NAMESPACE_DEV and K8S_NAMESPACE_PROD
  - Example: crs-aws-dev
  - Example: crs-aws-prod

## Secrets and Config

Update these before deploy:

- k8s/base/secret-app.yaml
  - JWT_PRIVATE_KEY
  - JWT_PUBLIC_KEY
  - MONGO_URI
  - REDIS_URL
  - SMTP_* (optional)
  - S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
- k8s/base/data/mongo-secret.yaml
  - MONGO_INITDB_ROOT_USERNAME
  - MONGO_INITDB_ROOT_PASSWORD
- k8s/base/data/redis-secret.yaml
  - REDIS_PASSWORD

For object storage uploads:

- Set UPLOAD_PROVIDER=s3 in the prod overlays
- Set S3_ENDPOINT in the DO overlay (DigitalOcean Spaces)

## Sealed Secrets (Recommended)

Store real secrets as SealedSecrets and keep the placeholders in base YAML only.
Use kubeseal to generate encrypted secret manifests for each environment.

## Backup and Restore

Backups

- Mongo and Redis backups run as CronJobs and write to the crs-backups PVC
- If S3_BUCKET is set, backups are also uploaded to S3 or Spaces

Restore

- Edit the RESTORE_FILE value in the restore job manifests
- Apply the job from k8s/ops when you need a restore

Examples:

- Mongo restore:
  kubectl apply -f server/cloud-infra/k8s/ops/restore-mongo-job.yaml
- Redis restore:
  kubectl apply -f server/cloud-infra/k8s/ops/restore-redis-job.yaml

Redis restore copies the RDB snapshot into the redis PVC. Restart the redis pod to load the snapshot.

## Scaling for 5000 Users

- API HPA is enabled (min 2, max 10); tune CPU and memory targets to your load tests
- Keep Socket.IO on the Redis adapter with Redis persistence enabled
- Use CDN for client static files and cache /assets/
- Increase MongoDB and Redis resources and storage as usage grows
- Set a higher ingress proxy timeout for long-lived socket connections

## Notes

- This setup uses single-node MongoDB and Redis by default. For production HA, move MongoDB to a replica set and Redis to a clustered or sentinel setup.
- The restore jobs are not part of the base kustomization to avoid accidental runs.
