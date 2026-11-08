import { createFileRoute } from '@tanstack/react-router'
import { demoPlans } from '../demo-config'
import { findSavedProjectMethod } from '../server/deposit-setup'
import { getWhopUserId } from '../server/whop-auth'

export const Route = createFileRoute('/api/project-deposit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { 'Cache-Control': 'private, no-store' }
        if (request.headers.get('origin') !== new URL(request.url).origin) {
          return new Response(null, { status: 403, headers })
        }
        const userId = getWhopUserId()
        if (!userId) return new Response(null, { status: 401, headers })
        const size = Number(request.headers.get('content-length'))
        if (!Number.isInteger(size) || size < 1 || size > 1024) return new Response(null, { status: 400, headers })
        const input = await request.json().catch(() => null)
        const setupId = input?.setupId
        if (typeof setupId !== 'string' || !/^sint_[A-Za-z0-9]+$/.test(setupId)) {
          return new Response(null, { status: 400, headers })
        }

        const { WHOP_ACCOUNT_ID, WHOP_API_KEY } = process.env
        if (!WHOP_ACCOUNT_ID || !WHOP_API_KEY) return new Response(null, { status: 503, headers })
        try {
          const setup = await findSavedProjectMethod(setupId, WHOP_ACCOUNT_ID, WHOP_API_KEY)
          if (setup?.userId !== userId) return new Response(null, { status: 403, headers })
          const response = await fetch('https://api.whop.com/api/v1/checkout_configurations', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${WHOP_API_KEY}`,
              'Content-Type': 'application/json',
              'Api-Version-Date': '2026-10-24',
              'Idempotency-Key': `roofing-deposit-${setupId}`,
            },
            body: JSON.stringify({
              account_id: WHOP_ACCOUNT_ID,
              mode: 'payment',
              // Pinned to 2026-10-24: the plan_id → variant_id rename landed in 2026-10-27-2.
              plan_id: demoPlans.deposit.id,
              metadata: {
                source: 'roofing_project_deposit',
                customer_id: userId,
                project: setup.project,
                setup_intent_id: setupId,
              },
            }),
            signal: AbortSignal.timeout(10000),
          })
          if (!response.ok) throw new Error('Checkout configuration failed')
          const configuration = await response.json()
          if (configuration.account_id !== WHOP_ACCOUNT_ID || !/^ch_[A-Za-z0-9]+$/.test(configuration.id)) {
            throw new Error('Invalid checkout configuration')
          }
          return Response.json({ configurationId: configuration.id }, { headers })
        } catch {
          return new Response(null, { status: 502, headers })
        }
      },
    },
  },
})
