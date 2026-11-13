import { whopAccountId, whopApiBase, whopApiHeaders } from './whop-api'
import { hasOwnerSession, ownerLoginConfigured } from './owner-session'

export async function whopOwnerRequest(path: string, apiKey?: string) {
  const response = await fetch(`${whopApiBase}${path}`, {
    headers: whopApiHeaders(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    console.error('Whop API request failed:', response.status, path)
    throw new Error('Whop request failed')
  }
  return response.json()
}

export async function getOwnerAccess(slug: string, request: Request) {
  const { OWNER_ROUTE_SLUG: ownerSlug } = process.env
  const accountId = whopAccountId
  if (!ownerSlug || ownerSlug !== slug) return { status: 404 } as const

  const { protocol, hostname } = new URL(request.url)
  if (protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
    return { status: 403 } as const
  }
  if (!ownerLoginConfigured() || !accountId || !/^biz_[A-Za-z0-9]+$/.test(accountId)) {
    return { status: 503 } as const
  }
  if (!hasOwnerSession()) return { status: 401 } as const

  try {
    const account = await whopOwnerRequest('/accounts/me')
    if (account.id !== accountId) return { status: 403 } as const
    return { status: 200, accountId } as const
  } catch {
    return { status: 502 } as const
  }
}

export function ownerLoginRedirect(slug: string, request: Request) {
  const url = new URL(request.url)
  const base = `/${slug}/`
  const returnTo = [`${base}leads`, `${base}pixel`, `${base}invoice`].find(path => url.pathname === path)
  const login = new URL(`${base}login`, url)
  if (returnTo) login.searchParams.set('returnTo', returnTo)
  return Response.redirect(login, 303)
}
