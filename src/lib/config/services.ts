// src/lib/config/services.ts
import { businessConfig } from './business';

export interface ServiceOption {
  value: string;
  label: string;
}

export const serviceOptions: ServiceOption[] = [
  { value: 'repair', label: businessConfig.services.repair.title },
  { value: 'replacement', label: businessConfig.services.replacement.title },
  { value: 'inspection', label: businessConfig.services.inspection.title },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'other', label: 'Other / Not Sure' },
];
