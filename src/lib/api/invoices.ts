// src/lib/api/invoices.ts
import { getWhopClient } from '@/lib/whop-client';

export interface CreateFinalInvoiceParams {
  customerEmail: string;
  paymentMethodId: string; // from deposit setup intent
  depositAmount: number; // 50000
  totalAmount: number; // 250000
  projectId: string;
  accountId: string;
  flatRateVariantId: string;
}

export async function createFinalInvoice(params: CreateFinalInvoiceParams) {
  const client = getWhopClient();
  const remainingBalance = params.totalAmount - params.depositAmount;

  const invoice = await client.invoices.create({
    account_id: params.accountId,
    email_address: params.customerEmail,
    payment_method_id: params.paymentMethodId,
    due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        variant_id: params.flatRateVariantId,
        quantity: 1,
        price_override: remainingBalance,
      },
    ],
    metadata: {
      project_id: params.projectId,
      deposit_amount: params.depositAmount.toString(),
      total_amount: params.totalAmount.toString(),
    },
  });
  return invoice;
}
