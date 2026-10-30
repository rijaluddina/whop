# Template Customization Guide

Complete step-by-step guide to rebrand this template for your roofing company.

---

## 📋 Overview

This template uses a **configuration-first approach** — nearly all company-specific content lives in `src/lib/config/`. You rarely need to touch React components.

**Estimated time**: 30–60 minutes for full rebrand.

---

## 🎯 Step 1: Company Identity

**File**: `src/lib/config/company.ts`

Update every field with your company's information:

```typescript
export const companyConfig = {
  // Basic info
  name: 'Your Company Name', // Used in header, title, footer
  tagline: 'Your Tagline Here', // Hero subtitle, meta description
  phone: '(555) 000-0000', // Header, footer, contact forms
  email: 'info@yourcompany.com', // Footer, contact forms
  address: '123 Your St, City, ST 12345', // Footer, schema.org

  // Service areas (array of city names)
  serviceAreas: ['Your City', 'Nearby Town', 'Another Area'],

  // Brand colors (Tailwind-compatible hex values)
  colors: {
    primary: '#1B4F72', // Main brand color (buttons, headers, links)
    secondary: '#E8A838', // Accent color (highlights, badges)
    background: '#FFFFFF', // Page background
    surface: '#F8FAFC', // Card backgrounds
    border: '#E2E8F0', // Input borders, dividers
    muted: '#64748B', // Secondary text
    success: '#059669', // Success toasts, badges
    warning: '#D97706', // Warning states
    danger: '#DC2626', // Error states
    error: '#DC2626', // Alias for danger
    darkBg: '#111827', // Footer background
    darkText: '#F9FAFB', // Footer text
  },

  // Logo (place in public/logo.svg)
  logo: '/logo.svg',

  // Reviews/testimonials (shown in Reviews section)
  reviews: [
    { name: 'Customer Name', rating: 5, text: 'Great service!', date: '2024-01-15' },
    { name: 'Another Customer', rating: 5, text: 'Highly recommend.', date: '2024-02-20' },
    // Add 3–5 reviews
  ],

  // Trust badges (shown in Hero & Footer)
  trustBadges: ['Licensed & Insured', 'BBB A+ Rating', '500+ Projects', '10-Year Warranty'],

  // Social media links (Footer)
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com/yourcompany', icon: 'facebook' },
    { label: 'Twitter', href: 'https://twitter.com/yourcompany', icon: 'twitter' },
    { label: 'Instagram', href: 'https://instagram.com/yourcompany', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/yourcompany', icon: 'linkedin' },
    {
      label: 'Google Reviews',
      href: 'https://google.com/search?q=yourcompany+reviews',
      icon: 'google',
    },
  ],

  // Footer navigation links
  footerLinks: {
    services: [
      { label: 'Residential Roofing', href: '#services' },
      { label: 'Commercial Roofing', href: '#services' },
      { label: 'Roof Repair', href: '#services' },
      { label: 'Roof Inspection', href: '#services' },
      { label: 'Emergency Services', href: '#contact' },
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Our Team', href: '#about' },
      { label: 'Careers', href: '#contact' },
      { label: 'Blog', href: '#contact' },
      { label: 'FAQ', href: '#contact' },
    ],
    support: [
      { label: 'Contact Us', href: '#contact' },
      { label: 'Request a Quote', href: '#contact' },
      { label: 'Schedule Inspection', href: '#contact' },
      { label: 'Financing Options', href: '#contact' },
      { label: 'Warranty Info', href: '#contact' },
    ],
  },
} as const;
```

### Logo

Replace `public/logo.svg` with your logo (SVG recommended, 200×60px ideal). The logo appears in:

- Header (top-left)
- Footer
- Browser tab (via favicon — see Step 8)

---

## 🎨 Step 2: Brand Colors (Tailwind)

**File**: `tailwind.config.js` (create if missing) + `src/lib/config/company.ts`

The template uses CSS variables for colors. Your `companyConfig.colors` values are automatically injected via `src/index.css`.

