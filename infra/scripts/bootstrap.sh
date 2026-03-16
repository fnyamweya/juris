#!/usr/bin/env bash
set -euo pipefail

# =============================================
# Bootstrap Cloudflare resources & GitHub secrets
# =============================================
# Creates D1, R2, Vectorize, and Queue resources if they don't exist,
# then stores the IDs as GitHub Actions secrets.
#
# Prerequisites:
#   - gh cli authenticated  (gh auth login)
#   - wrangler authenticated (npx wrangler login  OR  CLOUDFLARE_API_TOKEN set)
#   - CLOUDFLARE_ACCOUNT_ID set in environment or .env
#
# Usage:
#   ./infra/scripts/bootstrap.sh
#   ./infra/scripts/bootstrap.sh --skip-secrets   # provision only, don't set GH secrets
#   ./infra/scripts/bootstrap.sh --dry-run        # show what would be created

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

SKIP_SECRETS=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --skip-secrets) SKIP_SECRETS=true ;;
    --dry-run)      DRY_RUN=true ;;
  esac
done

# Load .env if present (but don't override existing env vars)
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source <(grep -v '^\s*#' "$ROOT_DIR/.env" | grep -v '^\s*$' | while IFS='=' read -r key value; do
    [[ -z "${!key:-}" ]] && echo "$key=$value"
  done)
  set +a
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Error: CLOUDFLARE_ACCOUNT_ID is required."
  echo "Set it in .env or export it before running this script."
  exit 1
fi

REPO="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo '')}"

# ---- Helpers ----

log()  { echo "  $1  $2"; }
info() { echo ""; echo "==> $1"; }

# Get or create a D1 database, returns the UUID
ensure_d1() {
  local db_name="$1"
  info "D1 database: $db_name"

  local existing_id
  existing_id=$(npx wrangler d1 list --json 2>/dev/null \
    | grep -o "\"uuid\":\"[^\"]*\",\"name\":\"${db_name}\"" \
    | head -1 \
    | grep -o '"uuid":"[^"]*"' \
    | cut -d'"' -f4 || true)

  if [[ -n "$existing_id" ]]; then
    log "EXISTS" "$db_name → $existing_id"
    echo "$existing_id"
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "WOULD CREATE" "$db_name"
    echo "dry-run-id"
    return
  fi

  local output
  output=$(npx wrangler d1 create "$db_name" 2>&1)
  local new_id
  new_id=$(echo "$output" | grep -oP 'database_id\s*=\s*"\K[^"]+' || \
           echo "$output" | grep -oP '"uuid":\s*"\K[^"]+' || true)

  if [[ -z "$new_id" ]]; then
    echo "Error: Failed to parse D1 ID from output:" >&2
    echo "$output" >&2
    exit 1
  fi

  log "CREATED" "$db_name → $new_id"
  echo "$new_id"
}

# Get or create an R2 bucket (buckets don't have UUIDs, just names)
ensure_r2() {
  local bucket_name="$1"
  info "R2 bucket: $bucket_name"

  local exists
  exists=$(npx wrangler r2 bucket list 2>/dev/null | grep -c "\"name\":\"${bucket_name}\"" || true)

  if [[ "$exists" -gt 0 ]]; then
    log "EXISTS" "$bucket_name"
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "WOULD CREATE" "$bucket_name"
    return
  fi

  npx wrangler r2 bucket create "$bucket_name" >/dev/null 2>&1
  log "CREATED" "$bucket_name"
}

# Get or create a Vectorize index
ensure_vectorize() {
  local index_name="$1"
  local dimensions="${2:-768}"
  local metric="${3:-cosine}"
  info "Vectorize index: $index_name"

  local exists
  exists=$(npx wrangler vectorize list 2>/dev/null | grep -c "\"name\":\"${index_name}\"" || true)

  if [[ "$exists" -gt 0 ]]; then
    log "EXISTS" "$index_name"
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "WOULD CREATE" "$index_name (${dimensions}d, $metric)"
    return
  fi

  npx wrangler vectorize create "$index_name" \
    --dimensions="$dimensions" \
    --metric="$metric" >/dev/null 2>&1
  log "CREATED" "$index_name (${dimensions}d, $metric)"
}

# Get or create a Queue
ensure_queue() {
  local queue_name="$1"
  info "Queue: $queue_name"

  local exists
  exists=$(npx wrangler queues list 2>/dev/null | grep -c "\"queue_name\":\"${queue_name}\"" || true)

  if [[ "$exists" -gt 0 ]]; then
    log "EXISTS" "$queue_name"
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "WOULD CREATE" "$queue_name"
    return
  fi

  npx wrangler queues create "$queue_name" >/dev/null 2>&1
  log "CREATED" "$queue_name"
}

# Set a GitHub secret
set_secret() {
  local key="$1"
  local value="$2"

  if [[ "$SKIP_SECRETS" == "true" || "$DRY_RUN" == "true" ]]; then
    log "SKIP" "secret $key"
    return
  fi

  if [[ -z "$REPO" ]]; then
    log "WARN" "No GitHub repo detected — skipping secret $key"
    return
  fi

  echo "$value" | gh secret set "$key" --repo "$REPO" 2>/dev/null
  log "SECRET" "$key → set"
}

# =============================================
# Provision Resources
# =============================================

echo "============================================="
echo " JUSRIS Platform — Resource Bootstrap"
echo "============================================="
echo " Account: $CLOUDFLARE_ACCOUNT_ID"
[[ -n "$REPO" ]] && echo " Repo:    $REPO"
[[ "$DRY_RUN" == "true" ]] && echo " Mode:    DRY RUN"
echo "============================================="

# --- D1 Databases ---
MASTER_REGISTRY_D1_ID=$(ensure_d1 "jusris-master-registry")
TENANT_D1_ID=$(ensure_d1 "jusris-tenant")

# --- R2 Buckets ---
ensure_r2 "jusris-tenant-storage"

# --- Vectorize Indexes ---
ensure_vectorize "jusris-tenant-vectors" 768 cosine

# --- Queues ---
ensure_queue "jusris-provisioning"
ensure_queue "jusris-ingestion"

# =============================================
# Run Migrations
# =============================================

info "Running master-registry migrations..."
if [[ "$DRY_RUN" == "true" ]]; then
  log "SKIP" "migrations (dry run)"
else
  node "$SCRIPT_DIR/migrate-registry.mjs" || log "WARN" "Migration failed — DB may already be up to date"
fi

# =============================================
# Set GitHub Secrets
# =============================================

info "Setting GitHub secrets..."

set_secret "CLOUDFLARE_ACCOUNT_ID" "$CLOUDFLARE_ACCOUNT_ID"
set_secret "CLOUDFLARE_API_TOKEN"  "${CLOUDFLARE_API_TOKEN:-}"
set_secret "MASTER_REGISTRY_D1_ID" "$MASTER_REGISTRY_D1_ID"
set_secret "TENANT_D1_ID"          "$TENANT_D1_ID"

# =============================================
# Summary
# =============================================

info "Done!"
echo ""
echo "  Resource IDs:"
echo "    MASTER_REGISTRY_D1_ID = $MASTER_REGISTRY_D1_ID"
echo "    TENANT_D1_ID          = $TENANT_D1_ID"
echo ""
echo "  To also write these to .env:"
echo "    MASTER_REGISTRY_D1_ID=$MASTER_REGISTRY_D1_ID"
echo "    TENANT_D1_ID=$TENANT_D1_ID"
echo ""
