// src/lib/api/setup-intents.ts
import { getWhopClient } from '@/lib/whop-client';

export async function finalizeSetupIntent(setupIntentId: string) {
  const client = getWhopClient();
  // Poll setup intent status or use client_secret from checkout
  const setupIntent = await client.setupIntents.retrieve({ id: setupIntentId });
  // Store payment_method_id for later invoice use
  return setupIntent;
}
