// src/lib/config/plans.ts
export const plans = {
  inspection: {
    id: 'plan_inspection',
    name: 'Roof Inspection',
    description: 'Comprehensive 21-point roof inspection with detailed report',
    price: 14900,
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_inspection', // TODO: Replace after Whop Dashboard creation
    trackingEvent: 'service_viewed',
    metadata: { serviceType: 'inspection' },
  },
  deposit: {
    id: 'plan_deposit',
    name: 'Project Deposit',
    description: 'Secures your project start date and materials - applied to final balance',
    price: 50000,
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_deposit',
    trackingEvent: 'deposit_started',
    metadata: { serviceType: 'deposit', isSetupIntent: true },
  },
  flatRate: {
    id: 'plan_flat_rate',
    name: 'Standard Roof Replacement',
    description: 'Complete asphalt shingle roof replacement up to 2,000 sq ft',
    price: 250000,
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_flat_rate',
    trackingEvent: 'service_viewed',
    metadata: { serviceType: 'replacement' },
  },
} as const;

export type PlanKey = keyof typeof plans;
export type PlanConfig = (typeof plans)[PlanKey];
