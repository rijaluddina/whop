// src/components/forms/EstimateForm.tsx
import { useState } from 'react';
import { useEstimateForm, EstimateFormData } from '../../hooks/useEstimateForm';
import { serviceOptions } from '../../lib/config/services';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../ui';

const initialFormData: EstimateFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  serviceType: '',
  message: '',
};

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  message?: string;
}

export function EstimateForm() {
  const [formData, setFormData] = useState<EstimateFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const { submit, loading, error: hookError } = useEstimateForm();

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
    } else if (
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phone.replace(/\s/g, '')
      )
    ) {
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

    setSubmitStatus('idle');
    setSubmitMessage('');

    const result = await submit(formData);

    if (result.success) {
      setSubmitStatus('success');
      setSubmitMessage(
        "Thank you! We'll contact you within 24 hours to schedule your free estimate."
      );
      setFormData(initialFormData);
    } else {
      setSubmitStatus('error');
      setSubmitMessage(
        result.error?.message || 'Something went wrong. Please try again or call us directly.'
      );
    }
  };

  const handleChange = (field: keyof EstimateFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const displayError = hookError || (submitStatus === 'error' ? submitMessage : '');

  return (
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

          {displayError && (
            <div
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
              role="alert"
            >
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{displayError}</p>
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
                loading={loading}
              >
                {loading ? 'Submitting...' : 'Get My Free Estimate'}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                By submitting, you agree to be contacted about your estimate request. We respect
                your privacy and never share your information.
              </p>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}

EstimateForm.displayName = 'EstimateForm';
