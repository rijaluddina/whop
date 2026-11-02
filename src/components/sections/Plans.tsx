import { businessConfig } from '../../lib/config/business';

interface PlansProps {
  onOpenCheckout: (plan: any) => void;
  onOpenInvoicesDemo: () => void;
}

export const Plans = ({ onOpenCheckout, onOpenInvoicesDemo }: PlansProps) => {
  return (
    <section className="section section-dark" id="plans">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Fixed Plans & Pricing
          </div>
          <h2 className="section-title">Fixed Roofing Plans & Project Deposits</h2>
          <p className="section-subtitle">
            Transparent, fixed pricing with secure checkout via Whop. Pay deposits online or book inspections instantly.
          </p>
        </div>

        <div className="grid-3">
          <div className="plan-card">
            <div>
              <div className="plan-type-label">INSPECTION</div>
              <h3 className="plan-name">21-Point Drone & Attic Roof Inspection</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Comprehensive inspection with photo report and repair recommendations.</p>
              <div className="plan-price-row">
                <span className="plan-price">$149</span>
                <span className="plan-period">one-time</span>
              </div>
            </div>
            <div>
              <ul className="plan-features-list">
                {[
                  'High-resolution drone imagery',
                  'Attic & ventilation inspection',
                  '21-point checklist',
                  'Insurance-ready PDF report',
                  'Same-week scheduling',
                ].map((item) => (
                  <li key={item} className="plan-feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onOpenCheckout({ type: 'inspection', name: '21-Point Drone & Attic Roof Inspection', price: 149, tag: 'INSPECTION', tagline: 'Certified Drone & Hail Inspections', details: ['High-resolution drone imagery', 'Attic & ventilation inspection', '21-point checklist', 'Insurance-ready PDF report'], depositTerms: null, planId: businessConfig.plans.inspection.whopPlanId })} className="btn btn-primary btn-block">
                Select & Pay $149 via Whop
              </button>
            </div>
          </div>

          <div className="plan-card popular">
            <div className="popular-ribbon">Most Popular</div>
            <div>
              <div className="plan-type-label">DEPOSIT</div>
              <h3 className="plan-name">Project Work Deposit & Materials Lock</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Secure your slot and lock material pricing with a refundable deposit.</p>
              <div className="plan-price-row">
                <span className="plan-price">$500</span>
                <span className="plan-period">deposit</span>
              </div>
              <div className="plan-deposit-notice">
                Balance invoiced after final walkthrough. Typical final invoice ~$4,500.
              </div>
            </div>
            <div>
              <ul className="plan-features-list">
                {[
                  'Holds your project on the schedule',
                  'Locks current shingle pricing',
                  'Card saved on file for final balance',
                  'Refundable up to 72h before materials',
                  'Coordinated by project manager',
                ].map((item) => (
                  <li key={item} className="plan-feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onOpenCheckout({ type: 'deposit', name: 'Project Work Deposit & Materials Lock', price: 500, tag: 'DEPOSIT', tagline: 'Project Work Deposit & Materials Lock', details: ['Holds your project on the schedule', 'Locks current shingle pricing', 'Card saved on file for final balance'], depositTerms: { depositAmount: 500, finalInvoiceEstimated: 4500, termsText: 'A $500 project deposit is collected today by Whop. The remaining balance (about $4,500) is invoiced by Whop after your final walkthrough inspection and can be paid by card or.' }, planId: businessConfig.plans.deposit.whopPlanId })} className="btn btn-primary btn-block">
                Select & Pay $500 via Whop
              </button>
            </div>
          </div>

          <div className="plan-card">
            <div>
              <div className="plan-type-label">FLAT-RATE</div>
              <h3 className="plan-name">Flat-Rate Roof Tune-Up & Storm Seal</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Minor repairs, sealant, flashing touch-ups, and debris removal in one visit.</p>
              <div className="plan-price-row">
                <span className="plan-price">$799</span>
                <span className="plan-period">flat-rate</span>
              </div>
            </div>
            <div>
              <ul className="plan-features-list">
                {[
                  'Up to 15 minor repairs',
                  'Ridge/valley sealant touch-up',
                  'Flashing inspection & seal',
                  'Gutter debris clearing (front/rear)',
                  '1-year workmanship warranty',
                ].map((item) => (
                  <li key={item} className="plan-feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onOpenCheckout({ type: 'repair', name: 'Flat-Rate Roof Tune-Up & Storm Seal', price: 799, tag: 'FIXED ROOFING SERVICE', tagline: 'Flat-Rate Roof Tune-Up & Storm Seal', details: ['Up to 15 minor repairs', 'Ridge/valley sealant touch-up', 'Flashing inspection & seal'], depositTerms: null, planId: businessConfig.plans.replacement.whopPlanId })} className="btn btn-primary btn-block">
                Select & Pay $799 via Whop
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={onOpenInvoicesDemo} className="btn btn-secondary">
            Open final balance invoice
          </button>
        </div>
      </div>
    </section>
  );
};
