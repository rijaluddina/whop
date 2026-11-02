import { useState } from 'react';
import { trackEvent } from '../../lib/tracking';

interface EstimateFormState {
  name: string;
  email: string;
  phone: string;
  zip: string;
  address: string;
  service: string;
  roofAge: string;
  message: string;
  insuranceClaim: boolean;
}

const initialFormState: EstimateFormState = {
  name: '',
  email: '',
  phone: '',
  zip: '',
  address: '',
  service: 'Complete Roof Replacement',
  roofAge: "I don't know",
  message: '',
  insuranceClaim: true,
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  background: 'var(--bg-darkest)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '0.75rem',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
};

export const Contact = () => {
  const [form, setForm] = useState<EstimateFormState>(initialFormState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const setField = (field: keyof EstimateFormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setStatus('error');
      setFeedback('Please complete your name, email, and phone number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus('error');
      setFeedback('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setFeedback('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          address: form.address,
          message: form.message,
          zipCode: form.zip,
          roofAge: form.roofAge,
          hasInsuranceClaim: form.insuranceClaim,
          source: 'apex-roofing-website',
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit your estimate request.');
      }

      trackEvent('estimate_requested', {
        service_type: form.service,
        customer_name: form.name,
        email: form.email,
        zip: form.zip,
        roof_age: form.roofAge,
        has_insurance_claim: form.insuranceClaim,
      });

      setStatus('success');
      setFeedback(
        "Request received! We'll inspect, document, and send your detailed written estimate within 24-48 hours."
      );
      setForm(initialFormState);
    } catch (error) {
      setStatus('error');
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please call us directly at (800) 555-ROOF.'
      );
    }
  };

  return (
    <section className="section section-dark" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Get Started
          </div>
          <h2 className="section-title">Request Your Free Comprehensive Estimate</h2>
          <p className="section-subtitle">
            No obligation. We'll inspect, document, and provide a detailed written estimate within
            24-48 hours.
          </p>
        </div>

        <div className="grid-2">
          <div className="plan-card">
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: '0 auto 1.25rem',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Request Submitted!
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {feedback}
                </p>
                <button type="button" className="btn btn-primary" onClick={() => setStatus('idle')}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                noValidate
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Property Owner Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Marcus Vance"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="marcus.homeowner@example.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(214) 555-0182"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Postal Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="75201"
                      value={form.zip}
                      onChange={(e) => setField('zip', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="742 Evergreen Ridge Rd"
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Primary Service Needed
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => setField('service', e.target.value)}
                      style={fieldStyle}
                    >
                      <option>Complete Roof Replacement</option>
                      <option>Emergency Roof & Leak Repair</option>
                      <option>Certified Drone & Hail Inspections</option>
                      <option>Seamless Gutters & Architectural Flashing</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Estimated Roof Age
                    </label>
                    <select
                      value={form.roofAge}
                      onChange={(e) => setField('roofAge', e.target.value)}
                      style={fieldStyle}
                    >
                      <option>0-5 years (Newer)</option>
                      <option>6-10 years (Mid-life)</option>
                      <option>11-15 years (Wear starting)</option>
                      <option>16-20+ years (Replacement ready)</option>
                      <option>I don't know</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    Project Details / Storm Damage Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Wind lifted several shingles on the west slope during last week's thunderstorm."
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    style={{ ...fieldStyle, resize: 'vertical' }}
                  />
                </div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.insuranceClaim}
                    onChange={(e) => setField('insuranceClaim', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  I have an open insurance claim or want help with insurance adjuster review
                </label>
                {status === 'error' && feedback && (
                  <div
                    role="alert"
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(220, 38, 38, 0.12)',
                      border: '1px solid rgba(220, 38, 38, 0.45)',
                      color: '#fca5a5',
                      fontSize: '0.875rem',
                    }}
                  >
                    {feedback}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Submitting...' : 'Submit Estimate Request'}
                </button>
              </form>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="plan-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                Direct Dispatch
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a
                  href="tel:800555ROOF"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#020617',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>(800) 555-ROOF</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Sales & Estimates
                    </div>
                  </div>
                </a>
                <a
                  href="tel:8005559119"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '0.75rem',
                      background: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>(800) 555-9119</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      24/7 Emergency Hotline
                    </div>
                  </div>
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '0.75rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-amber)"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>contact@apexshieldroofing.com</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Email Inquiries
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="plan-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                Office & Credentials
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Address</div>
                  <div>4500 Ridgeview Blvd, Suite 200, Dallas, TX 75201</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>License</div>
                  <div>TX-RC-889421A</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Insurance</div>
                  <div>$2,000,000 General Liability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
