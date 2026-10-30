# Roofing Company Whop Website Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Whop Website template for a US roofing company with live whop.app URL, Payment Elements checkout, Leads API integration, Setup Intents for card-on-file, Invoices API for final balance, and custom whop.track events.

**Architecture:** React + Vite scaffold via Whop CLI, deployed to whop.app. Components organized by feature (sections, checkout, forms, tracking). Server-side API routes for Leads, Setup Intents, and Invoices using Whop SDK. Configuration-driven for easy rebranding.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, @whop/elements-react, @whop/elements, @whop/sdk, Whop CLI

**Spec:** docs/superpowers/specs/2026-10-30-roofing-whop-website-design.md

## Global Constraints

- Must deploy to live `whop.app` URL via `whop apps deploy`
- Whop Payments only — no Stripe, PayPal, or custom card forms
- Payment Elements: CheckoutElement + ExpressCheckoutElement + BrandingElement (required)
- Estimate form creates Lead via Whop Leads API (`lead:manage` permission)
- Deposit uses Setup Intent (mode: "setup") to save payment_method for later
- Final balance uses Invoices API with `collection_method: "charge_automatically"` using saved payment_method
- Custom events: `estimate_requested`, `service_viewed`, `deposit_started` via `whop.track`
- Responsive: mobile (375px), tablet (768px), desktop (1440px)
- Template-ready: swap company name, services, pricing via config files only
- TypeScript strict mode, ESLint, Prettier

## Review Focus

1. **Missing Whop Plan IDs** — Plans in config must match actual Whop Dashboard product/plan IDs; deploy will fail checkout if mismatched
2. **Setup Intent status handling** — Must poll `retrieve-setup-status` or use `handleNextAction` for `requires_action`; cannot assume immediate `succeeded`
3. **Event deduplication** — Each `whop.track` call needs unique `event_id` (not constant "lead") or Whop counts all as one event
4. **BrandingElement required** — Payment elements stay in loading state without it; checkout will appear broken
5. **CORS/API key exposure** — Server-side API calls must use Whop runtime-injected key; never expose API key in client bundle

---

### Task 1: Scaffold Whop Website Project

**Files:**

- Create: `whop.app.json`
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**

- Produces: Vite + React + TypeScript + Tailwind project structure ready for Whop CLI

- [ ] **Step 1: Run Whop CLI init to scaffold project**

```bash
whop apps init --type website --route apex-roofing
```

- [ ] **Step 2: Verify scaffold structure and install dependencies**

```bash
npm install
```

- [ ] **Step 3: Configure Vite with Whop plugin**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { whop } from '@whop/cli/vite';

export default defineConfig({
  plugins: [react(), whop()],
  build: { outDir: 'dist' },
});
```

- [ ] **Step 4: Configure Tailwind CSS**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 5: Add base styles and CSS variables for theming**

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #1b4f72;
  --color-secondary: #e8a838;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
}
```

- [ ] **Step 6: Create .env.example with required variables**

```env
WHOP_API_KEY=whop_xxxxxxxxxxxx
WHOP_ACCOUNT_ID=biz_xxxxxxxxxxxx
WHOP_APP_ID=app_xxxxxxxxxxxx
VITE_WHOP_ACCOUNT_ID=biz_xxxxxxxxxxxx
VITE_SITE_URL=https://apex-roofing.whop.site
```

- [ ] **Step 7: Run dev server to verify scaffold works**

```bash
whop apps dev
```

Expected: Local dev server running at localhost:3000

- [ ] **Step 8: Commit scaffold**

```bash
git add .
git commit -m "chore: scaffold Whop Website project with Vite, React, TypeScript, Tailwind"
```

---

### Task 2: Configuration System (Company & Plans)

**Files:**

- Create: `src/lib/config/company.ts`
- Create: `src/lib/config/plans.ts`
- Create: `src/lib/config/tracking.ts`
- Create: `src/lib/whop-client.ts`

**Interfaces:**

- Consumes: Scaffold from Task 1
- Produces: Type-safe config objects and Whop SDK client for all later tasks

- [ ] **Step 1: Create company configuration**

