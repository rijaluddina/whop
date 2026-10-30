// src/hooks/useWhopCheckout.ts
import { loadWhop } from '@whop/elements';
import { useMemo, useEffect } from 'react';
import { plans, type PlanKey } from '@/lib/config/plans';
import { useTracking } from './useTracking';

export function useWhopCheckout(planKey: PlanKey) {
  const plan = plans[planKey];
  const { trackServiceViewed, trackDepositStarted } = useTracking();
  const elements = useMemo(() => loadWhop(), []);

  // Track service viewed when checkout loads
  useEffect(() => {
    trackServiceViewed(plan.metadata.serviceType, plan.whopPlanId);
  }, [plan.metadata.serviceType, plan.whopPlanId, trackServiceViewed]);

  // Track deposit started for deposit plan
  useEffect(() => {
    if (planKey === 'deposit') {
      trackDepositStarted(plan.whopPlanId, plan.price);
    }
  }, [planKey, plan.whopPlanId, plan.price, trackDepositStarted]);

  return { plan, elements };
}
