#!/usr/bin/env bash
# Set production secrets for the Whop app via `whop apps secrets set`.
#
# Fill in the two FILL-IN values below, log in with `pnpm exec whop auth login`,
# then run: bash scripts/set-production-secrets.sh
#
# Values are reused from .dev.vars where the same setting already exists locally,
# so production and local testing stay consistent. Edit .dev.vars first if the
# operator password or dashboard slug should differ in production.
set -euo pipefail
cd "$(dirname "$0")/.."

# ---- FILL-IN -----------------------------------------------------------
WHOP_CLIENT_SECRET=''    # FILL-IN: whop.com/dashboard/developer → your app → OAuth client secret
WHOP_WEBHOOK_SECRET=''   # FILL-IN: ws_... from webhook creation (dashboard, or scripts/register-webhook.sh)
SITE_DOMAIN="${SITE_DOMAIN:-the-curiosity-labs.whop.site}"
# ------------------------------------------------------------------------

missing=0
for required in WHOP_CLIENT_SECRET WHOP_WEBHOOK_SECRET; do
  if [[ -z ${!required} ]]; then
    echo "Missing $required — fill in the FILL-IN block at the top of this script." >&2
    missing=1
  fi
done
[[ $missing -eq 0 ]] || exit 1
[[ $WHOP_WEBHOOK_SECRET == ws_* ]] || { echo 'WHOP_WEBHOOK_SECRET must start with ws_.' >&2; exit 1; }
[[ -f .dev.vars ]] || { echo '.dev.vars not found.' >&2; exit 1; }

read_dev_var() { grep -E "^$1=" .dev.vars | head -1 | cut -d= -f2-; }

WHOP_ACCOUNT_ID=$(read_dev_var WHOP_ACCOUNT_ID)
WHOP_API_KEY=$(read_dev_var WHOP_API_KEY)
OWNER_DASHBOARD_PASSWORD=$(read_dev_var OWNER_DASHBOARD_PASSWORD)
OWNER_ROUTE_SLUG=$(read_dev_var OWNER_ROUTE_SLUG)

for required in WHOP_ACCOUNT_ID WHOP_API_KEY OWNER_DASHBOARD_PASSWORD OWNER_ROUTE_SLUG; do
  [[ -n ${!required} ]] || { echo "Missing $required in .dev.vars." >&2; exit 1; }
done
[[ $WHOP_ACCOUNT_ID == biz_* ]] || { echo 'WHOP_ACCOUNT_ID must start with biz_.' >&2; exit 1; }
(( ${#OWNER_DASHBOARD_PASSWORD} >= 32 )) || { echo 'OWNER_DASHBOARD_PASSWORD must be at least 32 characters.' >&2; exit 1; }

WHOP_CLIENT_ID=$(node -p "require('./whop.app.json').app_id")
SESSION_SECRET=$(openssl rand -hex 32)
WHOP_REDIRECT_URI="https://${SITE_DOMAIN}/auth/callback"
WHOP_PIXEL_HOSTNAME="$SITE_DOMAIN"

echo "Setting secrets for app $WHOP_CLIENT_ID (values are not printed)."
pnpm exec whop apps secrets set \
  --secret "WHOP_CLIENT_ID=$WHOP_CLIENT_ID" \
  --secret "WHOP_CLIENT_SECRET=$WHOP_CLIENT_SECRET" \
  --secret "WHOP_REDIRECT_URI=$WHOP_REDIRECT_URI" \
  --secret "SESSION_SECRET=$SESSION_SECRET" \
  --secret "WHOP_ACCOUNT_ID=$WHOP_ACCOUNT_ID" \
  --secret "WHOP_API_KEY=$WHOP_API_KEY" \
  --secret "WHOP_WEBHOOK_SECRET=$WHOP_WEBHOOK_SECRET" \
  --secret "OWNER_DASHBOARD_PASSWORD=$OWNER_DASHBOARD_PASSWORD" \
  --secret "OWNER_ROUTE_SLUG=$OWNER_ROUTE_SLUG" \
  --secret "WHOP_PIXEL_HOSTNAME=$WHOP_PIXEL_HOSTNAME"

echo
echo "Done. Verify with: pnpm exec whop apps secrets list"
echo "Reminder: the OAuth callback URL $WHOP_REDIRECT_URI must also be registered"
echo "in the app's OAuth settings in the Whop dashboard."
