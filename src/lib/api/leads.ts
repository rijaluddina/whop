// src/lib/api/leads.ts
import { getWhopClient } from '@/lib/whop-client';
import { EstimateFormData } from '@/hooks/useEstimateForm';

export async function createLead(data: EstimateFormData, accountId: string) {
  const client = getWhopClient();
  const lead = await client.leads.create({
    account_id: accountId,
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
