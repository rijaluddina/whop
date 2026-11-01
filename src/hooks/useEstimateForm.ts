import { useState } from 'react';

export interface EstimateFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  message: string;
}

export function useEstimateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(data: EstimateFormData) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, service: data.serviceType }),
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || 'Unable to submit your estimate request.');
      return { success: true as const };
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Unable to submit your estimate request.';
      setError(message);
      return { success: false as const, error: new Error(message) };
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}
