import { createHash, timingSafeEqual } from 'node:crypto'

const api = 'https://api.whop.com/api/v1'

export async function whopOwnerRequest(path: string, apiKey: string) {
  const response = await fetch(`${api}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Api-Version-Date': '2026-10-24' },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Whop request failed')
  return response.json()
}

export async function getOwnerAccess(slug: string, request: Request) {
  const {
    WHOP_ACCOUNT_ID: accountId,
    WHOP_API_KEY: apiKey,
    OWNER_ROUTE_SLUG: ownerSlug,
    OWNER_DASHBOARD_PASSWORD: password,
  } = process.env
  if (!ownerSlug || ownerSlug !== slug) return { status: 404 } as const

  const { protocol, hostname } = new URL(request.url)
  if (protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
    return { status: 403 } as const
  }
  if (!password || password.length < 32 || !accountId || !/^biz_[A-Za-z0-9]+$/.test(accountId) || !apiKey) {
    return { status: 503 } as const
  }

  const expected = Buffer.from(`owner:${password}`).toString('base64')
  const provided = /^Basic ([A-Za-z0-9+/=]+)$/i.exec(request.headers.get('authorization') ?? '')?.[1] ?? ''
  const digest = (value: string) => createHash('sha256').update(value).digest()
  if (!timingSafeEqual(digest(expected), digest(provided))) return { status: 401 } as const

  try {
    const account = await whopOwnerRequest('/accounts/me', apiKey)
    if (account.id !== accountId) return { status: 403 } as const
    return { status: 200, accountId, apiKey } as const
  } catch {
    return { status: 502 } as const
  }
}
