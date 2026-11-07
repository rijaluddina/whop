import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyWhopWebhook(headers: Headers, body: Uint8Array, secret: string, now = Date.now()) {
  const id = headers.get('webhook-id')
  const timestamp = headers.get('webhook-timestamp')
  const signatures = headers.get('webhook-signature')
  if (!secret.startsWith('ws_') || !id || !timestamp || !/^\d+$/.test(timestamp) || !signatures) return false
  if (Math.abs(now - Number(timestamp) * 1000) > 300000) return false

  const expected = createHmac('sha256', secret).update(`${id}.${timestamp}.`).update(body).digest()
  return signatures.split(/\s+/).some(entry => {
    const [version, encoded, extra] = entry.split(',')
    if (version !== 'v1' || !encoded || extra !== undefined) return false
    const received = Buffer.from(encoded, 'base64')
    return received.length === expected.length && timingSafeEqual(received, expected)
  })
}
