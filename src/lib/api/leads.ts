// src/lib/api/leads.ts
import { getWhopClient } from '@/lib/whop-client';
import { EstimateFormData } from '@/hooks/useEstimateForm';

export async function createLead(data: EstimateFormData) {
  const client = getWhopClient();
  const lead = await client.leads.create({
    account_id: process.env.WHOP_ACCOUNT_ID!,
    metadata: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      service_type: data.serviceType,
      address: data.address,
      message: data.message,
      source: 'website_estimate_form',
    },
  });
  return lead;
}
