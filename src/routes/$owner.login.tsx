import { createFileRoute } from '@tanstack/react-router'
import { ownerPage } from '../server/owner-page'
import { hasOwnerSession, ownerLoginConfigured, setOwnerSession, verifyOwnerCredentials } from '../server/owner-session'

function safeReturnTo(value: string | null, slug: string) {
  const allowed = [`/${slug}/leads`, `/${slug}/pixel`, `/${slug}/invoice`]
  return value && allowed.includes(value) ? value : allowed[0]
}

function loginPage(returnTo: string, error?: string, status = 200) {
  return ownerPage('Owner login', <section className="panel" style={{ maxWidth: 520, margin: '0 auto' }}>
    <h2>Owner dashboard</h2>
    <p>Sign in to manage leads, pixel activity, and invoices.</p>
    {error && <p role="alert">{error}</p>}
    <form method="post">
      <input type="hidden" name="returnTo" value={returnTo} />
      <p><label>Username <input name="username" autoComplete="username" required maxLength={128} /></label></p>
      <p><label>Password <input type="password" name="password" autoComplete="current-password" required maxLength={256} /></label></p>
      <button type="submit">Sign in</button>
    </form>
  </section>, status)
}

export const Route = createFileRoute('/$owner/login')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (process.env.OWNER_ROUTE_SLUG !== params.owner) return Response.redirect(new URL('/', request.url), 302)
        if (new URL(request.url).protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname)) {
          return ownerPage('Owner login', <p>Login requires HTTPS.</p>, 403)
        }
        if (!ownerLoginConfigured()) return ownerPage('Owner login', <p>Owner login is unavailable. Check dashboard credentials and SESSION_SECRET.</p>, 503)
        const returnTo = safeReturnTo(new URL(request.url).searchParams.get('returnTo'), params.owner)
        if (hasOwnerSession()) return Response.redirect(new URL(returnTo, request.url), 303)
        return loginPage(returnTo)
      },
      POST: async ({ params, request }) => {
        const url = new URL(request.url)
        if (request.headers.get('origin') !== url.origin) return ownerPage('Owner login', <p>Request denied.</p>, 403)
        if (process.env.OWNER_ROUTE_SLUG !== params.owner) return Response.redirect(new URL('/', request.url), 302)
        if (!ownerLoginConfigured()) return ownerPage('Owner login', <p>Owner login is unavailable. Check dashboard credentials and SESSION_SECRET.</p>, 503)
        const size = Number(request.headers.get('content-length'))
        if (!Number.isInteger(size) || size < 1 || size > 4096) return ownerPage('Owner login', <p>Invalid login request.</p>, 400)
        const form = await request.formData().catch(() => null)
        const username = form?.get('username')
        const password = form?.get('password')
        const returnTo = safeReturnTo(typeof form?.get('returnTo') === 'string' ? form.get('returnTo') as string : null, params.owner)
        if (typeof username !== 'string' || typeof password !== 'string' || !verifyOwnerCredentials(username, password)) {
          return loginPage(returnTo, 'Username or password is incorrect.', 401)
        }
        if (!setOwnerSession(request)) return ownerPage('Owner login', <p>Owner login is unavailable. Check dashboard credentials and SESSION_SECRET.</p>, 503)
        return new Response(null, { status: 303, headers: { Location: returnTo, 'Cache-Control': 'no-store' } })
      },
    },
  },
})
