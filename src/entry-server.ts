// src/entry-server.ts
// Cloudflare Worker entry point for API routes
import { createLead } from './lib/api/leads';
import type { EstimateFormData } from './hooks/useEstimateForm';

interface Env {
  WHOP_API_KEY: string;
  WHOP_ACCOUNT_ID: string;
}

async function handleLeadsPost(request: Request, env: Env): Promise<Response> {
  try {
    const rawData = await request.json();

    // Validate and type the data
    const data = rawData as EstimateFormData;

    // Validate required fields
    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.address ||
      !data.serviceType ||
      !data.message
    ) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lead = await createLead(data, env.WHOP_ACCOUNT_ID);

    return new Response(JSON.stringify({ id: lead.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Lead creation error:', error);
    return new Response(JSON.stringify({ message: 'Failed to submit estimate request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // API routes
  if (url.pathname === '/api/leads' && request.method === 'POST') {
    return handleLeadsPost(request, env);
  }

  // For all other routes, serve the SPA (handled by Cloudflare Workers static assets)
  // Return a 404 for unmatched API routes
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Let the static asset handling take over for non-API routes
  return new Response(null, { status: 404 });
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};

export default handler;