```typescript
// src/lib/config/company.ts
export const companyConfig = {
  name: 'Apex Roofing',
  tagline: 'Your Trusted Roofing Partner',
  phone: '(555) 123-4567',
  email: 'info@apexroofing.com',
  address: '123 Main St, Springfield, IL 62701',
  serviceAreas: ['Springfield', 'Champaign', 'Bloomington', 'Decatur', 'Peoria'],
  colors: {
    primary: '#1B4F72',
    secondary: '#E8A838',
    background: '#FFFFFF',
    surface: '#F8FAFC',
  },
  logo: '/logo.svg',
  reviews: [
    { name: 'Sarah M.', rating: 5, text: 'Excellent work, professional team!', date: '2024-01-15' },
    {
      name: 'James R.',
      rating: 5,
      text: 'Fixed our leak in one day. Highly recommend.',
      date: '2024-02-20',
    },
    {
      name: 'Lisa K.',
      rating: 5,
      text: 'Fair pricing, great communication throughout.',
      date: '2024-03-10',
    },
  ],
  trustBadges: ['Licensed & Insured', 'BBB A+ Rating', '500+ Projects', '10-Year Warranty'],
} as const;

export type CompanyConfig = typeof companyConfig;
```

- [ ] **Step 2: Create plans configuration**

```typescript
// src/lib/config/plans.ts
export const plans = {
  inspection: {
    id: 'plan_inspection',
    name: 'Roof Inspection',
    description: 'Comprehensive 21-point roof inspection with detailed report',
    price: 14900,
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_inspection', // TODO: Replace after Whop Dashboard creation
    trackingEvent: 'service_viewed',
    metadata: { serviceType: 'inspection' },
  },
  deposit: {
    id: 'plan_deposit',
    name: 'Project Deposit',
    description: 'Secures your project start date and materials - applied to final balance',
    price: 50000,
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_deposit',
    trackingEvent: 'deposit_started',
    metadata: { serviceType: 'deposit', isSetupIntent: true },
  },
  flatRate: {
    id: 'plan_flat_rate',
    name: 'Standard Roof Replacement',
    description: 'Complete asphalt shingle roof replacement up to 2,000 sq ft',
    price: 250000,
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_flat_rate',
    trackingEvent: 'service_viewed',
    metadata: { serviceType: 'replacement' },
  },
} as const;

export type PlanKey = keyof typeof plans;
export type PlanConfig = (typeof plans)[PlanKey];
```

- [ ] **Step 3: Create tracking event names and helpers**

```typescript
// src/lib/config/tracking.ts
export const trackingEvents = {
  estimateRequested: 'estimate_requested',
  serviceViewed: 'service_viewed',
  depositStarted: 'deposit_started',
} as const;

export function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
```

- [ ] **Step 4: Create Whop SDK client (server-side only)**

```typescript
// src/lib/whop-client.ts
import { WhopClient } from '@whop/sdk';

export function getWhopClient(): WhopClient {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new Error('WHOP_API_KEY not set');
  return new WhopClient({ token: apiKey });
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 6: Commit config system**

```bash
git add src/lib/config src/lib/whop-client.ts
git commit -m "feat: add company, plans, tracking config and Whop SDK client"
```

---

### Task 3: UI Component Library

**Files:**

- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Textarea.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Container.tsx`
- Create: `src/components/ui/Section.tsx`
- Create: `src/components/ui/index.ts`

**Interfaces:**

- Consumes: Tailwind config, company colors from config
- Produces: Reusable typed UI components for all sections

- [ ] **Step 1: Create Button component with variants**

```tsx
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary:
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 focus:ring-[var(--color-primary)]',
      secondary:
        'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/90 focus:ring-[var(--color-secondary)]',
      outline:
        'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:ring-[var(--color-primary)]',
      ghost:
        'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:ring-[var(--color-primary)]',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className || ''}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
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
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

- [ ] **Step 2: Create Card, Input, Textarea, Select, Badge, Container, Section components**

(Similar pattern - typed, Tailwind-styled, accessible)

- [ ] **Step 3: Export all from index.ts**

- [ ] **Step 4: Verify components render in Storybook or test page**

- [ ] **Step 5: Commit UI library**

```bash
git add src/components/ui
git commit -m "feat: add reusable UI component library"
```

---

### Task 4: Layout Components (Header, Footer, Navigation)

**Files:**

- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/Navigation.tsx`
- Create: `src/components/layout/index.ts`

**Interfaces:**

- Consumes: companyConfig, UI components
- Produces: Layout wrapper for all pages

- [ ] **Step 1: Create Header with logo, navigation, mobile menu**

- [ ] **Step 2: Create Footer with contact info, service areas, social links**

