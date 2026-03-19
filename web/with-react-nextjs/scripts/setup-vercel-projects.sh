#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$BASE_DIR/vercel-projects.json"

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Error: VERCEL_TOKEN environment variable is required"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not installed"
  exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Config file not found: $CONFIG_FILE"
  exit 1
fi

DEPLOY=${1:-}
PARA_API_KEY="${PARA_API_KEY:-}"
WALLET_CONNECT_PROJECT_ID="${WALLET_CONNECT_PROJECT_ID:-}"
VERCEL_SCOPE="${VERCEL_SCOPE:-para-examples}"

# Projects that need WalletConnect
WALLETCONNECT_PROJECTS="para-modal-evm para-modal-multichain connector-wagmi connector-rainbowkit connector-reown-appkit signer-viem-v2"

PROJECTS=$(jq -r 'keys[]' "$CONFIG_FILE")
UPDATED_CONFIG=$(cat "$CONFIG_FILE")
FAILED_PROJECTS=""
DEPLOYED_PROJECTS=""

for PROJECT in $PROJECTS; do
  PROJECT_DIR="$BASE_DIR/$PROJECT"
  VERCEL_NAME="para-example-$PROJECT"

  if [ ! -d "$PROJECT_DIR" ]; then
    echo "Warning: Directory not found, skipping: $PROJECT_DIR"
    continue
  fi

  echo ""
  echo "=========================================="
  echo "  $PROJECT"
  echo "=========================================="

  # Link project (creates .vercel/ in project dir)
  echo "Linking -> $VERCEL_NAME"
  (cd "$PROJECT_DIR" && vercel link --yes --project "$VERCEL_NAME" --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE")

  PROJECT_ID=$(jq -r '.projectId' "$PROJECT_DIR/.vercel/project.json")
  UPDATED_CONFIG=$(echo "$UPDATED_CONFIG" | jq --arg proj "$PROJECT" --arg id "$PROJECT_ID" \
    '.[$proj].projectId = $id')
  echo "  projectId: $PROJECT_ID"

  if [ "$DEPLOY" = "--deploy" ]; then
    # Set env vars while project is still linked (.vercel/ exists)
    if [ -n "$PARA_API_KEY" ]; then
      echo "  Setting NEXT_PUBLIC_PARA_API_KEY (production)..."
      printf '%s' "$PARA_API_KEY" | (cd "$PROJECT_DIR" && vercel env add NEXT_PUBLIC_PARA_API_KEY production --force --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE") || true

      echo "  Setting NEXT_PUBLIC_PARA_ENVIRONMENT (production)..."
      printf '%s' "BETA" | (cd "$PROJECT_DIR" && vercel env add NEXT_PUBLIC_PARA_ENVIRONMENT production --force --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE") || true
    fi

    if echo "$WALLETCONNECT_PROJECTS" | grep -qw "$PROJECT" && [ -n "$WALLET_CONNECT_PROJECT_ID" ]; then
      echo "  Setting NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID (production)..."
      printf '%s' "$WALLET_CONNECT_PROJECT_ID" | (cd "$PROJECT_DIR" && vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID production --force --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE") || true

    fi

    echo "  Deploying..."
    if (cd "$PROJECT_DIR" && vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE" 2>&1); then
      DEPLOYED_PROJECTS="$DEPLOYED_PROJECTS $PROJECT"
      echo "  Deployed!"
    else
      FAILED_PROJECTS="$FAILED_PROJECTS $PROJECT"
      echo "  FAILED to deploy"
    fi
  fi

  # Clean up .vercel directory after env vars and deploy
  rm -rf "$PROJECT_DIR/.vercel"
done

echo "$UPDATED_CONFIG" | jq '.' > "$CONFIG_FILE"
echo ""
echo "Updated $CONFIG_FILE with all project IDs"

if [ "$DEPLOY" = "--deploy" ]; then
  echo ""
  echo "=========================================="
  echo "  Deploy Summary"
  echo "=========================================="
  if [ -n "$DEPLOYED_PROJECTS" ]; then
    echo "Deployed:$DEPLOYED_PROJECTS"
  fi
  if [ -n "$FAILED_PROJECTS" ]; then
    echo "Failed:$FAILED_PROJECTS"
  fi
fi
