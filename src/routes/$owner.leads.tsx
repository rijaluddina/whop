import { createFileRoute } from '@tanstack/react-router'
import { ownerPage } from '../server/owner-page'
import { getOwnerAccess, whopOwnerRequest } from '../server/whop-owner'

export const Route = createFileRoute('/$owner/leads')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const access = await getOwnerAccess(params.owner, request)
        if (access.status === 401) return ownerPage('Estimate requests', <p>Owner dashboard credentials are required.</p>, 401)
        if (access.status === 403) return ownerPage('Estimate requests', <p>This page is restricted to the account owner.</p>, 403)
        if (access.status !== 200) return ownerPage('Estimate requests', <p>Estimate requests are unavailable.</p>, access.status)

        const query = new URLSearchParams({ account_id: access.accountId, first: '25' })
        const cursor = new URL(request.url).searchParams.get('after')
        if (cursor && cursor.length <= 512) query.set('after', cursor)
        try {
          const result = await whopOwnerRequest(`/leads?${query}`)
          const leads = result.data.filter((lead: Lead) => lead.metadata?.source === 'roofing_estimate') as Lead[]
          const next = result.page_info?.has_next_page && result.page_info.end_cursor
          return ownerPage('Estimate requests', <>
            {leads.length === 0 && <p>No estimate requests on this page.</p>}
            {leads.map((lead) => <article key={lead.id}>
              <h2>{String(lead.metadata?.name || lead.user?.name || lead.user?.email || lead.id)}</h2>
              <p>{String(lead.metadata?.email || lead.user?.email || '')}</p>
              {typeof lead.metadata?.service === 'string' && <p>Requested service: {lead.metadata.service}</p>}
              <p>{String(lead.metadata?.phone ?? '')} · {String(lead.metadata?.zip ?? '')}</p>
              <p>{String(lead.metadata?.details ?? '')}</p>
              <p>Address: {String(lead.metadata?.address ?? 'Not provided')}</p>
              <p>Roof age: {String(lead.metadata?.roofAge ?? 'Not provided')}</p>
              <p>Insurance review requested: {lead.metadata?.insuranceClaim === true ? 'Yes' : 'No'}</p>
              <p><time>{lead.created_at}</time></p>
            </article>)}
            {typeof next === 'string' && <a href={`?after=${encodeURIComponent(next)}`}>Older leads</a>}
          </>)
        } catch {
          return ownerPage('Estimate requests', <p>Whop could not return the estimate requests.</p>, 502)
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
