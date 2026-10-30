// src/pages/InvoicePayment.tsx
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
  Button,
} from '@/components/ui';
import { Header, Footer } from '@/components/layout';
import { plans, type PlanKey } from '@/lib/config/plans';
import { companyConfig } from '@/lib/config/company';

function InvoicePaymentPage() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const paymentId = searchParams.get('payment_id');
  const invoiceId = searchParams.get('invoice_id');
  const amount = searchParams.get('amount');

  const planKey = plan as PlanKey | null;
  const planName = planKey && plans[planKey] ? plans[planKey].name : 'Project Balance';

  // Format amount from cents to dollars
  const formattedAmount = amount ? `$${(parseInt(amount, 10) / 100).toFixed(2)}` : '$0.00';

  // Calculate deposit amount (assuming 50% deposit for demo)
  const totalAmount = amount ? parseInt(amount, 10) : 250000; // Default to flat rate price
  const depositAmount = Math.round(totalAmount * 0.5);
  const balanceAmount = totalAmount - depositAmount;
  const formattedDeposit = `$${(depositAmount / 100).toFixed(2)}`;
  const formattedBalance = `$${(balanceAmount / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="pt-16 md:pt-20">
        <Section className="py-12 md:py-20">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                  Final Payment Due
                </h1>
                <p className="text-lg text-[var(--color-muted-foreground)]">
                  Complete your project balance for <strong>{planName}</strong>
                </p>
              </div>

              {/* Invoice Summary Card */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{companyConfig.name} - Invoice</CardTitle>
                      <CardDescription>Final balance for your roofing project</CardDescription>
                    </div>
                    <Badge variant="warning" size="lg" dot>
                      Balance Due
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Details */}
                  <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="font-semibold text-[var(--color-foreground)] mb-4">
                      Project Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--color-muted-foreground)]">Service</p>
                        <p className="font-medium text-[var(--color-foreground)]">{planName}</p>
                      </div>
                      <div>
                        <p className="text-[var(--color-muted-foreground)]">Invoice #</p>
                        <p className="font-mono text-[var(--color-foreground)]">
                          {invoiceId || 'INV-XXXXXX'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--color-muted-foreground)]">Original Payment</p>
                        <p className="font-mono text-[var(--color-foreground)]">
                          {paymentId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--color-muted-foreground)]">Date</p>
                        <p className="text-[var(--color-foreground)]">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="font-semibold text-[var(--color-foreground)] mb-4">
                      Payment Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-muted-foreground)]">Project Total</span>
                        <span className="font-medium text-[var(--color-foreground)]">
                          {formattedAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-muted-foreground)]">
                          Deposit Paid (50%)
                        </span>
                        <span className="font-medium text-[var(--color-success)]">
                          - {formattedDeposit}
                        </span>
                      </div>
                      <div className="border-t border-[var(--color-border)] pt-3">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span className="text-[var(--color-foreground)]">Balance Due</span>
                          <span className="text-[var(--color-primary)]">{formattedBalance}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Info Notice */}
                  <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-[var(--color-primary)]">Deposit Applied</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          Your project deposit of <strong>{formattedDeposit}</strong> has been
                          secured and applied to this invoice. The remaining balance of{' '}
                          <strong>{formattedBalance}</strong> is due before project completion.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Complete Payment</CardTitle>
                  <CardDescription>
                    Securely pay your remaining balance to schedule your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                      Amount Due:{' '}
                      <span className="text-[var(--color-primary)]">{formattedBalance}</span>
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Your saved payment method will be charged for the final balance
                    </p>
                  </div>

                  <Button
                    className="w-full py-4 text-lg"
                    size="lg"
                    onClick={() => {
                      // In a real implementation, this would trigger the final payment
                      alert('Demo: This would redirect to Whop Checkout for final payment');
                    }}
                  >
                    Pay Final Balance ({formattedBalance})
                  </Button>

                  <p className="text-center text-sm text-[var(--color-muted-foreground)]">
                    By clicking above, you authorize {companyConfig.name} to charge your saved
                    payment method for the remaining project balance.
                  </p>

                  <div className="border-t border-[var(--color-border)] pt-4">
                    <p className="text-sm text-[var(--color-muted-foreground)] text-center">
                      Questions? Contact us at{' '}
                      <a
                        href={`tel:${companyConfig.phone}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {companyConfig.phone}
                      </a>{' '}
                      or{' '}
                      <a
                        href={`mailto:${companyConfig.email}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {companyConfig.email}
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

export default InvoicePaymentPage;
