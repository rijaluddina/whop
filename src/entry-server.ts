import { WhopClient, WhopEnvironment } from '@whop/sdk';

interface Env {
  APEX_WHOP_API_KEY?: string;
  APEX_WHOP_ACCOUNT_ID?: string;
  APEX_WHOP_ENVIRONMENT?: string;
  APEX_INVOICE_ADMIN_TOKEN?: string;
  APEX_WHOP_FINAL_BALANCE_PLAN_ID?: string;
  APEX_WHOP_DEPOSIT_PLAN_ID?: string;
  APEX_WHOP_INSPECTION_PLAN_ID?: string;
  APEX_WHOP_FLAT_RATE_PLAN_ID?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface LeadBody {
  name?: string;
  fullName?: string;
  email: string;
  phone: string;
  service?: string;
  primaryService?: string;
  address?: string;
  streetAddress?: string;
  message?: string;
  projectDetails?: string;
  zipCode?: string;
  roofAge?: string;
  hasInsuranceClaim?: boolean;
  source?: string;
  [key: string]: unknown;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function getOrigin(request: Request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return '';
  }
}

function whopClient(env: Env): WhopClient {
  if (!env.APEX_WHOP_API_KEY || !env.APEX_WHOP_ACCOUNT_ID) {
    throw new Error('Whop is not configured.');
  }
  return new WhopClient({
    token: env.APEX_WHOP_API_KEY,
    environment:
      env.APEX_WHOP_ENVIRONMENT === 'production'
        ? WhopEnvironment.Production
        : WhopEnvironment.Sandbox,
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizeLead(body: Record<string, unknown>): LeadBody | null {
  const name = (body.name || body.fullName || body.customerName || '') as string;
  const email = (body.email || body.emailAddress || '') as string;
  const phone = (body.phone || body.phoneNumber || '') as string;
  const service = (body.service || body.primaryService || body.serviceType || '') as string;
  const address = (body.address || body.streetAddress || body.propertyAddress || '') as string;
  const message = (body.message ||
    body.projectDetails ||
    body.notes ||
    body.stormDamageNotes ||
    '') as string;

  if (!name.trim() || !email.trim() || !phone.trim() || !service.trim()) {
    return null;
  }
  if (!isValidEmail(email)) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    service: service.trim(),
    address: address.trim(),
    message: message.trim(),
    zipCode: typeof body.zipCode === 'string' ? body.zipCode.trim() : undefined,
    roofAge: typeof body.roofAge === 'string' ? body.roofAge.trim() : undefined,
    hasInsuranceClaim: Boolean(body.hasInsuranceClaim || body.insuranceClaim),
    source: typeof body.source === 'string' ? body.source.trim() : 'apex-roofing-website',
    ...body,
  };
}

async function handleLead(request: Request, env: Env) {
  const raw = await request.json().catch(() => undefined);
  if (!raw || typeof raw !== 'object') {
    return json({ message: 'Invalid request body.' }, 400);
  }

  const lead = normalizeLead(raw as Record<string, unknown>);
  if (!lead) {
    return json({ message: 'Please complete every field with a valid email address.' }, 400);
  }

  try {
    const whop = whopClient(env);
    const accountId = env.APEX_WHOP_ACCOUNT_ID!;

    // Whop leads attach to a Whop user; enroll the visitor as a connected
    // account so the estimate has an owner, then record the lead against it.
    const account = await whop.accounts.create({
      email: lead.email,
      title: lead.name,
      metadata: {
        source: lead.source || 'apex-roofing-website',
        service: lead.service,
        phone: lead.phone,
        address: lead.address || '',
        zipCode: lead.zipCode || '',
        roofAge: lead.roofAge || '',
        hasInsuranceClaim: String(Boolean(lead.hasInsuranceClaim)),
      },
    });

    const userId = account.owner?.id || (account as any).user_id || (account as any).owner_id;
    if (!userId) {
      return json({ message: 'Unable to register the estimate contact.' }, 502);
    }

    const leadRecord = await whop.leads.create({
      account_id: accountId,
      user_id: userId,
      metadata: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        address: lead.address || '',
        message: lead.message || '',
        zipCode: lead.zipCode || '',
        roofAge: lead.roofAge || '',
        hasInsuranceClaim: Boolean(lead.hasInsuranceClaim),
        source: lead.source || 'apex-roofing-website',
        submittedAt: new Date().toISOString(),
      },
    });

    await whop.events
      .create({
        account_id: accountId,
        event_name: 'lead',
        action_source: 'website',
        user: { email: lead.email, name: lead.name, phone: lead.phone },
        url: getOrigin(request) + '/',
        referrer_url: request.headers.get('referer') ?? undefined,
      })
      .catch((error) => console.error('Whop lead event failed', error));

    // Notify the business owner that a new estimate request landed.
    try {
      await whop.notifications.create({
        account_id: accountId,
        title: 'New estimate request',
        content: `${lead.name} requested an estimate for ${lead.service} (${lead.email}, ${lead.phone}).`,
        rest_path: '/exp_lwCZRXodbz56vG',
      });
    } catch (error) {
      // Non-fatal: the lead is already recorded; surface in logs only.
      console.error('Whop owner notification failed', error);
    }

    return json({ id: leadRecord.id, success: true }, 201);
  } catch (error) {
    console.error('Lead creation failed', error);
    return json(
      { message: whopClientErrorMessage(error) ?? 'Unable to submit estimate request.' },
      502
    );
  }
}

// Surface Whop's validation feedback (e.g. a rejected email address) to the
// visitor instead of a generic failure message. Server-side 5xx details stay generic.
function whopClientErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const statusCode = (error as { statusCode?: number }).statusCode;
  if (!statusCode || statusCode < 400 || statusCode >= 500) return null;
  const detail =
    (error as { body?: { error?: { message?: string } } }).body?.error?.message ||
    (error as { message?: string }).message;
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }
  return null;
}

