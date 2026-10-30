// src/components/tracking/useWhopPixelStatus.ts
import { useEffect, useRef, useState } from 'react';

/**
 * Hook to check Whop pixel status programmatically
 */
export function useWhopPixelStatus(): 'loading' | 'ready' | 'error' {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const statusRef = useRef(status);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setStatus('error');
      return;
    }

    const checkPixel = () => {
      if (window.whop?.track) {
        setStatus('ready');
      } else {
        pollTimeoutRef.current = setTimeout(checkPixel, 100);
      }
    };

    checkPixel();

    overallTimeoutRef.current = setTimeout(() => {
      if (statusRef.current === 'loading') {
        setStatus('error');
      }
    }, 10_000);

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      if (overallTimeoutRef.current) {
        clearTimeout(overallTimeoutRef.current);
      }
    };
  }, []);

  return status;
}
