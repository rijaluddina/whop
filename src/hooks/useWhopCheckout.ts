// src/hooks/useWhopCheckout.ts
import { loadWhop } from '@whop/elements';
import { plans, type PlanKey } from '@/lib/config/plans';
import { useTracking } from './useTracking';

export function useWhopCheckout(planKey: PlanKey) {
  const plan = plans[planKey];
  const { trackServiceViewed, trackDepositStarted } = useTracking();
  const elements = loadWhop();

  // Track service viewed when checkout loads
  trackServiceViewed(plan.metadata.serviceType, plan.whopPlanId);

  if (planKey === 'deposit') {
    trackDepositStarted(plan.whopPlanId, plan.price);
  }

  return { plan, elements };
}
