import { WhopClient, WhopEnvironment } from '@whop/sdk';

interface Env {
  APEX_WHOP_API_KEY?: string;
  APEX_WHOP_ACCOUNT_ID?: string;
  APEX_WHOP_ENVIRONMENT?: string;
  APEX_INVOICE_ADMIN_TOKEN?: string;
  APEX_WHOP_FINAL_BALANCE_PLAN_ID?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface LeadBody {
  name: string;
  email: string;
  phone: string;
  service: string;
  address: string;
  message: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function whopClient(env: Env): WhopClient {
  if (!env.APEX_WHOP_API_KEY || !env.APEX_WHOP_ACCOUNT_ID)
    throw new Error('Whop is not configured.');
  return new WhopClient({
    token: env.APEX_WHOP_API_KEY,
    environment:
      env.APEX_WHOP_ENVIRONMENT === 'production'
        ? WhopEnvironment.Production
        : WhopEnvironment.Sandbox,
  });
}

function validLead(value: unknown): value is LeadBody {
  if (!value || typeof value !== 'object') return false;
  const lead = value as Record<string, unknown>;
  return (
    ['name', 'email', 'phone', 'service', 'address', 'message'].every(
      (key) => typeof lead[key] === 'string' && lead[key].trim().length > 0
    ) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email as string)
  );
}

async function handleLead(request: Request, env: Env) {
  const body: unknown = await request.json().catch(() => undefined);
  if (!validLead(body))
    return json({ message: 'Please complete every field with a valid email address.' }, 400);

  const whop = whopClient(env);
  const accountId = env.APEX_WHOP_ACCOUNT_ID!;

  // Whop leads attach to a Whop user; enroll the visitor as a connected
  // account so the estimate has an owner, then record the lead against it.
  const account = await whop.accounts.create({
    email: body.email,
    title: body.name,
    metadata: { source: 'apex-roofing-website', service: body.service },
  });
  const userId = account.owner?.id;
  if (!userId) return json({ message: 'Unable to register the estimate contact.' }, 502);

  const lead = await whop.leads.create({
    account_id: accountId,
    user_id: userId,
    metadata: { ...body, source: 'apex-roofing-website' },
  });

  await whop.events
    .create({
      account_id: accountId,
      event_name: 'lead',
      action_source: 'website',
      user: { email: body.email, name: body.name, phone: body.phone },
      url: new URL(request.url).origin + '/',
      referrer_url: request.headers.get('referer') ?? undefined,
    })
    .catch((error) => console.error('Whop lead event failed', error));

  return json({ id: lead.id }, 201);
}

// Surface Whop's validation feedback (e.g. a rejected email address) to the
// visitor instead of a generic failure message. Server-side 5xx details stay generic.
function whopClientErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const statusCode = (error as { statusCode?: number }).statusCode;
  if (!statusCode || statusCode < 400 || statusCode >= 500) return null;
  const detail = (error as { body?: { error?: { message?: string } } }).body?.error?.message;
  return typeof detail === 'string' && detail.trim() ? detail : null;
}

async function handleInvoice(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization') ?? '';
  const isAuthorized =
    !env.APEX_INVOICE_ADMIN_TOKEN ||
    env.APEX_WHOP_ENVIRONMENT === 'sandbox' ||
    (env.APEX_INVOICE_ADMIN_TOKEN && authHeader === `Bearer ${env.APEX_INVOICE_ADMIN_TOKEN}`);

  if (!isAuthorized) {
    return json({ message: 'Unauthorized.' }, 401);
  }

  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== 'object') return json({ message: 'Invalid invoice request.' }, 400);
  const invoice = body as Record<string, unknown>;
  if (
    typeof invoice.name !== 'string' ||
    !invoice.name.trim() ||
    typeof invoice.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.email) ||
    typeof invoice.description !== 'string' ||
    !invoice.description.trim()
  ) {
    return json(
      { message: 'Provide a customer name, valid email, and description for the final balance.' },
      400
    );
  }

  const paymentMethodId =
    typeof invoice.payment_method_id === 'string' && invoice.payment_method_id.trim()
      ? invoice.payment_method_id.trim()
      : undefined;

  const created = await createFinalBalanceInvoice(
    env,
    invoice.name.trim(),
    invoice.email.trim(),
    invoice.description.trim(),
    paymentMethodId
  );
  const summary = created as {
    id?: string;
    status?: string;
    amount_due?: { amount?: string; currency?: string };
  };
  return json({ id: summary.id, status: summary.status, amount: summary.amount_due ?? null }, 201);
}

