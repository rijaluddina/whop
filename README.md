# Apex Roofing — Whop Website Template

A production-ready roofing company website template built for the **Whop platform**. Features a complete checkout flow with Whop Elements, lead capture, pixel tracking, and final invoice generation.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-teal)
![Whop](https://img.shields.io/badge/Whop-Platform-orange)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Whop Account** with API access
- **Whop CLI** (`npm install -g @whop/cli`)

### Installation

```bash
# Clone the template
git clone <your-repo-url> my-roofing-site
cd my-roofing-site

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Whop credentials
# (see Environment Variables section below)

# Start development server
npm run dev
```

Open http://localhost:5173 to see the site.

---

## 📁 Project Structure

```
src/
├── App.tsx                      # Main app with routing
├── main.tsx                     # Entry point
├── entry-server.ts              # SSR entry for Whop
├── index.css                    # Global styles + Tailwind
├── components/
│   ├── layout/                  # Header, Footer, Navigation
│   ├── sections/                # Hero, Services, ServiceArea, Financing, Reviews, Contact
│   ├── forms/                   # EstimateForm
│   ├── checkout/                # CheckoutElements, FinalInvoiceDemo
│   ├── tracking/                # WhopPixelEvents
│   ├── ui/                      # Button, Input, Card, Select, etc.
│   └── icons/                   # FinancingIcons
├── hooks/
│   ├── useWhopCheckout.ts       # Whop checkout integration
│   ├── useEstimateForm.ts       # Estimate form logic
│   └── useTracking.ts           # Pixel event helpers
├── lib/
│   ├── api/                     # API routes (leads, setup-intents, invoices)
│   ├── config/                  # Company, plans, services, tracking config
│   ├── whop-client.ts           # Whop SDK client
│   └── utils/                   # Navigation helpers
└── pages/
    ├── Checkout.tsx             # Checkout page
    ├── CheckoutSuccess.tsx      # Success page
    └── InvoicePayment.tsx       # Final invoice payment page
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` from `.env.example` and fill in your Whop credentials:

```bash
# Server-side (set in Whop Dashboard → App Settings → Environment Variables)
WHOP_API_KEY=whop_xxxxxxxxxxxx           # Your Whop API key
WHOP_ACCOUNT_ID=biz_xxxxxxxxxxxx         # Your business account ID
WHOP_APP_ID=app_xxxxxxxxxxxx             # Your app ID
WHOP_FLAT_RATE_PRODUCT_ID=prod_xxxxxxxxxxxx  # Flat-rate product ID

# Client-side (prefixed with VITE_ for Vite)
VITE_WHOP_ACCOUNT_ID=biz_xxxxxxxxxxxx    # Same as WHOP_ACCOUNT_ID
VITE_SITE_URL=https://your-site.whop.site
```

| Variable                    | Required | Description                              |
| --------------------------- | -------- | ---------------------------------------- |
| `WHOP_API_KEY`              | ✅       | Whop API key (starts with `whop_`)       |
| `WHOP_ACCOUNT_ID`           | ✅       | Business account ID (starts with `biz_`) |
| `WHOP_APP_ID`               | ✅       | App ID (starts with `app_`)              |
| `WHOP_FLAT_RATE_PRODUCT_ID` | ✅       | Product ID for flat-rate replacement     |
| `VITE_WHOP_ACCOUNT_ID`      | ✅       | Client-side account ID                   |
| `VITE_SITE_URL`             | ✅       | Production URL for redirects             |

### Whop Dashboard Setup

Before deploying, create these in **Whop Dashboard → Monetization → Plans**:

| Plan                          | Type         | Price  | Purpose                                |
| ----------------------------- | ------------ | ------ | -------------------------------------- |
| **Roof Inspection**           | One-time     | $149   | Inspection checkout                    |
| **Project Deposit**           | Setup Intent | $500   | Saves payment method for final invoice |
| **Standard Roof Replacement** | One-time     | $2,500 | Full replacement checkout              |

Also create a **Product** for the flat-rate plan to get `WHOP_FLAT_RATE_PRODUCT_ID`.

After creating plans, update `src/lib/config/plans.ts` with the actual Plan IDs:

```typescript
// src/lib/config/plans.ts
export const plans = {
  inspection: {
    whopPlanId: 'plan_actual_id_from_dashboard', // Replace placeholder
    // ...
  },
  deposit: {
    whopPlanId: 'plan_actual_id_from_dashboard',
    // ...
  },
  flatRate: {
    whopPlanId: 'plan_actual_id_from_dashboard',
    // ...
  },
};
```

---

## 🛠️ Development

### Commands

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start dev server (Vite)                |
| `npm run build`        | Build for production (client + server) |
| `npm run build:client` | Build client bundle only               |
| `npm run build:server` | Build SSR server bundle only           |
| `npm run preview`      | Preview production build locally       |
| `npm run lint`         | Run ESLint                             |
| `npm run format`       | Format with Prettier                   |

### Tech Stack

- **Framework**: React 18 + React Router 7
- **Build**: Vite 5 (SSR + Client)
- **Styling**: Tailwind CSS 3
- **Platform**: Whop (Cloudflare Workers)
- **Payments**: Whop Elements React + Whop SDK
- **Notifications**: Sonner (toasts)
- **TypeScript**: Strict mode

---

## 🚢 Deployment

### Build Production Bundle

```bash
npm run build
```

Output structure:

```
dist/
├── client/           # Client assets
│   ├── index.html
│   ├── index.js
│   ├── favicon.ico
│   ├── favicon.svg
│   └── assets/
├── server/           # SSR worker
│   ├── index.js
│   ├── favicon.ico
│   └── favicon.svg
├── whop-build.zip    # Deployment package
└── manifest.json     # Inside zip
```

### Deploy to Whop

```bash
# Authenticate (one-time)
whop auth login

# Or set API key
export WHOP_API_KEY=whop_xxxxxxxxxxxx

# Deploy
whop apps deploy
```

Deploys to: `https://your-route.whop.site` (from `whop.app.json`)

### Post-Deployment Verification

Visit these URLs and verify functionality:

| Page                | URL                                                        | Test              |
| ------------------- | ---------------------------------------------------------- | ----------------- |
| Homepage            | `https://your-site.whop.site`                              | All sections load |
| Inspection Checkout | `/checkout?plan=inspection`                                | $149 payment      |
| Deposit Checkout    | `/checkout?plan=deposit`                                   | $500 setup intent |
| Flat Rate Checkout  | `/checkout?plan=flatRate`                                  | $2,500 payment    |
| Invoice Payment     | `/invoice/payment?plan=flatRate&invoice_id=...&amount=...` | Final balance     |

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed verification checklist.

---

## 🎨 Customization

This template is designed to be easily rebranded for any roofing company.

**See [TEMPLATE_CUSTOMIZATION.md](./TEMPLATE_CUSTOMIZATION.md)** for a complete step-by-step guide covering:

- Company info (name, logo, colors, contact)
- Service offerings & pricing
- Service areas
- Reviews & testimonials
- Social links & footer
- Plan configuration
- Whop Dashboard setup

---

## 📊 Pixel Tracking (Analytics)

The template fires these Whop Pixel events automatically:

| Event                         | Trigger                   | Data                                |
| ----------------------------- | ------------------------- | ----------------------------------- |
| `estimate_requested`          | Estimate form submit      | `lead_id`, `service_type`           |
| `service_viewed` (inspection) | Inspection checkout loads | `service: "inspection"`, `plan_id`  |
| `service_viewed` (deposit)    | Deposit checkout loads    | `service: "deposit"`, `plan_id`     |
| `service_viewed` (flatRate)   | Flat rate checkout loads  | `service: "replacement"`, `plan_id` |
| `deposit_started`             | Deposit checkout loads    | `plan_id`, `amount: 50000`          |

View in **Whop Dashboard → Analytics → Pixel Events**.

---

## 🔧 API Routes

| Route                         | Method | Purpose                                    |
| ----------------------------- | ------ | ------------------------------------------ |
| `/api/leads`                  | POST   | Create lead from estimate form             |
| `/api/setup-intents/finalize` | POST   | Finalize deposit setup intent              |
| `/api/invoices/create-final`  | POST   | Create final invoice for deposit customers |

All routes are serverless functions deployed as Cloudflare Workers via Whop.

---

## 📄 License

This template is provided as-is for Whop platform developers. Customize freely for your roofing business.

---

## 🆘 Support

- **Whop CLI Docs**: https://dev.whop.com/cli
- **Whop Elements**: https://dev.whop.com/elements/react
- **Whop SDK**: https://dev.whop.com/sdk
- **Whop Dashboard**: https://whop.com/dashboard

---

## 📝 Version History

| Version | Date       | Changes         |
| ------- | ---------- | --------------- |
| 0.0.1   | 2026-10-30 | Initial release |

---

**Built for the Whop Platform** • **Deployed on Cloudflare Workers** • **Powered by React & Tailwind**
