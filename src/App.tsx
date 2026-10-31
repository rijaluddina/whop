import { useMemo, type CSSProperties } from 'react';
import { loadWhop } from '@whop/elements';
import {
  Checkout as WhopCheckout,
  CheckoutElement,
  WhopElements,
} from '@whop/elements-react';
import { Header, Footer } from './components/layout';
import { Contact, Hero, Reviews, Services } from './components/sections';
import { businessConfig, formatBusinessCurrency } from './lib/config/business';
import { plans, type PlanKey } from './lib/config/plans';

const env = import.meta.env as Record<string, string | undefined>;
const themeStyle = Object.fromEntries(
  Object.entries(businessConfig.company.colors).map(([name, value]) => [`--color-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value]),
) as CSSProperties;

function CheckoutEmbed({ planId }: { planId: string | undefined }) {
  const sandbox = env.VITE_WHOP_ENVIRONMENT === 'sandbox';
  const elements = useMemo(() => loadWhop(), []);

  if (!planId) {
    return <p className="notice">Checkout is not configured yet. Add the matching Whop plan ID to your environment variables.</p>;
  }

  return (
    sandbox ? <div className="checkout-embed">
      <iframe title="Whop checkout" src={`https://sandbox.whop.com/checkout/${planId}`} allow="payment *" />
    </div> :
    <WhopElements
      elements={elements}
      environment={sandbox ? 'sandbox' : 'production'}
      appearance={{ theme: { appearance: 'light', accentColor: 'orange' } }}
    >
      <div className="checkout-embed">
        <WhopCheckout
          plan={planId}
          returnUrl={`${window.location.origin}/thanks`}
        >
          <CheckoutElement />
        </WhopCheckout>
      </div>
    </WhopElements>
  );
}

function Home() {
  return <div style={themeStyle}>
    <Header />
    <main className="pt-16 md:pt-20">
      <Hero />
      <Services />
      <Reviews />
      <Contact />
    </main>
    <Footer />
  </div>;
}

function Checkout() {
  const selected = new URLSearchParams(window.location.search).get('plan') as PlanKey | null;
  const plan = selected && plans[selected];
  if (!plan) return <main className="centered"><h1>Choose a service first.</h1><a className="button" href="/">Back to Apex Roofing</a></main>;
  return (
    <main className="checkout-page" style={themeStyle}>
      <div className="checkout-layout">
        <section className="checkout-main" aria-labelledby="checkout-title">
          <a className="brand" href="/">{businessConfig.company.name}</a>
          <p className="eyebrow">SECURE WHOP CHECKOUT</p>
          <h1 id="checkout-title">{plan.name}</h1>
          <p className="price">{formatBusinessCurrency(plan.price)}</p>
          <CheckoutEmbed planId={plan.whopPlanId} />
        </section>
        <aside className="checkout-summary" aria-label="Service and payment details">
          <p className="eyebrow">YOUR SERVICE</p>
          <h2>{plan.name}</h2>
          <p className="checkout-description">{plan.description}</p>
          <ul className="checkout-details">
            {plan.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
          <div className="checkout-total"><span>Due today</span><strong>{formatBusinessCurrency(plan.price)}</strong></div>
          <div className="checkout-payment">
            <p className="eyebrow">PAYMENT METHODS</p>
            <div className="payment-methods"><span>Card</span><span>Apple Pay</span><span>Google Pay</span></div>
            <p>Available options can vary by device, browser, and region. Whop shows the methods supported for your checkout.</p>
          </div>
          <p className="checkout-secure">Payments are processed securely by Whop.</p>
        </aside>
      </div>
    </main>
  );
}

export default function App() {
  if (window.location.pathname === '/checkout') return <Checkout />;
  if (window.location.pathname === '/thanks') return <main className="centered" style={themeStyle}><p className="eyebrow">PAYMENT RECEIVED</p><h1>Thank you. We’ll be in touch shortly.</h1><a className="button" href="/">Return home</a></main>;
  return <Home />;
}
