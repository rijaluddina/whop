# Whop Deployment Guide for Apex Roofing

## Overview

This guide documents the complete deployment process for the Apex Roofing Whop Website template to Whop's platform.

## Prerequisites

1. **Whop Account** with API access
2. **Whop CLI** installed (`npm install -g @whop/cli` or use `npx`)
3. **Environment Variables** configured in Whop Dashboard
4. **Plans Created** in Whop Dashboard (Inspection, Deposit, Flat Rate)

## Required Environment Variables

Set these in **Whop Dashboard → Your App → Settings → Environment Variables**:

| Variable                    | Description                                   | Example          |
| --------------------------- | --------------------------------------------- | ---------------- |
| `WHOP_API_KEY`              | Your Whop API key (starts with `whop_`)       | `whop_abc123...` |
| `WHOP_ACCOUNT_ID`           | Your business account ID (starts with `biz_`) | `biz_xyz789...`  |
| `WHOP_APP_ID`               | Your app ID (starts with `app_`)              | `app_def456...`  |
| `WHOP_FLAT_RATE_PRODUCT_ID` | Product ID for flat-rate roof replacement     | `prod_ghi123...` |

**Client-side variables** (prefixed with `VITE_` for Vite):

| Variable               | Description                            | Example                          |
| ---------------------- | -------------------------------------- | -------------------------------- |
| `VITE_WHOP_ACCOUNT_ID` | Same as WHOP_ACCOUNT_ID for client use | `biz_xyz789...`                  |
| `VITE_SITE_URL`        | Production URL                         | `https://apex-roofing.whop.site` |

## Whop Dashboard Plan Setup

Before deploying, create these plans in **Whop Dashboard → Monetization → Plans**:

### 1. Roof Inspection

- **Type**: One-time payment
- **Price**: $149.00 (14900 cents)
- **Plan ID**: Copy the generated `plan_xxxxx_inspection` → update `src/lib/config/plans.ts`

### 2. Project Deposit

- **Type**: Setup Intent (mode: "setup" - saves payment method for later)
- **Price**: $500.00 (50000 cents)
- **Plan ID**: Copy the generated `plan_xxxxx_deposit` → update `src/lib/config/plans.ts`

### 3. Standard Roof Replacement

- **Type**: One-time payment
- **Price**: $2,500.00 (250000 cents)
- **Plan ID**: Copy the generated `plan_xxxxx_flat_rate` → update `src/lib/config/plans.ts`

Also create a **Product** for the flat-rate replacement to get `WHOP_FLAT_RATE_PRODUCT_ID`.

## Deployment Steps

### Step 1: Build Production Bundle

```bash
npm run build
```

This runs:

- `npm run build:server` - Builds SSR entry point to `dist/server/`
- `npm run build:client` - Builds client bundle to `dist/client/`
- Creates `dist/whop-build.zip` with manifest.json

**Expected Output:**

```
dist/
├── client/
│   ├── index.html
│   ├── index.js
│   ├── favicon.ico
│   ├── favicon.svg
│   └── assets/client-*.css
├── server/
│   ├── index.js
│   ├── favicon.ico
│   └── favicon.svg
├── whop-build.zip
└── manifest.json (inside zip)
```

### Step 2: Verify Build Locally

```bash
# Preview the client build
npm run preview

# Or test the worker locally with wrangler
npx wrangler dev dist/server/index.js
```

### Step 3: Authenticate Whop CLI

```bash
# Option 1: Interactive login
whop auth login

# Option 2: Set API key as environment variable
export WHOP_API_KEY=whop_xxxxxxxxxxxx
```

### Step 4: Deploy to Whop

```bash
whop apps deploy
```

This will:

1. Read `whop.app.json` configuration
2. Upload `dist/whop-build.zip`
3. Deploy to `https://apex-roofing.whop.site` (based on route)

### Step 5: Verify Deployment

After deployment, visit:

- **Homepage**: https://apex-roofing.whop.site
- **Inspection Checkout**: https://apex-roofing.whop.site/checkout?plan=inspection
- **Deposit Checkout**: https://apex-roofing.whop.site/checkout?plan=deposit
- **Flat Rate Checkout**: https://apex-roofing.whop.site/checkout?plan=flatRate

## Functional Verification Checklist

### ✅ Homepage

- [ ] Hero section loads
- [ ] Services section displays 3 plans
- [ ] Service Area section renders
- [ ] Financing section renders
- [ ] Reviews section renders
- [ ] Contact/Estimate form renders

### ✅ Estimate Form Flow

- [ ] Fill out estimate form with valid data
- [ ] Submit form → shows success toast
- [ ] **Whop Dashboard → Leads** → Verify new lead created with metadata:
  - email, name, phone, service_type, address, message, source: "website_estimate_form"
- [ ] **Whop Pixel Dashboard** → Verify `estimate_requested` event fired

### ✅ Inspection Checkout Flow ($149)

- [ ] Navigate to `/checkout?plan=inspection`
- [ ] Verify plan details show correctly
- [ ] Complete checkout with test card (4242 4242 4242 4242)
- [ ] Redirect to `/checkout/success?plan=inspection&payment_id=...`
- [ ] **Whop Dashboard → Payments** → Verify payment succeeded
- [ ] **Whop Pixel Dashboard** → Verify `service_viewed` event fired (service: "inspection")

### ✅ Deposit Checkout Flow ($500 - Setup Intent)

