import { useState } from 'react';
import { trackingEvents, generateEventId } from '../../lib/config/tracking';

// Whop tracking type augmentation
declare global {
  interface Window {
    whop?: {
      track: (eventName: string, data: Record<string, unknown>) => void;
    };
  }
}

import {
  Section,
  Container,
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Badge,
} from '../ui';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  message?: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  serviceType: '',
  message: '',
};

const serviceOptions = [
  { value: 'repair', label: 'Roof Repair' },
  { value: 'replacement', label: 'Roof Replacement' },
  { value: 'inspection', label: 'Roof Inspection' },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'other', label: 'Other / Not Sure' },
];

export const Contact = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-()+]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a service type';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please describe your roofing needs';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide more details (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || 'Failed to submit estimate request');
      }

      const lead = (await response.json()) as { id?: string };

      // Fire tracking event
      if (typeof window !== 'undefined' && window.whop) {
        window.whop.track(trackingEvents.estimateRequested, {
          event_id: lead.id || generateEventId('est'),
          service_type: formData.serviceType,
          value: 0,
        });
      }

      setSubmitStatus('success');
      setSubmitMessage(
        "Thank you! We'll contact you within 24 hours to schedule your free estimate."
      );
      setFormData(initialFormData);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again or call us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Section id="contact" variant="alternate" size="xl">
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Info */}
          <div className="lg:sticky lg:top-24">
            <Badge variant="primary" size="md" className="mb-4" dot>
              Get Your Free Estimate
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Fill out the form and we&apos;ll contact you within 24 hours to schedule your free,
              no-obligation roof inspection and estimate.
            </p>

            {/* Contact Info Cards */}
            <div className="space-y-4 mb-8">
              {[
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  ),
                  label: 'Phone',
                  value: '(555) 123-4567',
                  href: 'tel:(555) 123-4567',
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                  label: 'Email',
                  value: 'info@apexroofing.com',
                  href: 'mailto:info@apexroofing.com',
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ),
                  label: 'Address',
                  value: '123 Main St, Springfield, IL 62701',
                  href: '#',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <a
                      href={item.href}
                      className="font-medium text-gray-900 hover:text-[var(--color-primary)] transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose Us?</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Licensed & Insured', 'BBB A+ Rating', '10-Year Warranty', 'Free Estimates'].map(
                  (item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg
                        className="w-5 h-5 text-[var(--color-success)] flex-shrink-0"
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
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            {submitStatus === 'success' ? (
              // Success State
              <Card variant="elevated" padding="lg" className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[var(--color-success)]"
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-600 mb-6">{submitMessage}</p>
                <Button variant="primary" onClick={() => setSubmitStatus('idle')}>
                  Submit Another Request
                </Button>
              </Card>
            ) : (
              // Form
              <Card variant="elevated" padding="lg">
                <CardHeader className="mb-6">
                  <CardTitle>Request a Free Estimate</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>

                {submitStatus === 'error' && (
                  <div
                    className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
                    role="alert"
                  >
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{submitMessage}</p>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit(e);
                  }}
                  className="space-y-5"
                  noValidate
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="Full Name *"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={errors.name}
                      required
                      autoComplete="name"
                    />
                    <Input
                      label="Email *"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={errors.email}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="Phone *"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      error={errors.phone}
                      required
                      autoComplete="tel"
                    />
                    <Select
                      label="Service Type *"
                      placeholder="Select a service"
                      options={serviceOptions}
                      value={formData.serviceType}
                      onChange={(e) => handleChange('serviceType', e.target.value)}
                      error={errors.serviceType}
                      required
                      id="service-type"
                    />
                  </div>

                  <Input
                    label="Address *"
                    placeholder="123 Main St, Springfield, IL 62701"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    error={errors.address}
                    required
                    autoComplete="street-address"
                  />

                  <Textarea
                    label="Project Details *"
                    placeholder="Describe your roofing needs, any specific concerns, preferred timeline, etc."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    error={errors.message}
                    required
                    rows={4}
                    helperText="Include details like: type of roof, age, known issues, preferred timeline"
                  />

                  <CardFooter className="border-t border-[var(--color-border)] pt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      loading={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Get My Free Estimate'}
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      By submitting, you agree to be contacted about your estimate request. We
                      respect your privacy and never share your information.
                    </p>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

Contact.displayName = 'Contact';
