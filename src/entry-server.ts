// src/entry-server.ts
// Cloudflare Worker entry point for API routes
import { createLead } from './lib/api/leads';
import { finalizeSetupIntent } from './lib/api/setup-intents';
import { createFinalInvoice } from './lib/api/invoices';
import type { EstimateFormData } from './hooks/useEstimateForm';

interface CreateFinalInvoiceRequest {
  customer_email: string;
  payment_method_id: string;
  deposit_amount: number;
  total_amount: number;
  project_id: string;
}

interface Env {
  WHOP_API_KEY: string;
  WHOP_ACCOUNT_ID: string;
  WHOP_FLAT_RATE_VARIANT_ID: string;
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

async function handleFinalInvoiceCreate(request: Request, env: Env): Promise<Response> {
  // Validate HTTP method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  try {
    const rawData = await request.json();
    const { customer_email, payment_method_id, deposit_amount, total_amount, project_id } =
      rawData as CreateFinalInvoiceRequest;

    // Validate required fields
    if (!customer_email) {
      return new Response(JSON.stringify({ message: 'Missing customer_email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!payment_method_id) {
      return new Response(JSON.stringify({ message: 'Missing payment_method_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof deposit_amount !== 'number' || deposit_amount <= 0) {
      return new Response(JSON.stringify({ message: 'Invalid deposit_amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof total_amount !== 'number' || total_amount <= 0) {
      return new Response(JSON.stringify({ message: 'Invalid total_amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!project_id) {
      return new Response(JSON.stringify({ message: 'Missing project_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const invoice = await createFinalInvoice({
      customerEmail: customer_email,
      paymentMethodId: payment_method_id,
      depositAmount: deposit_amount,
      totalAmount: total_amount,
      projectId: project_id,
      accountId: env.WHOP_ACCOUNT_ID,
      flatRateVariantId: env.WHOP_FLAT_RATE_VARIANT_ID,
    });

    return new Response(JSON.stringify({ invoice }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Final invoice creation error:', error);
    return new Response(JSON.stringify({ message: 'Failed to create final invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleSetupIntentsFinalize(request: Request): Promise<Response> {
  // Validate HTTP method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  try {
    const rawData = await request.json();
    const { setup_intent_id, customer_email } = rawData as {
      setup_intent_id: string;
      customer_email?: string;
    };

    if (!setup_intent_id) {
      return new Response(JSON.stringify({ message: 'Missing setup_intent_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!customer_email) {
      return new Response(JSON.stringify({ message: 'Missing customer_email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const setupIntent = await finalizeSetupIntent(setup_intent_id, customer_email);

    return new Response(JSON.stringify({ setupIntent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Setup intent finalize error:', error);
    return new Response(JSON.stringify({ message: 'Failed to finalize setup intent' }), {
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

  if (url.pathname === '/api/setup-intents/finalize' && request.method === 'POST') {
    return handleSetupIntentsFinalize(request);
  }

  if (url.pathname === '/api/invoices/create-final' && request.method === 'POST') {
    return handleFinalInvoiceCreate(request, env);
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
