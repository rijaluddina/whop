import { createFileRoute } from '@tanstack/react-router'
import { estimateServices, roofAges } from '../demo-config'
import { whopApiBase, whopApiHeaders } from '../server/whop-api'
import { getWhopUserId } from '../server/whop-auth'

export const Route = createFileRoute('/api/estimate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get('origin') !== new URL(request.url).origin) {
          return new Response(null, { status: 403 })
        }
        const userId = getWhopUserId()
        if (!userId) return new Response(null, { status: 401 })

        const length = Number(request.headers.get('content-length'))
        if (!Number.isInteger(length) || length < 1 || length > 8192) {
          return new Response(null, { status: 400 })
        }
        const input = await request.json().catch(() => null)
        const { requestId, name, email, service, phone, zip, details, address, roofAge, insuranceClaim } = input ?? {}
        if (
          typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/.test(requestId) ||
          typeof name !== 'string' || !name.trim() || name.length > 100 ||
          typeof email !== 'string' || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ||
          !estimateServices.some(option => option === service) ||
          typeof phone !== 'string' || !/^[+()0-9 .-]{7,32}$/.test(phone) ||
          phone.replace(/\D/g, '').length < 7 ||
          typeof zip !== 'string' || !/^\d{5}(?:-\d{4})?$/.test(zip) ||
          typeof details !== 'string' || !details.trim() || details.length > 1000 ||
          (address !== undefined && (typeof address !== 'string' || address.length > 200)) ||
          (roofAge !== undefined && !roofAges.some(age => age === roofAge)) ||
          (insuranceClaim !== undefined && insuranceClaim !== 'yes')
        ) return new Response(null, { status: 400 })

        const { WHOP_ACCOUNT_ID } = process.env
        if (!WHOP_ACCOUNT_ID) return new Response(null, { status: 503 })

        try {
          const result = await fetch(`${whopApiBase}/leads`, {
            method: 'POST',
            headers: whopApiHeaders({
              'Content-Type': 'application/json',
              'Idempotency-Key': `estimate-${userId}-${requestId}`,
            }),
            body: JSON.stringify({
              account_id: WHOP_ACCOUNT_ID,
              user_id: userId,
              metadata: { source: 'roofing_estimate', name: name.trim(), email: email.trim(), service, phone, zip, details: details.trim(), address: address?.trim() ?? '', roofAge: roofAge ?? "I don't know", insuranceClaim: insuranceClaim === 'yes' },
            }),
            signal: AbortSignal.timeout(10000),
          })
          if (result.ok) {
            const lead = await result.json()
            if (typeof lead.id === 'string' && /^lead_[A-Za-z0-9]+$/.test(lead.id)) {
              return Response.json({ leadId: lead.id }, { headers: { 'Cache-Control': 'private, no-store' } })
            }
          }
        } catch {
          // A retry with the same request ID can recover a timed-out submission.
        }
        return new Response(null, { status: 502 })
      },
    },
  },
})
