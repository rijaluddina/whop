# Roofing Company Whop Website Template - Design Specification

## Project Overview

**Project**: Production-ready Whop Website template for a US roofing company
**Deploy Target**: Live `whop.app` URL via Whop CLI
**Template Goal**: Pitch-ready for real roofing businesses - swap company name/services/pricing without structural changes

---

## Requirements Summary

### Core Features
1. **Site Sections**: Services (repair, replacement, inspection), Service Area, Financing Callout, Reviews/Trust, Contact
2. **Payment Plans**:
   - One-time Inspection Fee: $149
   - Project Deposit: $500 (setup intent for card-on-file)
   - Flat-Rate Service: $2,500 (example: standard roof replacement)
3. **Checkout**: Whop Payment Elements only (CheckoutElement + ExpressCheckoutElement + BrandingElement)
4. **Lead Capture**: "Request an Estimate" form → Whop Leads API
4. **Card-on-File**: Setup intent at deposit checkout, final balance via Whop Invoices API
5. **Tracking**: Custom `whop.track` events: `estimate_requested`, `service_viewed`, `deposit_started`

### Technical Stack
- **Framework**: React + Vite (Whop Website scaffold)
- **Deployment**: Whop CLI (`whop apps deploy`)
- **Payments**: `@whop/elements-react` + `@whop/elements`
- **API**: `@whop/sdk` for server-side calls (Leads, Invoices, Setup Intents)
- **Styling**: Tailwind CSS (responsive, mobile-first)

---

## Architecture

### Project Structure
```
/roofing-whop-template/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (Button, Card, Form, etc.)
│   │   ├── layout/             # Header, Footer, Section wrapper
│   │   ├── sections/           # Page sections (Hero, Services, ServiceArea, etc.)
│   │   ├── checkout/           # Checkout components (DepositCheckout, InspectionCheckout, etc.)
│   │   ├── forms/              # EstimateForm, ContactForm
│   │   └── tracking/           # WhopPixelEvents component
│   ├── lib/
│   │   ├── whop-client.ts      # Whop SDK client initialization
│   │   ├── api/                # Server API routes (Next.js API or similar)
│   │   │   ├── leads.ts        # Create lead endpoint
│   │   │   ├── invoices.ts     # Create/finalize invoice endpoint
│   │   │   └── setup-intents.ts # Create setup intent endpoint
│   │   ├── config/
│   │   │   ├── plans.ts        # Plan definitions (inspection, deposit, flat-rate)
│   │   │   ├── company.ts      # Company config (name, colors, location, services)
│   │   │   └── tracking.ts     # Event names and helpers
│   │   └── utils/
│   │       ├── formatting.ts   # Currency, phone formatting
│   │       └── validation.ts   # Form validation
│   ├── hooks/
│   │   ├── useWhopCheckout.ts  # Checkout hook
│   │   ├── useEstimateForm.ts  # Estimate form hook
│   │   └── useTracking.ts      # whop.track wrapper
│   ├── pages/
│   │   ├── Index.tsx           # Main landing page
│   │   ├── Checkout.tsx        # Checkout page (dynamic based on plan)
│   │   ├── CheckoutSuccess.tsx # Post-checkout success
│   │   └── InvoicePayment.tsx  # Final invoice payment page
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── whop.app.json               # Whop app configuration
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Component Design

### 1. Company Configuration (`src/lib/config/company.ts`)
Centralized config for easy templating:
```typescript
export const companyConfig = {
  name: "Apex Roofing",
  tagline: "Your Trusted Roofing Partner",
  phone: "(555) 123-4567",
  email: "info@apexroofing.com",
  address: "123 Main St, Springfield, IL 62701",
  serviceAreas: ["Springfield", "Champaign", "Bloomington", "Decatur", "Peoria"],
  colors: {
    primary: "#1B4F72",      // Deep blue
    secondary: "#E8A838",    // Gold accent
    background: "#FFFFFF",
    surface: "#F8FAFC",
  },
  logo: "/logo.svg",
  reviews: [
    { name: "Sarah M.", rating: 5, text: "Excellent work, professional team!", date: "2024-01-15" },
    { name: "James R.", rating: 5, text: "Fixed our leak in one day. Highly recommend.", date: "2024-02-20" },
    { name: "Lisa K.", rating: 5, text: "Fair pricing, great communication throughout.", date: "2024-03-10" },
  ],
  trustBadges: ["Licensed & Insured", "BBB A+ Rating", "500+ Projects", "10-Year Warranty"],
};
```

### 2. Plans Configuration (`src/lib/config/plans.ts`)
```typescript
export const plans = {
  inspection: {
    id: "plan_inspection",
    name: "Roof Inspection",
    description: "Comprehensive 21-point roof inspection with detailed report",
    price: 14900, // cents
    currency: "usd",
    type: "one_time" as const,
    whopPlanId: "plan_xxxxx_inspection", // Set after Whop product creation
    trackingEvent: "service_viewed",
    metadata: { serviceType: "inspection" },
  },
  deposit: {
    id: "plan_deposit",
    name: "Project Deposit",
    description: "Secures your project start date and materials - applied to final balance",
    price: 50000, // cents
    currency: "usd",
    type: "one_time" as const,
    whopPlanId: "plan_xxxxx_deposit",
    trackingEvent: "deposit_started",
    metadata: { serviceType: "deposit", isSetupIntent: true },
  },
  flatRate: {
    id: "plan_flat_rate",
    name: "Standard Roof Replacement",
    description: "Complete asphalt shingle roof replacement up to 2,000 sq ft",
    price: 250000, // cents
    currency: "usd",
    type: "one_time" as const,
    whopPlanId: "plan_xxxxx_flat_rate",
    trackingEvent: "service_viewed",
    metadata: { serviceType: "replacement" },
  },
};
```

### 3. Page Sections

#### Hero Section
- Headline, subheadline, CTA buttons ("Get Free Estimate", "Schedule Inspection")
- Trust badges row
- Background image with overlay

#### Services Section
- Three service cards: Repair, Replacement, Inspection
- Each with icon, title, description, "Learn More" → scrolls to estimate form or opens checkout
- Clicking "Schedule Inspection" fires `service_viewed` + opens inspection checkout

#### Service Area Section
- Interactive map or list of cities/zip codes
- "Check if we serve your area" CTA

#### Financing Callout
- "Financing Available" banner
- Mentions Klarna, Splitit, Afterpay (surfaced automatically by Whop)
- CTA to estimate form

#### Reviews/Trust Section
- Carousel of testimonials
- Trust badges grid
- Google Reviews / BBB badges

#### Contact/Estimate Form Section
- Form fields: Name, Email, Phone, Address, Service Type, Message
- Submit → Whop Leads API
- Success: fires `estimate_requested` event, shows confirmation

---

## Checkout Flow

### 1. Inspection Checkout ($149)
```
User clicks "Schedule Inspection" 
  → fires whop.track("service_viewed", { service: "inspection" })
  → navigates to /checkout?plan=inspection
  → CheckoutElement + ExpressCheckoutElement + BrandingElement
  → On success: redirect to /checkout/success?plan=inspection
  → Webhook creates lead + sends confirmation email
