// src/hooks/useEstimateForm.ts
import { useState } from 'react';
import { useTracking } from './useTracking';

export interface EstimateFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  message: string;
}

interface ErrorResponse {
  message?: string;
  [key: string]: unknown;
}

export interface UseEstimateFormReturn {
  submit: (
    data: EstimateFormData
  ) => Promise<{ success: boolean; lead?: { id: string }; error?: Error }>;
  loading: boolean;
  error: string | null;
}

export function useEstimateForm(): UseEstimateFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEstimateRequested } = useTracking();

  const submit = async (data: EstimateFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(errorData.message || 'Failed to submit estimate request');
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const lead = (await res.json()) as { id: string };
      trackEstimateRequested(lead.id, data.serviceType);
      return { success: true, lead: { id: lead.id } };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Something went wrong';
      setError(errorMessage);
      return { success: false, error: e instanceof Error ? e : new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
