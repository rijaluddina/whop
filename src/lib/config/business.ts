const env = import.meta.env as Record<string, string | undefined>;

// Edit this file when adapting the site to another business. Keep Whop API credentials server-side.
export const businessConfig = {
  company: {
    name: 'Apex Roofing',
    tagline: 'Your Trusted Roofing Partner',
    phone: '(555) 123-4567',
    email: 'info@apexroofing.com',
    address: '123 Main St, Springfield, IL 62701',
    serviceAreas: ['Springfield', 'Champaign', 'Bloomington', 'Decatur', 'Peoria'],
    currency: 'USD',
    locale: 'en-US',
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
      { name: 'James R.', rating: 5, text: 'Fixed our leak in one day. Highly recommend.', date: '2024-02-20' },
      { name: 'Lisa K.', rating: 5, text: 'Fair pricing, great communication throughout.', date: '2024-03-10' },
    ],
    trustBadges: ['Licensed & Insured', 'BBB A+ Rating', '500+ Projects', '10-Year Warranty'],
    socialLinks: [
      { label: 'Facebook', href: 'https://facebook.com/apexroofing', icon: 'facebook' },
      { label: 'Instagram', href: 'https://instagram.com/apexroofing', icon: 'instagram' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/apexroofing', icon: 'linkedin' },
      { label: 'Google Reviews', href: 'https://google.com/search?q=apex+roofing+reviews', icon: 'google' },
    ],
    footerLinks: {
      services: [
        { label: 'Residential Roofing', href: '#services' },
        { label: 'Commercial Roofing', href: '#services' },
        { label: 'Roof Repair', href: '#services' },
        { label: 'Roof Inspection', href: '#services' },
        { label: 'Emergency Services', href: '#contact' },
      ],
      company: [
        { label: 'About Us', href: '#about' },
        { label: 'Our Team', href: '#about' },
        { label: 'Careers', href: '#contact' },
        { label: 'Blog', href: '#contact' },
        { label: 'FAQ', href: '#contact' },
      ],
      support: [
        { label: 'Contact Us', href: '#contact' },
        { label: 'Request a Quote', href: '#contact' },
        { label: 'Schedule Inspection', href: '#contact' },
        { label: 'Financing Options', href: '#contact' },
        { label: 'Warranty Info', href: '#contact' },
      ],
    },
  },
  plans: {
    inspection: {
      name: 'Roof inspection',
      price: 14900,
      description: 'A detailed inspection to understand your roof’s condition and the work it may need.',
      details: ['21-point roof assessment', 'Photo report and clear recommendations', 'Attic and ventilation check'],
      whopPlanId: env.VITE_WHOP_PLAN_INSPECTION,
      type: 'one_time',
      metadata: { serviceType: 'inspection' },
    },
    deposit: {
      name: 'Project deposit',
      price: 50000,
      description: 'A deposit toward getting your roofing project underway.',
      details: ['Secure online payment', 'Project deposit recorded through Whop', 'Next steps coordinated with the project team'],
      whopPlanId: env.VITE_WHOP_PLAN_DEPOSIT,
      type: 'one_time',
      metadata: { serviceType: 'deposit' },
    },
    replacement: {
      name: 'Roof replacement',
      price: 250000,
      description: 'A payment option for a full roof replacement project.',
      details: ['Roof replacement service', 'Checkout securely handled by Whop', 'Project details confirmed with the project team'],
      whopPlanId: env.VITE_WHOP_PLAN_REPLACEMENT,
      type: 'one_time',
      metadata: { serviceType: 'replacement' },
    },
  },
  services: {
    repair: {
      title: 'Roof Repair',
      description: 'Fast, reliable fixes for leaks, storm damage, and wear. We handle everything from minor patches to major structural repairs.',
      features: ['Leak detection & repair', 'Storm & hail damage', 'Shingle replacement', 'Flashing repair & replacement', 'Emergency tarping available', 'Workmanship warranty included'],
    },
    replacement: {
      title: 'Roof Replacement',
      description: 'Complete roof replacement with premium materials. Up to 2,000 sq ft of asphalt shingles with full tear-off and installation.',
      features: ['Full tear-off & disposal', 'Premium asphalt shingles', 'New flashing & drip edge', 'Ridge vent installation', '10-year workmanship warranty', 'Manufacturer warranty registration'],
    },
    inspection: {
      title: 'Roof Inspection',
      description: 'Comprehensive 21-point inspection with detailed photo report. Identify issues early and plan maintenance with confidence.',
      features: ['21-point inspection checklist', 'Drone roof assessment', 'Attic & ventilation check', 'Detailed photo report', 'Maintenance recommendations', 'Free with any repair job'],
    },
  },
} as const;

export const formatBusinessCurrency = (amountInMinorUnits: number) =>
  new Intl.NumberFormat(businessConfig.company.locale, {
    style: 'currency',
    currency: businessConfig.company.currency,
    maximumFractionDigits: 2,
  }).format(amountInMinorUnits / 100);
