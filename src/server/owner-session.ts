import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const cookieName = 'roofing_owner_session'
const sessionSeconds = 12 * 60 * 60

function config() {
  const { OWNER_DASHBOARD_USERNAME: username, OWNER_DASHBOARD_PASSWORD: password, SESSION_SECRET: secret } = process.env
  if (!username || username.length > 128 || !password || password.length < 32 || !secret || secret.length < 32) return
  return { username, password, secret }
}

function signature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest()
}

export function ownerLoginConfigured() {
  return Boolean(config())
}

export function verifyOwnerCredentials(username: string, password: string) {
  const settings = config()
  if (!settings || username.length > 128 || password.length > 256) return false
  const digest = (value: string) => createHash('sha256').update(value).digest()
  const usernameMatches = timingSafeEqual(digest(settings.username), digest(username))
  const passwordMatches = timingSafeEqual(digest(settings.password), digest(password))
  return usernameMatches && passwordMatches
}

export function setOwnerSession(request: Request) {
  const settings = config()
  if (!settings) return false
  const expiry = String(Date.now() + sessionSeconds * 1000)
  const credentialVersion = createHash('sha256').update(settings.password).digest('base64url')
  const value = `${settings.username}.${expiry}.${credentialVersion}`
  const mac = signature(value, settings.secret).toString('base64url')
  setCookie(cookieName, `${expiry}.${credentialVersion}.${mac}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: sessionSeconds,
  })
  return true
}

export function hasOwnerSession() {
  const settings = config()
  const cookie = getCookie(cookieName)
  if (!settings || !cookie) return false
  const [expiry, credentialVersion, mac, extra] = cookie.split('.')
  if (extra !== undefined || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false
  const currentVersion = createHash('sha256').update(settings.password).digest('base64url')
  if (credentialVersion !== currentVersion) return false
  const value = `${settings.username}.${expiry}.${credentialVersion}`
  const expected = signature(value, settings.secret)
  let actual: Buffer
  try { actual = Buffer.from(mac, 'base64url') } catch { return false }
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function clearOwnerSession(request: Request) {
  setCookie(cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: 0,
  })
}
