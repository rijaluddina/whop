import { Section, Container, Button, Card, CardContent } from '../ui';
import { scrollToContact } from '../../lib/utils/navigation';

const methods = [
  { name: 'Card', mark: '•••', description: 'Pay securely with a supported credit or debit card.' },
  { name: 'Apple Pay', mark: ' Pay', description: 'Appears when Apple Pay is supported for your checkout session.' },
  { name: 'Google Pay', mark: 'G Pay', description: 'Appears when Google Pay is supported for your checkout session.' },
];

export const Financing = () => (
  <Section id="financing" variant="alternate" size="xl" className="relative overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[var(--color-secondary)]/10 to-transparent rounded-bl-3xl" aria-hidden="true" />
    <Container size="lg" className="relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
          <span className="font-semibold">Secure checkout by Whop</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">Simple, secure ways to pay</h2>
        <p className="text-lg text-gray-600 leading-relaxed">Choose from the payment methods available for your plan. Whop shows the options supported by your device, browser, and region at checkout.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {methods.map((method) => (
          <Card key={method.name} variant="elevated" padding="lg" className="text-center h-full transition-all hover:shadow-xl">
            <CardContent>
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-lg">{method.mark}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-gray-600">{method.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <Button variant="primary" size="lg" onClick={() => scrollToContact()} className="min-w-[200px]">Get a Free Estimate</Button>
      </div>
    </Container>
  </Section>
);

Financing.displayName = 'Financing';