```

### 2. Deposit Checkout ($500) - Card on File
```
User clicks "Start Project - $500 Deposit"
  → fires whop.track("deposit_started", { projectId: "..." })
  → navigates to /checkout?plan=deposit
  → CheckoutElement (mode: "setup") + ExpressCheckoutElement + BrandingElement
  → Creates Setup Intent via API
  → On success: saves payment_method_id, redirects to /checkout/success?plan=deposit
  → Stores payment_method_id for final invoice
```

### 3. Flat-Rate Service Checkout ($2,500)
```
User clicks "Book Roof Replacement"
  → fires whop.track("service_viewed", { service: "replacement" })
  → navigates to /checkout?plan=flat_rate
  → CheckoutElement + ExpressCheckoutElement + BrandingElement
  → On success: redirect to success page
```

### 4. Final Invoice Payment (Card on File)
```
After project completion:
  → Server creates Invoice via Whop Invoices API
  → collection_method: "charge_automatically"
  → payment_method_id: from deposit setup intent
  → Invoice issued → auto-charges stored card
  → Or: collection_method: "send_invoice" → email with payment link
```

---

## API Endpoints

### POST `/api/leads` - Create Lead
```typescript
// Called from EstimateForm on submit
// Creates lead via Whop SDK
const lead = await whopClient.leads.create({
  account_id: process.env.WHOP_ACCOUNT_ID,
  email: formData.email,
  name: formData.name,
  phone: formData.phone,
  metadata: {
    service_type: formData.serviceType,
    address: formData.address,
    message: formData.message,
    source: "website_estimate_form",
  },
});
// Fires whop.track("estimate_requested", { event_id: lead.id })
```

### POST `/api/setup-intents` - Create Setup Intent (Deposit)
```typescript
// Called after deposit checkout confirmation token received
const setupIntent = await whopClient.setupIntents.create({
  account_id: process.env.WHOP_ACCOUNT_ID,
  confirmation_token: confirmationToken,
  return_url: `${process.env.SITE_URL}/checkout/success?plan=deposit`,
  metadata: { customer_email: customerEmail, purpose: "roofing_deposit" },
});
// Returns client_secret for handleNextAction if needed
```

### POST `/api/invoices/final-balance` - Create Final Invoice
```typescript
// Called after project completion (manual trigger or webhook)
const invoice = await whopClient.invoices.create({
  account_id: process.env.WHOP_ACCOUNT_ID,
  customer_email: customerEmail,
  collection_method: "charge_automatically", // or "send_invoice"
  payment_method_id: savedPaymentMethodId, // from deposit setup intent
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  plan: {
    product_id: productId, // flat-rate product
    plan_type: "one_time",
    initial_price: finalAmount - depositAmount, // remaining balance
    currency: "usd",
  },
  metadata: { project_id: projectId, deposit_payment_id: depositPaymentId },
});
```

---

## Tracking Events

### Custom Events (fired via `whop.track`)
| Event Name | Trigger | Payload |
|------------|---------|---------|
| `service_viewed` | User clicks service card or "Learn More" | `{ service: "inspection\|repair\|replacement", plan_id }` |
| `deposit_started` | User initiates deposit checkout | `{ plan_id: "deposit", amount: 50000 }` |
| `estimate_requested` | Estimate form submits successfully | `{ event_id: lead.id, service_type, value: 0 }` |

### Automatic Events (Whop handles)
- Page views
- Checkout views
- Purchases
- Subscriptions

---

## Whop CLI Deployment

### Commands
```bash
# 1. Initialize (run once)
whop apps init --type website --route apex-roofing

