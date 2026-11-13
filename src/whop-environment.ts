const configuredEnvironment = import.meta.env.VITE_WHOP_ENVIRONMENT ?? 'production'

if (configuredEnvironment !== 'sandbox' && configuredEnvironment !== 'production') {
  throw new Error('WHOP_ENVIRONMENT must be "sandbox" or "production"')
}

export const whopEnvironment = configuredEnvironment
