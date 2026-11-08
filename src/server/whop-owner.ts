import { createHash, timingSafeEqual } from 'node:crypto'
import { whopApiBase, whopApiHeaders } from './whop-api'

export async function whopOwnerRequest(path: string, apiKey?: string) {
  const response = await fetch(`${whopApiBase}${path}`, {
    headers: whopApiHeaders(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Whop request failed')
  return response.json()
}

export async function getOwnerAccess(slug: string, request: Request) {
  const { WHOP_ACCOUNT_ID: accountId, OWNER_ROUTE_SLUG: ownerSlug, OWNER_DASHBOARD_PASSWORD: password } = process.env
  if (!ownerSlug || ownerSlug !== slug) return { status: 404 } as const

  const { protocol, hostname } = new URL(request.url)
  if (protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
    return { status: 403 } as const
  }
  if (!password || password.length < 32 || !accountId || !/^biz_[A-Za-z0-9]+$/.test(accountId)) {
    return { status: 503 } as const
  }

  const expected = Buffer.from(`owner:${password}`).toString('base64')
  const provided = /^Basic ([A-Za-z0-9+/=]+)$/i.exec(request.headers.get('authorization') ?? '')?.[1] ?? ''
  const digest = (value: string) => createHash('sha256').update(value).digest()
  if (!timingSafeEqual(digest(expected), digest(provided))) return { status: 401 } as const

  try {
    const account = await whopOwnerRequest('/accounts/me')
    if (account.id !== accountId) return { status: 403 } as const
    return { status: 200, accountId } as const
  } catch {
    return { status: 502 } as const
  }
}
