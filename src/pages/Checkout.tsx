// src/pages/Checkout.tsx
import { useSearchParams } from 'react-router-dom';
import { CheckoutElements } from '@/components/checkout/CheckoutElements';
import { plans, type PlanKey } from '@/lib/config/plans';
import { Container, Section } from '@/components/ui';
import { Header, Footer } from '@/components/layout';

// Type guard for PlanKey
const isValidPlan = (key: string): key is PlanKey => key in plans;

function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const planKey = searchParams.get('plan');

  // Validate plan key using type guard
  if (!planKey || !isValidPlan(planKey)) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">Invalid Plan</h1>
          <p className="text-[var(--color-muted-foreground)]">
            The selected plan is not valid. Please go back and select a valid service.
          </p>
        </div>
      </div>
    );
  }

  const plan = plans[planKey];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="pt-16 md:pt-20">
        <Section className="py-12 md:py-20">
          <Container>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                  {plan.name}
                </h1>
                <p className="text-lg text-[var(--color-muted-foreground)]">{plan.description}</p>
                <div className="mt-4 text-3xl font-bold text-[var(--color-primary)]">
                  ${(plan.price / 100).toFixed(2)} {plan.currency.toUpperCase()}
                </div>
              </div>

              <CheckoutElements planKey={planKey} />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

export default CheckoutPage;
