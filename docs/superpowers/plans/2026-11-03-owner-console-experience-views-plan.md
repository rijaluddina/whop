# Owner Console Experience Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the three existing Whop experience tabs (invoice, lead, pixel) on Momentum Lab functional by rendering an owner console inside the Website Embed iframe, with server-side data fetching via the app's Whop API key — no secrets exposed to the frontend.

**Architecture:** `src/App.tsx` detects `window.location.pathname` for `/hub/exp_*` and renders one of three new console components (InvoiceConsole, LeadConsole, PixelConsole). Each console calls new GET endpoints on `src/entry-server.ts` (`/api/invoices`, `/api/leads`, `/api/events`), which call the Whop SDK server-side with `APEX_WHOP_API_KEY`. `POST /api/leads` additionally triggers `whop.notifications.create` to notify the owner of a new estimate request.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, `@whop/sdk` v2.7.0, Cloudflare Workers (wrangler), Vite.

**Spec:** `docs/superpowers/specs/2026-11-03-owner-console-experience-views-design.md`

## Global Constraints

- No API keys/secrets visible in frontend, chat, or bounty recording.
- All console data fetched server-side via `APEX_WHOP_API_KEY` (Cloudflare Worker env binding).
- Existing site (`/`, `/services`, checkout, estimate form) continues to work unchanged.
- No new SMTP / third-party email provider.
- No real live transactions — demo/sandbox only.
- No marketplace listing / public app publishing.

## Review Focus

1. **Missing `APEX_WHOP_API_KEY` in production env** — GET console endpoints must not crash; return a clear empty/configured state rather than a 500 leak.
2. **`whop.events.list` requires `from`/`to` when `identifier` omitted** — console must default to last 30 days, not pass null dates.
3. **`whop.leads.list` may return 403 despite `lead:basic:read`** — LeadConsole must degrade gracefully (show fallback link to Whop Dashboard → Sub accounts) instead of blank/error.
4. **Pathname detection collision** — `/hub/exp_*` must only match the three known experience IDs; anything else renders the normal site.
5. **iframe authorization** — Website Embed experiences are non-public (`is_public: false`); owner must have a membership to prod_bB5kDaAZ55f0l to see tabs. Console cannot override this; document it.

---

### Task 1: Backend GET endpoints for console data

**Files:**

- Modify: `src/entry-server.ts`

**Interfaces:**

- Consumes: `env.APEX_WHOP_API_KEY`, `env.APEX_WHOP_ACCOUNT_ID`, `env.APEX_WHOP_ENVIRONMENT` (already defined in `Env` interface); `WhopClient` constructor (already used).
- Produces: handlers for `GET /api/invoices`, `GET /api/leads`, `GET /api/events` returning JSON arrays; no new exports.

- [ ] **Step 1: Add GET `/api/invoices` handler**

Run: `curl -s -H 'Authorization: Basic dummy' https://apex-roofing-2.whop.site/api/invoices | head -c 200`
Expected before: `Not found` 404 (or SPA fallback). After: JSON array or empty array.

- [ ] **Step 2: Add GET `/api/leads` handler**

Run: `curl -s -H 'Authorization: Basic dummy' https://apex-roofing-2.whop.site/api/leads | head -c 200`
Expected before: 404/SPA. After: JSON array or empty array.

- [ ] **Step 3: Add GET `/api/events` handler**

Run: `curl -s 'https://apex-roofing-2.whop.site/api/events?from=2026-10-01T00:00:00Z&to=2026-11-04T00:00:00Z' | head -c 200`
Expected before: 404/SPA. After: JSON array or empty array.

- [ ] **Step 4: Verify build compiles**

Run: `npm run build`
Expected: PASS, no TS errors.

- [ ] **Step 5: Commit**

```bash
git add src/entry-server.ts
git commit -m "feat: add GET /api/invoices, /api/leads, /api/events console endpoints"
```

---

### Task 2: Notify owner on new estimate lead (notifications)

**Files:**

- Modify: `src/entry-server.ts` (inside `handleLead`, after `whop.leads.create`)

**Interfaces:**

- Consumes: `whop` client instance, `accountId`, lead name/email/service.
- Produces: `whop.notifications.create({account_id, title, content})` call wrapped in try/catch (non-fatal).

