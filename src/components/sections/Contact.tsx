export const Contact = () => {
  return (
    <section className="section section-dark" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Get Started
          </div>
          <h2 className="section-title">Request Your Free Comprehensive Estimate</h2>
          <p className="section-subtitle">
            No obligation. We'll inspect, document, and provide a detailed written estimate within 24-48 hours.
          </p>
        </div>

        <div className="grid-2">
          <div className="plan-card">
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Property Owner Full Name *</label>
                  <input type="text" placeholder="Marcus Vance" style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Email Address *</label>
                  <input type="email" placeholder="marcus.homeowner@example.com" style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Phone Number *</label>
                  <input type="tel" placeholder="(214) 555-0182" style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Postal Zip Code *</label>
                  <input type="text" placeholder="75201" style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Street Address</label>
                <input type="text" placeholder="742 Evergreen Ridge Rd" style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Primary Service Needed</label>
                  <select style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                    <option>Complete Roof Replacement</option>
                    <option>Emergency Roof & Leak Repair</option>
                    <option>Certified Drone & Hail Inspections</option>
                    <option>Seamless Gutters & Architectural Flashing</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Estimated Roof Age</label>
                  <select style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                    <option>0-5 years (Newer)</option>
                    <option>6-10 years (Mid-life)</option>
                    <option>11-15 years (Wear starting)</option>
                    <option>16-20+ years (Replacement ready)</option>
                    <option>I don't know</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Project Details / Storm Damage Notes</label>
                <textarea rows={4} placeholder="Wind lifted several shingles on the west slope during last week's thunderstorm." style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                I have an open insurance claim or want help with insurance adjuster review
              </label>
              <button type="button" className="btn btn-primary btn-block">Submit Estimate Request</button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="plan-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Direct Dispatch</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="tel:800555ROOF" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>(800) 555-ROOF</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Sales & Estimates</div>
                  </div>
                </a>
                <a href="tel:8005559119" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>(800) 555-9119</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>24/7 Emergency Hotline</div>
                  </div>
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>contact@apexshieldroofing.com</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Email Inquiries</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="plan-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Office & Credentials</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Address</div>
                  <div>4500 Ridgeview Blvd, Suite 200, Dallas, TX 75201</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>License</div>
                  <div>TX-RC-889421A</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Insurance</div>
                  <div>$2,000,000 General Liability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
