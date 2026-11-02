interface FooterProps {
  onScrollTo: (id: string) => void;
  onOpenInvoicesDemo: () => void;
}

export const Footer = ({ onScrollTo, onOpenInvoicesDemo }: FooterProps) => {
  return (
    <footer className="footer-dark">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
              <div>
                <div className="footer-brand">Apex Shield Roofing</div>
                <div style={{ fontSize: '0.8125rem' }}>Certified Contractors • Lifetime Protection</div>
              </div>
            </div>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Certified commercial and residential roofing contractors serving the Dallas-Fort Worth Metroplex with storm-tested craftsmanship and industry-leading warranties.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>★★★★★ 4.9/5</div>
              <div>• 4,800+ Homeowners</div>
            </div>
          </div>

          <div>
            <div className="footer-heading">NAVIGATION</div>
            <button onClick={() => onScrollTo('home')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Home Overview</button>
            <button onClick={() => onScrollTo('services')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Roofing Services</button>
            <button onClick={() => onScrollTo('plans')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Fixed Pricing & Deposits</button>
            <button onClick={() => onScrollTo('financing')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>0% APR Financing (Klarna)</button>
            <button onClick={() => onScrollTo('service-area')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Service Area Radius</button>
            <button onClick={() => onScrollTo('reviews')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Client Reviews</button>
          </div>

          <div>
            <div className="footer-heading">PAYMENTS & FINANCING</div>
            <button onClick={onOpenInvoicesDemo} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>→ Final balance invoice</button>
            <button onClick={() => onScrollTo('plans')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Book Drone Inspection ($149)</button>
            <button onClick={() => onScrollTo('plans')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Project Deposit ($500)</button>
            <button onClick={() => onScrollTo('financing')} className="footer-link" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', font: 'inherit' }}>Financing Options</button>
          </div>

          <div>
            <div className="footer-heading">DIRECT DISPATCH</div>
            <a href="tel:800555ROOF" className="footer-link">(800) 555-ROOF</a>
            <a href="tel:8005559119" className="footer-link">Emergency: (800) 555-9119</a>
            <a href="mailto:contact@apexshieldroofing.com" className="footer-link">contact@apexshieldroofing.com</a>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem' }}>
              <div>TX-RC-889421A</div>
              <div>$2,000,000 General Liability</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            © 2026 Apex Shield Roofing & Exteriors. All rights reserved. • Built for storm season. • Privacy Policy • Terms of Service
          </div>
        </div>
      </div>
    </footer>
  );
};
