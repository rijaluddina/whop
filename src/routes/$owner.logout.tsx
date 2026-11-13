import { createFileRoute } from '@tanstack/react-router'
import { clearOwnerSession } from '../server/owner-session'

export const Route = createFileRoute('/$owner/logout')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const url = new URL(request.url)
        if (request.headers.get('origin') !== url.origin) return new Response('Request denied.', { status: 403 })
        if (process.env.OWNER_ROUTE_SLUG !== params.owner) return Response.redirect(new URL('/', request.url), 302)
        clearOwnerSession(request)
        return new Response(null, { status: 303, headers: { Location: `/${params.owner}/login`, 'Cache-Control': 'no-store' } })
      },
    },
  },
})