### Option A: Use CSS Variables (Recommended)

Colors from `companyConfig` are injected as CSS custom properties. No Tailwind config changes needed.

```css
/* src/index.css - automatically reads from companyConfig */
:root {
  --color-primary: #1b4f72;
  --color-secondary: #e8a838;
  /* ... all colors from companyConfig */
}
```

### Option B: Extend Tailwind Theme

If you want Tailwind utility classes like `bg-primary-500`, create `tailwind.config.js`:

```javascript
// tailwind.config.js
import { companyConfig } from './src/lib/config/company';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: companyConfig.colors.primary,
        secondary: companyConfig.colors.secondary,
        // ... map other colors
      },
    },
  },
  plugins: [],
};
```

Then run `npm run dev` — colors update instantly.

---

## 🛠️ Step 3: Services & Pricing

**File**: `src/lib/config/plans.ts`

Configure your three checkout plans. Each plan maps to a Whop Dashboard plan.

```typescript
export const plans = {
  inspection: {
    id: 'plan_inspection', // Internal ID (don't change)
    name: 'Roof Inspection', // Display name
    description: 'Comprehensive 21-point roof inspection with detailed report',
    price: 14900, // Price in CENTS ($149.00)
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_inspection', // REPLACE after Whop Dashboard creation
    trackingEvent: 'service_viewed',
    metadata: { serviceType: 'inspection' },
  },
  deposit: {
    id: 'plan_deposit',
    name: 'Project Deposit',
    description: 'Secures your project start date and materials - applied to final balance',
    price: 50000, // $500.00
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_deposit', // REPLACE after Whop Dashboard creation
    trackingEvent: 'deposit_started',
    metadata: { serviceType: 'deposit', isSetupIntent: true },
  },
  flatRate: {
    id: 'plan_flat_rate',
    name: 'Standard Roof Replacement',
    description: 'Complete asphalt shingle roof replacement up to 2,000 sq ft',
    price: 250000, // $2,500.00
    currency: 'usd',
    type: 'one_time' as const,
    whopPlanId: 'plan_xxxxx_flat_rate', // REPLACE after Whop Dashboard creation
    trackingEvent: 'service_viewed',
    metadata: { serviceType: 'replacement' },
  },
} as const;
```

### Key Fields

| Field                    | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `price`                  | **In cents** (multiply dollars by 100)                              |
| `whopPlanId`             | **Must match Whop Dashboard exactly** — update after creating plans |
| `metadata.serviceType`   | Used for pixel tracking (`inspection`, `deposit`, `replacement`)    |
| `metadata.isSetupIntent` | Only `true` for deposit plan                                        |

### Adding a 4th Plan

1. Add new entry to `plans` object
2. Add route handling in `src/pages/Checkout.tsx` (plan selector)
3. Update `src/components/sections/Services.tsx` to display 4th card
4. Create plan in Whop Dashboard

---

## 📍 Step 4: Service Areas

**File**: `src/lib/config/company.ts` → `serviceAreas` array

```typescript
serviceAreas: [
  'Springfield',
  'Champaign',
  'Bloomington',
  'Decatur',
  'Peoria',
  // Add your cities
],
```

Used in:

- ServiceArea section (map/list display)
- Schema.org LocalBusiness markup
- Footer

---

## ⭐ Step 5: Reviews & Testimonials

**File**: `src/lib/config/company.ts` → `reviews` array

```typescript
reviews: [
  { name: 'Sarah M.', rating: 5, text: 'Excellent work, professional team!', date: '2024-01-15' },
  { name: 'James R.', rating: 5, text: 'Fixed our leak in one day. Highly recommend.', date: '2024-02-20' },
  { name: 'Lisa K.', rating: 5, text: 'Fair pricing, great communication throughout.', date: '2024-03-10' },
  // Add your real reviews
],
```

### Fields

| Field    | Type   | Notes                                   |
| -------- | ------ | --------------------------------------- |
| `name`   | string | Customer name (initials OK for privacy) |
| `rating` | 1–5    | Star rating                             |
| `text`   | string | Testimonial text                        |
| `date`   | string | ISO date (YYYY-MM-DD)                   |

