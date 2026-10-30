// src/pages/CheckoutSuccess.tsx
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Section,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Badge,
} from '@/components/ui';
import { Header, Footer } from '@/components/layout';
import { plans, type PlanKey } from '@/lib/config/plans';

function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const paymentId = searchParams.get('payment_id');
  const setupIntentId = searchParams.get('setup_intent_id');

  const isSetupIntent = !!setupIntentId;
  const referenceId = paymentId || setupIntentId;

  const planKey = plan as PlanKey | null;
  const planName = planKey && plans[planKey] ? plans[planKey].name : 'Service';

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="pt-16 md:pt-20">
        <Section className="py-12 md:py-20">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-6">
                  <svg
                    className="w-8 h-8"
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
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                  {isSetupIntent ? 'Card Saved for Final Payment' : 'Payment Successful'}
                </h1>
                <p className="text-lg text-[var(--color-muted-foreground)]">
                  {isSetupIntent
                    ? 'Your payment method has been securely saved. The deposit is applied and the final balance will be charged upon project completion.'
                    : 'Your payment has been processed successfully.'}
                </p>
              </div>

              <Card className="mx-auto max-w-md">
                <CardHeader>
                  <CardTitle className="text-xl">{planName}</CardTitle>
                  <CardDescription>Order confirmation details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">Status</span>
                    <Badge variant="success">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">Reference ID</span>
                    <span className="font-mono text-[var(--color-foreground)]">
                      {referenceId || 'N/A'}
                    </span>
                  </div>
                  {setupIntentId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-muted-foreground)]">Setup Intent</span>
                      <span className="font-mono text-[var(--color-foreground)]">
                        {setupIntentId}
                      </span>
                    </div>
                  )}
                  {paymentId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-muted-foreground)]">Payment ID</span>
                      <span className="font-mono text-[var(--color-foreground)]">{paymentId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 text-sm text-[var(--color-muted-foreground)]">
                <p>
                  {isSetupIntent
                    ? "Your card is saved for the final payment. We'll reach out shortly to schedule your project."
                    : "A confirmation email has been sent. We'll be in touch soon to discuss next steps."}
                </p>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

export default CheckoutSuccessPage;
