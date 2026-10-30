// src/components/icons/FinancingIcons.tsx
// Financing partner icon components

import React from 'react';

interface FinancingIconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

export const KlarnaIcon: React.FC<FinancingIconProps> = ({
  className = 'w-6 h-6',
  'aria-hidden': ariaHidden = true,
}) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

export const SplititIcon: React.FC<FinancingIconProps> = ({
  className = 'w-6 h-6',
  'aria-hidden': ariaHidden = true,
}) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden}>
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
    <path d="M8 12h8v2H8zm0-4h8v2H8z" fill="white" />
  </svg>
);

export const AfterpayIcon: React.FC<FinancingIconProps> = ({
  className = 'w-6 h-6',
  'aria-hidden': ariaHidden = true,
}) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden={ariaHidden}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
  </svg>
);
