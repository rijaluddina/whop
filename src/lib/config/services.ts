import { businessConfig } from './business';

export const servicesConfig = businessConfig.services;
export type ServiceKey = keyof typeof servicesConfig;
