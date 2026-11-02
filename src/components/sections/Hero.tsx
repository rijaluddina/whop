import { businessConfig } from '../../lib/config/business';

interface HeroProps {
  onOpenCheckout: (plan: any) => void;
  onScrollTo: (id: string) => void;
}

export const Hero = ({ onOpenCheckout, onScrollTo }: HeroProps) => {
  return (
    <section className="section-hero" id="home">
      <div className="container">
        <div className="grid-hero">
          <div className="hero-content">
            <div className="section-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              GAF Master Elite® • Owens Corning Platinum Preferred
            </div>
            <h1 className="hero-title">
              Built to Withstand <span className="hero-highlight">Storms</span>. Backed by 50-Year Protection.
            </h1>
            <p className="hero-desc">
              Certified commercial and residential roofing contractors. Lifetime architectural shingle replacement, emergency leak repair, and 21-point drone roof inspections. Flexible 0% APR financing via Whop.
            </p>

            <div className="hero-check-grid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Licensed, Bonded & Insured
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                24/7 Emergency Response
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Drone Inspections & Reports
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Insurance Claim Assistance
              </div>
            </div>

            <div className="hero-btn-group">
              <button onClick={() => onOpenCheckout({ type: 'deposit', name: 'Project Work Deposit & Materials Lock', price: 500, tag: 'DEPOSIT', tagline: 'Project Work Deposit & Materials Lock', details: ['Holds your project on the schedule', 'Locks current shingle pricing', 'Card saved on file for final balance'], depositTerms: { depositAmount: 500, finalInvoiceEstimated: 4500, termsText: 'A $500 project deposit is collected today by Whop. The remaining balance (about $4,500) is invoiced by Whop after your final walkthrough inspection and can be paid by card or.' }, planId: businessConfig.plans.deposit.whopPlanId })} className="btn btn-primary btn-lg">
                Lock In Project Deposit ($500)
              </button>
              <button onClick={() => onOpenCheckout({ type: 'inspection', name: '21-Point Drone & Attic Roof Inspection', price: 149, tag: 'INSPECTION', tagline: 'Certified Drone & Hail Inspections', details: ['High-resolution drone imagery', 'Attic & ventilation inspection', '21-point checklist', 'Insurance-ready PDF report'], depositTerms: null, planId: businessConfig.plans.inspection.whopPlanId })} className="btn btn-secondary btn-lg">
                21-Pt Inspection ($149)
              </button>
            </div>

            <button onClick={() => onScrollTo('contact')} style={{ background: 'none', border: 'none', color: 'var(--accent-amber)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', font: 'inherit' }}>
              Need an exact measurement first? Request Free Estimate
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div>
            <div className="hero-card-frame">
              <div className="hero-card-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#020617',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>Apex Shield Roofing</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Storm-Tested Excellence</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.8125rem' }}>★★★★★ 4.9/5</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>4,800+ Reviews</div>
                  </div>
                </div>
                <div className="hero-img-box">
                  <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop" alt="Professional roofing installation" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)' }}>50+</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Year Warranty</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)' }}>24/7</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Emergency</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)' }}>0%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>APR Financing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
