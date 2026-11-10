import { createFileRoute } from '@tanstack/react-router'
import { estimateServices, roofAges } from '../demo-config'
import { createEstimateLead } from '../server/estimate-lead'
import { getWhopUserId } from '../server/whop-auth'
import { sendEstimateConfirmation } from '../server/estimate-email'

export const Route = createFileRoute('/api/estimate')({
  server: {
    handlers: {
      GET: () => Response.json({ signedIn: Boolean(getWhopUserId()) }, { headers: { 'Cache-Control': 'private, no-store' } }),
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
          const leadId = await createEstimateLead(WHOP_ACCOUNT_ID, userId, {
            source: 'roofing_estimate',
            name: name.trim(),
            email: email.trim(),
            service,
            phone,
            zip,
            details: details.trim(),
            address: address?.trim() ?? '',
            roofAge: roofAge ?? "I don't know",
            insuranceClaim: insuranceClaim === 'yes',
          })
          if (leadId) {
            const emailSent = await sendEstimateConfirmation(`${userId}/${requestId}`, email.trim(), {
              name: name.trim(),
              service,
              zip,
              address: address?.trim() || undefined,
              roofAge: roofAge ?? "I don't know",
              insuranceClaim: insuranceClaim === 'yes',
            })
            return Response.json({ leadId, emailSent }, { headers: { 'Cache-Control': 'private, no-store' } })
          }
        } catch {
          // Whop keeps one lead per user, so a resubmission re-resolves to the
          // same lead instead of duplicating it.
        }
        return new Response(null, { status: 502 })
      },
    },
  },
})
