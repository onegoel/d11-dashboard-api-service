#!/usr/bin/env bash

set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID}"
: "${REGION:?Set REGION}"
: "${AR_REPO:?Set AR_REPO}"
: "${SERVICE_NAME:?Set SERVICE_NAME}"
: "${CORS_ORIGIN:?Set CORS_ORIGIN}"
: "${BEST_N_DROP_COUNT:?Set BEST_N_DROP_COUNT}"

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}:$(date +%Y%m%d-%H%M%S)"

echo "Building ${IMAGE_URI}"
gcloud builds submit --tag "${IMAGE_URI}" .

echo "Deploying ${SERVICE_NAME} to Cloud Run"
EXTRA_ARGS=()
if [[ -n "${CLOUD_SQL_INSTANCE:-}" ]]; then
  EXTRA_ARGS+=(--add-cloudsql-instances "${CLOUD_SQL_INSTANCE}")
fi

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,CORS_ORIGIN=${CORS_ORIGIN},BEST_N_DROP_COUNT=${BEST_N_DROP_COUNT}" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --set-secrets "FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest" \
  --set-secrets "FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest" \
  --set-secrets "FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest" \
  "${EXTRA_ARGS[@]}"

echo "Deployment complete"