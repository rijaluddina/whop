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

export interface CheckoutElementsProps {
  planKey: PlanKey;
}

function handleCompletion(
  planKey: string,
  completion: { result: string; paymentId?: string; setupIntentId?: string }
) {
  if (completion.result === 'payment') {
    window.location.href = `/checkout/success?plan=${planKey}&payment_id=${completion.paymentId}`;
  } else if (completion.result === 'setup') {
    // Handle setup intent completion
    const setupIntentId = completion.setupIntentId;
    // Call API to finalize setup intent
    fetch('/api/setup-intents/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setup_intent_id: setupIntentId }),
    })
      .then(() => {
        window.location.href = `/checkout/success?plan=${planKey}&setup_intent_id=${setupIntentId}`;
      })
      .catch((error) => {
        console.error('Failed to finalize setup intent:', error);
        // Still redirect to success page even if finalize fails
        window.location.href = `/checkout/success?plan=${planKey}&setup_intent_id=${setupIntentId}`;
      });
  }
}

export function CheckoutElements({ planKey }: CheckoutElementsProps) {
  const { plan, elements } = useWhopCheckout(planKey);

  return (
    <WhopElements elements={elements}>
      <Checkout
        plan={plan.whopPlanId}
        onComplete={(completion) => handleCompletion(planKey, completion)}
      >
        <CheckoutElement />
        <ExpressCheckoutElement />
        <BrandingElement />
      </Checkout>
    </WhopElements>
  );
}
