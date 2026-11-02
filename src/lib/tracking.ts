export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && (window as any).whop?.track) {
      (window as any).whop.track(eventName, properties);
    }
  } catch (error) {
    console.debug('Track event failed', error);
  }
}
