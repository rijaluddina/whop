#!/usr/bin/env bash
# Set production secrets for the Whop app via `whop apps secrets set`.
#
# 1. Create a .secrets.local file (git-ignored) next to .dev.vars with:
#      WHOP_CLIENT_SECRET=<client secret from whop.com/dashboard/developer → your app → OAuth>
#      WHOP_WEBHOOK_SECRET=<ws_... from scripts/register-webhook.sh or the dashboard>
# 2. Log in with `pnpm exec whop auth login`.
# 3. Run: bash scripts/set-production-secrets.sh
#
# WHOP_ACCOUNT_ID and WHOP_API_KEY are NOT set here: the Whop hosted runtime
# reserves and injects WHOP_ACCOUNT_ID itself, and signs server-side API calls
# with the app's own key through its outbound proxy — see
# https://docs.whop.com/developer/websites/hosting.md. Both stay in .dev.vars
# for local development only.
#
# Values can also be passed as environment variables, e.g.
#   WHOP_CLIENT_SECRET=... WHOP_WEBHOOK_SECRET=... bash scripts/set-production-secrets.sh
#
# OWNER_DASHBOARD_PASSWORD and OWNER_ROUTE_SLUG are reused from .dev.vars so
# production matches local testing. Edit .dev.vars first if they should differ.
set -euo pipefail
cd "$(dirname "$0")/.."

SITE_DOMAIN="${SITE_DOMAIN:-the-curiosity-labs.whop.site}"

local_var() { { grep -E "^$1=" .secrets.local 2>/dev/null || true; } | head -1 | cut -d= -f2-; }
WHOP_CLIENT_SECRET="${WHOP_CLIENT_SECRET:-$(local_var WHOP_CLIENT_SECRET)}"
WHOP_WEBHOOK_SECRET="${WHOP_WEBHOOK_SECRET:-$(local_var WHOP_WEBHOOK_SECRET)}"

missing=0
for required in WHOP_CLIENT_SECRET WHOP_WEBHOOK_SECRET; do
  if [[ -z ${!required} ]]; then
    echo "Missing $required — put it in .secrets.local (WHOP_CLIENT_SECRET=..., WHOP_WEBHOOK_SECRET=ws_...) or export it." >&2
    missing=1
  fi
done
[[ $missing -eq 0 ]] || exit 1
[[ $WHOP_WEBHOOK_SECRET == ws_* ]] || { echo 'WHOP_WEBHOOK_SECRET must start with ws_.' >&2; exit 1; }
[[ -f .dev.vars ]] || { echo '.dev.vars not found.' >&2; exit 1; }

read_dev_var() { grep -E "^$1=" .dev.vars | head -1 | cut -d= -f2-; }

OWNER_DASHBOARD_PASSWORD=$(read_dev_var OWNER_DASHBOARD_PASSWORD)
OWNER_ROUTE_SLUG=$(read_dev_var OWNER_ROUTE_SLUG)

for required in OWNER_DASHBOARD_PASSWORD OWNER_ROUTE_SLUG; do
  [[ -n ${!required} ]] || { echo "Missing $required in .dev.vars." >&2; exit 1; }
done
(( ${#OWNER_DASHBOARD_PASSWORD} >= 32 )) || { echo 'OWNER_DASHBOARD_PASSWORD must be at least 32 characters.' >&2; exit 1; }

WHOP_CLIENT_ID=$(node -p "require('./whop.app.json').app_id")
# Reuse the session secret across runs so operator sessions survive a re-run.
SESSION_SECRET=$(local_var SESSION_SECRET)
if [[ -z $SESSION_SECRET ]]; then
  SESSION_SECRET=$(openssl rand -hex 32)
  printf '\nSESSION_SECRET=%s\n' "$SESSION_SECRET" >> .secrets.local
  echo 'Generated a new SESSION_SECRET and stored it in .secrets.local.'
fi
WHOP_REDIRECT_URI="https://${SITE_DOMAIN}/auth/callback"
WHOP_PIXEL_HOSTNAME="$SITE_DOMAIN"

echo "Setting secrets for app $WHOP_CLIENT_ID (values are not printed)."
pnpm exec whop apps secrets set \
  --secret "WHOP_CLIENT_ID=$WHOP_CLIENT_ID" \
  --secret "WHOP_CLIENT_SECRET=$WHOP_CLIENT_SECRET" \
  --secret "WHOP_REDIRECT_URI=$WHOP_REDIRECT_URI" \
  --secret "SESSION_SECRET=$SESSION_SECRET" \
  --secret "WHOP_WEBHOOK_SECRET=$WHOP_WEBHOOK_SECRET" \
  --secret "OWNER_DASHBOARD_PASSWORD=$OWNER_DASHBOARD_PASSWORD" \
  --secret "OWNER_ROUTE_SLUG=$OWNER_ROUTE_SLUG" \
  --secret "WHOP_PIXEL_HOSTNAME=$WHOP_PIXEL_HOSTNAME"

echo
echo "Done. Verify with: pnpm exec whop apps secrets list"
echo "Reminder: the OAuth callback URL $WHOP_REDIRECT_URI must also be registered"
echo "in the app's OAuth settings in the Whop dashboard."
