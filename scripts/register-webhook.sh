#!/usr/bin/env bash
# Register the production webhook via the Whop API and print the signing secret.
# The secret (ws_...) is shown ONCE — copy it into scripts/set-production-secrets.sh.
#
# Requires the Thrive Daily API key in .dev.thrive.local to have the `developer:manage_webhook` scope.
# If the API rejects it, create the webhook in the Whop dashboard instead and copy
# its signing secret from there.
set -euo pipefail
cd "$(dirname "$0")/.."

SITE_DOMAIN="${SITE_DOMAIN:-summit-roofing-thrive.whop.site}"
WHOP_API_KEY=$(grep -E '^WHOP_API_KEY=' .dev.thrive.local | head -1 | cut -d= -f2-)
[[ -n $WHOP_API_KEY ]] || { echo 'Missing WHOP_API_KEY in .dev.thrive.local.' >&2; exit 1; }

curl -fsS https://api.whop.com/api/v1/webhooks \
  -H "Authorization: Bearer $WHOP_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: roofing-webhook-registration' \
  -d @- <<BODY | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log("webhook id:",j.id);console.log("url:",j.url);console.log("api version:",j.api_version_date);console.log("events:",(j.events||[]).join(", "));console.log("");console.log("WHOP_WEBHOOK_SECRET (copy, shown once):",j.webhook_secret)})'
{
  "url": "https://${SITE_DOMAIN}/api/whop-webhook",
  "enabled": true,
  "api_version_date": "2026-10-24",
  "events": ["setup_intent.succeeded", "payment.succeeded", "payment.failed"],
  "title": "Summit Ridge Roofing"
}
BODY
