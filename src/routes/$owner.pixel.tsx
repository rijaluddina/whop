import { createFileRoute } from '@tanstack/react-router'
import { ownerPage } from '../server/owner-page'
import { getOwnerAccess, ownerLoginRedirect, whopOwnerRequest } from '../server/whop-owner'

const title = 'Pixel'

type PixelEvent = {
  id: string
  event_name: string
  custom_name?: string | null
  event_time: string
  path?: string | null
  event_id?: string
  person_id?: string
  url?: string | null
  referrer_url?: string | null
  value?: number | null
  currency?: string | null
  total_usd_amount?: number | null
  user?: { email?: string | null; name?: string | null; country?: string | null; city?: string | null } | null
  context?: { source_type?: string | null; utm_source?: string | null } | null
  related?: { product?: { title?: string | null } | null; variant?: { title?: string | null } | null } | null
}

export const Route = createFileRoute('/$owner/pixel')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const access = await getOwnerAccess(params.owner, request)
        if (access.status === 404) return Response.redirect(new URL('/', request.url), 302)
        if (access.status === 401) return ownerLoginRedirect(params.owner, request)
        if (access.status === 403) return ownerPage(title, <p>This page is restricted to the account owner.</p>, 403)
        if (access.status !== 200) return ownerPage(title, <p>Pixel events are unavailable.</p>, access.status)

        const search = new URL(request.url).searchParams
        const anchor = search.get('to')
        const anchorTime = anchor && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(anchor) ? Date.parse(anchor) : NaN
        const now = Number.isFinite(anchorTime) && anchorTime <= Date.now() ? anchorTime : Date.now()
        const query = new URLSearchParams({
          account_id: access.accountId,
          first: '25',
          from: new Date(now - 7 * 86400000).toISOString(),
          to: new Date(now).toISOString(),
        })
        const cursor = search.get('after')
        if (cursor && cursor.length <= 512) query.set('after', cursor)

        try {
          const result = await whopOwnerRequest(`/events?${query}`)
          const events: PixelEvent[] = result.data.filter((event: PixelEvent) =>
            ['estimate_requested', 'service_viewed', 'deposit_started'].includes(event.custom_name || event.event_name) ||
            event.event_name === 'pixel.page' || event.event_name.includes('checkout') || event.event_name === 'payment.completed'
          )
          return ownerPage(title, <>
            <p className="panel">Events from the past seven days: estimate_requested, service_viewed, deposit_started, page views, and checkout activity. Missing fields are shown as —.</p>
            {events.length === 0 ? <p className="empty">No matching events on this page. Check older events if available.</p> : <div className="table-wrap"><table>
              <thead><tr><th scope="col">Event / ID</th><th scope="col">Person</th><th scope="col">Page / URL</th><th scope="col">Source / referrer</th><th scope="col">Location</th><th scope="col">Product</th><th scope="col">Amount</th><th scope="col">Time (UTC)</th></tr></thead>
              <tbody>{events.map(event => <tr key={event.id}>
                <th scope="row">{event.custom_name || event.event_name}{event.custom_name && <><br /><small>{event.event_name}</small></>}<br /><small>{event.event_id || event.id}</small></th>
                <td>{event.user?.email || event.user?.name || '—'}<br /><small>{event.person_id || '—'}</small></td>
                <td>{event.path || '—'}{event.url && <><br /><small>{event.url}</small></>}</td>
                <td>{event.context?.utm_source || event.context?.source_type || '—'}{event.referrer_url && <><br /><small>{event.referrer_url}</small></>}</td>
                <td>{[event.user?.city, event.user?.country].filter(Boolean).join(', ') || '—'}</td>
                <td>{event.related?.variant?.title || event.related?.product?.title || '—'}</td>
                <td>{event.total_usd_amount != null ? `$${event.total_usd_amount.toFixed(2)} USD` : event.value != null ? `${event.value} ${event.currency?.toUpperCase() || ''}` : '—'}</td>
                <td><time dateTime={event.event_time}>{event.event_time}</time></td>
              </tr>)}</tbody>
            </table></div>}
            {result.page_info?.has_next_page && typeof result.page_info.end_cursor === 'string' && <a className="page-link" href={`?to=${encodeURIComponent(new Date(now).toISOString())}&after=${encodeURIComponent(result.page_info.end_cursor)}`}>Older events →</a>}
          </>)
        } catch {
          return ownerPage(title, <p>Whop could not return pixel events.</p>, 502)
        }
      },
    },
  },
})