---

## 🔗 Step 6: Social Links & Footer

**File**: `src/lib/config/company.ts` → `socialLinks` + `footerLinks`

### Social Links

```typescript
socialLinks: [
  { label: 'Facebook', href: 'https://facebook.com/yourcompany', icon: 'facebook' },
  { label: 'Instagram', href: 'https://instagram.com/yourcompany', icon: 'instagram' },
  { label: 'Google Reviews', href: 'https://google.com/search?q=yourcompany+reviews', icon: 'google' },
  // Remove unused platforms
],
```

**Available icons**: `facebook`, `twitter`, `instagram`, `linkedin`, `google`, `youtube`, `tiktok`

### Footer Links

Three columns: Services, Company, Support. Customize labels and anchor links:

```typescript
footerLinks: {
  services: [
    { label: 'Residential Roofing', href: '#services' },
    { label: 'Commercial Roofing', href: '#services' },
    // ...
  ],
  company: [
    { label: 'About Us', href: '#about' },
    // ...
  ],
  support: [
    { label: 'Contact Us', href: '#contact' },
    // ...
  ],
},
```

---

## 🏷️ Step 7: Trust Badges

**File**: `src/lib/config/company.ts` → `trustBadges`

```typescript
trustBadges: [
  'Licensed & Insured',
  'BBB A+ Rating',
  '500+ Projects Completed',
  '10-Year Workmanship Warranty',
  'Free Estimates',
  'Emergency Service Available',
],
```

Shown in Hero section and Footer. Keep to 4–6 badges.

---

## 🖼️ Step 8: Favicon & Meta

### Favicon

Replace these files in `public/`:

- `favicon.ico` (32×32, 16×16)
- `favicon.svg` (vector, any size)

Generate at: https://realfavicongenerator.net/

### Meta Tags

**File**: `index.html`

```html
<meta
  name="description"
  content="Your Company - Professional roofing services in Your Area. Roof repair, replacement, inspection, and financing. Licensed & insured."
/>
<title>Your Company Name</title>
```

Also update Open Graph tags if you add them.

---

## 📝 Step 9: Estimate Form Options

**File**: `src/lib/config/services.ts`

```typescript
export const serviceOptions: ServiceOption[] = [
  { value: 'repair', label: 'Roof Repair' },
  { value: 'replacement', label: 'Roof Replacement' },
  { value: 'inspection', label: 'Roof Inspection' },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'other', label: 'Other / Not Sure' },
  // Add/remove as needed
];
```

Values are sent to Whop Dashboard as lead metadata.

---

## 💳 Step 10: Whop Dashboard Configuration

### 1. Create Plans

Go to **Whop Dashboard → Monetization → Plans → Create Plan**:

| Plan                          | Settings                                           |
| ----------------------------- | -------------------------------------------------- |
| **Roof Inspection**           | One-time • $149.00 • Copy Plan ID → `plans.ts`     |
| **Project Deposit**           | Setup Intent • $500.00 • Copy Plan ID → `plans.ts` |
| **Standard Roof Replacement** | One-time • $2,500.00 • Copy Plan ID → `plans.ts`   |

### 2. Create Product (Flat Rate)

**Whop Dashboard → Monetization → Products → Create Product**:

- Name: "Standard Roof Replacement"
- Copy Product ID → `.env` as `WHOP_FLAT_RATE_PRODUCT_ID`

### 3. Set Environment Variables

**Whop Dashboard → Your App → Settings → Environment Variables**:

| Variable                    | Value                             |
| --------------------------- | --------------------------------- |
| `WHOP_API_KEY`              | `whop_...` (from API Keys page)   |
| `WHOP_ACCOUNT_ID`           | `biz_...` (from Account settings) |
| `WHOP_APP_ID`               | `app_...` (from App settings)     |
| `WHOP_FLAT_RATE_PRODUCT_ID` | `prod_...` (from step 2)          |
| `VITE_WHOP_ACCOUNT_ID`      | Same as `WHOP_ACCOUNT_ID`         |
| `VITE_SITE_URL`             | `https://your-route.whop.site`    |

