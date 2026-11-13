# Owner Dashboard Login Implementation Plan

> **For agentic workers:** Use the executing-plans skill to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the browser Basic Auth prompt with a username/password login page and a shared secure session for Leads, Pixel, and Invoice.

**Architecture:** Add a small server helper that verifies `OWNER_DASHBOARD_USERNAME` and `OWNER_DASHBOARD_PASSWORD`, signs a 12-hour session cookie with `SESSION_SECRET`, and validates it on protected routes. A slug-scoped login page creates the session, and logout clears it. Existing account ownership validation remains in place after session validation.

**Tech Stack:** TanStack Start route handlers, Node `crypto`, server cookies, server-rendered HTML.

**Spec:** `docs/superpowers/specs/2026-11-14-owner-dashboard-login-design.md`

## Global Constraints

- Do not store credentials in client code or local storage.
- Do not alter OAuth for roofing customers.
- Use no new dependency.
- Username is configurable through `OWNER_DASHBOARD_USERNAME`; password remains `OWNER_DASHBOARD_PASSWORD`.
- The session expires after 12 hours.

## Review Focus

- Missing or malformed credential/session secrets must fail closed with a clear unavailable response.
- Wrong username or password must not create a cookie or disclose which value was wrong.
- Tampered and expired cookies must be rejected on all three dashboard routes.
- Return paths must stay within the configured owner slug to prevent open redirects.
- The Whop account ownership check must still run after session authentication.

---

### Task 1: Owner session verification

**Files:**
- Modify: `src/server/whop-owner.ts`
- Create: `src/server/owner-session.ts`

**Interfaces:**
- `owner-session.ts` exports login credential verification, session cookie creation, session validation, and logout cookie creation using `SESSION_SECRET`.
- `getOwnerAccess` consumes the validated owner session and continues the existing Whop account check.

- [x] Replace Basic Auth header comparison with HMAC-signed, HttpOnly, SameSite=Lax, Secure-on-HTTPS cookie validation.
- [x] Keep owner slug, HTTPS, configured account, and `/accounts/me` checks; unauthenticated status is distinguishable from configuration and account errors.
- [x] Verify valid, invalid, tampered, and expired session behavior with the existing project verification setup.

### Task 2: Login and logout pages

**Files:**
- Create: `src/routes/$owner.login.tsx`
- Create: `src/routes/$owner.logout.tsx`
- Modify: `src/server/owner-page.tsx`
- Modify: `src/routes/$owner.leads.tsx`
- Modify: `src/routes/$owner.pixel.tsx`
- Modify: `src/routes/$owner.invoice.tsx`

**Interfaces:**
- Login form posts username, password, and a validated same-owner return path.
- Each protected route redirects unauthenticated GET requests to the login route and preserves the destination.
- Logout clears the owner cookie and redirects to login.

- [x] Render a branded accessible login form and generic invalid-credentials message.
- [x] On valid credentials, issue the session and redirect only to `/<configured-slug>/(leads|pixel|invoice)`.
- [x] Ensure POST actions also require a valid owner session and retain the existing same-origin check.
- [ ] Verify route sharing and live Whop account ownership; local QA covers valid/invalid login, tampered/expired cookie rejection, and logout.

### Task 3: Deployment configuration

**Files:**
- Modify: `scripts/set-production-secrets.sh`
- Modify: `README.md`

- [x] Require and set `OWNER_DASHBOARD_USERNAME` alongside the existing dashboard password.
- [x] Document the login URL, configurable username, existing password, cookie session, and logout behavior without exposing secret values.
- [x] Run `pnpm typecheck`, `pnpm build`, and `git diff --check`.