- [ ] Navigate to `/checkout?plan=deposit`
- [ ] Verify plan details show correctly
- [ ] Complete checkout with test card (saves payment method)
- [ ] Redirect to `/checkout/success?plan=deposit&setup_intent_id=...`
- [ ] **Whop Dashboard → Setup Intents** → Verify setup intent succeeded, payment_method saved
- [ ] **Whop Pixel Dashboard** → Verify `service_viewed` AND `deposit_started` events fired

### ✅ Flat Rate Checkout Flow ($2,500)

- [ ] Navigate to `/checkout?plan=flatRate`
- [ ] Verify plan details show correctly
- [ ] Complete checkout with test card
- [ ] Redirect to `/checkout/success?plan=flatRate&payment_id=...`
- [ ] **Whop Dashboard → Payments** → Verify payment succeeded
- [ ] **Whop Pixel Dashboard** → Verify `service_viewed` event fired (service: "replacement")

### ✅ Final Invoice Flow (API)

- [ ] Use Whop API or Dashboard to create invoice for deposit customer:
  ```bash
  curl -X POST https://api.whop.com/v1/invoices \
    -H "Authorization: Bearer $WHOP_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "account_id": "biz_xxx",
      "customer_email": "test@example.com",
      "collection_method": "charge_automatically",
      "payment_method_id": "pm_xxx",  // From deposit setup intent
      "due_date": "2026-11-30T00:00:00Z",
      "plan": {
        "product_id": "prod_xxx",  // WHOP_FLAT_RATE_PRODUCT_ID
        "plan_type": "one_time",
        "initial_price": 200000,  // 250000 - 50000
        "currency": "usd"
      },
      "metadata": {
        "project_id": "proj_123",
        "deposit_amount": "50000",
        "total_amount": "250000"
      }
    }'
  ```
- [ ] Verify invoice created in Whop Dashboard
- [ ] Verify auto-charge of saved card succeeds
- [ ] Visit `/invoice/payment?plan=flatRate&invoice_id=inv_xxx&amount=200000` → shows correct balance

### ✅ Pixel Events Verification

In **Whop Dashboard → Analytics → Pixel Events**, verify these custom events:

| Event                         | Trigger                   | Expected Data                                                                |
| ----------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| `estimate_requested`          | Estimate form submit      | `{ event_id: "lead_xxx", service_type: "inspection\|replacement\|deposit" }` |
| `service_viewed` (inspection) | Inspection checkout loads | `{ service: "inspection", plan_id: "plan_xxx", event_id: "svc_xxx" }`        |
| `service_viewed` (deposit)    | Deposit checkout loads    | `{ service: "deposit", plan_id: "plan_xxx", event_id: "svc_xxx" }`           |
| `service_viewed` (flatRate)   | Flat rate checkout loads  | `{ service: "replacement", plan_id: "plan_xxx", event_id: "svc_xxx" }`       |
| `deposit_started`             | Deposit checkout loads    | `{ plan_id: "plan_xxx", amount: 50000, event_id: "dep_xxx" }`                |

## Screen Recording Script (3-5 minutes)

Record a video demonstrating:

1. **Homepage tour** (30s) - Scroll through all sections
2. **Estimate form submission** (45s) - Fill form, submit, show lead in Dashboard
3. **Inspection checkout** (45s) - Select inspection, pay $149, show success + Dashboard payment
4. **Deposit checkout** (45s) - Select deposit, save card $500, show success + Dashboard setup intent
5. **Flat rate checkout** (45s) - Select flat rate, pay $2500, show success + Dashboard payment
6. **Final invoice demo** (30s) - Show invoice creation API call, auto-charge verification
7. **Pixel events verification** (30s) - Show Pixel Dashboard with all 5 events

## Post-Deployment Configuration

### Update Plan IDs

After creating plans in Whop Dashboard, update `src/lib/config/plans.ts`:

```typescript
whopPlanId: 'plan_actual_id_from_dashboard', // Replace plan_xxxxx_inspection
```

Then rebuild and redeploy:

```bash
npm run build && whop apps deploy
```

### Custom Domain (Optional)

In Whop Dashboard → Settings → Domains, add custom domain if needed.

## Troubleshooting

### Build Fails

- Run `npm run lint` to check for TypeScript errors
- Ensure all imports resolve correctly
- Check `tsc` output for type errors

### Deployment Fails

- Verify `WHOP_API_KEY` is set and valid
- Check `whop.app.json` route matches your app
- Ensure `dist/whop-build.zip` exists and is valid

### API Routes Not Working

- Verify environment variables set in Whop Dashboard (not just local .env)
- Check Cloudflare Workers logs in Whop Dashboard
- Ensure API routes match `/api/leads`, `/api/setup-intents/finalize`, `/api/invoices/create-final`

### Pixel Events Not Firing

- Verify `window.whop` is available (loaded by Whop platform)
- Check browser console for errors
- Ensure `WhopPixelEvents` component mounts (in App.tsx)

### Checkout Redirect Issues

- Verify `whopPlanId` values in `plans.ts` match Dashboard exactly
- Check that deposit plan uses `mode: 'setup'` in CheckoutElements.tsx

## Rollback Procedure

If deployment has issues:

```bash
# List deployments
whop apps deployments list

# Rollback to previous deployment
whop apps deployments rollback <deployment-id>
```

## Support Resources

- [Whop CLI Documentation](https://dev.whop.com/cli)
- [Whop Elements React](https://dev.whop.com/elements/react)
- [Whop SDK Reference](https://dev.whop.com/sdk)
- [Whop Dashboard](https://whop.com/dashboard)

---

**Last Updated**: 2026-10-30
**Project**: Apex Roofing Whop Website Template
**Version**: 0.0.1
