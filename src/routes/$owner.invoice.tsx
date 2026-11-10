import { randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { demoPlans, estimateServices } from '../demo-config'
import { findPaidProjectDeposit } from '../server/deposit-setup'
import { ownerPage } from '../server/owner-page'
import { whopApiBase, whopApiHeaders } from '../server/whop-api'
import { getOwnerAccess, whopOwnerRequest } from '../server/whop-owner'

type Invoice = {
  id: string
  status: string
  due_at?: string | null
  created_at?: string
  number?: string | null
  overdue?: boolean
  customer_name?: string | null
  member_id?: string | null
  payment_method_id?: string | null
  email_address?: string | null
  billing_address?: { country?: string | null } | null
  metadata?: { source?: string; project?: string; service?: string; deposit_payment_id?: string }
  total?: { amount: string; currency: string }
}

function canSendManually(invoice: Invoice) {
  return invoice.status === 'draft' && invoice.payment_method_id === null &&
    invoice.metadata?.source === 'roofing_final_balance' && Boolean(invoice.email_address)
}

function canChargeSavedMethod(invoice: Invoice) {
  return invoice.status === 'draft' && invoice.metadata?.source === 'roofing_final_balance' &&
    Boolean(invoice.metadata.deposit_payment_id && invoice.payment_method_id && invoice.member_id) &&
    invoice.total?.currency.toLowerCase() === 'usd' && Number(invoice.total.amount) > 0
}

type BillingAddress = {
  name?: string
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

// Whop refuses to send or charge an invoice whose tax it cannot resolve
// (invoice_tax_address_required), so every draft carries the customer's billing
// address. Returns undefined when the submitted address is incomplete.
function readBillingAddress(form: FormData | null): BillingAddress | undefined {
  const value = (name: string) => {
    const raw = form?.get(name)
    return typeof raw === 'string' ? raw.trim() : ''
  }
  const field = (name: string, max: number) => {
    const raw = value(name)
    return raw && raw.length <= max ? raw : undefined
  }
  const country = value('billingCountry').toUpperCase()
  const line1 = field('billingLine1', 200)
  const city = field('billingCity', 100)
  const state = field('billingState', 100)
  const postalCode = field('billingPostalCode', 20)
  if (!line1 || !city || !postalCode || !/^[A-Z]{2}$/.test(country)) return
  if (country === 'US' && !state) return
  return {
    ...(field('billingName', 100) && { name: field('billingName', 100) }),
    line1,
    ...(field('billingLine2', 200) && { line2: field('billingLine2', 200) }),
    city,
    ...(state && { state }),
    postal_code: postalCode,
    country,
  }
}

// POSTs to Whop and records what Whop actually said when it refuses, so the
// owner page reports a real reason instead of a bare 502 and the app logs keep
// the upstream status. Callers render the reason they were thrown.
async function whopPost(path: string, body: string, idempotencyKey: string) {
  const response = await fetch(`${whopApiBase}${path}`, {
    method: 'POST',
    headers: whopApiHeaders({ 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }),
    body,
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Whop rejected ${path} with HTTP ${response.status}${detail ? ` — ${detail.slice(0, 240)}` : ''}`)
  }
  return response.json()
}

function failedPage(title: string, message: string, error: unknown) {
  const reason = error instanceof Error ? error.message : String(error)
  console.error(`Whop invoice call failed: ${reason}`)
  return ownerPage(title, <p>{message}<br /><small>{reason.slice(0, 240)}</small></p>, 502)
}

export const Route = createFileRoute('/$owner/invoice')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const title = 'Invoices'
        const url = new URL(request.url)
        if (request.headers.get('origin') !== url.origin) return ownerPage(title, <p>Request denied.</p>, 403)
        const access = await getOwnerAccess(params.owner, request)
        if (access.status !== 200) return ownerPage(title, <p>Access denied.</p>, access.status)
        const size = Number(request.headers.get('content-length'))
        if (!Number.isInteger(size) || size < 1 || size > 4096) {
          return ownerPage(title, <p>Invalid invoice request.</p>, 400)
        }
        const form = await request.formData().catch(() => null)
        const action = form?.get('action')
        if (form && (action === 'send' || action === 'charge')) {
          const id = form.get('invoiceId')
          if (typeof id !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(id) || form.get('confirmed') !== 'yes') {
            return ownerPage(title, <p>Confirm the invoice before proceeding.</p>, 400)
          }
          try {
            const invoice: Invoice = await whopOwnerRequest(`/invoices/${id}`)
            const eligible = action === 'charge' ? canChargeSavedMethod(invoice) : canSendManually(invoice)
            if (invoice.id !== id || !eligible || invoice.total?.amount !== form.get('amountConfirmed')) {
              return ownerPage(title, <p>The draft changed or is no longer eligible. Review it before retrying.</p>, 409)
            }
            // Whop cannot tax a draft without an address (invoice_tax_address_required).
            if (!invoice.billing_address?.country) {
              return ownerPage(title, <p>This draft has no billing address, so Whop cannot calculate its tax. Create a new draft with the customer's billing address.</p>, 409)
            }
            if (action === 'charge') {
              const depositId = invoice.metadata?.deposit_payment_id
              const saved = depositId && await findPaidProjectDeposit(
                depositId, access.accountId, demoPlans.deposit.id,
              )
              if (!saved || saved.project !== invoice.metadata?.project ||
                saved.methodId !== invoice.payment_method_id || saved.memberId !== invoice.member_id) {
                return ownerPage(title, <p>The saved method no longer matches this project's paid deposit.</p>, 409)
              }
            } else if (invoice.email_address !== form.get('recipientConfirmed')) {
              return ownerPage(title, <p>The recipient changed. Review the draft before retrying.</p>, 409)
            }
            const operation = action === 'charge' ? 'issue' : 'send'
            await whopPost(`/invoices/${id}/${operation}`, '{}', `roofing-${operation}-${id}`)
            return new Response(null, { status: 303, headers: { Location: url.pathname, 'Cache-Control': 'no-store' } })
          } catch (error) {
            return failedPage(title, 'Whop did not confirm the invoice action. Check the invoice status before retrying.', error)
          }
        }
        const email = form?.get('email')
        const depositId = form?.get('depositId')
        const usesSavedMethod = typeof depositId === 'string' && depositId.trim() !== ''
        const validCustomer = usesSavedMethod
          ? /^pay_[A-Za-z0-9]+$/.test(depositId) && form?.get('savedMethodConfirmed') === 'yes'
          : typeof email === 'string' && email.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
        const project = form?.get('project')
        const service = form?.get('service')
        const amount = form?.get('amount')
        const requestId = form?.get('requestId')
        if (
          !validCustomer ||
          typeof service !== 'string' || !estimateServices.some(option => option === service) ||
          typeof project !== 'string' || project.length > 100 || (usesSavedMethod && !project.trim()) ||
          typeof amount !== 'string' || !/^\d{1,5}(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 ||
          typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/.test(requestId)
        ) return ownerPage(title, <p>Check the customer email, project reference, and balance.</p>, 400)

        const billing = readBillingAddress(form)
        if (!billing) return ownerPage(title, <p>Check the customer's billing address — Whop needs it to calculate the tax on the balance.</p>, 400)

        try {
          const saved = usesSavedMethod
            ? await findPaidProjectDeposit(depositId, access.accountId, demoPlans.deposit.id)
            : undefined
          if (usesSavedMethod && (!saved || saved.project !== project.trim())) {
            return ownerPage(title, <p>The deposit and saved method could not be verified for this project.</p>, 409)
          }
          const draft = await whopPost('/invoices', JSON.stringify({
            account_id: access.accountId,
            ...(saved
              ? { member_id: saved.memberId, payment_method_id: saved.methodId }
              : { email_address: email }),
            billing_address: billing,
            memo: `Roofing final balance · ${service}${project.trim() ? ` · ${project.trim()}` : ''}`,
            metadata: {
              source: 'roofing_final_balance',
              project: project.trim(),
              service,
              ...(saved && { deposit_payment_id: depositId }),
            },
            items: [{
              plan: { title: 'Roofing final balance', plan_type: 'one_time', initial_price: Number(amount), currency: 'usd' },
              quantity: 1,
            }],
          }), `roofing-invoice-${saved ? depositId : requestId}`)
          if (draft.status !== 'draft' || typeof draft.id !== 'string') throw new Error('Draft was not confirmed')
          return new Response(null, { status: 303, headers: { Location: url.pathname, 'Cache-Control': 'no-store' } })
        } catch (error) {
          return failedPage(title, 'Whop did not confirm the draft. Check the invoice list before creating another draft.', error)
        }
      },
      GET: async ({ params, request }) => {
        const title = 'Invoices'
        const access = await getOwnerAccess(params.owner, request)
        if (access.status === 404) return Response.redirect(new URL('/', request.url), 302)
        if (access.status === 401) return ownerPage(title, <p>Owner dashboard credentials are required.</p>, 401)
        if (access.status === 403) return ownerPage(title, <p>This page is restricted to the account owner.</p>, 403)
        if (access.status !== 200) return ownerPage(title, <p>Invoices are unavailable.</p>, access.status)

        const query = new URLSearchParams({ account_id: access.accountId, first: '25' })
        const paramsQuery = new URL(request.url).searchParams
        const filter = paramsQuery.get('status') || 'all'
        if (['draft', 'open', 'paid'].includes(filter)) query.set('status', filter)
        if (filter === 'overdue') query.set('overdue', 'true')
        const cursor = paramsQuery.get('after')
        if (cursor && cursor.length <= 512) query.set('after', cursor)
        try {
          const result = await whopOwnerRequest(`/invoices?${query}`)
          const invoices: Invoice[] = result.data
          const next = result.page_info?.has_next_page && result.page_info.end_cursor
          return ownerPage(title, <>
            <form className="panel" method="post">
              <h2>Draft a final balance invoice</h2>
              <p>Enter the amount still owed after applying the deposit and any approved changes. For example, a $5,000 project with a $500 deposit leaves a $4,500 balance before applicable tax.</p>
              <p>Review the draft before emailing its payment link or issuing a charge to an authorized saved method.</p>
              <input type="hidden" name="requestId" value={randomUUID()} />
              <p><label>Customer email <input type="email" name="email" maxLength={254} /></label></p>
              <p><label>Service <select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{estimateServices.map(service => <option key={service} value={service}>{service}</option>)}</select></label></p>
              <p><label>Project reference (required for a saved method) <input name="project" maxLength={100} /></label></p>
              <p><label>Remaining balance (USD) <input name="amount" type="number" min="0.01" max="99999.99" step="0.01" required /></label></p>
              <p>Whop requires the customer's billing address to calculate the tax on the balance.</p>
              <p><label>Name on the address (optional) <input name="billingName" maxLength={100} /></label></p>
              <p><label>Street address <input name="billingLine1" required maxLength={200} /></label></p>
              <p><label>Street address line 2 (optional) <input name="billingLine2" maxLength={200} /></label></p>
              <p><label>City <input name="billingCity" required maxLength={100} /></label></p>
              <p><label>State or province <input name="billingState" required maxLength={100} /></label></p>
              <p><label>ZIP or postal code <input name="billingPostalCode" required maxLength={20} /></label></p>
              <p><label>Country (ISO 3166-1 alpha-2) <input name="billingCountry" required maxLength={2} defaultValue="US" /></label></p>
              <p>For manual payment, enter the customer email. To draft against a saved method, enter the paid deposit ID.</p>
              <p><label>Paid deposit ID <input name="depositId" maxLength={100} /></label></p>
              <p><label><input type="checkbox" name="savedMethodConfirmed" value="yes" />
                Confirm the customer authorized use of the saved method for this invoice
              </label></p>
              <button type="submit">Create draft</button>
            </form>
            <h2>Recent invoices</h2>
            <nav className="filters" aria-label="Filter invoices">{[['all', 'All invoices'], ['draft', 'Draft'], ['open', 'Open'], ['overdue', 'Overdue'], ['paid', 'Paid']].map(([value, label]) => <a key={value} href={value === 'all' ? '?' : `?status=${value}`} aria-current={filter === value ? 'page' : undefined}>{label}</a>)}</nav>
            {invoices.length === 0 ? <p className="empty">No invoices on this page.</p> : <div className="table-wrap"><table>
              <thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Due date</th><th scope="col">Action</th></tr></thead>
              <tbody>{invoices.map(invoice => <tr key={invoice.id}>
                <th scope="row">{invoice.number || invoice.id}{invoice.metadata?.service && <><br /><small>{invoice.metadata.service}</small></>}</th>
                <td>{invoice.email_address || invoice.customer_name || invoice.member_id || '—'}</td>
                <td>{invoice.total ? `${invoice.total.amount} ${invoice.total.currency.toUpperCase()}` : '—'}</td>
                <td>{invoice.overdue && invoice.status === 'open' ? 'Overdue' : invoice.status}</td>
                <td>{invoice.created_at ? <time dateTime={invoice.created_at}>{invoice.created_at.slice(0, 10)}</time> : '—'}</td>
                <td>{invoice.due_at ? <time dateTime={invoice.due_at}>{invoice.due_at.slice(0, 10)}</time> : '—'}</td>
                <td>{(canSendManually(invoice) || canChargeSavedMethod(invoice)) && <form method="post">
                  <input type="hidden" name="action" value={canChargeSavedMethod(invoice) ? 'charge' : 'send'} />
                  <input type="hidden" name="invoiceId" value={invoice.id} />
                  <input type="hidden" name="amountConfirmed" value={invoice.total?.amount} />
                  <input type="hidden" name="recipientConfirmed" value={invoice.email_address ?? ''} />
                  <label><input type="checkbox" name="confirmed" value="yes" required />
                    {canChargeSavedMethod(invoice)
                      ? `Authorize Whop to charge the saved method for ${invoice.metadata?.project} · ${invoice.total?.amount} USD before final tax`
                      : `Confirm sending ${invoice.total?.amount} ${invoice.total?.currency.toUpperCase()} to ${invoice.email_address}`}
                  </label>
                  <button type="submit">{canChargeSavedMethod(invoice) ? 'Issue and charge saved method' : 'Email payment link'}</button>
                </form>}</td>
              </tr>)}</tbody>
            </table></div>}
            {typeof next === 'string' && <a className="page-link" href={`?${filter === 'all' ? '' : `status=${encodeURIComponent(filter)}&`}after=${encodeURIComponent(next)}`}>Older invoices →</a>}
          </>)
        } catch (error) {
          console.error('Whop invoice list failed:', error instanceof Error ? error.message : error)
          return ownerPage(title, <p>Whop could not return invoices.</p>, 502)
        }
      },
    },
  },
})
