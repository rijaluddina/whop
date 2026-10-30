// src/hooks/useTracking.ts
import { trackingEvents, generateEventId } from '../lib/config/tracking';

export function useTracking() {
  const track = (eventName: string, data?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.whop) {
      window.whop.track(eventName, {
        ...data,
        event_id: data?.event_id || generateEventId(eventName),
      });
    }
  };

  return {
    trackEstimateRequested: (leadId: string, serviceType: string) =>
      track(trackingEvents.estimateRequested, { event_id: leadId, service_type: serviceType }),
    trackServiceViewed: (service: string, planId: string) =>
      track(trackingEvents.serviceViewed, {
        service,
        plan_id: planId,
        event_id: generateEventId('svc'),
      }),
    trackDepositStarted: (planId: string, amount: number) =>
      track(trackingEvents.depositStarted, {
        plan_id: planId,
        amount,
        event_id: generateEventId('dep'),
      }),
  };
}

export type TrackingFunctions = ReturnType<typeof useTracking>;
