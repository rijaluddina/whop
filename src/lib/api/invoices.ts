// src/lib/api/invoices.ts
import { getWhopClient } from '@/lib/whop-client';

export interface CreateFinalInvoiceParams {
  customerEmail: string;
  paymentMethodId: string; // from deposit setup intent
  depositAmount: number; // 50000
  totalAmount: number; // 250000
  projectId: string;
}

interface WhopInvoiceCreatePayload {
  account_id: string;
  customer_email: string;
  collection_method: 'charge_automatically';
  payment_method_id: string;
  due_date: string;
  plan: {
    product_id: string;
    plan_type: 'one_time';
    initial_price: number;
    currency: 'usd';
  };
  metadata: {
    project_id: string;
    deposit_amount: string;
    total_amount: string;
  };
}

export async function createFinalInvoice(params: CreateFinalInvoiceParams) {
  const client = getWhopClient();
  const remainingBalance = params.totalAmount - params.depositAmount;

  const payload: WhopInvoiceCreatePayload = {
    account_id: import.meta.env.WHOP_ACCOUNT_ID,
    customer_email: params.customerEmail,
    collection_method: 'charge_automatically',
    payment_method_id: params.paymentMethodId,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan: {
      product_id: import.meta.env.WHOP_FLAT_RATE_PRODUCT_ID,
      plan_type: 'one_time',
      initial_price: remainingBalance,
      currency: 'usd',
    },
    metadata: {
      project_id: params.projectId,
      deposit_amount: params.depositAmount.toString(),
      total_amount: params.totalAmount.toString(),
    },
  };

  // Use type assertion to bypass SDK type limitations (API accepts these fields per brief)
  const invoice = await client.invoices.create(
    payload as unknown as Parameters<typeof client.invoices.create>[0]
  );
  return invoice;
}
