import { whopApiBase, whopApiHeaders } from './whop-api.ts'

// POST /leads stores the estimate request on the Whop account. Whop keeps one
// lead per user and upserts it, so the same user's submissions land on one lead.
export async function createEstimateLead(
  accountId: string,
  userId: string,
  metadata: Record<string, unknown>,
): Promise<string | null> {
  const result = await fetch(`${whopApiBase}/leads`, {
    method: 'POST',
    // No Idempotency-Key: Whop identifies the lead by user_id (one lead per
    // user), so a retry would be re-resolved to the same lead regardless.
    headers: whopApiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ account_id: accountId, user_id: userId, metadata }),
    signal: AbortSignal.timeout(10000),
  })
  if (!result.ok) return null
  const lead = await result.json()
  return typeof lead.id === 'string' && /^lead_[A-Za-z0-9]+$/.test(lead.id) ? lead.id : null
}
