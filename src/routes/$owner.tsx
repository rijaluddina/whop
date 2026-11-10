import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$owner')({
  component: Outlet,
  server: {
    handlers: {
      GET: ({ request }) => Response.redirect(new URL('/', request.url), 302),
    },
  },
})
