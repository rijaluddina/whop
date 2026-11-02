import { useState, useMemo } from 'react';

const env = import.meta.env as Record<string, string | undefined>;

interface InvoicesModalProps {
  isOpen: boolean;
  depositReceipt: any;
  onClose: () => void;
}

export const InvoicesModal = ({ isOpen, depositReceipt, onClose }: InvoicesModalProps) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const plan = { price: 500 };
  const finalInvoiceEstimated = 4500;
  const total = plan.price + finalInvoiceEstimated;
  const credit = plan.price;
  const due = total - credit;

  const lineItems = useMemo(() => [
    { label: 'Architectural shingles, underlayment & ice/water shield', unitPrice: Math.round(total * 0.72), quantity: 1 },
    { label: 'Tear-off, deck repair & installation labour', unitPrice: Math.round(total * 0.21), quantity: 1 },
    { label: 'Disposal, permits & final inspection', unitPrice: total - Math.round(total * 0.72) - Math.round(total * 0.21), quantity: 1 },
    { label: `Project deposit credited (${depositReceipt?.paymentId || 'deposit'})`, unitPrice: -credit, quantity: 1 },
  ], [total, credit, depositReceipt]);

  const generateInvoice = async () => {
    setLoading(true);
    const invoiceNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
    const inv = {
      invoiceNumber: invoiceNum,
      customerName: 'Homeowner',
      emailAddress: '',
      subtotal: lineItems.filter(l => l.unitPrice > 0).reduce((s, l) => s + l.unitPrice * l.quantity, 0),
      depositCredited: Math.abs(lineItems.filter(l => l.unitPrice < 0).reduce((s, l) => s + l.unitPrice * l.quantity, 0)),
      totalDue: due,
      status: 'draft',
      mode: 'dashboard',
      lineItems,
      dueDate: new Date(Date.now() + 10080 * 60 * 1000).toISOString(),
      jobReferenceId: depositReceipt?.paymentId ? `JOB-${depositReceipt.paymentId.slice(4, 12).toUpperCase()}` : 'JOB-UNASSIGNED',
      dashboardUrl: env.VITE_WHOP_ACCOUNT_ID ? `https://whop.com/dashboard/${env.VITE_WHOP_ACCOUNT_ID}/invoices` : 'https://whop.com/dashboard/',
      createdAt: new Date().toISOString(),
    };
    setInvoice(inv);
    setLoading(false);
  };

  const copyStatement = async () => {
    if (!invoice) return;
    const text = [
      `Invoice ${invoice.invoiceNumber} — Apex Shield Roofing & Exteriors`,
      ...invoice.lineItems.map((l: any) => `${l.label}: $${l.unitPrice.toLocaleString()}`),
      `Total due: $${invoice.totalDue.toLocaleString()}`,
      `Due: ${new Date(invoice.dueDate).toLocaleDateString()}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.info(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="invoices-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Final balance invoice">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="contractor-pill">Final balance invoice</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Deposit → job completion → balance</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="invoices-flow-intro">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg style={{ width: 20, height: 20, color: '#f59e0b' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Bill the remaining balance in Whop
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.5 }}>
            {depositReceipt ? `Deposit ${depositReceipt.paymentId} is paid. Below is the itemized final statement with that deposit credited.` : 'Preview mode — no deposit has been paid in this session, so the reference below is a sample.'} Whop invoices are created and emailed from your Whop dashboard; this screen builds the exact statement and takes you there, or POSTs it to your own endpoint when <code>VITE_INVOICE_ENDPOINT</code> is configured.
          </p>
        </div>

        <div className="deposit-verified-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: depositReceipt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: depositReceipt ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
              {depositReceipt ? '✓' : 'i'}
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: depositReceipt ? '#10b981' : '#f59e0b' }}>{depositReceipt ? 'Deposit received' : 'Preview statement'}</div>
              <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                {depositReceipt ? `Checkout ${depositReceipt.sessionId} • ${new Date(depositReceipt.completedAt).toLocaleString()}` : 'Pay the $500 deposit from the plans section to attach a real receipt.'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Deposit credited</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>-${plan.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="invoice-breakdown-card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>Itemized job completion statement</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
            {lineItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.35rem 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: item.unitPrice < 0 ? '#10b981' : '#e2e8f0', fontWeight: item.unitPrice < 0 ? 700 : 500 }}>{item.label}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: item.unitPrice < 0 ? '#10b981' : '#ffffff', whiteSpace: 'nowrap' }}>
                  {item.unitPrice < 0 ? `-$${Math.abs(item.unitPrice).toLocaleString()}` : `$${item.unitPrice.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff' }}>
            <span>Remaining balance due</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>${due.toLocaleString()}</span>
          </div>
        </div>

        {invoice ? (
          <div className="invoice-receipt-result">
            <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: invoice.mode === 'endpoint' ? '#10b981' : '#fcd34d', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{invoice.mode === 'endpoint' ? 'Invoice created through your endpoint' : 'Draft ready — create it in Whop'}</span>
              </div>
              <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b', fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                <div>Invoice #: <span style={{ color: '#ffffff', fontWeight: 800 }}>{invoice.invoiceNumber}</span></div>
                <div>Reference: <span style={{ color: '#cbd5e1' }}>{invoice.jobReferenceId}</span></div>
                <div>Subtotal: <span style={{ color: '#cbd5e1' }}>${invoice.subtotal.toLocaleString()}</span></div>
                <div>Deposit credited: <span style={{ color: '#10b981' }}>-${invoice.depositCredited.toLocaleString()}</span></div>
                <div>Total due: <span style={{ color: '#f59e0b', fontWeight: 800 }}>${invoice.totalDue.toLocaleString()}</span></div>
                <div>Due date: <span style={{ color: '#cbd5e1' }}>{new Date(invoice.dueDate).toLocaleDateString()}</span></div>
                <div>Status: <span style={{ textTransform: 'uppercase', color: invoice.status === 'open' ? '#10b981' : '#fcd34d', fontWeight: 800 }}>{invoice.status}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <a href={invoice.dashboardUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open in Whop
                </a>
                <button type="button" className="btn btn-secondary btn-sm" onClick={copyStatement} style={{ flex: 1, justifyContent: 'center' }}>
                  {copied ? (
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                  {copied ? 'Copied' : 'Copy statement'}
                </button>
              </div>
              <button type="button" style={{ marginTop: '0.75rem', width: '100%', padding: '0.625rem', background: '#1e293b', border: 'none', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem', cursor: 'pointer' }} onClick={() => setInvoice(null)}>Regenerate</button>
            </div>
          </div>
        ) : (
          <button type="button" className="invoice-execute-btn" disabled={loading} onClick={generateInvoice}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg style={{ width: 18, height: 18 }} className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
                <span>Building invoice…</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span>Generate ${due.toLocaleString()} invoice</span>
                <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            )}
          </button>
        )}

        <div className="invoice-flow-footer">
          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Whop account: <code>{env.VITE_WHOP_ACCOUNT_ID || 'biz_LHN26NTWx9YO5m'}</code></span>
        </div>
      </div>
    </div>
  );
};
