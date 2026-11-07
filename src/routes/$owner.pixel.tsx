import { createFileRoute } from '@tanstack/react-router'
import { ownerPage } from '../server/owner-page'
import { getOwnerAccess, whopOwnerRequest } from '../server/whop-owner'

const title = 'Whop pixel events'
const eventNames = ['service_viewed', 'estimate_requested', 'deposit_started']

type PixelEvent = {
  id: string
  event_name: string
  custom_name?: string | null
  event_time: string
  path?: string | null
}

export const Route = createFileRoute('/$owner/pixel')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const access = await getOwnerAccess(params.owner, request)
        if (access.status === 401) return ownerPage(title, <p>Owner dashboard credentials are required.</p>, 401)
        if (access.status === 403) return ownerPage(title, <p>This page is restricted to the account owner.</p>, 403)
        if (access.status !== 200) return ownerPage(title, <p>Pixel events are unavailable.</p>, access.status)

        const now = Date.now()
        const query = new URLSearchParams({
          account_id: access.accountId,
          first: '25',
          from: new Date(now - 7 * 86400000).toISOString(),
          to: new Date(now).toISOString(),
          event: eventNames.map(name => `pixel.custom:${name}`).join(','),
        })
        const hostname = process.env.WHOP_PIXEL_HOSTNAME
        if (!hostname) return ownerPage(title, <p>The website hostname has not been configured.</p>, 503)
        query.set('hostname', hostname)

        try {
          const result = await whopOwnerRequest(`/events?${query}`, access.apiKey)
          const events: PixelEvent[] = result.data
          return ownerPage(title, <>
            <p>Latest 25 matching events Whop returned for {hostname} in the past seven days.</p>
            {events.length === 0 ? <p>Whop returned no matching events.</p> : <table>
              <thead><tr><th scope="col">Event</th><th scope="col">Time (UTC)</th></tr></thead>
              <tbody>{events.map(event => <tr key={event.id}>
                <th scope="row">{event.custom_name || event.event_name}</th>
                <td><time dateTime={event.event_time}>{event.event_time}</time></td>
              </tr>)}</tbody>
            </table>}
          </>)
        } catch {
          return ownerPage(title, <p>Whop could not return pixel events.</p>, 502)
        }
      },
    },
  },
})
