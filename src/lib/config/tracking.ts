// src/lib/config/tracking.ts
export const trackingEvents = {
  estimateRequested: 'estimate_requested',
  serviceViewed: 'service_viewed',
  depositStarted: 'deposit_started',
} as const;

export function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
