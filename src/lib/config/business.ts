const env = import.meta.env as Record<string, string | undefined>;

export const businessConfig = {
  company: {
    name: 'Apex Shield Roofing & Exteriors',
    tagline: 'Built to Withstand Storms. Backed by 50-Year Protection.',
    phone: '(800) 555-ROOF',
    email: 'contact@apexshieldroofing.com',
    address: '4500 Ridgeview Blvd, Suite 200, Dallas, TX 75201',
    serviceAreas: ['Dallas', 'Fort Worth', 'Plano', 'Frisco', 'Southlake', 'Arlington'],
    currency: 'USD',
    locale: 'en-US',
    colors: {
      primary: '#f59e0b',
      secondary: '#ea580c',
      background: '#020617',
      surface: '#0d1527',
      border: '#1e293b',
      muted: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#dc2626',
      error: '#dc2626',
      darkBg: '#020617',
      darkText: '#f8fafc',
    },
    logo: '/logo.svg',
    reviews: [
      { name: 'Marcus Vance', rating: 5, text: 'Apex Shield handled our storm damage claim flawlessly. The drone inspection was incredibly detailed and they walked us through every step with our insurance adjuster.', date: '2024-06-15' },
      { name: 'Elena Rostova', rating: 5, text: 'Top-tier workmanship. Crew arrived on time, cleaned up daily, and the new roof looks absolutely stunning. The 50-year warranty gives us peace of mind.', date: '2024-07-20' },
      { name: 'David & Sarah Chen', rating: 5, text: "Used the deposit system and it was seamless. Financing options made it affordable. Best roofing experience we've ever had. Highly recommend!", date: '2024-08-10' },
    ],
    trustBadges: ['GAF Master Elite®', 'Owens Corning Platinum Preferred', 'BBB Accredited A+', 'CertainTeed Select ShingleMaster™'],
    socialLinks: [],
    footerLinks: { services: [], company: [], support: [] },
  },
  plans: {
    inspection: {
      name: '21-Point Drone & Attic Roof Inspection',
      price: 14900,
      description: 'Comprehensive inspection with photo report and repair recommendations.',
      details: ['High-resolution drone imagery', 'Attic & ventilation inspection', '21-point checklist', 'Insurance-ready PDF report', 'Same-week scheduling'],
      whopPlanId: env.VITE_WHOP_PLAN_INSPECTION,
      type: 'one_time',
      metadata: { serviceType: 'inspection' },
    },
    deposit: {
      name: 'Project Work Deposit & Materials Lock',
      price: 50000,
      description: 'Secure your slot and lock material pricing with a refundable deposit.',
      details: ['Holds your project on the schedule', 'Locks current shingle pricing', 'Card saved on file for final balance', 'Refundable up to 72h before materials', 'Coordinated by project manager'],
      whopPlanId: env.VITE_WHOP_PLAN_DEPOSIT,
      type: 'one_time',
      metadata: { serviceType: 'deposit' },
    },
    replacement: {
      name: 'Flat-Rate Roof Tune-Up & Storm Seal',
      price: 79900,
      description: 'Minor repairs, sealant, flashing touch-ups, and debris removal in one visit.',
      details: ['Up to 15 minor repairs', 'Ridge/valley sealant touch-up', 'Flashing inspection & seal', 'Gutter debris clearing (front/rear)', '1-year workmanship warranty'],
      whopPlanId: env.VITE_WHOP_PLAN_REPLACEMENT,
      type: 'one_time',
      metadata: { serviceType: 'repair' },
    },
  },
  services: {},
} as const;

export const formatBusinessCurrency = (amountInMinorUnits: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amountInMinorUnits / 100);
