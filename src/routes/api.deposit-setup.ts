import { createFileRoute } from '@tanstack/react-router'
import { findSavedProjectMethod } from '../server/deposit-setup'
import { getWhopUserId } from '../server/whop-auth'

export const Route = createFileRoute('/api/deposit-setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = getWhopUserId()
        const headers = { 'Cache-Control': 'private, no-store' }
        if (!userId) return new Response(null, { status: 401, headers })
        const id = new URL(request.url).searchParams.get('id')
        if (!id || !/^sint_[A-Za-z0-9]+$/.test(id)) return new Response(null, { status: 400, headers })
        const { WHOP_ACCOUNT_ID, WHOP_API_KEY } = process.env
        if (!WHOP_ACCOUNT_ID || !WHOP_API_KEY) return new Response(null, { status: 503, headers })
        try {
          const setup = await findSavedProjectMethod(id, WHOP_ACCOUNT_ID, WHOP_API_KEY)
          return Response.json({ saved: setup?.userId === userId }, { headers })
        } catch {
          return new Response(null, { status: 502, headers })
        }
      },
      POST: async ({ request }) => {
        const origin = new URL(request.url).origin
        if (request.headers.get('origin') !== origin) return new Response(null, { status: 403 })
        const userId = getWhopUserId()
        if (!userId) return new Response('Sign in with Whop before saving a payment method.', { status: 401 })

        const size = Number(request.headers.get('content-length'))
        if (!Number.isInteger(size) || size < 1 || size > 2048) return new Response(null, { status: 400 })
        const form = await request.formData().catch(() => null)
        const project = form?.get('project')
        if (form?.get('consent') !== 'yes' || typeof project !== 'string' || !project.trim() || project.length > 100) {
          return new Response('Enter the project reference and confirm your consent.', { status: 400 })
        }

        const { WHOP_API_KEY, WHOP_ACCOUNT_ID, WHOP_REDIRECT_URI } = process.env
        if (!WHOP_API_KEY || !WHOP_ACCOUNT_ID || !WHOP_REDIRECT_URI) return new Response(null, { status: 503 })
        const returnUrl = new URL('/checkout?setup=returned', WHOP_REDIRECT_URI)
        if (returnUrl.protocol !== 'https:') return new Response('Payment setup requires HTTPS.', { status: 503 })

        try {
          const response = await fetch('https://api.whop.com/api/v1/checkout_configurations', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${WHOP_API_KEY}`,
              'Api-Version-Date': '2026-10-24',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              account_id: WHOP_ACCOUNT_ID,
              mode: 'setup',
              redirect_url: returnUrl.href,
              metadata: {
                source: 'roofing_deposit_setup',
                customer_id: userId,
                project: project.trim(),
              },
            }),
            signal: AbortSignal.timeout(10000),
          })
          if (!response.ok) throw new Error('Setup checkout unavailable')
          const configuration = await response.json()
          const purchaseUrl = new URL(configuration.purchase_url)
          if (purchaseUrl.protocol !== 'https:' || !['whop.com', 'checkout.whop.com'].includes(purchaseUrl.hostname)) {
            throw new Error('Unexpected checkout URL')
          }
          return new Response(null, {
            status: 303,
            headers: { Location: purchaseUrl.href, 'Cache-Control': 'no-store' },
          })
        } catch {
          return new Response('Whop could not start payment setup. Please try again.', { status: 502 })
        }
      },
    },
  },
})
