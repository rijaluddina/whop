// src/components/icons/financingIconsMap.ts
// Icon mapping for financing partners

import { KlarnaIcon, SplititIcon, AfterpayIcon } from './FinancingIcons';
import type { FC } from 'react';

export const financingIcons = {
  Klarna: KlarnaIcon,
  Splitit: SplititIcon,
  Afterpay: AfterpayIcon,
} as const;

export type FinancingPartnerName = keyof typeof financingIcons;
export type FinancingIconComponent = FC<{ className?: string; 'aria-hidden'?: boolean }>;
