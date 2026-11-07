import { createFileRoute } from '@tanstack/react-router'
import { startWhopLogin } from '../server/whop-auth'

export const Route = createFileRoute('/auth/login')({
  server: { handlers: { GET: ({ request }) => startWhopLogin(request) } },
})
