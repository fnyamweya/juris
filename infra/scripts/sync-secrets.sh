#!/usr/bin/env bash
set -euo pipefail

# =============================================
# Sync local .env values to GitHub Actions secrets
# =============================================
# Usage:
#   ./infra/scripts/sync-secrets.sh              # reads .env
#   ./infra/scripts/sync-secrets.sh .env.staging  # reads custom file
#
# Prerequisites: gh cli authenticated (`gh auth login`)

ENV_FILE="${1:-.env}"
REPO="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found."
  echo "Copy .env.example to .env and fill in your values first:"
  echo "  cp .env.example .env"
  exit 1
fi

echo "Syncing secrets from $ENV_FILE → GitHub repo $REPO"
echo "---------------------------------------------------"

count=0
skipped=0

while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip comments and blank lines
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Parse KEY=VALUE
  key="${line%%=*}"
  value="${line#*=}"

  # Skip entries with no value
  if [[ -z "$value" ]]; then
    echo "  SKIP  $key (empty)"
    ((skipped++)) || true
    continue
  fi

  echo "  SET   $key"
  echo "$value" | gh secret set "$key" --repo "$REPO"
  ((count++)) || true
done < "$ENV_FILE"

echo "---------------------------------------------------"
echo "Done: $count secrets set, $skipped skipped (empty)."
