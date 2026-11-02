
import { businessConfig } from '../../lib/config/business';

interface HeaderProps {
  onOpenCheckout: (plan: any) => void;
  onOpenInvoicesDemo: () => void;
  onScrollTo: (id: string) => void;
}

export const Header = ({ onOpenCheckout, onOpenInvoicesDemo, onScrollTo }: HeaderProps) => {
  return (
    <>
      <div className="top-emergency-bar">
        <div className="top-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              24/7 Storm Response • Emergency Hotline
            </span>
            <a href="tel:8005559119" style={{ color: 'inherit', textDecoration: 'none' }}>(800) 555-9119</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenInvoicesDemo} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>Deposit → Final Invoice</button>
            <a href="tel:800555ROOF" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              (800) 555-ROOF
            </a>
          </div>
        </div>
      </div>

      <header className="main-navbar">
        <div className="navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#020617',
                fontWeight: 900,
              }}
            >
              AS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', lineHeight: 1 }}>Apex Shield Roofing</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Certified Contractors • Lifetime Protection</span>
            </div>
          </div>

          <nav className="nav-links">
            <button onClick={() => onScrollTo('services')} className="nav-link">Services</button>
            <button onClick={() => onScrollTo('plans')} className="nav-link">Fixed Plans & Pricing</button>
            <button onClick={() => onScrollTo('financing')} className="nav-link">0% APR Financing</button>
            <button onClick={() => onScrollTo('service-area')} className="nav-link">Service Area</button>
            <button onClick={() => onScrollTo('reviews')} className="nav-link">Reviews</button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => onScrollTo('contact')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Free Estimate
            </button>
            <button onClick={() => onOpenCheckout({ type: 'inspection', name: '21-Point Drone & Attic Roof Inspection', price: 149, tag: 'INSPECTION', tagline: 'Certified Drone & Hail Inspections', details: ['High-resolution drone imagery', 'Attic & ventilation inspection', '21-point checklist', 'Insurance-ready PDF report'], depositTerms: null, planId: businessConfig.plans.inspection.whopPlanId })} className="btn btn-primary btn-sm">
              Book Drone Inspection ($149)
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
