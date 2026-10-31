import { plans } from '../../lib/config/plans';
import { businessConfig, formatBusinessCurrency } from '../../lib/config/business';
import { navigateToCheckout, scrollToContact } from '../../lib/utils/navigation';

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Section,
  Container,
  Badge,
} from '../ui';

interface ServiceCardProps {
  title: string;
  description: string;
  features: readonly string[];
  price: number;
  planKey: keyof typeof plans;
  icon: React.ReactNode;
  onClick?: () => void;
}

const ServiceCard = ({
  title,
  description,
  features,
  price,
  planKey,
  icon,
  onClick,
}: ServiceCardProps) => {
  const plan = plans[planKey];

  const handleClick = () => {
    onClick?.();
  };

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="h-full transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <CardHeader>
        <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3" role="list">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-600">
              <svg
                className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5"
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
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            {formatBusinessCurrency(price)}
          </span>
          <Badge variant="primary" size="sm">
            {plan.type === 'one_time' ? 'One-time' : 'Recurring'}
          </Badge>
        </div>
        <Button
          variant="primary"
          className="w-full"
          onClick={handleClick}
          aria-label={`Learn more about ${title}`}
        >
          {planKey === 'inspection'
            ? 'Schedule Inspection'
            : planKey === 'deposit'
              ? 'Start Project'
              : 'Book Service'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Derive service data from plans config
// This ensures price/description/features stay in sync with the single source of truth
const createServiceData = () => {
  const repairPlan = plans.deposit;
  const replacementPlan = plans.replacement;
  const inspectionPlan = plans.inspection;
  const services = businessConfig.services;

  return [
    {
      id: 'repair',
      ...services.repair,
      price: repairPlan.price, // From plans config
      planKey: 'deposit' as const,
      icon: (
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      ),
      onClick: () => navigateToCheckout('deposit'),
    },
    {
      id: 'replacement',
      ...services.replacement,
      price: replacementPlan.price, // From plans config
      planKey: 'replacement' as const,
      icon: (
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
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      onClick: () => navigateToCheckout('replacement'),
    },
    {
      id: 'inspection',
      ...services.inspection,
      price: inspectionPlan.price, // From plans config
      planKey: 'inspection' as const,
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      onClick: () => navigateToCheckout('inspection'),
    },
  ];
};

export const Services = () => {
  const services = createServiceData();

  return (
    <Section id="services" variant="alternate" size="xl">
      <Container size="lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="md" className="mb-4" dot>
            Our Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
            Comprehensive Roofing Solutions
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            From minor repairs to full replacements, we deliver quality workmanship backed by
            industry-leading warranties. Every project starts with a thorough inspection.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Not sure which service you need? Let us assess your roof at no obligation.
          </p>
          <Button variant="outline" size="lg" onClick={() => scrollToContact('inspection')}>
            Schedule Free Inspection
          </Button>
        </div>
      </Container>
    </Section>
  );
};

Services.displayName = 'Services';
