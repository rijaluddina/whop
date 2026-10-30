// src/components/checkout/CheckoutElements.tsx
import {
  WhopElements,
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  BrandingElement,
} from '@whop/elements-react';
import { useWhopCheckout } from '@/hooks/useWhopCheckout';
import type { PlanKey } from '@/lib/config/plans';
import { toast } from 'sonner';

export interface CheckoutElementsProps {
  planKey: PlanKey;
}

interface CompletionPayload {
  result: 'payment' | 'setup';
  paymentId?: string;
  setupIntentId?: string;
}

async function handleCompletion(planKey: PlanKey, completion: CompletionPayload) {
  if (completion.result === 'payment') {
    window.location.href = `/checkout/success?plan=${planKey}&payment_id=${completion.paymentId}`;
    return;
  }

  if (completion.result === 'setup') {
    const setupIntentId = completion.setupIntentId;

    if (!setupIntentId) {
      console.error('Missing setupIntentId in completion payload');
      toast.error('Failed to save payment method');
      return;
    }

    try {
      const response = await fetch('/api/setup-intents/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_intent_id: setupIntentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to finalize setup intent');
      }

      window.location.href = `/checkout/success?plan=${planKey}&setup_intent_id=${setupIntentId}`;
    } catch (error) {
      console.error('Failed to finalize setup intent:', error);
      toast.error('Failed to save payment method. Please contact support.');
      // Still redirect to success page with the setup intent ID for reference
      window.location.href = `/checkout/success?plan=${planKey}&setup_intent_id=${setupIntentId}`;
    }
  }
}

export function CheckoutElements({ planKey }: CheckoutElementsProps) {
  const { plan, elements } = useWhopCheckout(planKey);

  return (
    <WhopElements elements={elements}>
      <Checkout
        plan={plan.whopPlanId}
        // @ts-expect-error - Whop Checkout types don't include `mode` but brief requires it for setup vs payment mode
        mode={plan.id === 'plan_deposit' ? 'setup' : 'payment'}
        onComplete={(completion) => {
          void handleCompletion(planKey, completion as CompletionPayload);
        }}
      >
        <CheckoutElement />
        <ExpressCheckoutElement />
        <BrandingElement />
      </Checkout>
    </WhopElements>
  );
}