### 4. Update Plan IDs

After creating plans, update `src/lib/config/plans.ts`:

```typescript
whopPlanId: 'plan_actual_id_from_dashboard', // Not plan_xxxxx_inspection
```

### 5. Configure App Route

**File**: `whop.app.json`

```json
{
  "name": "your-company-name",
  "type": "website",
  "route": "your-company-name",
  "buildCommand": "npm run build",
  "outputDir": "dist",
  "framework": "vite"
}
```

The `route` becomes your URL: `https://your-company-name.whop.site`

---

## 🏗️ Step 11: Build & Test Locally

```bash
# Install deps
npm install

# Build
npm run build

# Preview production build
npm run preview
```

Check:

- [ ] Homepage loads with your branding
- [ ] Colors match your brand
- [ ] Logo displays correctly
- [ ] Service areas show your cities
- [ ] Reviews show your testimonials
- [ ] Footer links work
- [ ] Estimate form submits (check console for API calls)

---

## 🚀 Step 12: Deploy

```bash
# Authenticate
whop auth login

# Deploy
whop apps deploy
```

Visit `https://your-route.whop.site` and verify all flows (see DEPLOYMENT_GUIDE.md).

---

## 📋 Quick Checklist

| Task                             | File               | Done |
| -------------------------------- | ------------------ | ---- |
| Company name, tagline, contact   | `company.ts`       | ☐    |
| Brand colors                     | `company.ts`       | ☐    |
| Logo                             | `public/logo.svg`  | ☐    |
| Service areas                    | `company.ts`       | ☐    |
| Reviews                          | `company.ts`       | ☐    |
| Trust badges                     | `company.ts`       | ☐    |
| Social links                     | `company.ts`       | ☐    |
| Footer links                     | `company.ts`       | ☐    |
| Plan names, prices, descriptions | `plans.ts`         | ☐    |
| Whop Plan IDs                    | `plans.ts`         | ☐    |
| Service options                  | `services.ts`      | ☐    |
| Favicon                          | `public/favicon.*` | ☐    |
| Meta description/title           | `index.html`       | ☐    |
| Whop Dashboard plans created     | Dashboard          | ☐    |
| Whop Dashboard product created   | Dashboard          | ☐    |
| Env vars in Whop Dashboard       | Dashboard          | ☐    |
| `whop.app.json` route            | `whop.app.json`    | ☐    |
| Build passes                     | `npm run build`    | ☐    |
| Deploy succeeds                  | `whop apps deploy` | ☐    |

---

## 🔧 Advanced Customization

### Modify Hero Section

**File**: `src/components/sections/Hero.tsx`

Edit headline, subheadline, CTA buttons, background image.

### Modify Services Cards

**File**: `src/components/sections/Services.tsx`

Uses `plans` config automatically. To change layout, edit this component.

### Add New Page

1. Create `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Navigation.tsx`

### Custom CSS

Add to `src/index.css` or create component-specific CSS modules.

---

## 🆘 Troubleshooting

| Issue                    | Solution                                                   |
| ------------------------ | ---------------------------------------------------------- |
| Colors not updating      | Restart dev server (`npm run dev`)                         |
| Plan ID errors           | Verify `whopPlanId` matches Dashboard exactly              |
| Build fails              | Run `npm run lint` for TypeScript errors                   |
| Pixel events not firing  | Check browser console, verify `WhopPixelEvents` in App.tsx |
| Checkout redirects wrong | Verify `VITE_SITE_URL` matches deployed URL                |

---

## 📚 Related Docs

- [README.md](./README.md) — Project overview & deployment
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) — Detailed deployment & verification
- [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) — Pre-launch checklist
- Whop Docs: https://dev.whop.com

---

**Need help?** Check the Whop Discord or create an issue in this template's repository.
