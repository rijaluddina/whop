import { createFileRoute } from '@tanstack/react-router'
import { finishWhopLogin } from '../server/whop-auth'

export const Route = createFileRoute('/auth/callback')({
  server: { handlers: { GET: ({ request }) => finishWhopLogin(request) } },
})
