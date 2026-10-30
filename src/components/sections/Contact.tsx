// src/components/sections/Contact.tsx
import { companyConfig } from '../../lib/config/company';
import { EstimateForm } from '../forms';
import { Section, Container, Badge } from '../ui';

export const Contact = () => {
  // Contact info from companyConfig
  const contactInfo = [
    {
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      label: 'Phone',
      value: companyConfig.phone,
      href: `tel:${companyConfig.phone}`,
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      label: 'Email',
      value: companyConfig.email,
      href: `mailto:${companyConfig.email}`,
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      label: 'Address',
      value: companyConfig.address,
      href: '#',
    },
  ];

  return (
    <Section id="contact" variant="alternate" size="xl">
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Info */}
          <div className="lg:sticky lg:top-24">
            <Badge variant="primary" size="md" className="mb-4" dot>
              Get Your Free Estimate
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Fill out the form and we&apos;ll contact you within 24 hours to schedule your free,
              no-obligation roof inspection and estimate.
            </p>

            {/* Contact Info Cards */}
            <div className="space-y-4 mb-8">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <a
                      href={item.href}
                      className="font-medium text-gray-900 hover:text-[var(--color-primary)] transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators from companyConfig */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose Us?</h3>
              <div className="grid grid-cols-2 gap-3">
                {companyConfig.trustBadges.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-[var(--color-success)] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <EstimateForm />
          </div>
        </div>
      </Container>
    </Section>
  );
};

Contact.displayName = 'Contact';
