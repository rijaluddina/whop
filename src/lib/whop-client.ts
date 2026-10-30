// src/lib/whop-client.ts
import { WhopClient } from '@whop/sdk';

export function getWhopClient(): WhopClient {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new Error('WHOP_API_KEY not set');
  return new WhopClient({ token: apiKey });
}
