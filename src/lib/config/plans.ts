import { businessConfig } from './business';
export const plans = businessConfig.plans;
export type PlanKey = keyof typeof plans;
