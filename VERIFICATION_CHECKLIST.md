# Deployment Verification Checklist

## Pre-Deployment Verification

- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes with no warnings
- [ ] `dist/whop-build.zip` exists and contains manifest.json
- [ ] `whop.app.json` has correct route: `"route": "apex-roofing"`
- [ ] All plan IDs in `src/lib/config/plans.ts` updated from Whop Dashboard
- [ ] Environment variables documented in `.env.example`

## Whop Dashboard Configuration

- [ ] **App created** in Whop Dashboard
- [ ] **Environment variables** set in App Settings:
  - [ ] `WHOP_API_KEY`
  - [ ] `WHOP_ACCOUNT_ID`
  - [ ] `WHOP_APP_ID`
  - [ ] `WHOP_FLAT_RATE_PRODUCT_ID`
  - [ ] `VITE_WHOP_ACCOUNT_ID`
  - [ ] `VITE_SITE_URL`
- [ ] **Plans created** in Monetization → Plans:
  - [ ] Inspection ($149) → Plan ID copied to `plans.ts`
  - [ ] Deposit ($500, setup mode) → Plan ID copied to `plans.ts`
  - [ ] Flat Rate ($2,500) → Plan ID copied to `plans.ts`
- [ ] **Product created** for flat rate → Product ID set as `WHOP_FLAT_RATE_PRODUCT_ID`

## Deployment

- [ ] `whop auth login` completed OR `WHOP_API_KEY` exported
- [ ] `whop apps deploy` completes successfully
- [ ] Deployment URL accessible: https://apex-roofing.whop.site

## Functional Testing

### Homepage (https://apex-roofing.whop.site)

- [ ] Page loads without console errors
- [ ] Hero section visible
- [ ] Services section shows 3 cards (Inspection, Deposit, Flat Rate)
- [ ] Service Area section renders
- [ ] Financing section renders
- [ ] Reviews section renders
- [ ] Contact/Estimate form visible

### Estimate Form Flow

- [ ] Fill form with test data:
  - Name: "Test User"
  - Email: "test@example.com"
  - Phone: "555-123-4567"
  - Address: "123 Test St, Test City, TS 12345"
  - Service Type: "Roof Inspection"
  - Message: "Test estimate request"
- [ ] Submit form → Success toast appears
- [ ] **Whop Dashboard → Leads** → New lead appears with correct metadata
- [ ] **Whop Pixel Dashboard** → `estimate_requested` event recorded

### Checkout Flow 1: Inspection ($149)

- [ ] Navigate to `/checkout?plan=inspection`
- [ ] Plan name shows "Roof Inspection", price $149.00
- [ ] Complete checkout with test card: `4242 4242 4242 4242`, any future date, any CVC
- [ ] Redirect to `/checkout/success?plan=inspection&payment_id=pay_xxx`
- [ ] Success page shows "Payment Successful"
- [ ] **Whop Dashboard → Payments** → Payment `pay_xxx` succeeded
- [ ] **Whop Pixel Dashboard** → `service_viewed` event (service: "inspection")

### Checkout Flow 2: Deposit ($500 - Setup Intent)

- [ ] Navigate to `/checkout?plan=deposit`
- [ ] Plan name shows "Project Deposit", price $500.00
- [ ] Complete checkout with test card (saves payment method)
- [ ] Redirect to `/checkout/success?plan=deposit&setup_intent_id=seti_xxx`
- [ ] Success page shows "Card Saved for Final Payment"
- [ ] **Whop Dashboard → Setup Intents** → Setup intent `seti_xxx` succeeded, payment_method saved
- [ ] **Whop Pixel Dashboard** → `service_viewed` (service: "deposit") AND `deposit_started` events

### Checkout Flow 3: Flat Rate ($2,500)

- [ ] Navigate to `/checkout?plan=flatRate`
- [ ] Plan name shows "Standard Roof Replacement", price $2,500.00
- [ ] Complete checkout with test card
- [ ] Redirect to `/checkout/success?plan=flatRate&payment_id=pay_yyy`
- [ ] Success page shows "Payment Successful"
- [ ] **Whop Dashboard → Payments** → Payment `pay_yyy` succeeded
- [ ] **Whop Pixel Dashboard** → `service_viewed` event (service: "replacement")

### Final Invoice Flow

- [ ] Using deposit customer email and saved payment_method_id from deposit flow
- [ ] Create invoice via API or Dashboard for remaining balance ($2,000)
- [ ] Invoice created with `collection_method: charge_automatically`
- [ ] Auto-charge executes successfully
- [ ] Visit `/invoice/payment?plan=flatRate&invoice_id=inv_xxx&amount=200000`
- [ ] Page shows correct balance due: $2,000.00

## Pixel Events Verification

In **Whop Dashboard → Analytics → Pixel Events**, verify:

| Event                         | Count | Data Verified                   |
| ----------------------------- | ----- | ------------------------------- |
| `estimate_requested`          | 1     | lead_id, service_type           |
| `service_viewed` (inspection) | 1     | service: "inspection", plan_id  |
| `service_viewed` (deposit)    | 1     | service: "deposit", plan_id     |
| `service_viewed` (flatRate)   | 1     | service: "replacement", plan_id |
| `deposit_started`             | 1     | plan_id, amount: 50000          |

## Screen Recording

- [ ] 3-5 minute recording completed
- [ ] Covers all 7 segments from DEPLOYMENT_GUIDE.md
- [ ] Recording saved and accessible

## Post-Deployment

- [ ] Commit deployment config (whop.app.json, updated plans.ts)
- [ ] Tag release: `git tag v0.1.0-deploy`
- [ ] Document any issues encountered and resolutions

## Sign-Off

- [ ] All verification items passed
- [ ] Screen recording uploaded
- [ ] Deployment declared **LIVE**

---

**Verified By**: ________________
**Date**: ________________
**Deployment URL**: https://apex-roofing.whop.site
