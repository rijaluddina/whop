// src/lib/config/company.ts
export const companyConfig = {
  name: 'Apex Roofing',
  tagline: 'Your Trusted Roofing Partner',
  phone: '(555) 123-4567',
  email: 'info@apexroofing.com',
  address: '123 Main St, Springfield, IL 62701',
  serviceAreas: ['Springfield', 'Champaign', 'Bloomington', 'Decatur', 'Peoria'],
  colors: {
    primary: '#1B4F72',
    secondary: '#E8A838',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    border: '#E2E8F0',
    muted: '#64748B',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    error: '#DC2626',
    darkBg: '#111827',
    darkText: '#F9FAFB',
  },
  logo: '/logo.svg',
  reviews: [
    { name: 'Sarah M.', rating: 5, text: 'Excellent work, professional team!', date: '2024-01-15' },
    {
      name: 'James R.',
      rating: 5,
      text: 'Fixed our leak in one day. Highly recommend.',
      date: '2024-02-20',
    },
    {
      name: 'Lisa K.',
      rating: 5,
      text: 'Fair pricing, great communication throughout.',
      date: '2024-03-10',
    },
  ],
  trustBadges: ['Licensed & Insured', 'BBB A+ Rating', '500+ Projects', '10-Year Warranty'],
} as const;

export type CompanyConfig = typeof companyConfig;
