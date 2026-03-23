#!/usr/bin/env bash

set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID}"
: "${REGION:?Set REGION}"
: "${AR_REPO:?Set AR_REPO}"
: "${SERVICE_NAME:?Set SERVICE_NAME}"
: "${CLOUD_SQL_INSTANCE:?Set CLOUD_SQL_INSTANCE}"
: "${CORS_ORIGIN:?Set CORS_ORIGIN}"

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}:$(date +%Y%m%d-%H%M%S)"

echo "Building ${IMAGE_URI}"
gcloud builds submit --tag "${IMAGE_URI}" .

echo "Deploying ${SERVICE_NAME} to Cloud Run"
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances "${CLOUD_SQL_INSTANCE}" \
  --set-env-vars "NODE_ENV=production,CORS_ORIGIN=${CORS_ORIGIN}" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --set-secrets "FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest" \
  --set-secrets "FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest" \
  --set-secrets "FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest" \
  --set-secrets "WEB_PUSH_PUBLIC_KEY=WEB_PUSH_PUBLIC_KEY:latest" \
  --set-secrets "WEB_PUSH_PRIVATE_KEY=WEB_PUSH_PRIVATE_KEY:latest" \
  --set-secrets "WEB_PUSH_SUBJECT=WEB_PUSH_SUBJECT:latest"

echo "Deployment complete"