import { createFileRoute } from '@tanstack/react-router'
import { ownerPage } from '../server/owner-page'
import { getOwnerAccess, ownerLoginRedirect, whopOwnerRequest } from '../server/whop-owner'

export const Route = createFileRoute('/$owner/leads')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const access = await getOwnerAccess(params.owner, request)
        if (access.status === 404) return Response.redirect(new URL('/', request.url), 302)
        if (access.status === 401) return ownerLoginRedirect(params.owner, request)
        if (access.status === 403) return ownerPage('Leads', <p>This page is restricted to the account owner.</p>, 403)
        if (access.status !== 200) return ownerPage('Leads', <p>Leads are unavailable.</p>, access.status)

        const query = new URLSearchParams({ account_id: access.accountId, first: '25' })
        const cursor = new URL(request.url).searchParams.get('after')
        if (cursor && cursor.length <= 512) query.set('after', cursor)
        try {
          const result = await whopOwnerRequest(`/leads?${query}`)
          const leads = result.data.filter((lead: Lead) => lead.metadata?.source === 'roofing_estimate') as Lead[]
          const next = result.page_info?.has_next_page && result.page_info.end_cursor
          return ownerPage('Leads', <>
            {leads.length === 0 && <p className="empty">No leads on this page.</p>}
            <div className="lead-grid">{leads.map((lead) => <article className="lead-card" key={lead.id}>
              <div className="lead-top"><div><p className="service">{String(lead.metadata?.service || 'Estimate request')}</p><h2>{String(lead.metadata?.name || lead.user?.name || lead.user?.email || lead.id)}</h2></div><time className="date" dateTime={lead.created_at}>{lead.created_at?.slice(0, 10)}</time></div>
              <p className="contact">{String(lead.metadata?.email || lead.user?.email || 'Email not provided')} · {String(lead.metadata?.phone || 'Phone not provided')}</p>
              <div className="details"><p><span>Address</span> {String(lead.metadata?.address || 'Not provided')}</p><p><span>ZIP code</span> {String(lead.metadata?.zip || 'Not provided')}</p><p><span>Roof age</span> {String(lead.metadata?.roofAge || 'Not provided')}</p><p><span>Insurance review</span> {lead.metadata?.insuranceClaim === true ? 'Yes' : 'No'}</p></div>
              {Boolean(lead.metadata?.details) && <p className="message">{String(lead.metadata?.details)}</p>}
            </article>)}</div>
            {typeof next === 'string' && <a className="page-link" href={`?after=${encodeURIComponent(next)}`}>Older leads →</a>}
          </>)
        } catch {
          return ownerPage('Leads', <p>Whop could not return the leads.</p>, 502)
        }
      },
    },
  },
})

type Lead = {
  id: string
  created_at: string
  user?: { name?: string; email?: string }
  metadata?: Record<string, unknown>
}
