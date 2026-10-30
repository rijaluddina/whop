// src/lib/config/services.ts
export interface ServiceOption {
  value: string;
  label: string;
}

export const serviceOptions: ServiceOption[] = [
  { value: 'repair', label: 'Roof Repair' },
  { value: 'replacement', label: 'Roof Replacement' },
  { value: 'inspection', label: 'Roof Inspection' },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'other', label: 'Other / Not Sure' },
];