function getInvoiceAdminToken(env: Env) {
  return env.APEX_INVOICE_ADMIN_TOKEN || '';
}

function isInvoiceRequestAuthorized(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = getInvoiceAdminToken(env);

  if (!token) return true; // allow if not configured
  if (env.APEX_WHOP_ENVIRONMENT === 'sandbox') return true;

  if (authHeader === `Bearer ${token}`) return true;

  // Basic auth
  if (authHeader.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.slice(6));
      const pass = decoded.includes(':') ? decoded.slice(decoded.indexOf(':') + 1) : decoded;
      if (pass === token) return true;
    } catch {
      // ignore
    }
  }

  // Query param
  const url = new URL(request.url);
  if (url.searchParams.get('token') === token) return true;

  return false;
}

async function handleInvoice(request: Request, env: Env) {
  if (!isInvoiceRequestAuthorized(request, env)) {
    return json({ message: 'Unauthorized.' }, 401);
  }

  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== 'object') return json({ message: 'Invalid invoice request.' }, 400);
  const invoice = body as Record<string, unknown>;

  const name =
    (typeof invoice.name === 'string' && invoice.name.trim()) ||
    (typeof invoice.customer_name === 'string' && invoice.customer_name.trim()) ||
    (typeof invoice.customerName === 'string' && invoice.customerName.trim()) ||
    '';
  const email =
    (typeof invoice.email === 'string' && invoice.email.trim()) ||
    (typeof invoice.email_address === 'string' && invoice.email_address.trim()) ||
    (typeof invoice.emailAddress === 'string' && invoice.emailAddress.trim()) ||
    '';
  const description =
    (typeof invoice.description === 'string' && invoice.description.trim()) ||
    (typeof invoice.notes === 'string' && invoice.notes.trim()) ||
    (typeof invoice.job_reference === 'string' && invoice.job_reference.trim()) ||
    '';

  if (!name || !isValidEmail(email) || !description) {
    return json(
      { message: 'Provide a customer name, valid email, and description for the final balance.' },
      400
    );
  }

  const paymentMethodId =
    (typeof invoice.payment_method_id === 'string' && invoice.payment_method_id.trim()) ||
    (typeof invoice.paymentMethodId === 'string' && invoice.paymentMethodId.trim()) ||
    undefined;

  try {
    const created = await createFinalBalanceInvoice(
      env,
      name,
      email.toLowerCase(),
      description,
      paymentMethodId || undefined
    );
    const summary = created as {
      id?: string;
      status?: string;
      amount_due?: { amount?: string; currency?: string };
    };
    return json(
      {
        id: summary.id,
        status: summary.status,
        amount: summary.amount_due ?? null,
        invoice,
      },
      201
    );
  } catch (error) {
    console.error('Invoice creation failed', error);
    return json({ message: 'Unable to create the Whop invoice.' }, 502);
  }
}