- [ ] **Step 1: Add notification call after lead creation**

Code approach: after `return json({ id: leadRecord.id, success: true }, 201)` is reached, but before return, call `whop.notifications.create` with title "New estimate request" and content summarizing name/service. Wrap in try/catch; do not block the 201 response.

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/entry-server.ts
git commit -m "feat: notify owner via Whop notification on new estimate lead"
```

---

### Task 3: Console layout + InvoiceConsole component

**Files:**

- Create: `src/components/console/ConsoleLayout.tsx`
- Create: `src/components/console/InvoiceConsole.tsx`

**Interfaces:**

- `ConsoleLayout({children, title})` → renders header, back-to-site link, children.
- `InvoiceConsole()` → fetches `GET /api/invoices`, renders table of invoices + "Create invoice" button opening a modal form (customer name, email, description, billing method) that POSTs to `/api/invoices`.

- [ ] **Step 1: Create ConsoleLayout**

- [ ] **Step 2: Create InvoiceConsole with fetch + table + create form**

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/console/ConsoleLayout.tsx src/components/console/InvoiceConsole.tsx
git commit -m "feat: add ConsoleLayout and InvoiceConsole"
```

---

### Task 4: LeadConsole + PixelConsole components

**Files:**

- Create: `src/components/console/LeadConsole.tsx`
- Create: `src/components/console/PixelConsole.tsx`

**Interfaces:**

- `LeadConsole()` → fetches `GET /api/leads`, renders table; on error/empty shows fallback link to Whop Dashboard.
- `PixelConsole()` → fetches `GET /api/events?from=...&to=...` (last 30 days default), renders table with event name + JSON payload + time.

- [ ] **Step 1: Create LeadConsole**

- [ ] **Step 2: Create PixelConsole**

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/console/LeadConsole.tsx src/components/console/PixelConsole.tsx
git commit -m "feat: add LeadConsole and PixelConsole"
```

---

### Task 5: Wire pathname-based routing in App.tsx

**Files:**

- Modify: `src/App.tsx`

**Interfaces:**

- Consumes: `window.location.pathname`; imports the three console components.
- Produces: when pathname matches `/hub/exp_ORsFI0oQ0idUBO` / `/hub/exp_lwCZRXodbz56vG` / `/hub/exp_wFsRMd3RWEdBoz`, render corresponding console instead of the normal site; otherwise render existing site.

- [ ] **Step 1: Add experience-path detection + conditional render**

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: route /hub/exp_* paths to owner console views"
```

---

### Task 6: Build, deploy, and verify live

**Files:**

- None (build/deploy only)

**Interfaces:**

- None.

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 2: Deploy**

Run: `npx whop apps deploy`
Expected: status approved, production URL `https://apex-roofing-2.whop.site`.

- [ ] **Step 3: Verify all three tabs load in iframe**

Open `https://whop.com/momentum-lab-9b67/exp_ORsFI0oQ0idUBO/app/` (invoice), `.../exp_lwCZRXodbz56vG/app/` (lead), `.../exp_wFsRMd3RWEdBoz/app/` (pixel).
Expected: each shows its console (not "not authorized").

- [ ] **Step 4: Verify no secrets in frontend**

Run: `grep -r "APEX_WHOP_API_KEY" src/components/console src/App.tsx | head`
Expected: no matches (console components use relative `/api/*` only).

- [ ] **Step 5: Commit + push**

```bash
git push origin main
```

---

## Proportion check

Plan length is appropriate — roughly 1:1 with spec sections, no code bodies except where the algorithm isn't determined by the signature. Each task ends with an independently testable deliverable and a commit.

---

Plan complete and saved to `docs/superpowers/plans/2026-11-03-owner-console-experience-views-plan.md`. Please review the plan. Does it capture what you want, and which execution approach should we use?

- **Subagent-driven** — a fresh subagent implements each task with independent review per task (most thorough, fresh context per task).
- **Native** — I implement every task myself in this session, then one final review (fastest, no independent review until end).

For this plan I recommend **Native**, because the 6 tasks are tightly coupled through shared interfaces (endpoints → console components → routing) and a shipped mistake (e.g., wrong pathname match) would be caught by the live verification in Task 6 anyway. Which approach should we use?