- [ ] **Step 3: Create Navigation with smooth scroll to sections**

- [ ] **Step 4: Verify responsive behavior (hamburger menu on mobile)**

- [ ] **Step 5: Commit layout components**

---

### Task 5: Page Sections (Hero, Services, ServiceArea, Financing, Reviews, Contact)

**Files:**

- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/Services.tsx`
- Create: `src/components/sections/ServiceArea.tsx`
- Create: `src/components/sections/Financing.tsx`
- Create: `src/components/sections/Reviews.tsx`
- Create: `src/components/sections/Contact.tsx`
- Create: `src/components/sections/index.ts`

**Interfaces:**

- Consumes: companyConfig, plans, UI components, tracking hooks
- Produces: Complete landing page sections

- [ ] **Step 1: Create Hero section with CTAs**

- [ ] **Step 2: Create Services section - 3 cards (Repair, Replacement, Inspection)**

```tsx
// Fires tracking on service card click
const handleServiceClick = (service: string, planId: string) => {
  track(trackingEvents.serviceViewed, {
    service,
    plan_id: planId,
    event_id: generateEventId('svc'),
  });
  // Navigate to checkout or scroll to form
};
```

- [ ] **Step 3: Create ServiceArea section with city list/map**

- [ ] **Step 4: Create Financing callout section**

- [ ] **Step 5: Create Reviews carousel with trust badges**

- [ ] **Step 6: Create Contact/Estimate form section**

```tsx
// Form fields: name, email, phone, address, serviceType, message
// On submit: POST to /api/leads, fire estimate_requested event
```

- [ ] **Step 7: Compose sections into Index page**

- [ ] **Step 8: Commit page sections**

---

### Task 6: Tracking Integration (whop.track Events)

**Files:**

- Create: `src/hooks/useTracking.ts`
- Create: `src/components/tracking/WhopPixelEvents.tsx`

**Interfaces:**

- Consumes: trackingEvents config, generateEventId
- Produces: Typed tracking functions for all custom events

- [ ] **Step 1: Create useTracking hook**

```typescript
// src/hooks/useTracking.ts
import { trackingEvents, generateEventId } from '@/lib/config/tracking';

export function useTracking() {
  const track = (eventName: string, data?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.whop) {
      window.whop.track(eventName, {
        ...data,
        event_id: data?.event_id || generateEventId(eventName),
      });
    }
  };
  return {
    trackEstimateRequested: (leadId: string, serviceType: string) =>
      track(trackingEvents.estimateRequested, { event_id: leadId, service_type: serviceType }),
    trackServiceViewed: (service: string, planId: string) =>
      track(trackingEvents.serviceViewed, {
        service,
        plan_id: planId,
        event_id: generateEventId('svc'),
      }),
    trackDepositStarted: (planId: string, amount: number) =>
      track(trackingEvents.depositStarted, {
        plan_id: planId,
        amount,
        event_id: generateEventId('dep'),
      }),
  };
}
```

- [ ] **Step 2: Create WhopPixelEvents component to verify pixel loads**

- [ ] **Step 3: Test events fire in browser console and Whop Pixel Dashboard**

- [ ] **Step 4: Commit tracking integration**

---

### Task 7: Estimate Form & Leads API Integration

**Files:**

- Create: `src/components/forms/EstimateForm.tsx`
- Create: `src/hooks/useEstimateForm.ts`
- Create: `src/lib/api/leads.ts` (server API route)
- Modify: `src/pages/Index.tsx` (integrate form)

**Interfaces:**

- Consumes: companyConfig, plans, useTracking, whop-client
- Produces: Working estimate form that creates Whop Lead

- [ ] **Step 1: Create useEstimateForm hook with validation**

```typescript
// src/hooks/useEstimateForm.ts
import { useState } from 'react';
import { useTracking } from './useTracking';

interface EstimateFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  message: string;
}

