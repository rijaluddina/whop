import { WhopClient, WhopEnvironment } from '@whop/sdk';

interface Env {
  APEX_WHOP_API_KEY?: string;
  APEX_WHOP_ACCOUNT_ID?: string;
  APEX_WHOP_ENVIRONMENT?: string;
  APEX_INVOICE_ADMIN_TOKEN?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function validLead(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object') return false;
  const lead = value as Record<string, unknown>;
  return ['name', 'email', 'phone', 'service', 'address', 'message'].every((key) => typeof lead[key] === 'string' && lead[key].trim().length > 0) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email as string);
}

async function handleLead(request: Request, env: Env) {
  const body: unknown = await request.json().catch(() => undefined);
  if (!validLead(body)) return json({ message: 'Please complete every field with a valid email address.' }, 400);
  if (!env.APEX_WHOP_API_KEY || !env.APEX_WHOP_ACCOUNT_ID) return json({ message: 'Whop is not configured.' }, 503);

  const client = new WhopClient({ token: env.APEX_WHOP_API_KEY, environment: env.APEX_WHOP_ENVIRONMENT === 'production' ? WhopEnvironment.Production : WhopEnvironment.Sandbox });
  const lead = await client.leads.create({ account_id: env.APEX_WHOP_ACCOUNT_ID, metadata: { ...body, source: 'apex-roofing-website' } });
  const apiBase = env.APEX_WHOP_ENVIRONMENT === 'production' ? 'https://api.whop.com/api/v1' : 'https://sandbox-api.whop.com/api/v1';
  try {
    const eventResponse = await fetch(`${apiBase}/conversions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.APEX_WHOP_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: env.APEX_WHOP_ACCOUNT_ID, event_name: 'lead' }),
    });
    if (!eventResponse.ok) console.error('Whop lead conversion event failed', eventResponse.status);
  } catch (error) {
    console.error('Whop lead conversion event failed', error);
  }
  return json({ id: lead.id }, 201);
}

async function handleInvoice(request: Request, env: Env) {
  if (!env.APEX_INVOICE_ADMIN_TOKEN || env.APEX_INVOICE_ADMIN_TOKEN.length < 32 || request.headers.get('Authorization') !== `Bearer ${env.APEX_INVOICE_ADMIN_TOKEN}`) return json({ message: 'Unauthorized.' }, 401);
  const body: unknown = await request.json().catch(() => undefined);
  if (!body || typeof body !== 'object') return json({ message: 'Invalid invoice request.' }, 400);
  const invoice = body as Record<string, unknown>;
  if (typeof invoice.name !== 'string' || !invoice.name.trim() || typeof invoice.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.email) || typeof invoice.description !== 'string' || !invoice.description.trim() || !Number.isSafeInteger(invoice.amountCents) || (invoice.amountCents as number) < 1 || (invoice.amountCents as number) > 100_000_000) {
    return json({ message: 'Provide a customer name, valid email, description, and final balance in cents.' }, 400);
  }
  if (!env.APEX_WHOP_API_KEY || !env.APEX_WHOP_ACCOUNT_ID) return json({ message: 'Whop is not configured.' }, 503);

  const apiBase = env.APEX_WHOP_ENVIRONMENT === 'production' ? 'https://api.whop.com/api/v1' : 'https://sandbox-api.whop.com/api/v1';
  const response = await fetch(`${apiBase}/invoices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.APEX_WHOP_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account_id: env.APEX_WHOP_ACCOUNT_ID,
      customer_name: invoice.name.trim(),
      email_address: invoice.email.trim(),
      line_items: [{ label: invoice.description.trim(), unit_price: (invoice.amountCents as number) / 100, quantity: 1 }],
      save_as_draft: true,
    }),
  });
  const result: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    console.error('Whop invoice creation failed', response.status);
    return json({ message: 'Unable to create the Whop invoice.' }, 502);
  }
  return json({ id: (result as { id?: string } | undefined)?.id }, 201);
}

export default { async fetch(request: Request, env: Env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/leads' && request.method === 'POST') {
    try { return await handleLead(request, env); } catch (error) { console.error('Lead creation failed', error); return json({ message: 'Unable to submit estimate request.' }, 502); }
  }
  if (url.pathname === '/api/invoices' && request.method === 'POST') {
    try { return await handleInvoice(request, env); } catch (error) { console.error('Invoice creation failed', error); return json({ message: 'Unable to create the Whop invoice.' }, 502); }
  }
  if (url.pathname.startsWith('/api/')) return json({ message: 'Not found' }, 404);
  return env.ASSETS.fetch(request);
} };
