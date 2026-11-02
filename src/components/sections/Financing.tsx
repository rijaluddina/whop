interface FinancingProps {
  onOpenCheckout: (plan: any) => void;
  onScrollTo: (id: string) => void;
}

export const Financing = ({ onScrollTo }: any) => {
  return (
    <section className="section section-alt" id="financing">
      <div className="container">
        <div className="section-header">
          <div className="section-pill emerald">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Flexible Payments
          </div>
          <h2 className="section-title">0% APR Financing Up To 18 Months</h2>
          <p className="section-subtitle">
            Preserve cash flow for your home. Get approved in minutes with transparent terms — no hidden fees.
          </p>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { title: 'Klarna', desc: 'Pay in 4 or monthly' },
                { title: 'Splitit', desc: 'Use existing credit card' },
                { title: 'Afterpay', desc: '4 interest-free installments' },
                { title: 'Apple Pay / Google Pay', desc: 'Fast & secure checkout' },
              ].map((item) => (
                <div key={item.title} className="plan-card" style={{ padding: '1.25rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="plan-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Highlights</h3>
              <ul className="plan-features-list">
                {[
                  'Flexible split payments with Klarna, Splitit, and Afterpay natively at checkout',
                  'Pay 1/3 or 1/4 upfront, or spread over 12-60 low-interest monthly payments',
                  'No penalty for early payoff on full roof replacements',
                  'Insurance deductible financing options available',
                ].map((item) => (
                  <li key={item} className="plan-feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onScrollTo('contact')} className="btn btn-primary">
                Lock In $500 Deposit With 0% Financing
              </button>
            </div>
          </div>

          <div className="plan-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Roofing Payment Estimator</h3>
              <span style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.875rem' }}>Estimate Only</span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Project Amount</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>$8,500</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ea580c)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Pay in 4 (Klarna)', amount: '$2,125' },
                { label: '18 Mos (0% APR)', amount: '$472/mo' },
                { label: '36 Mos (Low APR)', amount: '$272/mo' },
              ].map((option) => (
                <button key={option.label} className="btn btn-secondary" style={{ flexDirection: 'column', padding: '0.875rem', alignItems: 'flex-start', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.8125rem' }}>{option.label}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800 }}>{option.amount}</span>
                </button>
              ))}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Terms shown are examples. Final terms are determined at checkout based on credit approval and provider availability.
            </p>

            <button onClick={() => onScrollTo('contact')} className="btn btn-primary btn-block">
              Get Exact Quote
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
