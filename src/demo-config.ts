// Live demo plans. Replace these IDs and scopes when configuring another business.
export const demoPlans = {
  inspection: {
    id: 'plan_cBXkmGicP30XC',
    price: 149,
    name: '21-Point Drone & Attic Roof Inspection',
    includes: [
      '4K drone aerial thermal scan.',
      'Attic moisture and sheathing inspection.',
      'Digital report and storm-damage documentation for insurance.',
      '$149 credited toward a subsequent repair or replacement.',
      'Inspection scheduled within 48 hours.',
    ],
    scope: 'Inspection fee is credited once toward approved follow-up work. Repairs are quoted separately.',
  },
  deposit: {
    id: 'plan_2COSQXzAgQjgQ',
    price: 500,
    name: 'Project Work Deposit & Materials Lock',
    includes: [
      'Secure your crew date using your approved project reference.',
      'Reserve materials and delivery for the agreed project.',
      'The deposit is applied toward your agreed project total.',
      'Final balance invoiced through Whop after the walkthrough.',
      'Refundable up to 72 hours before material delivery.',
    ],
    scope: 'Example: a $5,000 project minus a $500 deposit leaves $4,500 before applicable tax or approved changes.',
  },
  tuneUp: {
    id: 'plan_kxkaZyPyd2iR8',
    price: 799,
    name: 'Flat-Rate Roof Tune-Up & Storm Seal',
    includes: [
      'Replace up to 3 weathered plumbing vent pipe boots.',
      'Apply elastomeric sealant to flashing and penetrations.',
      'Secure loose ridge caps and edge shingles.',
      'Clear gutter debris near downspout openings, up to 150 linear feet.',
      'Includes a 1-year no-leak workmanship warranty.',
    ],
    scope: 'Flat-rate preventive maintenance. Structural repairs and full replacement require a separate estimate.',
  },
} as const

export const estimateServices = ['Complete Roof Replacement', 'Emergency Roof & Leak Repair', 'Certified Drone & Hail Inspections', 'Seamless Gutters & Architectural Flashing'] as const

export const roofAges = ['0-5 years', '6-10 years', '11-15 years', '16-20+ years', "I don't know"] as const

// Preserve existing checkout links without advertising the retired plan.
export const legacyGutterPlan = {
  id: 'plan_Sb7o9hynxZ4lc', price: 299, name: 'Gutter cleaning',
  includes: ['Remove debris from accessible gutters and check downspouts.'],
  scope: 'Cleaning only. Repairs are quoted separately.',
} as const
