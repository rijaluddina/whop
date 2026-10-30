import { Section, Container, Button, Card, CardContent } from '../ui';
import { financingIcons, type FinancingPartnerName } from '../icons/financingIconsMap';
import { scrollToContact } from '../../lib/utils/navigation';

export const Financing = () => {
  const handleGetEstimate = () => {
    scrollToContact();
  };

  type FinancingOption = {
    name: FinancingPartnerName;
    description: string;
  };

  const financingOptions: FinancingOption[] = [
    {
      name: 'Klarna',
      description: 'Pay in 4 interest-free installments or monthly financing',
    },
    {
      name: 'Splitit',
      description: 'Split payments over time using your existing credit card',
    },
    {
      name: 'Afterpay',
      description: 'Shop now, pay later in 4 interest-free payments',
    },
  ];

  const benefits = [
    'No hard credit check for pre-qualification',
    'Flexible terms from 6 to 60 months',
    'Competitive APR starting at 0%',
    'Quick online approval in minutes',
    'No prepayment penalties',
    'Apply directly at checkout',
  ];

  return (
    <Section id="financing" variant="alternate" size="xl" className="relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[var(--color-secondary)]/10 to-transparent rounded-bl-3xl"
        aria-hidden="true"
      />

      <Container size="lg" className="relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] mb-4">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Financing Available</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
            Flexible Payment Options for Your Roofing Project
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Don&apos;t let budget concerns delay critical roof repairs. We&apos;ve partnered with
            leading financing providers to offer flexible payment plans that fit your budget.
          </p>
        </div>

        {/* Financing Partners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {financingOptions.map((option) => {
            const Icon = financingIcons[option.name];
            return (
              <Card
                key={option.name}
                variant="elevated"
                padding="lg"
                className="text-center h-full transition-all hover:shadow-xl"
              >
                <CardContent>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Icon />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.name}</h3>
                  <p className="text-gray-600">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <div className="w-6 h-6 flex-shrink-0 mt-0.5 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--color-success)]"
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
              </div>
              <p className="text-gray-700 font-medium">{benefit}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <Card variant="outlined" padding="lg" className="mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
              How Financing Works
            </h3>
            <p className="text-gray-600">Simple 3-step process to get your project funded</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Get an Estimate',
                description: 'Request a free, no-obligation estimate for your roofing project.',
              },
              {
                step: '02',
                title: 'Choose a Plan',
                description:
                  'Select from multiple financing options at checkout with instant approval.',
              },
              {
                step: '03',
                title: 'Start Your Project',
                description:
                  'Schedule your roofing work with flexible payments that fit your budget.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {item.step}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Ready to explore financing for your roofing project? Get started with a free estimate.
          </p>
          <Button variant="primary" size="lg" onClick={handleGetEstimate} className="min-w-[200px]">
            Get Free Estimate
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-gray-500 mt-8 max-w-2xl mx-auto">
          Financing options provided through Whop Payments partners. Terms and conditions apply.
          Subject to credit approval. Not all applicants will qualify for the lowest rates.
        </p>
      </Container>
    </Section>
  );
};

Financing.displayName = 'Financing';
