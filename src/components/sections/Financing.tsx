import { Section, Container, Button, Card, CardContent, Badge } from '../ui';
import { scrollToContact } from '../../lib/utils/navigation';

const paymentFeatures = [
  {
    title: 'Flexible Financing (BNPL)',
    mark: 'BNPL',
    tag: 'Klarna • Splitit • Afterpay',
    description:
      'High-ticket roofing projects made accessible. Financing and split-payment options surface automatically at Whop checkout for approved customers.',
  },
  {
    title: 'Express Checkout',
    mark: '⚡',
    tag: 'Apple Pay • Google Pay',
    description:
      'Frictionless one-click mobile payments with native Apple Pay and Google Pay integration via Whop Express Checkout Element.',
  },
  {
    title: 'Card-on-File Deposit',
    mark: '🛡️',
    tag: 'Setup Intent • Stored Method',
    description:
      'Lock in your roofing schedule with a low initial deposit. Your payment method is securely saved to bill the final balance upon completion.',
  },
];

export const Financing = () => (
  <Section id="financing" variant="alternate" size="xl" className="relative overflow-hidden">
    <div
      className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[var(--color-secondary)]/10 to-transparent rounded-bl-3xl"
      aria-hidden="true"
    />
    <Container size="lg" className="relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="primary" size="md" className="mb-4" dot>
          Financing & Payments
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
          Flexible Financing & Secure Whop Payments
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Roofing is a high-ticket investment. We use Whop Payments so you can choose from flexible
          monthly financing (Klarna, Afterpay, Splitit), instant digital wallets, or secure
          card-on-file deposits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {paymentFeatures.map((item) => (
          <Card
            key={item.title}
            variant="elevated"
            padding="lg"
            className="text-center h-full transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <CardContent>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-xl">
                {item.mark}
              </div>
              <p className="text-xs font-semibold text-[var(--color-secondary)] uppercase tracking-wider mb-2">
                {item.tag}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => scrollToContact()}
          className="min-w-[200px]"
        >
          Request Financing & Estimate
        </Button>
      </div>
    </Container>
  </Section>
);

Financing.displayName = 'Financing';
