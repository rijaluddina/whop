// src/lib/types/whop.d.ts
// Centralized Whop tracking type augmentation

declare global {
  interface Window {
    whop?: {
      track: (eventName: string, data: Record<string, unknown>) => void;
    };
  }
}

export {};
