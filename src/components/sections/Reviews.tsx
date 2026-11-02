interface ReviewsProps {
  onScrollTo: (id: string) => void;
}

const reviews = [
  {
    name: 'Marcus Vance',
    location: 'Dallas, TX',
    rating: 5,
    text: 'Apex Shield handled our storm damage claim flawlessly. The drone inspection was incredibly detailed and they walked us through every step with our insurance adjuster.',
  },
  {
    name: 'Elena Rostova',
    location: 'Plano, TX',
    rating: 5,
    text: 'Top-tier workmanship. Crew arrived on time, cleaned up daily, and the new roof looks absolutely stunning. The 50-year warranty gives us peace of mind.',
  },
  {
    name: 'David & Sarah Chen',
    location: 'Southlake, TX',
    rating: 5,
    text: "Used the deposit system and it was seamless. Financing options made it affordable. Best roofing experience we've ever had. Highly recommend!",
  },
];

const badges = [
  { title: 'GAF Master Elite®', subtitle: 'Top 2% of Contractors' },
  { title: 'Owens Corning Platinum Preferred', subtitle: 'Elite Certification' },
  { title: 'BBB Accredited A+', subtitle: 'Since 2018' },
  { title: 'CertainTeed Select ShingleMaster™', subtitle: 'Certified Excellence' },
];

export const Reviews = () => {
  return (
    <section className="section section-alt" id="reviews">
      <div className="container">
        <div className="section-header">
          <div className="section-pill emerald">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Customer Satisfaction
          </div>
          <h2 className="section-title">Trusted by Over 4,800 Homeowners</h2>
          <p className="section-subtitle">Real reviews from North Texas families who chose Apex Shield Roofing.</p>
        </div>

        <div className="grid-4" style={{ marginBottom: '3rem' }}>
          {badges.map((badge) => (
            <div key={badge.title} className="plan-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>{badge.title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{badge.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="grid-3">
          {reviews.map((review) => (
            <div key={review.name} className="plan-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[...Array(review.rating)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-amber)">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>"{review.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#020617',
                    fontWeight: 800,
                  }}
                >
                  {review.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{review.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{review.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
