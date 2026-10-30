// src/components/tracking/WhopPixelEvents.tsx
import { useEffect } from 'react';
import { useWhopPixelStatus } from './useWhopPixelStatus';

interface WhopPixelEventsProps {
  /** Optional callback fired when pixel status changes */
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

/**
 * WhopPixelEvents - Verification component that confirms the Whop tracking pixel
 * is loaded and ready on the page. Useful for debugging and ensuring events will fire.
 *
 * Renders nothing visually - it's a silent verification utility.
 */
export function WhopPixelEvents({ onStatusChange }: WhopPixelEventsProps) {
  const status = useWhopPixelStatus();

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  // This component renders nothing - it's purely for side effects
  return null;
}