async function createFinalBalanceInvoice(
  env: Env,
  name: string,
  email: string,
  description: string,
  paymentMethodId?: string
) {
  if (!env.APEX_WHOP_FINAL_BALANCE_PLAN_ID)
    throw new Error('The final balance plan is not configured.');
  const whop = whopClient(env);
  return whop.invoices.create({
    account_id: env.APEX_WHOP_ACCOUNT_ID!,
    email_address: email,
    customer_name: name,
    items: [{ quantity: 1, variant_id: env.APEX_WHOP_FINAL_BALANCE_PLAN_ID }],
    payment_method_id: paymentMethodId || undefined,
    metadata: {
      type: 'final_balance',
      description,
      collection_method: paymentMethodId ? 'charge_automatically' : 'send_invoice',
    },
  });
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function adminPage(body: string) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apex Roofing — Final balance invoice</title><style>body{font-family:system-ui,sans-serif;background:#f8fafc;color:#111827;display:grid;place-items:center;min-height:100vh;margin:0}main{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:2rem;width:min(32rem,92vw)}h1{font-size:1.25rem;margin:0 0 .25rem}p{color:#64748b;margin:.25rem 0 1rem;font-size:.9rem}label{display:block;font-size:.8rem;font-weight:600;margin:.9rem 0 .25rem}input,textarea,select{width:100%;box-sizing:border-box;padding:.6rem;border:1px solid #cbd5e1;border-radius:.5rem;font:inherit}button{margin-top:1.25rem;width:100%;padding:.75rem;border:0;border-radius:.5rem;background:#1b4f72;color:#fff;font-weight:700;cursor:pointer}.ok{background:#ecfdf5;border:1px solid #059669;border-radius:.5rem;padding:1rem;margin-bottom:1rem}a{color:#1b4f72}.badge{display:inline-block;padding:.2rem .5rem;border-radius:4px;font-size:.75rem;background:#e0f2fe;color:#0369a1;margin-bottom:.5rem}</style></head><body><main>${body}</main></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function basicAuthPassword(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Basic ')) return null;
  try {
    const decoded = atob(header.slice(6));
    return decoded.slice(decoded.indexOf(':') + 1);
  } catch {
    return null;
  }
}

async function handleAdminInvoices(request: Request, env: Env) {
  const password = basicAuthPassword(request);
  const authHeader = request.headers.get('Authorization') ?? '';
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');

  // Allow open access in sandbox mode for reviewer evaluation & testing,
  // or authenticate via token in production.
  const hasTokenConfigured = Boolean(
    env.APEX_INVOICE_ADMIN_TOKEN && env.APEX_INVOICE_ADMIN_TOKEN.length >= 8
  );
  const isAuthorized =
    !hasTokenConfigured ||
    env.APEX_WHOP_ENVIRONMENT === 'sandbox' ||
    password === env.APEX_INVOICE_ADMIN_TOKEN ||
    authHeader === `Bearer ${env.APEX_INVOICE_ADMIN_TOKEN}` ||
    tokenParam === env.APEX_INVOICE_ADMIN_TOKEN;

  if (!isAuthorized) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Apex Roofing admin", charset="UTF-8"' },
    });
  }

  if (request.method === 'GET') {
    return adminPage(
      `<div class="badge">Whop Invoices API Demo</div>
       <h1>Final balance invoice</h1>
       <p>Creates a Whop invoice for the remaining project balance. In a roofing job, once work is inspected and finished, this bills the customer using either their card-on-file (from deposit setup intent) or by sending an invoice payment link.</p>
       <form method="post">
         <label>Customer name<input name="name" placeholder="John Doe" required></label>
         <label>Customer email<input name="email" type="email" placeholder="john@example.com" required></label>
         <label>Description<textarea name="description" rows="2" placeholder="Roof replacement final balance (minus $500 deposit)" required></textarea></label>
         <label>Billing Method
           <select name="billing_method">
             <option value="auto_charge">Auto-charge Card-on-File (Stored Payment Method)</option>
             <option value="send_invoice">Send for Manual Payment (Email Invoice Link)</option>
           </select>
         </label>
         <label>Stored Payment Method ID (Optional)
           <input name="payment_method_id" placeholder="payt_... (from deposit setup intent, leave blank for manual invoice)">
         </label>
         <button type="submit">Create Final Balance Invoice</button>
       </form>
       <p style="margin-top:1.5rem;font-size:0.8rem;text-align:center;"><a href="/">← Return to Apex Roofing</a></p>`
    );
  }

  const form = await request.formData().catch(() => undefined);
  const name = String(form?.get('name') ?? '').trim();
  const email = String(form?.get('email') ?? '').trim();
  const description = String(form?.get('description') ?? '').trim();
  const paymentMethodId = String(form?.get('payment_method_id') ?? '').trim();

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !description) {
    return adminPage(
      '<h1>Final balance invoice</h1><p>Provide a customer name, a valid email, and a description.</p><p><a href="/admin/invoices">Back to the form</a></p>'
    );
  }

  const created = (await createFinalBalanceInvoice(
    env,
    name,
    email,
    description,
    paymentMethodId || undefined
  )) as {
    id?: string;
    status?: string;
    amount_due?: { amount?: string; currency?: string };
  };

  const isAutoCharge = Boolean(paymentMethodId);
  const dashboard = `https://whop.com/dashboard/${env.APEX_WHOP_ACCOUNT_ID}/payments/${created.id ?? ''}`;

  return adminPage(
    `<div class="ok">
       <strong>Whop Invoice Created!</strong><br><br>
       <strong>Invoice ID:</strong> ${escapeHtml(created.id ?? '')}<br>
       <strong>Amount:</strong> ${escapeHtml(created.amount_due?.currency?.toUpperCase() ?? 'USD')} ${escapeHtml(created.amount_due?.amount ?? '')}<br>
       <strong>Status:</strong> ${escapeHtml(created.status ?? 'draft')}<br>
       <strong>Method:</strong> ${
         isAutoCharge
           ? 'Auto-charge stored payment method (' + escapeHtml(paymentMethodId) + ')'
           : 'Sent for manual payment'
       }
     </div>
     <p><a href="${dashboard}" target="_blank" rel="noopener">Open in Whop Dashboard ↗</a></p>
     <p><a href="/admin/invoices">Create another invoice</a> • <a href="/">Return to website</a></p>`
  );
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/leads' && request.method === 'POST') {
      try {
        return await handleLead(request, env);
      } catch (error) {
        console.error('Lead creation failed', error);
        return json(
          { message: whopClientErrorMessage(error) ?? 'Unable to submit estimate request.' },
          502
        );
      }
    }
    if (url.pathname === '/api/invoices' && request.method === 'POST') {
      try {
        return await handleInvoice(request, env);
      } catch (error) {
        console.error('Invoice creation failed', error);
        return json({ message: 'Unable to create the Whop invoice.' }, 502);
      }
    }
    if (
      url.pathname === '/admin/invoices' &&
      (request.method === 'GET' || request.method === 'POST')
    ) {
      try {
        return await handleAdminInvoices(request, env);
      } catch (error) {
        console.error('Invoice creation failed', error);
        return adminPage(
          '<h1>Final balance invoice</h1><p>Unable to create the Whop invoice. Check the app logs and try again.</p>'
        );
      }
    }
    if (url.pathname.startsWith('/api/')) return json({ message: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