export function useEstimateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEstimateRequested } = useTracking();

  const submit = async (data: EstimateFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit estimate request');
      const lead = await res.json();
      trackEstimateRequested(lead.id, data.serviceType);
      return { success: true, lead };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
```

- [ ] **Step 2: Create server API route for Leads**

```typescript
// src/lib/api/leads.ts (or API route in Vite/Whop runtime)
import { getWhopClient } from '@/lib/whop-client';

export async function createLead(data: EstimateFormData) {
  const client = getWhopClient();
  const lead = await client.leads.create({
    account_id: process.env.WHOP_ACCOUNT_ID!,
    email: data.email,
    name: data.name,
    phone: data.phone,
    metadata: {
      service_type: data.serviceType,
      address: data.address,
      message: data.message,
      source: 'website_estimate_form',
    },
  });
  return lead;
}
```

- [ ] **Step 3: Create EstimateForm component with form fields and submit handling**

- [ ] **Step 4: Test lead creation in Whop Dashboard**

- [ ] **Step 5: Commit estimate form and Leads API**

---

### Task 8: Checkout Page & Payment Elements Integration

**Files:**

- Create: `src/pages/Checkout.tsx`
- Create: `src/components/checkout/CheckoutElements.tsx`
- Create: `src/hooks/useWhopCheckout.ts`
- Create: `src/lib/api/setup-intents.ts` (server API route)

**Interfaces:**

- Consumes: plans config, whop-client, useTracking
- Produces: Dynamic checkout page for all 3 plans with Payment Elements

- [ ] **Step 1: Create useWhopCheckout hook**

```typescript
// src/hooks/useWhopCheckout.ts
import { loadWhop } from '@whop/elements';
import { plans } from '@/lib/config/plans';
import { useTracking } from './useTracking';

export function useWhopCheckout(planKey: PlanKey) {
  const plan = plans[planKey];
  const { trackServiceViewed, trackDepositStarted } = useTracking();
  const elements = loadWhop();

  // Track service viewed when checkout loads
  trackServiceViewed(plan.metadata.serviceType, plan.whopPlanId);

  if (planKey === 'deposit') {
    trackDepositStarted(plan.whopPlanId, plan.price);
  }

  return { plan, elements };
}
```

- [ ] **Step 2: Create CheckoutElements component**

```tsx
// src/components/checkout/CheckoutElements.tsx
import {
  WhopElements,
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  BrandingElement,
} from '@whop/elements-react';
import { useWhopCheckout } from '@/hooks/useWhopCheckout';

export function CheckoutElements({ planKey }: { planKey: PlanKey }) {
  const { plan, elements } = useWhopCheckout(planKey);

  return (
    <WhopElements elements={elements}>
      <Checkout
        plan={plan.whopPlanId}
        mode={plan.id === 'plan_deposit' ? 'setup' : 'payment'}
        onComplete={async (completion) => {
          if (completion.result === 'payment') {
            window.location.href = `/checkout/success?plan=${planKey}&payment_id=${completion.paymentId}`;
          } else if (completion.result === 'setup_intent') {
            // Handle setup intent completion
            const setupIntentId = completion.setupIntentId;
            // Call API to finalize setup intent
            await fetch('/api/setup-intents/finalize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ setup_intent_id: setupIntentId }),
            });
            window.location.href = `/checkout/success?plan=${planKey}&setup_intent_id=${setupIntentId}`;
          }
        }}
      >
        <CheckoutElement />
        <ExpressCheckoutElement />
        <BrandingElement />
      </Checkout>
    </WhopElements>
  );
}
```

- [ ] **Step 3: Create Checkout page with dynamic plan loading from URL**

- [ ] **Step 4: Create Setup Intent finalize API route**

```typescript
// src/lib/api/setup-intents.ts
import { getWhopClient } from '@/lib/whop-client';

export async function finalizeSetupIntent(setupIntentId: string, customerEmail: string) {
  const client = getWhopClient();
  // Poll setup intent status or use client_secret from checkout
  const setupIntent = await client.setupIntents.retrieve(setupIntentId);
  // Store payment_method_id for later invoice use
  return setupIntent;
}
```

- [ ] **Step 5: Test all 3 checkout flows in sandbox**

- [ ] **Step 6: Commit checkout integration**

---

### Task 9: Checkout Success Page & Deposit Flow

**Files:**

- Create: `src/pages/CheckoutSuccess.tsx`
- Create: `src/pages/InvoicePayment.tsx`

**Interfaces:**

- Consumes: URL params (plan, payment_id, setup_intent_id)
- Produces: Success UX and final invoice payment page

- [ ] **Step 1: Create CheckoutSuccess page with plan-specific messaging**

- [ ] **Step 2: For deposit plan, show "Card saved for final payment" message**

- [ ] **Step 3: Create InvoicePayment page for final balance demo**

- [ ] **Step 4: Commit success pages**

---

### Task 10: Final Invoice API & Card-on-File Demo

**Files:**

- Create: `src/lib/api/invoices.ts` (server API route)
- Create: `src/components/checkout/FinalInvoiceDemo.tsx`

**Interfaces:**

- Consumes: whop-client, saved payment_method_id from deposit
- Produces: Working final invoice creation that charges saved card

- [ ] **Step 1: Create final invoice API**

```typescript
// src/lib/api/invoices.ts
import { getWhopClient } from '@/lib/whop-client';

