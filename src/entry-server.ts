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
      (key) => typeof lead[key] === 'string' && (lead[key] as string).trim().length > 0
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

async function handleInvoice(request: Request, env: Env) {
  if (
    !env.APEX_INVOICE_ADMIN_TOKEN ||
    env.APEX_INVOICE_ADMIN_TOKEN.length < 32 ||
    request.headers.get('Authorization') !== `Bearer ${env.APEX_INVOICE_ADMIN_TOKEN}`
  ) {
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
  if (!env.APEX_WHOP_FINAL_BALANCE_PLAN_ID)
    return json({ message: 'The final balance plan is not configured.' }, 503);

  const whop = whopClient(env);
  const created = await whop.invoices.create({
    account_id: env.APEX_WHOP_ACCOUNT_ID!,
    email_address: invoice.email.trim(),
    customer_name: invoice.name.trim(),
    items: [{ quantity: 1, variant_id: env.APEX_WHOP_FINAL_BALANCE_PLAN_ID }],
    metadata: { type: 'final_balance', description: invoice.description.trim() },
  });
  const summary = created as {
    id?: string;
    status?: string;
    amount_due?: { amount?: string; currency?: string };
  };
  return json({ id: summary.id, status: summary.status, amount: summary.amount_due ?? null }, 201);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/leads' && request.method === 'POST') {
      try {
        return await handleLead(request, env);
      } catch (error) {
        console.error('Lead creation failed', error);
        return json({ message: 'Unable to submit estimate request.' }, 502);
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
    if (url.pathname.startsWith('/api/')) return json({ message: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
