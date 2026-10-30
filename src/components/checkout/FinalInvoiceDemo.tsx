// src/components/checkout/FinalInvoiceDemo.tsx
import { useState } from 'react';
import {
  Container,
  Section,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
} from '@/components/ui';
import { Header, Footer } from '@/components/layout';
import { plans } from '@/lib/config/plans';
import { companyConfig } from '@/lib/config/company';

interface FinalInvoiceDemoProps {
  /** Pre-filled customer email for demo */
  customerEmail?: string;
  /** Pre-filled payment method ID from deposit setup intent */
  paymentMethodId?: string;
  /** Project ID for tracking */
  projectId?: string;
}

export function FinalInvoiceDemo({
  customerEmail = 'demo@example.com',
  paymentMethodId = 'pm_demo_12345',
  projectId = 'proj_demo_001',
}: FinalInvoiceDemoProps) {
  const [email, setEmail] = useState(customerEmail);
  const [pmId, setPmId] = useState(paymentMethodId);
  const [projId, setProjId] = useState(projectId);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    invoice?: Record<string, unknown> | string;
  } | null>(null);

  const depositAmount = plans.deposit.price; // 50000 cents = $500
  const totalAmount = plans.flatRate.price; // 250000 cents = $2500
  const remainingBalance = totalAmount - depositAmount; // 200000 cents = $2000

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleCreateInvoice = async () => {
    if (!email || !pmId || !projId) {
      setResult({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/invoices/create-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          paymentMethodId: pmId,
          depositAmount,
          totalAmount,
          projectId: projId,
        }),
      });

      const data: {
        message?: string;
        invoice?: Record<string, unknown> | string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create final invoice');
      }

      setResult({
        success: true,
        message:
          'Final invoice created successfully! The remaining balance has been charged to the saved card.',
        invoice: data.invoice,
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

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
                  Final Invoice Demo
                </h1>
                <p className="text-lg text-[var(--color-muted-foreground)]">
                  Create a final invoice and charge the saved card-on-file for the remaining balance
                </p>
                <Badge variant="warning" className="mt-4 inline-block text-sm">
                  Demo Mode - For Screen Recording
                </Badge>
              </div>

              {/* Invoice Summary */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {companyConfig.name} - Final Invoice Preview
                      </CardTitle>
                      <CardDescription>Project balance after deposit</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Breakdown */}
                  <div className="border-t border-[var(--color-border)] pt-6">
                    <h3 className="font-semibold text-[var(--color-foreground)] mb-4">
                      Payment Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-muted-foreground)]">
                          Project Total ({plans.flatRate.name})
                        </span>
                        <span className="font-medium text-[var(--color-foreground)]">
                          {formatAmount(totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-muted-foreground)]">
                          Deposit Paid ({plans.deposit.name})
                        </span>
                        <span className="font-medium text-[var(--color-success)]">
                          - {formatAmount(depositAmount)}
                        </span>
                      </div>
                      <div className="border-t border-[var(--color-border)] pt-3">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span className="text-[var(--color-foreground)]">Balance Due</span>
                          <span className="text-[var(--color-primary)]">
                            {formatAmount(remainingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card on File Info */}
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
                        <p className="font-medium text-[var(--color-primary)]">
                          Card-on-File Payment
                        </p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          The remaining balance of <strong>{formatAmount(remainingBalance)}</strong>{' '}
                          will be automatically charged to the saved payment method from the
                          deposit.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Form */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Demo Configuration</CardTitle>
                  <CardDescription>
                    Adjust values to test different scenarios (pre-filled with demo defaults)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                    >
                      Customer Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="paymentMethodId"
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                    >
                      Payment Method ID (from deposit setup intent)
                    </label>
                    <Input
                      id="paymentMethodId"
                      type="text"
                      value={pmId}
                      onChange={(e) => setPmId(e.target.value)}
                      placeholder="pm_xxxxxxxxxxxxx"
                      className="w-full font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="projectId"
                      className="block text-sm font-medium text-[var(--color-foreground)] mb-2"
                    >
                      Project ID
                    </label>
                    <Input
                      id="projectId"
                      type="text"
                      value={projId}
                      onChange={(e) => setProjId(e.target.value)}
                      placeholder="proj_xxxxx"
                      className="w-full font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Trigger Final Invoice</CardTitle>
                  <CardDescription>
                    This will create the invoice and automatically charge the saved card
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                      Amount to Charge:{' '}
                      <span className="text-[var(--color-primary)]">
                        {formatAmount(remainingBalance)}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Uses payment method: <code className="font-mono text-xs">{pmId}</code>
                    </p>
                  </div>

                  <Button
                    className="w-full py-4 text-lg"
                    size="lg"
                    onClick={() => void handleCreateInvoice()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="mr-2 h-5 w-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating Invoice...
                      </>
                    ) : (
                      `Create Final Invoice & Charge Card (${formatAmount(remainingBalance)})`
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset Demo
                  </Button>

                  <p className="text-center text-sm text-[var(--color-muted-foreground)]">
                    By clicking above, you authorize {companyConfig.name} to charge the saved
                    payment method for the remaining project balance.
                  </p>
                </CardContent>
              </Card>

              {/* Result Display */}
              {result && (
                <Card
                  className={`mt-8 ${result.success ? 'border-[var(--color-success)]' : 'border-[var(--color-destructive)]'}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {result.success ? 'Success' : 'Error'}
                      </CardTitle>
                      <Badge variant={result.success ? 'success' : 'danger'}>
                        {result.success ? 'Completed' : 'Failed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p
                      className={
                        result.success
                          ? 'text-[var(--color-success)]'
                          : 'text-[var(--color-destructive)]'
                      }
                    >
                      {result.message}
                    </p>
                    {result.invoice && (
                      <div className="p-4 bg-[var(--color-muted)]/50 rounded-lg overflow-x-auto">
                        <pre className="font-mono text-sm text-[var(--color-foreground)]">
                          {typeof result.invoice === 'string'
                            ? result.invoice
                            : JSON.stringify(result.invoice as object, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

export default FinalInvoiceDemo;
