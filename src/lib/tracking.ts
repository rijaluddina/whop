// src/lib/tracking.ts

// The Whop-hosted pixel sends events straight to Whop's servers, so the local
// `window.whop.q` queue stays empty. We mirror every whop.track call here so
// the on-page PixelDebugger can show exactly what was fired and when.

export interface CapturedPixelEvent {
  id: number;
  name: string;
  properties: Record<string, unknown>;
  time: string;
}

type PixelListener = (events: CapturedPixelEvent[]) => void;

const listeners = new Set<PixelListener>();
const log: CapturedPixelEvent[] = [];
let seq = 0;

if (typeof window !== 'undefined') {
  (window as unknown as { __whopPixelLog?: CapturedPixelEvent[] }).__whopPixelLog = log;
}

export function subscribeToPixelEvents(listener: PixelListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPixelEventLog(): CapturedPixelEvent[] {
  return [...log];
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  const captured: CapturedPixelEvent = {
    id: ++seq,
    name: eventName,
    properties: properties ?? {},
    time: new Date().toISOString(),
  };
  log.unshift(captured);
  if (log.length > 30) log.length = 30;
  listeners.forEach((listener) => listener([...log]));

  try {
    if (
      typeof window !== 'undefined' &&
      (window as { whop?: { track?: (n: string, p?: Record<string, unknown>) => void } }).whop
        ?.track
    ) {
      (window as { whop?: { track?: (n: string, p?: Record<string, unknown>) => void } }).whop!
        .track!(eventName, properties);
    }
  } catch (error) {
    console.debug('Track event failed', error);
  }
}
