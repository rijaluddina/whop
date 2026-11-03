# Design: Owner Console Experience Views

**Date:** 2026-11-03  
**App:** Apex Roofing (`app_uXznjBKM6fBZnS`, `biz_LHN26NTWx9YO5m`, Momentum Lab)  
**Status:** Draft (pending user review)

## 1. Intent & background

Owner of Momentum Lab runs a Whop-powered roofing business at `https://apex-roofing-2.whop.site`. Three Whop **experiences** already exist in the account sidebar, all powered by the **Website Embed** app (`app_OtuSFX6rkPguRs`):

| Tab     | Experience ID        | Purpose                                       |
| ------- | -------------------- | --------------------------------------------- |
| invoice | `exp_ORsFI0oQ0idUBO` | Create & send final-balance invoices manually |
| lead    | `exp_lwCZRXodbz56vG` | View estimate-request leads                   |
| pixel   | `exp_wFsRMd3RWEdBoz` | View `whop.track` pixel events                |

Today each tab loads the website inside an iframe (`l0swsgrcq5o69ii0t158.apps.whop.com/hub/exp_X`) but shows _"You are not authorized to view this page"_ because the website has no owner-console routes and no console UI.

Goal: make the three tabs functional so the business owner can manage invoices, leads, and pixel events from inside Whop — without exposing API keys or secrets to the frontend or in chat/video.

## 2. Success criteria

1. Clicking **invoice** tab → owner console shows a form to create a Whop final-balance invoice (customer name, email, description, billing method: auto-charge stored method / send email link) and lists existing draft invoices.
2. Clicking **lead** tab → owner console shows a table of estimate-request leads (name, email, phone, service, address, submitted at).
3. Clicking **pixel** tab → owner console shows a table of `whop.track` custom events (name, payload JSON, time).
4. Customer who submits an estimate request gets a confirmation that the request was received (on-screen success message); owner gets a Whop notification. Email to customer via Whop is handled when the owner sends an invoice through Whop (not a separate SMTP provider — no new secret).
5. No API keys/secrets visible in frontend, chat, or bounty recording.
6. All console data fetched server-side via `APEX_WHOP_API_KEY` (Cloudflare Worker env binding).
7. Existing site (`/`, `/services`, checkout, estimate form) continues to work unchanged.

## 3. Scope boundaries (what's NOT included)

- No new SMTP / third-party email provider (no SendGrid/Mailgun secrets). Whop invoices carry email delivery when sent manually from Dashboard.
- No real live transactions — demo/sandbox only per bounty constraints.
- No changes to checkout pixel logic (already done in prior commits).
- No marketplace listing / public app publishing.

## 4. Architecture

### 4.1 Routing (frontend SPA)

`src/App.tsx` detects `window.location.pathname` on load:

| Pathname                  | Render                                   |
| ------------------------- | ---------------------------------------- |
| `/hub/exp_ORsFI0oQ0idUBO` | `InvoiceConsole`                         |
| `/hub/exp_lwCZRXodbz56vG` | `LeadConsole`                            |
| `/hub/exp_wFsRMd3RWEdBoz` | `PixelConsole`                           |
| Everything else           | existing site (Hero, Services, Plans, …) |

This matches how Whop Website Embed loads: `https://l0swsgrcq5o69ii0t158.apps.whop.com/hub/exp_X`.

### 4.2 Backend (Cloudflare Worker, `src/entry-server.ts`)

New GET endpoints (all require `APEX_WHOP_API_KEY` via server-side WhopClient):

| Endpoint        | Method | Source                                     | Notes                  |
| --------------- | ------ | ------------------------------------------ | ---------------------- |
| `/api/invoices` | GET    | `whop.invoices.list({account_id})`         | Draft + sent invoices  |
| `/api/leads`    | GET    | `whop.leads.list({account_id})`            | Estimate-request leads |
| `/api/events`   | GET    | `whop.events.list({account_id, from, to})` | Custom pixel events    |
| `/api/invoices` | POST   | existing `createFinalBalanceInvoice`       | unchanged              |
| `/api/leads`    | POST   | existing `handleLead`                      | unchanged              |

Existing `POST /api/pixel` logs the event (no change).

### 4.3 Owner console components (new)

- `src/components/console/InvoiceConsole.tsx` — table of invoices + "Create invoice" modal form.
- `src/components/console/LeadConsole.tsx` — table of leads.
- `src/components/console/PixelConsole.tsx` — table of tracked events with JSON payload.
- `src/components/console/ConsoleLayout.tsx` — shared header + back-to-site link.

### 4.4 Confirmation to customer

After `POST /api/leads` creates a lead:

- Return `201 {success:true, id}` → frontend shows *"Request Submitted! We will contact you shortly."`
- `whop.notifications.create({account_id, title: 'New estimate request', content: …})` → owner notified in Whop.
- No direct customer email (Whop has no send-email TS SDK endpoint); formal email goes out when owner sends the invoice via Whop Dashboard.

## 5. Data flow

```
Customer submits estimate
      → POST /api/leads (server)
          → whop.accounts.create + whop.leads.create (server, APEX_WHOP_API_KEY)
          → whop.notifications.create (owner notified)
          → 201 to frontend → "Request Submitted!" + trackEvent('estimate_requested')

Owner clicks Whop tab "invoice"/"lead"/"pixel"
      → iframe loads apex-roofing-2.whop.site/hub/exp_X
          → App.tsx detects pathname → renders matching Console
          → Console calls GET /api/invoices | /api/leads | /api/events
              → server calls Whop API with APEX_WHOP_API_KEY → returns table rows

Owner creates invoice from console
      → POST /api/invoices (server)
          → whop.invoices.create (final_balance plan, card-on-file or send)
          → 201 {id, status, amount}
          → Owner sends from Whop Dashboard → customer receives email
```

## 6. Files to create / modify

**Create:**

- `src/components/console/ConsoleLayout.tsx`
- `src/components/console/InvoiceConsole.tsx`
- `src/components/console/LeadConsole.tsx`
- `src/components/console/PixelConsole.tsx`

**Modify:**

- `src/App.tsx` — add experience-path detection + console imports
- `src/entry-server.ts` — add GET `/api/invoices`, `/api/leads`, `/api/events`
- `README.md` — document owner-console access + no-secret rule

## 7. Error handling & security

- All Whop API calls wrapped in try/catch → return generic 502 without leaking Whop error detail.
- GET console endpoints return 401 if `APEX_WHOP_API_KEY` missing (they will be present in production env).
- Frontend console components only call relative `/api/*` — no secrets in browser.
- `whop.notifications.create` failure is caught and logged (non-fatal — lead still created).

## 8. Testing plan (for bounty recording)

1. Open `https://apex-roofing-2.whop.site/` → normal site loads.
2. Open Whop tab **invoice** → iframe shows InvoiceConsole (empty table + create form).
3. Open Whop tab **lead** → iframe shows LeadConsole (existing leads from estimate submits).
4. Open Whop tab **pixel** → iframe shows PixelConsole (service_viewed, deposit_started, estimate_requested, invoice_requested).
5. Submit estimate form on site → "Request Submitted!" + lead appears in Lead tab + `estimate_requested` in Pixel tab.
6. Verify no API key visible in page source or network tab.

## 9. Open questions (deferred)

- Whop `events.list` requires `from`/`to` when `identifier` omitted — console will default to last 30 days.
- `whop.leads.list` returned 403 earlier via CLI despite `lead:basic:read`; will verify server-side with app API key. If still forbidden, console shows "leads require Whop Dashboard → Sub accounts" fallback link.

---

Spec written. Please review: any changes before I proceed to the implementation plan?