export async function createFinalInvoice(params: {
  customerEmail: string;
  paymentMethodId: string; // from deposit setup intent
  depositAmount: number; // 50000
  totalAmount: number; // 250000
  projectId: string;
}) {
  const client = getWhopClient();
  const remainingBalance = params.totalAmount - params.depositAmount;

  const invoice = await client.invoices.create({
    account_id: process.env.WHOP_ACCOUNT_ID!,
    customer_email: params.customerEmail,
    collection_method: 'charge_automatically',
    payment_method_id: params.paymentMethodId,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan: {
      product_id: process.env.WHOP_FLAT_RATE_PRODUCT_ID!, // flat-rate product
      plan_type: 'one_time',
      initial_price: remainingBalance,
      currency: 'usd',
    },
    metadata: {
      project_id: params.projectId,
      deposit_amount: params.depositAmount.toString(),
      total_amount: params.totalAmount.toString(),
    },
  });
  return invoice;
}
```

- [ ] **Step 2: Create demo component to trigger final invoice (for screen recording)**

- [ ] **Step 3: Test invoice creation and auto-charge in Whop Dashboard**

- [ ] **Step 4: Commit invoice API**

---

### Task 11: Responsive Design & Polish

**Files:**

- Modify: All section components
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

**Interfaces:**

- Consumes: All previous components
- Produces: Fully responsive, polished site

- [ ] **Step 1: Test and fix mobile layout (375px)**

- [ ] **Step 2: Test and fix tablet layout (768px)**

- [ ] **Step 3: Test and fix desktop layout (1440px)**

- [ ] **Step 4: Add loading states, error states, empty states**

- [ ] **Step 5: Optimize images, add WebP, lazy loading**

- [ ] **Step 6: Run Lighthouse audit**

```bash
npx lighthouse http://localhost:3000 --view
```

Target: Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90

- [ ] **Step 7: Commit responsive polish**

---

### Task 12: Whop CLI Deployment & Verification

**Files:**

- Modify: `whop.app.json` (verify route)
- Verify: All env vars set in Whop Dashboard

**Interfaces:**

- Consumes: Complete built project
- Produces: Live whop.app URL

- [ ] **Step 1: Build production bundle**

```bash
npm run build
```

- [ ] **Step 2: Deploy to Whop**

```bash
whop apps deploy
```

- [ ] **Step 3: Verify live site at https://apex-roofing.whop.site**

- [ ] **Step 4: Test all 3 checkout flows on live site**

- [ ] **Step 5: Submit estimate form → verify Lead in Whop Dashboard**

- [ ] **Step 6: Complete deposit checkout → verify Setup Intent succeeded → payment_method saved**

- [ ] **Step 7: Create final invoice via API → verify auto-charge of saved card**

- [ ] **Step 8: Verify custom events in Whop Pixel Dashboard:**
  - `estimate_requested`
  - `service_viewed` (3 variants)
  - `deposit_started`

- [ ] **Step 9: Record 3-5 minute screen recording**

- [ ] **Step 10: Commit deployment config**

---

### Task 13: Documentation & Template README

**Files:**

- Create: `README.md`
- Create: `TEMPLATE_CUSTOMIZATION.md`

**Interfaces:**

- Consumes: Complete project
- Produces: Documentation for template users

- [ ] **Step 1: Write README with project overview, setup, deployment**

- [ ] **Step 2: Write TEMPLATE_CUSTOMIZATION.md with step-by-step rebranding guide**

- [ ] **Step 3: Commit documentation**

---

## Execution Recommendation

**Plan complete and saved to `docs/superpowers/plans/2026-10-30-roofing-whop-website-plan.md`. Please review the plan. Which execution approach would you prefer?**

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.

- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end. Runs well with a mid-tier session model, since the plan carries the design.

**For this plan I recommend Native**, because the tasks are highly sequential (each builds on the previous), the interfaces are well-defined in the plan, and a shipped mistake would be caught during the live deployment verification in Task 12. Does the plan capture what you want, and which approach should we use?