async function createFinalBalanceInvoice(
  env: Env,
  name: string,
  email: string,
  description: string,
  paymentMethodId?: string
) {
  if (!env.APEX_WHOP_FINAL_BALANCE_PLAN_ID) {
    throw new Error('The final balance plan is not configured.');
  }
  if (!env.APEX_WHOP_API_KEY || !env.APEX_WHOP_ACCOUNT_ID) {
    throw new Error('Whop is not configured.');
  }
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
      source: 'apex-roofing-website',
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
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apex Roofing — Final balance invoice</title><style>body{font-family:system-ui,sans-serif;background:#020617;color:#e2e8f0;display:grid;place-items:center;min-height:100vh;margin:0}main{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:2rem;width:min(36rem,92vw);box-shadow:0 25px 60px -15px #000}h1{font-size:1.25rem;margin:0 0 .25rem;color:#f8fafc}p{color:#94a3b8;margin:.25rem 0 1rem;font-size:.9rem}label{display:block;font-size:.8rem;font-weight:600;margin:.9rem 0 .25rem;color:#cbd5e1}input,textarea,select{width:100%;box-sizing:border-box;padding:.65rem .8rem;border:1px solid #475569;border-radius:.6rem;font:inherit;background:#020617;color:#f8fafc}button{margin-top:1.25rem;width:100%;padding:.85rem;border:0;border-radius:.6rem;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#020617;font-weight:800;cursor:pointer}button:hover{filter:brightness(1.05)}.ok{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.4);border-radius:.6rem;padding:1rem;margin-bottom:1rem;color:#a7f3d0}.err{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);border-radius:.6rem;padding:1rem;margin-bottom:1rem;color:#fecaca}.badge{display:inline-flex;align-items:center;gap:.4rem;padding:.25rem .6rem;border-radius:999px;font-size:.75rem;background:rgba(245,158,11,.18);color:#fbbf24;border:1px solid rgba(245,158,11,.4);margin-bottom:.75rem}a{color:#f59e0b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}@media(max-width:640px){.grid{grid-template-columns:1fr}}</style></head><body><main>${body}</main></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function basicAuthPassword(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Basic ')) return null;
  try {
    const decoded = atob(header.slice(6));
    return decoded.includes(':') ? decoded.slice(decoded.indexOf(':') + 1) : decoded;
  } catch {
    return null;
  }
}

async function handleAdminInvoices(request: Request, env: Env) {
  const token = getInvoiceAdminToken(env);
  const password = basicAuthPassword(request);
  const authHeader = request.headers.get('Authorization') ?? '';
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');

  const isAuthorized =
    !token ||
    env.APEX_WHOP_ENVIRONMENT === 'sandbox' ||
    password === token ||
    authHeader === `Bearer ${token}` ||
    tokenParam === token;

  if (!isAuthorized) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Apex Roofing admin", charset="UTF-8"' },
    });
  }

  if (request.method === 'GET') {
    return adminPage(
      `<div class="badge">Whop Invoices</div>
       <h1>Final balance invoice</h1>
       <p>Create a Whop invoice for the remaining project balance. Charge a stored payment method (card-on-file) or send an email payment link.</p>
       <form method="post">
         <div class="grid">
           <label>Customer name<input name="name" placeholder="John Doe" required></label>
           <label>Customer email<input name="email" type="email" placeholder="john@example.com" required></label>
         </div>
         <label>Description<textarea name="description" rows="3" placeholder="Roof replacement final balance (minus $500 deposit). Job: JOB-XXXX" required></textarea></label>
         <label>Billing Method
           <select name="billing_method">
             <option value="auto_charge">Auto-charge stored payment method</option>
             <option value="send_invoice">Send invoice for manual payment</option>
           </select>
         </label>
         <label>Stored Payment Method ID (optional)<input name="payment_method_id" placeholder="payt_... (required for auto-charge)"></label>
         <button type="submit">Create Final Balance Invoice</button>
       </form>
       <p style="margin-top:1.5rem;font-size:0.8rem;text-align:center;"><a href="/">← Return to site</a></p>`
    );
  }

  const form = await request.formData().catch(() => undefined);
  const name = String(form?.get('name') ?? '').trim();
  const email = String(form?.get('email') ?? '').trim();
  const description = String(form?.get('description') ?? '').trim();
  const paymentMethodId = String(form?.get('payment_method_id') ?? '').trim();

  if (!name || !isValidEmail(email) || !description) {
    return adminPage(
      '<div class="err">Provide a customer name, a valid email, and a description.</div><p><a href="/admin/invoices">Back to the form</a></p>'
    );
  }

  try {
    const created = (await createFinalBalanceInvoice(
      env,
      name,
      email.toLowerCase(),
      description,
      paymentMethodId || undefined
    )) as {
      id?: string;
      status?: string;
      amount_due?: { amount?: string; currency?: string };
    };

    const isAutoCharge = Boolean(paymentMethodId);
    const dashboard = env.APEX_WHOP_ACCOUNT_ID
      ? `https://whop.com/dashboard/${env.APEX_WHOP_ACCOUNT_ID}/invoices/${created.id ?? ''}`
      : `https://whop.com/dashboard/`;

    return adminPage(
      `<div class="ok">
         <strong>Whop Invoice Created</strong><br><br>
         <strong>Invoice ID:</strong> ${escapeHtml(created.id ?? '')}<br>
         <strong>Amount:</strong> ${escapeHtml(created.amount_due?.currency?.toUpperCase() ?? 'USD')} ${escapeHtml(created.amount_due?.amount ?? '')}<br>
         <strong>Status:</strong> ${escapeHtml(created.status ?? 'draft')}<br>
         <strong>Method:</strong> ${isAutoCharge ? 'Auto-charge stored payment method' : 'Email invoice link'}
       </div>
       <p><a href="${dashboard}" target="_blank" rel="noopener">Open in Whop Dashboard ↗</a></p>
       <p><a href="/admin/invoices">Create another invoice</a> • <a href="/">Return to website</a></p>`
    );
  } catch (error) {
    console.error('Invoice creation failed', error);
    return adminPage(
      '<div class="err">Unable to create the Whop invoice. Check the app logs and try again.</div><p><a href="/admin/invoices">Back to the form</a></p>'
    );
  }
}

