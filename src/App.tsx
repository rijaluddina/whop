import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Services } from './components/sections/Services';
import { Plans } from './components/sections/Plans';
import { Financing } from './components/sections/Financing';
import { ServiceArea } from './components/sections/ServiceArea';
import { Reviews } from './components/sections/Reviews';
import { Contact } from './components/sections/Contact';
import { CheckoutModal } from './components/modals/CheckoutModal';
import { InvoicesModal } from './components/modals/InvoicesModal';
import { PixelDebugger } from './components/modals/PixelDebugger';

export default function App() {
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [invoicesOpen, setInvoicesOpen] = useState(false);
  const [depositReceipt] = useState<any>(null);
  const [toast, setToast] = useState<{ tone: string; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('whop_return')) return;
    const status = params.get('status');
    const payment = params.get('payment');
    if (status === 'succeeded') {
      setToast({ tone: 'success', message: `Payment ${payment ?? ''} confirmed by Whop.` });
    } else if (status === 'failed') {
      setToast({ tone: 'error', message: 'Whop reported the payment as failed. Nothing was charged.' });
    } else if (status === 'canceled') {
      setToast({ tone: 'error', message: 'Checkout was canceled. Nothing was charged.' });
    } else if (status) {
      setToast({ tone: 'success', message: `Payment is still processing (${status}). We will email you when it settles.` });
    }
    params.delete('whop_return');
    params.delete('status');
    params.delete('payment');
    params.delete('setup');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen app-shell">
      {toast && (
        <div className={`app-toast ${toast.tone === 'error' ? 'app-toast-error' : ''}`} role="status" aria-live="polite">
          {toast.tone === 'error' ? (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
      <Header onOpenCheckout={setCheckoutPlan} onOpenInvoicesDemo={() => setInvoicesOpen(true)} onScrollTo={scrollTo} />
      <main className="flex-1">
        <Hero onOpenCheckout={setCheckoutPlan} onScrollTo={scrollTo} />
        <Services onScrollTo={scrollTo} />
        <Plans onOpenCheckout={setCheckoutPlan} onOpenInvoicesDemo={() => setInvoicesOpen(true)} />
        <Financing onScrollTo={scrollTo} />
        <ServiceArea />
        <Reviews />
        <Contact />
      </main>
      <Footer onScrollTo={scrollTo} onOpenInvoicesDemo={() => setInvoicesOpen(true)} />
      <CheckoutModal isOpen={!!checkoutPlan} plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      <InvoicesModal isOpen={invoicesOpen} depositReceipt={depositReceipt} onClose={() => setInvoicesOpen(false)} />
      <PixelDebugger />
    </div>
  );
}
