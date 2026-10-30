// src/components/tracking/useWhopPixelStatus.ts
import { useEffect, useState } from 'react';

/**
 * Hook to check Whop pixel status programmatically
 */
export function useWhopPixelStatus(): 'loading' | 'ready' | 'error' {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (typeof window === 'undefined') {
      setStatus('error');
      return;
    }

    const checkPixel = () => {
      if (window.whop?.track) {
        setStatus('ready');
      } else {
        setTimeout(checkPixel, 100);
      }
    };

    checkPixel();

    const timeoutId = setTimeout(() => {
      if (status === 'loading') {
        setStatus('error');
      }
    }, 10_000);

    return () => clearTimeout(timeoutId);
  }, [status]);

  return status;
}