function getPublicConfig(env: Env) {
  return {
    company: {
      accountId: env.APEX_WHOP_ACCOUNT_ID || '',
      name: 'Apex Shield Roofing & Exteriors',
    },
    whop: {
      accountId: env.APEX_WHOP_ACCOUNT_ID || '',
      environment: env.APEX_WHOP_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
      depositPlanId: env.APEX_WHOP_DEPOSIT_PLAN_ID || '',
      inspectionPlanId: env.APEX_WHOP_INSPECTION_PLAN_ID || '',
      flatRatePlanId: env.APEX_WHOP_FLAT_RATE_PLAN_ID || '',
      finalBalancePlanId: env.APEX_WHOP_FINAL_BALANCE_PLAN_ID || '',
      invoiceDashboardUrl: env.APEX_WHOP_ACCOUNT_ID
        ? `https://whop.com/dashboard/${env.APEX_WHOP_ACCOUNT_ID}/invoices`
        : 'https://whop.com/dashboard/',
    },
    invoiceEndpoint: '/api/invoices',
    leadEndpoint: '/api/leads',
  };
}

async function handleGetInvoices(_request: Request, env: Env) {
  const whop = whopClient(env);
  const page = await whop.invoices.list({
    account_id: env.APEX_WHOP_ACCOUNT_ID,
    first: 50,
  });
  return json({
    data: page.data ?? [],
    ...(page.page_info ? { page_info: page.page_info } : {}),
  });
}

