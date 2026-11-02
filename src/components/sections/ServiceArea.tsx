interface ServiceAreaProps {
  onScrollTo: (id: string) => void;
}

const areas = ['75201', '75024', '76092', '75093', '75070', '76109', '75034', '76051'];

export const ServiceArea = () => {
  return (
    <section className="section section-dark" id="service-area">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Service Area
          </div>
          <h2 className="section-title">Dallas-Fort Worth Metroplex & Surrounding Counties</h2>
          <p className="section-subtitle">
            Rapid dispatch for storm damage, inspections, and repairs. Enter your ZIP code to check availability.
          </p>
        </div>

        <div className="grid-2">
          <div className="plan-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>FEATURED MUNICIPALITIES WITH SAME-DAY RESPONSE</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {areas.map((zip) => (
                <button key={zip} className="btn btn-secondary btn-sm">
                  {zip}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="e.g. 75201 or 75024"
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  background: 'var(--bg-darkest)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.75rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
              />
              <button className="btn btn-primary">Verify Zip</button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Coverage includes Dallas, Tarrant, Collin, Denton, Rockwall, and Ellis counties with priority routing during storm events.
            </p>
          </div>

          <div className="plan-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '400px', background: 'linear-gradient(135deg, #1e293b, #020617)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', background: 'rgba(2, 6, 23, 0.9)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700 }}>Apex Shield Service Territory</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>60-mile radius from Dallas HQ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
