import { companyConfig } from '../../lib/config/company';
import { Button, Section, Badge, Container } from '../ui';
import { scrollToContact } from '../../lib/utils/navigation';

export const Hero = () => {
  const handleGetEstimate = () => {
    scrollToContact();
  };

  const handleScheduleInspection = () => {
    scrollToContact('inspection');
  };

  return (
    <Section
      id="home"
      variant="default"
      size="xl"
      fullWidth
      className="relative min-h-[90vh] flex items-center"
    >
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[var(--color-primary)]/95">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)]/90 to-[var(--color-secondary)]/20" />
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <Container size="lg" className="relative z-10 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badges row - above headline */}
          <div
            className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8"
            role="list"
            aria-label="Trust indicators"
          >
            {companyConfig.trustBadges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                size="md"
                role="listitem"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
              >
                {badge}
              </Badge>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {companyConfig.name}
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {companyConfig.tagline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGetEstimate}
              className="w-full sm:w-auto min-w-[200px]"
            >
              Get Free Estimate
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleScheduleInspection}
              className="w-full sm:w-auto min-w-[200px] border-white text-white hover:bg-white/10 focus:ring-white"
            >
              Schedule Inspection
            </Button>
          </div>

          {/* Phone CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-[var(--color-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                href={`tel:${companyConfig.phone}`}
                className="text-lg font-medium hover:text-[var(--color-secondary)] transition-colors"
              >
                {companyConfig.phone}
              </a>
            </div>
            <span className="hidden sm:inline text-white/40">|</span>
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-[var(--color-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href={`mailto:${companyConfig.email}`}
                className="text-lg font-medium hover:text-[var(--color-secondary)] transition-colors"
              >
                {companyConfig.email}
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        aria-hidden="true"
      >
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </Section>
  );
};

Hero.displayName = 'Hero';
