# Owner dashboard login

## Intent

Replace the browser Basic Auth prompt with a branded login page so the owner can enter a configurable username and the existing dashboard password.

## Scope

- Read `OWNER_DASHBOARD_USERNAME` and `OWNER_DASHBOARD_PASSWORD` from server secrets.
- Add `/<owner-slug>/login` with a username/password form and clear invalid-credentials feedback.
- On successful login, issue a signed, HttpOnly, SameSite=Lax session cookie using the existing `SESSION_SECRET`; require HTTPS for Secure cookies.
- Redirect to the protected Leads, Pixel, or Invoice path requested before login, restricted to paths under the configured owner slug.
- Add logout and protect all existing owner routes with the shared session.
- Preserve the existing Whop account ownership check before serving protected dashboard data.

## Approaches

1. Keep Basic Auth and add instructions — smallest, but does not provide the requested form.
2. Add an application login form with a signed cookie — selected; works with the current server-side secret configuration and supports logout.
3. Use Whop OAuth for dashboard access — adds account/role authorization and changes the owner workflow beyond this request.

## Constraints and non-goals

Do not store credentials in client code or local storage. Do not alter OAuth for roofing customers. Use no new dependency. Username is configurable through `OWNER_DASHBOARD_USERNAME`; password remains `OWNER_DASHBOARD_PASSWORD`. The session expires after 12 hours.

## Implementation calls

Add login and logout handlers under the owner route, a small shared HMAC session helper, and update all three dashboard loaders/actions to redirect unauthenticated requests to login. Document the new required username secret in the deployment instructions and secret-setting script.

## Verification

Run typecheck and build. Verify valid login, invalid login, session persistence across owner pages, logout, and rejection of a tampered or expired session without creating or sending invoices.