async function handleGetLeads(_request: Request, env: Env) {
  const whop = whopClient(env);
  const page = await whop.leads.list({
    account_id: env.APEX_WHOP_ACCOUNT_ID,
    first: 50,
  });
  return json({
    data: page.data ?? [],
    ...(page.page_info ? { page_info: page.page_info } : {}),
  });
}

async function handleGetEvents(request: Request, env: Env) {
  const url = new URL(request.url);
  const from =
    url.searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = url.searchParams.get('to') || new Date().toISOString();
  const whop = whopClient(env);
  const page = await whop.events.list({
    account_id: env.APEX_WHOP_ACCOUNT_ID,
    from,
    to,
    first: 100,
    direction: 'desc',
  });
  return json({
    data: page.data ?? [],
    ...(page.page_info ? { page_info: page.page_info } : {}),
  });
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === '/api/config' && request.method === 'GET') {
      try {
        return json(getPublicConfig(env));
      } catch (error) {
        console.error('Config fetch failed', error);
        return json(getPublicConfig(env));
      }
    }

    if (pathname === '/api/leads' && request.method === 'POST') {
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
    if (pathname === '/api/lead' && request.method === 'POST') {
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
    if (pathname === '/api/pixel' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        console.log('Pixel event:', body);
        return json({ ok: true });
      } catch (error) {
        console.error('Pixel event failed', error);
        return json({ ok: true });
      }
    }
    if (pathname === '/api/invoices' && request.method === 'POST') {
      try {
        return await handleInvoice(request, env);
      } catch (error) {
        console.error('Invoice creation failed', error);
        return json({ message: 'Unable to create the Whop invoice.' }, 502);
      }
    }
    if (pathname === '/api/invoice' && request.method === 'POST') {
      try {
        return await handleInvoice(request, env);
      } catch (error) {
        console.error('Invoice creation failed', error);
        return json({ message: 'Unable to create the Whop invoice.' }, 502);
      }
    }
    if (pathname === '/api/invoices' && request.method === 'GET') {
      try {
        return await handleGetInvoices(request, env);
      } catch (error) {
        console.error('List invoices failed', error);
        return json({ data: [], error: 'Unable to list invoices.' }, 502);
      }
    }
    if (pathname === '/api/leads' && request.method === 'GET') {
      try {
        return await handleGetLeads(request, env);
      } catch (error) {
        console.error('List leads failed', error);
        return json({ data: [], error: 'Unable to list leads.' }, 502);
      }
    }
    if (pathname === '/api/events' && request.method === 'GET') {
      try {
        return await handleGetEvents(request, env);
      } catch (error) {
        console.error('List events failed', error);
        return json({ data: [], error: 'Unable to list events.' }, 502);
      }
    }
    if (pathname === '/admin/invoices' && (request.method === 'GET' || request.method === 'POST')) {
      try {
        return await handleAdminInvoices(request, env);
      } catch (error) {
        console.error('Invoice creation failed', error);
        return adminPage(
          '<div class="err">Unable to create the Whop invoice. Check the app logs and try again.</div><p><a href="/admin/invoices">Back to the form</a></p>'
        );
      }
    }
    if (pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
      if (request.method === 'GET') {
        return env.ASSETS.fetch(request);
      }
      return json({ message: 'Not found' }, 404);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleLeadV1(request: Request, env: Env) {
  return handleLead(request, env);
}
