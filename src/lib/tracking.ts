// src/lib/tracking.ts

declare global {
  interface Window {
    whop?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
      [key: string]: unknown;
    };
  }
}

/**
 * Fires a custom Whop pixel tracking event.
 * Also logs clearly to browser console for easy inspection during screen recordings & verification.
 */
export function trackEvent(eventName: string, data?: Record<string, unknown>): void {
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Visible console log with distinct styling for verification
  if (typeof console !== 'undefined' && console.log) {
    console.log(
      `%c[Whop Pixel Event] 🚀 ${eventName}`,
      'background: #1B4F72; color: #FFFFFF; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      payload
    );
  }

  if (typeof window !== 'undefined' && window.whop && typeof window.whop.track === 'function') {
    try {
      window.whop.track(eventName, payload);
    } catch (err) {
      console.warn(`[Whop Pixel] Failed to track ${eventName}:`, err);
    }
  }
}
