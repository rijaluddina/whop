import { randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { demoPlans, estimateServices } from '../demo-config'
import { findPaidProjectDeposit } from '../server/deposit-setup'
import { ownerPage } from '../server/owner-page'
import { whopApiBase, whopApiHeaders } from '../server/whop-api'
import { getOwnerAccess, ownerLoginRedirect, whopOwnerRequest } from '../server/whop-owner'

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

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countries = 'AW AF AO AI AX AL AD AE AR AM AS AQ TF AG AU AT AZ BI BE BJ BQ BF BD BG BH BS BA BL BY BZ BM BO BR BB BN BT BV BW CF CA CC CH CL CN CI CM CD CG CK CO KM CV CR CU CW CX KY CY CZ DE DJ DM DK DO DZ EC EG ER EH ES EE ET FI FJ FK FR FO FM GA GB GE GG GH GI GN GP GM GW GQ GR GD GL GT GF GU GY HK HM HN HR HT HU ID IM IN IO IE IR IQ IS IL IT JM JE JO JP KZ KE KG KH KI KN KR KW LA LB LR LY LC LI LK LS LT LU LV MO MF MA MC MD MG MV MX MH MK ML MT MM ME MN MP MZ MR MS MQ MU MW MY YT NA NC NE NF NG NI NU NL NO NP NR NZ OM PK PA PN PE PH PW PG PL PR KP PT PY PS PF QA RE RO RU RW SA SD SN SG GS SH SJ SB SL SV SM SO PM RS SS ST SR SK SI SE SZ SX SC SY TC TD TG TH TJ TK TM TL TO TT TN TR TV TW TZ UG UA UM UY US UZ VA VC VE VG VI VN VU WF WS YE ZA ZM ZW'.split(' ').map(code => ({ code, name: regionNames.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name))

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
  if (!line1 || !city || !postalCode || !countries.some(item => item.code === country)) return
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
async function whopRequest(method: 'POST' | 'PATCH', path: string, body: string, idempotencyKey: string) {
  const response = await fetch(`${whopApiBase}${path}`, {
    method,
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
        if (access.status === 401) return ownerLoginRedirect(params.owner, request)
        if (access.status !== 200) return ownerPage(title, <p>Access denied.</p>, access.status)
        const size = Number(request.headers.get('content-length'))
        if (!Number.isInteger(size) || size < 1 || size > 4096) {
          return ownerPage(title, <p>Invalid invoice request.</p>, 400)
        }
        const form = await request.formData().catch(() => null)
        const action = form?.get('action')
        if (form && (action === 'send' || action === 'charge')) {
          const id = form.get('invoiceId')
          if (typeof id !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(id) || (action === 'charge' && form.get('confirmed') !== 'yes')) {
            return ownerPage(title, <p>Confirm the invoice before proceeding.</p>, 400)
          }
          try {
            const invoice: Invoice = await whopOwnerRequest(`/invoices/${id}`)
            const eligible = action === 'charge' ? canChargeSavedMethod(invoice) : canSendManually(invoice)
            if (invoice.id !== id || !eligible || invoice.total?.amount !== form.get('amountConfirmed')) {
              return ownerPage(title, <p>The draft changed or is no longer eligible. Review it before retrying.</p>, 409)
            }
            // Whop cannot issue a draft without an address (invoice_tax_address_required).
            if (!invoice.billing_address?.country) {
              if (action === 'charge') {
                return ownerPage(title, <p>This draft has no billing address, so Whop cannot calculate its tax. Add one before charging the saved method.</p>, 409)
              }
              const billing = readBillingAddress(form)
              if (!billing) return ownerPage(title, <p>Enter the customer's billing address to calculate tax before sending this invoice.</p>, 400)
              await whopRequest('PATCH', `/invoices/${id}`, JSON.stringify({ billing_address: billing }), `roofing-invoice-address-${id}`)
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
            await whopRequest('POST', `/invoices/${id}/${operation}`, '{}', `roofing-${operation}-${id}`)
            return new Response(null, { status: 303, headers: { Location: url.pathname, 'Cache-Control': 'no-store' } })
          } catch (error) {
            return failedPage(title, 'Whop did not confirm the invoice action. Check the invoice status before retrying.', error)
          }
        }
        const email = form?.get('email')
        const customerType = form?.get('customerType')
        const memberId = form?.get('memberId')
        const customerName = form?.get('customerName')
        const memo = form?.get('memo')
        const dueDate = form?.get('dueDate')
        const project = form?.get('project')
        const service = form?.get('service')
        const amount = form?.get('amount')
        const requestId = form?.get('requestId')
        if (
          typeof email !== 'string' || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ||
          (customerType !== 'new' && customerType !== 'existing') ||
          (customerType === 'existing' && (typeof memberId !== 'string' || !/^mber_[A-Za-z0-9]+$/.test(memberId))) ||
          typeof customerName !== 'string' || customerName.length > 100 ||
          typeof memo !== 'string' || memo.length > 500 ||
          typeof dueDate !== 'string' || (dueDate !== '' && (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !Number.isFinite(Date.parse(`${dueDate}T23:59:59Z`)))) ||
          typeof service !== 'string' || !estimateServices.some(option => option === service) ||
          typeof project !== 'string' || project.length > 100 ||
          typeof amount !== 'string' || !/^\d{1,5}(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 ||
          typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/.test(requestId)
        ) return ownerPage(title, <p>Check the customer email, project reference, and balance.</p>, 400)

        const billing = readBillingAddress(form)
        if (!billing) return ownerPage(title, <p>Check the customer's billing address — Whop needs it to calculate the tax on the balance.</p>, 400)

        let createdInvoiceId: string | undefined
        try {
          if (customerType === 'existing') {
            const member = await whopOwnerRequest(`/members/${memberId}`)
            if (member.account_id !== access.accountId || member.email?.toLowerCase() !== email.trim().toLowerCase()) {
              return ownerPage(title, <p>The selected customer could not be verified. Search for the customer again.</p>, 409)
            }
          }
          const draft = await whopRequest('POST', '/invoices', JSON.stringify({
            account_id: access.accountId,
            ...(customerType === 'existing' ? { member_id: memberId, recipient_emails: [email.trim()] } : { email_address: email.trim() }),
            ...(customerType === 'new' && customerName.trim() && { customer_name: customerName.trim() }),
            billing_address: billing,
            ...(dueDate && { due_at: `${dueDate}T23:59:59Z` }),
            memo: memo.trim() || `${service}${project.trim() ? ` · ${project.trim()}` : ''}`,
            metadata: {
              source: 'roofing_final_balance',
              project: project.trim(),
              service,
            },
            items: [{
              plan: { title: service, plan_type: 'one_time', initial_price: Number(amount), currency: 'usd' },
              quantity: 1,
            }],
          }), `roofing-invoice-${requestId}`)
          if (draft.status !== 'draft' || typeof draft.id !== 'string') throw new Error('Draft was not confirmed')
          createdInvoiceId = draft.id
          await whopRequest('POST', `/invoices/${draft.id}/send`, '{}', `roofing-send-${draft.id}`)
          return new Response(null, { status: 303, headers: { Location: url.pathname, 'Cache-Control': 'no-store' } })
        } catch (error) {
          return failedPage(title, createdInvoiceId
            ? `Invoice ${createdInvoiceId} was created, but email delivery was not confirmed. Check its status before retrying; if it is still a draft, use Email payment link in the invoice list.`
            : 'Whop did not confirm the invoice. Check the invoice list before creating another.', error)
        }
      },
      GET: async ({ params, request }) => {
        const title = 'Invoices'
        const access = await getOwnerAccess(params.owner, request)
        if (access.status === 404) return Response.redirect(new URL('/', request.url), 302)
        if (access.status === 401) return ownerLoginRedirect(params.owner, request)
        if (access.status === 403) return ownerPage(title, <p>This page is restricted to the account owner.</p>, 403)
        if (access.status !== 200) return ownerPage(title, <p>Invoices are unavailable.</p>, access.status)

        const search = new URL(request.url).searchParams.get('customerSearch')
        if (search !== null) {
          if (search.trim().length < 2 || search.length > 100) return Response.json({ data: [] }, { headers: { 'Cache-Control': 'private, no-store' } })
          try {
            const query = new URLSearchParams({ account_id: access.accountId, query: search.trim(), first: '20' })
            const result = await whopOwnerRequest(`/members?${query}`)
            const data = result.data.filter((member: { id?: string; email?: string }) => member.id && member.email)
              .map((member: { id: string; email: string; name?: string; display_name?: string }) => ({ id: member.id, email: member.email, name: member.name || member.display_name || '' }))
            return Response.json({ data }, { headers: { 'Cache-Control': 'private, no-store' } })
          } catch {
            return Response.json({ error: 'Customer search is unavailable.' }, { status: 502, headers: { 'Cache-Control': 'private, no-store' } })
          }
        }

        const query = new URLSearchParams({ account_id: access.accountId, first: '25' })
        const paramsQuery = new URL(request.url).searchParams
        const filter = paramsQuery.get('status') || 'all'
        if (['draft', 'open', 'paid'].includes(filter)) query.set('status', filter)
        const cursor = paramsQuery.get('after')
        if (cursor && cursor.length <= 512) query.set('after', cursor)
        try {
          const result = await whopOwnerRequest(`/invoices?${query}`)
          const invoices: Invoice[] = result.data
          const next = result.page_info?.has_next_page && result.page_info.end_cursor
          return ownerPage(title, <>
            <form className="panel" method="post" id="invoice-create">
              <h2>Create invoice</h2>
              <p id="invoice-progress">Step 1 of 3: Customer</p>
              <input type="hidden" name="requestId" value={randomUUID()} />
              <input type="hidden" name="dueDate" value="" />
              <section data-invoice-step="0">
                <h3>Who is this invoice for?</h3>
                <p><label><input type="radio" name="customerType" value="new" defaultChecked /> New customer</label>{' '}<label><input type="radio" name="customerType" value="existing" /> Existing customer</label></p>
                <div id="customer-search" hidden><p><label>Search customer <input id="customer-query" maxLength={100} autoComplete="off" /></label></p><p><label>Choose customer <select id="customer-results"><option value="">Search for a customer</option></select></label></p><p id="customer-message" role="status" /></div>
                <input type="hidden" name="memberId" value="" />
                <p><label>Customer email <input type="email" name="email" required maxLength={254} /></label></p>
                <p><label>Customer name (optional) <input name="customerName" maxLength={100} /></label></p>
                <p>Enter the customer's billing address for tax calculation.</p>
                <p><label>Country <select name="billingCountry" required defaultValue="US">{countries.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label></p>
                <p><label>Address line 1 <input name="billingLine1" required maxLength={200} autoComplete="billing address-line1" /></label></p>
                <p><label>Address line 2 (optional) <input name="billingLine2" maxLength={200} autoComplete="billing address-line2" /></label></p>
                <p><label>City <input name="billingCity" required maxLength={100} autoComplete="billing address-level2" /></label></p>
                <p><label>State or province (required for US) <input name="billingState" maxLength={100} autoComplete="billing address-level1" /></label></p>
                <p><label>ZIP or postal code <input name="billingPostalCode" required maxLength={20} autoComplete="billing postal-code" /></label></p>
              </section>
              <section data-invoice-step="1" hidden>
                <h3>What are you billing for?</h3>
                <p><label>Service <select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{estimateServices.map(service => <option key={service} value={service}>{service}</option>)}</select></label></p>
                <p><label>Amount (USD) <input name="amount" type="number" min="0.01" max="99999.99" step="0.01" required /></label></p>
                <p><label>Project reference (optional) <input name="project" maxLength={100} /></label></p>
                <p><label>Invoice memo (optional) <input name="memo" maxLength={500} /></label></p>
              </section>
              <section data-invoice-step="2" hidden><h3>Review invoice</h3><p>Whop will email the customer a payment link.</p><div id="invoice-review" /></section>
              <p><button type="button" id="invoice-back" hidden>Back</button>{' '}<button type="button" id="invoice-next">Continue</button>{' '}<button type="submit" id="invoice-submit" hidden>Create &amp; email payment link</button></p>
              <script dangerouslySetInnerHTML={{ __html: `(() => {
                const form = document.getElementById('invoice-create');
                const steps = [...form.querySelectorAll('[data-invoice-step]')];
                const back = document.getElementById('invoice-back'), next = document.getElementById('invoice-next'), submit = document.getElementById('invoice-submit');
                let step = 0;
                const searchBox = document.getElementById('customer-search'), customerQuery = document.getElementById('customer-query'), results = document.getElementById('customer-results'), message = document.getElementById('customer-message');
                let timer, searchVersion = 0, customers = [];
                form.querySelectorAll('[name=customerType]').forEach(radio => radio.addEventListener('change', () => {
                  searchVersion++; clearTimeout(timer); results.replaceChildren(new Option('Search for a customer', '')); customers = []; customerQuery.value = ''; message.textContent = '';
                  form.elements.memberId.value = ''; form.elements.email.value = ''; form.elements.customerName.value = '';
                  searchBox.hidden = form.elements.customerType.value !== 'existing'; form.elements.email.readOnly = !searchBox.hidden;
                }));
                customerQuery.addEventListener('input', () => {
                  const version = ++searchVersion; clearTimeout(timer); form.elements.memberId.value = ''; form.elements.email.value = ''; form.elements.customerName.value = '';
                  results.replaceChildren(new Option('Search for a customer', '')); customers = []; message.textContent = '';
                  const query = customerQuery.value.trim(); if (query.length < 2) return;
                  timer = setTimeout(async () => {
                    try {
                      const url = new URL(location.href); url.search = ''; url.searchParams.set('customerSearch', query);
                      const response = await fetch(url, { headers: { Accept: 'application/json' } }); if (!response.ok) throw new Error();
                      const result = await response.json(); if (version !== searchVersion) return;
                      customers = result.data; results.replaceChildren(new Option('Select a customer', ''));
                      customers.forEach(customer => results.add(new Option((customer.name ? customer.name + ' — ' : '') + customer.email, customer.id)));
                      message.textContent = customers.length ? '' : 'No customers found.';
                    } catch { if (version === searchVersion) message.textContent = 'Customer search is unavailable. Please try again.'; }
                  }, 350);
                });
                results.addEventListener('change', () => {
                  const customer = customers.find(item => item.id === results.value); form.elements.memberId.value = customer?.id || ''; form.elements.email.value = customer?.email || ''; form.elements.customerName.value = customer?.name || '';
                });
                function show() {
                  steps.forEach((section, index) => { section.hidden = index !== step; });
                  back.hidden = step === 0; next.hidden = step === 2; submit.hidden = step !== 2;
                  document.getElementById('invoice-progress').textContent = 'Step ' + (step + 1) + ' of 3: ' + ['Customer', 'Items', 'Review'][step];
                  if (step === 2) {
                    const data = new FormData(form), review = document.getElementById('invoice-review');
                    review.replaceChildren();
                    for (const [label, value] of [['Customer', data.get('email')], ['Name', data.get('customerName')], ['Billing address', [data.get('billingLine1'), data.get('billingLine2'), data.get('billingCity'), data.get('billingState'), data.get('billingPostalCode'), data.get('billingCountry')].filter(Boolean).join(', ')], ['Service', data.get('service')], ['Amount before tax', '$' + data.get('amount') + ' USD'], ['Project', data.get('project')], ['Memo', data.get('memo')]]) {
                      if (!value) continue; const p = document.createElement('p'); p.textContent = label + ': ' + value; review.appendChild(p);
                    }
                  }
                }
                next.addEventListener('click', () => {
                  if (step === 0 && form.elements.customerType.value === 'existing' && !form.elements.memberId.value) { message.textContent = 'Select an existing customer.'; customerQuery.focus(); return; }
                  const country = form.elements.billingCountry.value.trim().toUpperCase();
                  form.elements.billingState.required = country === 'US';
                  for (const field of steps[step].querySelectorAll('input, select')) if (!field.reportValidity()) return;
                  step++; show();
                });
                back.addEventListener('click', () => { step--; show(); });
                form.addEventListener('submit', event => { if (step !== 2) event.preventDefault(); });
                show();
              })();` }} />
            </form>
            <h2>Recent invoices</h2>
            <nav className="filters" aria-label="Filter invoices">{[['all', 'All invoices'], ['draft', 'Draft'], ['open', 'Open'], ['paid', 'Paid']].map(([value, label]) => <a key={value} href={value === 'all' ? '?' : `?status=${value}`} aria-current={filter === value ? 'page' : undefined}>{label}</a>)}</nav>
            {invoices.length === 0 ? <p className="empty">No invoices on this page.</p> : <div className="table-wrap"><table>
              <thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Due date</th><th scope="col">Action</th></tr></thead>
              <tbody>{invoices.map(invoice => <tr key={invoice.id}>
                <th scope="row">{invoice.number || invoice.id}{invoice.metadata?.service && <><br /><small>{invoice.metadata.service}</small></>}</th>
                <td>{invoice.email_address || invoice.customer_name || invoice.member_id || '—'}</td>
                <td>{invoice.total ? `${invoice.total.amount} ${invoice.total.currency.toUpperCase()}` : '—'}</td>
                <td>{invoice.overdue && invoice.status === 'open' ? 'Overdue' : invoice.status}</td>
                <td>{invoice.created_at ? <time dateTime={invoice.created_at}>{invoice.created_at.slice(0, 10)}</time> : '—'}</td>
                <td>{invoice.due_at ? <time dateTime={invoice.due_at}>{invoice.due_at.slice(0, 10)}</time> : '—'}</td>
                <td>{!invoice.billing_address?.country && (canSendManually(invoice) || canChargeSavedMethod(invoice)) ? <small>Billing address missing</small> : (canSendManually(invoice) || canChargeSavedMethod(invoice)) && <form method="post">
                  <input type="hidden" name="action" value={canChargeSavedMethod(invoice) ? 'charge' : 'send'} />
                  <input type="hidden" name="invoiceId" value={invoice.id} />
                  <input type="hidden" name="amountConfirmed" value={invoice.total?.amount} />
                  <input type="hidden" name="recipientConfirmed" value={invoice.email_address ?? ''} />
                  {canChargeSavedMethod(invoice) && <label><input type="checkbox" name="confirmed" value="yes" required />
                    Authorize Whop to charge the saved method for {invoice.metadata?.project} · {invoice.total?.amount} USD before final tax
                  </label>}
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
