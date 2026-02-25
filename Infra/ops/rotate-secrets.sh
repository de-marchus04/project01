#!/usr/bin/env bash
set -euo pipefail

OUT_FILE=${1:-"./rotated-secrets-$(date -u +%Y%m%dT%H%M%SZ).env"}

JWT_KEY=$(openssl rand -base64 48 | tr -d '\n')
ADMIN_CREATION_KEY=$(openssl rand -base64 36 | tr -d '\n')
KEY_VERSION=$(date -u +"%Y%m%d")

cat > "$OUT_FILE" <<EOF
# Generated at $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Security__JwtKey=$JWT_KEY
Security__AdminCreationKey=$ADMIN_CREATION_KEY
Security__JwtKeyVersion=$KEY_VERSION
EOF

echo "Rotated secrets file created: $OUT_FILE"
echo "Next steps:"
echo "1) Update production secret store with these values"
echo "2) Restart api service"
echo "3) Verify /health/ready and login flow"
