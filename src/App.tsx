import { useEffect, useMemo, type CSSProperties } from 'react';
import { loadWhop } from '@whop/elements';
import {
  Checkout as WhopCheckout,
  CheckoutElement,
  Payments,
  BrandingElement,
  WhopElements,
} from '@whop/elements-react';
import { Header, Footer } from './components/layout';
import { Contact, Financing, Hero, Reviews, ServiceArea, Services } from './components/sections';
import { businessConfig, formatBusinessCurrency } from './lib/config/business';
import { plans, type PlanKey } from './lib/config/plans';
import { trackEvent } from './lib/tracking';

const env = import.meta.env as Record<string, string | undefined>;
const themeStyle = Object.fromEntries(
  Object.entries(businessConfig.company.colors).map(([name, value]) => [
    `--color-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
    value,
  ])
) as CSSProperties;

function CheckoutEmbed({ planId, planKey }: { planId: string | undefined; planKey: PlanKey }) {
  const sandbox = env.VITE_WHOP_ENVIRONMENT === 'sandbox';
  const elements = useMemo(() => loadWhop(), []);

  if (!planId) {
    return (
      <p className="notice">
        Checkout is not configured yet. Add the matching Whop plan ID to your environment variables.
      </p>
    );
  }

  return (
    <WhopElements
      elements={elements}
      environment={sandbox ? 'sandbox' : 'production'}
      appearance={{ theme: { appearance: 'light', accentColor: 'orange' } }}
    >
      <div className="checkout-embed space-y-4">
        {/* Hosted Whop Checkout (includes Card, Apple Pay, Google Pay, financing) */}
        <WhopCheckout
          plan={planId}
          returnUrl={`${window.location.origin}/thanks?plan=${planKey}`}
          onComplete={(completion) => {
            console.log('[Whop Checkout Complete]', completion);
            if (completion.result === 'setup') {
              window.location.href = `/thanks?plan=${planKey}&setup_intent_id=${completion.setupIntentId}`;
            } else if (completion.result === 'payment') {
              window.location.href = `/thanks?plan=${planKey}&payment_id=${completion.paymentId}`;
            }
          }}
        >
          <CheckoutElement />
        </WhopCheckout>

        {/* Required Whop Branding Element */}
        <Payments accountId={env.VITE_WHOP_ACCOUNT_ID || 'biz_sxrJ2hJtBgt6lb'} plan={planId}>
          <BrandingElement />
        </Payments>
      </div>
    </WhopElements>
  );
}

function Home() {
  return (
    <div style={themeStyle}>
      <Header />
      <main className="pt-16 md:pt-20">
        <Hero />
        <Services />
        <ServiceArea />
        <Financing />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Checkout() {
  const selected = new URLSearchParams(window.location.search).get('plan') as PlanKey | null;
  const plan = selected && plans[selected];

  useEffect(() => {
    if (plan && selected) {
      trackEvent('service_viewed', {
        service: plan.name,
        plan_id: plan.whopPlanId,
        price: plan.price,
      });

      if (selected === 'deposit') {
        trackEvent('deposit_started', {
          service: plan.name,
          amount: plan.price,
          plan_id: plan.whopPlanId,
        });
      }
    }
  }, [plan, selected]);

  if (!plan || !selected) {
    return (
      <main className="centered" style={themeStyle}>
        <h1>Choose a service first.</h1>
        <a className="button" href="/">
          Back to Apex Roofing
        </a>
      </main>
    );
  }

  return (
    <main className="checkout-page" style={themeStyle}>
      <div className="checkout-layout">
        <section className="checkout-main" aria-labelledby="checkout-title">
          <a className="brand" href="/">
            {businessConfig.company.name}
          </a>
          <p className="eyebrow">SECURE WHOP CHECKOUT</p>
          <h1 id="checkout-title">{plan.name}</h1>
          <p className="price">{formatBusinessCurrency(plan.price)}</p>
          <CheckoutEmbed planId={plan.whopPlanId} planKey={selected} />
        </section>
        <aside className="checkout-summary" aria-label="Service and payment details">
          <p className="eyebrow">YOUR SERVICE</p>
          <h2>{plan.name}</h2>
          <p className="checkout-description">{plan.description}</p>
          <ul className="checkout-details">
            {plan.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <div className="checkout-total">
            <span>Due today</span>
            <strong>{formatBusinessCurrency(plan.price)}</strong>
          </div>
          <div className="checkout-payment">
            <p className="eyebrow">PAYMENT METHODS</p>
            <div className="payment-methods">
              <span>Card</span>
              <span>Apple Pay</span>
              <span>Google Pay</span>
              <span>Klarna / BNPL</span>
            </div>
            <p>
              Available options can vary by device, browser, and region. Whop automatically surfaces
              supported payment and financing options.
            </p>
          </div>
          <p className="checkout-secure">Payments and financing are processed securely by Whop.</p>
        </aside>
      </div>
    </main>
  );
}

function Thanks() {
  const searchParams = new URLSearchParams(window.location.search);
  const planParam = searchParams.get('plan') as PlanKey | null;
  const setupIntentId = searchParams.get('setup_intent_id');
  const paymentId = searchParams.get('payment_id');

  const isDeposit = planParam === 'deposit' || Boolean(setupIntentId);

  return (
    <main className="centered" style={themeStyle}>
      <p className="eyebrow">{isDeposit ? 'DEPOSIT CONFIRMED • CARD SAVED' : 'PAYMENT RECEIVED'}</p>
      <h1>
        {isDeposit
          ? 'Deposit Received & Card Saved on File'
          : 'Thank you. We’ll be in touch shortly.'}
      </h1>
      <p
        style={{
          maxWidth: '32rem',
          margin: '1rem auto 1.5rem',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        {isDeposit
          ? 'Your project start date is secured. In our high-ticket roofing workflow, your payment method is stored on file to automatically charge or invoice the final project balance upon job completion.'
          : 'Your transaction has been processed securely via Whop Payments.'}
      </p>
      {paymentId && (
        <p
          style={{
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            color: '#64748b',
            marginBottom: '0.5rem',
          }}
        >
          Payment ID: {paymentId}
        </p>
      )}
      {setupIntentId && (
        <p
          style={{
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            color: '#059669',
            marginBottom: '0.5rem',
          }}
        >
          Setup Intent ID: {setupIntentId} (Card saved)
        </p>
      )}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <a className="button" href="/">
          Return Home
        </a>
        <a
          className="button"
          style={{ background: '#e8a838', color: '#111827' }}
          href="/admin/invoices"
        >
          Demo Final Balance Billing (Invoices API) →
        </a>
      </div>
    </main>
  );
}

export default function App() {
  if (window.location.pathname === '/checkout') return <Checkout />;
  if (window.location.pathname === '/thanks') return <Thanks />;
  return <Home />;
}
