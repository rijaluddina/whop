import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'

export function ownerPage(title: string, content: ReactNode, status = 200) {
  return new Response('<!doctype html>' + renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body><main><h1>{title}</h1>{content}</main></body>
    </html>,
  ), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "frame-ancestors 'none'",
      ...(status === 401 ? { 'WWW-Authenticate': 'Basic realm="Roofing owner dashboard", charset="UTF-8"' } : {}),
    },
  })
}
