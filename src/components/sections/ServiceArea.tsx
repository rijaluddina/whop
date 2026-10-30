import { companyConfig } from '../../lib/config/company';
import { Section, Container, Button, Badge, Card, CardContent } from '../ui';

export const ServiceArea = () => {
  const handleCheckArea = () => {
    // Scroll to contact form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Group service areas by region for better display
  const serviceAreas = companyConfig.serviceAreas;

  return (
    <Section id="service-area" variant="default" size="xl">
      <Container size="lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="md" className="mb-4" dot>
            Service Areas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
            Proudly Serving Central Illinois
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We&apos;re local to the area and know the unique roofing challenges our Illinois climate
            brings. Check if we serve your community below.
          </p>
        </div>

        {/* Map Placeholder / Visual */}
        <div className="relative mb-12 rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="aspect-video relative">
            {/* Map placeholder - in production, this would be an interactive map */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5">
              <div className="text-center p-8">
                <svg
                  className="w-16 h-16 mx-auto text-[var(--color-primary)]/30 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">Interactive Service Area Map</p>
                <p className="text-gray-400 text-sm mt-1">Click cities below to verify coverage</p>
              </div>
            </div>

            {/* City markers overlay - simplified for demo */}
            <div className="absolute inset-0 pointer-events-none">
              {serviceAreas.map((area, index) => (
                <div
                  key={area}
                  className="absolute"
                  style={{
                    top: `${20 + (index % 3) * 25}%`,
                    left: `${15 + Math.floor(index / 3) * 30}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Badge
                    variant="primary"
                    size="sm"
                    className="cursor-pointer hover:scale-105 transition-transform pointer-events-auto"
                    onClick={handleCheckArea}
                  >
                    {area}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* City List Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Cities We Serve</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {serviceAreas.map((area) => (
              <button
                key={area}
                onClick={handleCheckArea}
                className="group px-5 py-4 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                aria-label={`Check service availability in ${area}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                    <svg
                      className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                    {area}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <Card variant="outlined" padding="lg" className="max-w-2xl mx-auto">
          <CardContent className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Don&apos;t See Your City?</h3>
            <p className="text-gray-600 mb-6">
              We frequently expand our service area. Contact us to check if we can serve your
              location or to request service in a new area.
            </p>
            <Button variant="primary" size="lg" onClick={handleCheckArea}>
              Check My Address
            </Button>
          </CardContent>
        </Card>

        {/* Coverage note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Service radius extends approximately 50 miles from Springfield, IL. Additional travel fees
          may apply for locations beyond our core service area.
        </p>
      </Container>
    </Section>
  );
};

ServiceArea.displayName = 'ServiceArea';
