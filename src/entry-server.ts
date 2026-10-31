import { WhopClient, WhopEnvironment } from '@whop/sdk';

interface Env {
  APEX_WHOP_API_KEY?: string;
  APEX_WHOP_ACCOUNT_ID?: string;
  APEX_WHOP_ENVIRONMENT?: string;
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
  return json({ id: lead.id }, 201);
}

export default { async fetch(request: Request, env: Env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/leads' && request.method === 'POST') {
    try { return await handleLead(request, env); } catch (error) { console.error('Lead creation failed', error); return json({ message: 'Unable to submit estimate request.' }, 502); }
  }
  if (url.pathname.startsWith('/api/')) return json({ message: 'Not found' }, 404);
  return env.ASSETS.fetch(request);
} };