# 2. Develop locally
whop apps dev

# 3. Deploy to production
whop apps deploy

# 4. View logs
whop apps logs
```

### Whop App Configuration (`whop.app.json`)
```json
{
  "name": "Apex Roofing Website",
  "type": "website",
  "route": "apex-roofing",
  "buildCommand": "npm run build",
  "outputDir": "dist",
  "framework": "vite"
}
```

---

## Environment Variables
```env
# .env.example
WHOP_API_KEY=whop_xxxxxxxxxxxx
WHOP_ACCOUNT_ID=biz_xxxxxxxxxxxx
WHOP_APP_ID=app_xxxxxxxxxxxx
VITE_WHOP_ACCOUNT_ID=biz_xxxxxxxxxxxx
VITE_SITE_URL=https://apex-roofing.whop.site
```

---

## Responsive Design Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach
- Single column layouts on mobile
- Hamburger menu for navigation
- Touch-friendly button sizes (min 44px)
- Optimized images with WebP

---

## Template Customization Guide

### To Adapt for New Roofing Company:
1. Update `src/lib/config/company.ts` - all branding, contact info, service areas
2. Update `src/lib/config/plans.ts` - pricing, plan IDs (after Whop product creation)
3. Replace logo in `public/logo.svg`
4. Update `whop.app.json` route
5. Deploy with `whop apps deploy`

### Whop Dashboard Setup Required:
1. Create 3 Products + Plans in Whop Dashboard:
   - Roof Inspection ($149)
   - Project Deposit ($500) 
   - Standard Roof Replacement ($2,500)
2. Copy Plan IDs to `plans.ts`
3. Enable financing options (Klarna, Splitit, Afterpay) in Whop Dashboard
4. Configure webhooks for: `payment.succeeded`, `setup_intent.succeeded`, `invoice.paid`

---

## Acceptance Criteria

- [ ] Live at `https://<route>.whop.site` (or custom domain)
- [ ] All 3 plans purchasable via Payment Elements
- [ ] BrandingElement visible on all checkouts
- [ ] ExpressCheckoutElement shows Apple Pay/Google Pay
- [ ] Estimate form creates Lead in Whop Dashboard
- [ ] Deposit checkout creates Setup Intent, saves payment_method
- [ ] Final invoice created via API, charges saved method
- [ ] Custom events visible in Whop Pixel Dashboard:
  - `estimate_requested`
  - `service_viewed` (3 variants)
  - `deposit_started`
- [ ] Responsive on mobile (375px) and desktop (1440px)
- [ ] Code organized for easy rebranding (config files only)

---

## Implementation Phases

### Phase 1: Scaffold & Config (Day 1)
- `whop apps init` scaffold
- Company/plans config files
- Tailwind + base UI components
- Whop SDK client setup

### Phase 2: Page Sections (Day 1-2)
- Hero, Services, Service Area, Financing, Reviews, Contact
- Estimate form with Leads API integration
- Tracking events integration

### Phase 3: Checkout Flows (Day 2)
- Checkout page with dynamic plan loading
- Payment Elements integration (Checkout + Express + Branding)
- Deposit setup intent flow
- Success pages

### Phase 4: Invoice & Final Balance (Day 2-3)
- Invoice creation API
- Final balance page
- Card-on-file demo flow

### Phase 5: Polish & Deploy (Day 3)
- Responsive testing
- Cross-browser testing
- Whop CLI deploy
- Verify all events in dashboard
- Screen recording

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Whop CLI auth issues | Document `whop quickstart` steps; use account with admin perms |
| Plan IDs mismatch | Validate Plan IDs in config against Whop Dashboard before deploy |
| Setup intent not succeeding | Poll `retrieve-setup-status`; handle `requires_action` with `handleNextAction` |
| Financing not showing | Ensure merchant approved for financing in Whop Dashboard |
| Events not firing | Use `whop.track` with unique `event_id` per conversion; verify in Pixel Dashboard |
| CORS on API routes | Use Whop-hosted API routes (server-side in Vite/Whop runtime) |

---

## Success Metrics

- Template deploys successfully to whop.app
- Test checkout completes for all 3 plans
- Lead appears in Whop Dashboard after estimate form
- Setup intent succeeds, payment_method saved
- Invoice created and auto-charges saved method
- All 3 custom events visible in Pixel Dashboard
- Page loads < 3s on mobile (Lighthouse > 90)
- Code passes TypeScript strict mode