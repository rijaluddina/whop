// Base URL for Whop API calls. The hosted runtime injects WHOP_API_ORIGIN as a
// bare origin (https://api.whop.com) — per the hosting docs the /api/v1 path is
// appended by the caller; local development falls back to the production API.
export const whopApiBase = `${process.env.WHOP_API_ORIGIN ?? 'https://api.whop.com'}/api/v1`

// Builds headers for server-side Whop API calls. In local development .dev.vars
// provides WHOP_API_KEY and it is sent explicitly. On Whop's hosted runtime the
// key is never in the environment — the outbound proxy attaches the app's own
// API key, so no Authorization header is sent. Every call is pinned to the app's
// API version unless a caller overrides it.
export function whopApiHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { 'Api-Version-Date': '2026-10-24', ...extra }
  if (process.env.WHOP_API_KEY) headers.Authorization = `Bearer ${process.env.WHOP_API_KEY}`
  return headers
}
