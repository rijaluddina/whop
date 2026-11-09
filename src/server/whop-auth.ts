import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const oauth = 'https://api.whop.com/oauth'
const transactionCookie = 'roofing_oauth'
const sessionCookie = 'roofing_session'

function config() {
  const { WHOP_CLIENT_ID, WHOP_CLIENT_SECRET, WHOP_REDIRECT_URI, SESSION_SECRET } = process.env
  if (!WHOP_CLIENT_ID || !WHOP_CLIENT_SECRET || !WHOP_REDIRECT_URI || !SESSION_SECRET || SESSION_SECRET.length < 32) return
  return {
    clientId: WHOP_CLIENT_ID,
    clientSecret: WHOP_CLIENT_SECRET,
    redirectUri: WHOP_REDIRECT_URI,
    secure: new URL(WHOP_REDIRECT_URI).protocol === 'https:',
    secret: SESSION_SECRET,
  }
}

function writeCookie(name: string, value: string, maxAge: number, secure: boolean) {
  setCookie(name, value, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge })
}

function signature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function getWhopUserId() {
  const settings = config()
  const cookie = getCookie(sessionCookie)
  if (!settings || !cookie) return
  const [userId, expiry, mac, extra] = cookie.split('.')
  if (extra !== undefined || !/^user_[A-Za-z0-9]+$/.test(userId) || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return
  const expected = Buffer.from(signature(`${userId}.${expiry}`, settings.secret))
  const actual = Buffer.from(mac ?? '')
  if (actual.length === expected.length && timingSafeEqual(actual, expected)) return userId
}

function returnPath(candidate: string | null | undefined) {
  if (candidate === '/checkout?service=deposit' || candidate === '/?service=deposit#services') return candidate
  return '/#contact'
}

export function startWhopLogin(request: Request) {
  const settings = config()
  if (!settings) return new Response('Whop sign-in is unavailable.', { status: 503 })
  const verifier = randomBytes(32).toString('base64url')
  const state = randomBytes(24).toString('base64url')
  const nonce = randomBytes(16).toString('base64url')
  const params = new URLSearchParams({
    client_id: settings.clientId,
    redirect_uri: settings.redirectUri,
    response_type: 'code',
    scope: 'openid',
    state,
    // Whop's authorize endpoint rejects openid requests without a nonce.
    nonce,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
  })
  const destination = returnPath(new URL(request.url).searchParams.get('returnTo'))
  writeCookie(transactionCookie, `${state}.${verifier}.${nonce}.${destination}`, 600, settings.secure)
  return Response.redirect(`${oauth}/authorize?${params}`, 303)
}

export async function finishWhopLogin(request: Request) {
  const settings = config()
  if (!settings) return new Response('Whop sign-in is unavailable.', { status: 503 })
  const params = new URL(request.url).searchParams
  const code = params.get('code')
  const [state, verifier, nonce, destination] = (getCookie(transactionCookie) ?? '').split('.')
  writeCookie(transactionCookie, '', 0, settings.secure)
  if (!code || !state || !verifier || !nonce || state !== params.get('state')) {
    return new Response('Invalid sign-in request. Return to the site and try again.', { status: 400 })
  }

  try {
    const tokenResponse = await fetch(`${oauth}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        redirect_uri: settings.redirectUri,
        code_verifier: verifier,
        code,
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!tokenResponse.ok) throw new Error('Token exchange failed')
    const { access_token: token } = await tokenResponse.json()
    if (typeof token !== 'string' || !token) throw new Error('Missing access token')
    const profileResponse = await fetch(`${oauth}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!profileResponse.ok) throw new Error('Userinfo failed')
    const { sub } = await profileResponse.json()
    if (typeof sub !== 'string' || !/^user_[A-Za-z0-9]+$/.test(sub)) throw new Error('Invalid user ID')

    const maxAge = 900
    const value = `${sub}.${Date.now() + maxAge * 1000}`
    writeCookie(sessionCookie, `${value}.${signature(value, settings.secret)}`, maxAge, settings.secure)
    return new Response(null, { status: 303, headers: { Location: returnPath(destination), 'Cache-Control': 'no-store' } })
  } catch {
    return new Response('Whop sign-in failed. Return to the site and try again.', { status: 502 })
  }
}
