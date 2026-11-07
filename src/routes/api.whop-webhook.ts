import { createFileRoute } from '@tanstack/react-router'
import { verifyWhopWebhook } from '../server/whop-webhook'

export const Route = createFileRoute('/api/whop-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.WHOP_WEBHOOK_SECRET
        if (!secret) return new Response(null, { status: 503 })
        const body = new Uint8Array(await request.arrayBuffer())
        if (!verifyWhopWebhook(request.headers, body, secret)) return new Response(null, { status: 401 })
        try {
          const event = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body))
          if (!event || typeof event.type !== 'string') return new Response(null, { status: 400 })
          if (['setup_intent.succeeded', 'payment.succeeded', 'payment.failed'].includes(event.type)) {
            console.info('Verified Whop webhook', event.type, request.headers.get('webhook-id'))
          }
          return new Response(null, { status: 204 })
        } catch {
          return new Response(null, { status: 400 })
        }
      },
    },
  },
})
