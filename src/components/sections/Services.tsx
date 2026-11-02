import { trackEvent } from '../../lib/tracking';

interface ServicesProps {
  onOpenCheckout: (plan: any) => void;
  onScrollTo: (id: string) => void;
}

const services = [
  {
    title: 'Complete Roof Replacement',
    description:
      'Architectural shingles, underlayment, ventilation & flashing. Full tear-off with debris removal and site cleanup.',
    price: 'From $8,500',
    badge: 'Popular',
    image:
      'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?q=80&w=1974&auto=format&fit=crop',
  },
  {
    title: 'Emergency Roof & Leak Repair',
    description:
      'Rapid response for storm damage, active leaks, and tarping. Same-day dispatch in the metroplex.',
    price: 'From $399',
    badge: '24/7',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1976&auto=format&fit=crop',
  },
  {
    title: 'Certified Drone & Hail Inspections',
    description:
      '21-point inspection with high-resolution imagery, attic check, and insurance-ready report.',
    price: '$149',
    badge: 'Report Included',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Seamless Gutters & Architectural Flashing',
    description:
      'Custom seamless gutters, downspouts, and precision flashing to protect fascia and foundations.',
    price: 'From $1,250',
    badge: 'Add-On',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
  },
];

export const Services = ({ onScrollTo }: any) => {
  return (
    <section className="section section-dark" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 2 12 5 12 5 22 19 22 19 12 22 12 12 2" />
            </svg>
            Roofing & Architectural Systems
          </div>
          <h2 className="section-title">Storm-Tested Craftsmanship & Warranties</h2>
          <p className="section-subtitle">
            From emergency repairs to full replacements, every job is backed by certified crews and
            industry-leading protection.
          </p>
        </div>

        <div className="grid-3">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <div className="service-card-img">
                <img src={service.image} alt={service.title} />
                <span className="service-badge">{service.badge}</span>
                <span className="service-price-tag">{service.price}</span>
              </div>
              <div className="service-card-body">
                <div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-desc">{service.description}</p>
                </div>
                <button
                  onClick={() => {
                    trackEvent('service_viewed', { service: service.title });
                    onScrollTo('plans');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-amber)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    font: 'inherit',
                    padding: 0,
                  }}
                >
                  View Pricing & Book
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
