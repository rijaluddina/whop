import { useEffect, useMemo } from 'react';
import { loadWhop } from '@whop/elements';
import {
  Checkout as WhopCheckout,
  CheckoutElement,
  Payments,
  BrandingElement,
  WhopElements,
} from '@whop/elements-react';
import { trackEvent } from '../../lib/tracking';

const env = import.meta.env as Record<string, string | undefined>;

interface CheckoutModalProps {
  isOpen: boolean;
  plan: any;
  onClose: () => void;
  onPaymentSuccess: (receipt: any) => void;
}

export const CheckoutModal = ({ isOpen, plan, onClose }: any) => {
  const sandbox = env.VITE_WHOP_ENVIRONMENT === 'sandbox';
  const elements = useMemo(() => loadWhop(), []);

  useEffect(() => {
    if (isOpen && plan) {
      trackEvent('service_viewed', {
        service: plan.name,
        service_type: plan.type,
        price: plan.price,
        plan_id: plan.planId,
      });
      if (plan.type === 'deposit') {
        trackEvent('deposit_started', {
          service: plan.name,
          amount: plan.price,
          plan_id: plan.planId,
          final_invoice_estimated: plan.depositTerms?.finalInvoiceEstimated,
        });
      }
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Checkout — ${plan.name}`}
      >
        <div className="modal-header">
          <div className="modal-header-branding">
            <span className="brand-pill">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Whop Secure Payments
            </span>
            <span className={`environment-badge ${sandbox ? 'is-sandbox' : ''}`}>
              {sandbox ? 'SANDBOX' : 'PRODUCTION'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="order-summary-box">
          <div className="order-summary-main">
            <div>
              <span className="order-type-tag">
                {plan.type === 'deposit' ? 'PROJECT WORK DEPOSIT' : 'FIXED ROOFING SERVICE'}
              </span>
              <h3 className="order-title">{plan.name}</h3>
              <p className="order-tagline">{plan.tagline}</p>
            </div>
            <div className="order-price-wrap">
              <span className="order-currency">$</span>
              <span className="order-amount">{plan.price}</span>
              <span className="order-period">{plan.type === 'deposit' ? 'deposit' : 'total'}</span>
            </div>
          </div>
          {plan.type === 'deposit' && plan.depositTerms && (
            <div className="deposit-callout">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div className="text-xs">
                {plan.depositTerms.termsText} Typical final invoice:{' '}
                <strong>${plan.depositTerms.finalInvoiceEstimated.toLocaleString()}</strong>.
              </div>
            </div>
          )}
        </div>

        <div className="whop-elements-container">
          <div className="elements-section-title">
            <span>Payment method</span>
            <span className="pci-badge">PCI-DSS — hosted by Whop</span>
          </div>
          <WhopElements
            elements={elements}
            environment={sandbox ? 'sandbox' : 'production'}
            appearance={{ theme: { appearance: 'dark', accentColor: 'orange' } }}
          >
            <div className="whop-checkout-shell">
              <WhopCheckout
                plan={plan.planId}
                returnUrl={`${window.location.origin}/?whop_return=1&plan=${plan.type}`}
                onComplete={(completion: any) => {
                  if (completion.result === 'setup') {
                    window.location.href = `/?whop_return=1&setup_intent_id=${completion.setupIntentId}&plan=${plan.type}`;
                  } else if (completion.result === 'payment') {
                    window.location.href = `/?whop_return=1&payment_id=${completion.paymentId}&plan=${plan.type}`;
                  }
                }}
              >
                <CheckoutElement />
              </WhopCheckout>
            </div>
            <Payments
              accountId={env.VITE_WHOP_ACCOUNT_ID || 'biz_LHN26NTWx9YO5m'}
              plan={plan.planId}
            >
              <BrandingElement />
            </Payments>
          </WhopElements>
          <div className="whop-disclaimer">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              Card details are entered inside Whop's hosted element and never touch this site. Apple
              Pay, Google Pay, Klarna and other methods appear automatically when your Whop account
              enables them.
            </span>
          </div>
        </div>

        <div className="modal-footer-guarantees">
          <div className="guarantee-item">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              {plan.type === 'deposit'
                ? 'Deposit 100% refundable up to 72h before materials'
                : 'Backed by our workmanship warranty'}
            </span>
          </div>
          <div className="guarantee-item">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              {plan.type === 'deposit'
                ? 'Balance invoiced after final walkthrough'
                : 'No hidden fees at checkout'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
