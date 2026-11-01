# Apex Roofing — Whop Website Template

A production-ready website template for US roofing companies built on **Whop Websites** and deployed to `whop.app`. Designed for the high-ticket roofing vertical, featuring an end-to-end **deposit → job → final invoice** workflow, full **Whop Payment Elements**, custom **Whop Pixel tracking**, and **Whop Leads API** integration.

---

### One-Paragraph Feature Summary (for Bounty Submission)
> We built a production-ready roofing website template deployed on Whop Websites that completely implements the high-ticket deposit → job → final invoice workflow. Checkouts are powered entirely by Whop Payment Elements including `CheckoutElement`, `ExpressCheckoutElement` (Apple Pay and Google Pay), and the mandatory `BrandingElement`, automatically surfacing Buy Now Pay Later financing (Klarna, Splitit, Afterpay) without custom card forms. The "Request an Estimate" form integrates directly with the Whop Leads API (`POST /api/leads`) to enroll visitors as connected accounts and capture qualified leads. The deposit checkout ($500) secures project booking and captures card-on-file via a setup intent, seamlessly connecting to an interactive Whop Invoices API portal (`/admin/invoices` & `POST /api/invoices`) capable of auto-charging stored payment methods (`payment_method_id`) or sending manual invoice links for the remaining balance. Finally, real-time custom pixel events (`estimate_requested`, `service_viewed`, and `deposit_started`) fire through `whop.track` with visual console feedback for complete auditability.

---

## Fitur Utama & Integrasi Whop

1. **Whop Payment Elements**:
   - `CheckoutElement`: Formulir checkout pembayaran terkelola lengkap.
   - `ExpressCheckoutElement`: Akselerasi pembayaran 1-klik melalui Apple Pay & Google Pay.
   - `BrandingElement`: Elemen kepatuhan & branding wajib dari Whop.
   - Tanpa form kartu kustom — opsi financing BNPL (Klarna, Afterpay, Splitit) muncul otomatis untuk merchant yang disetujui.

2. **Whop Pixel Tracking (`whop.track`)**:
   - `estimate_requested`: Ditembakkan otomatis saat form estimate berhasil dikirim.
   - `service_viewed`: Ditembakkan saat pengunjung melihat kartu layanan atau membuka checkout plan tertentu.
   - `deposit_started`: Ditembakkan saat pengunjung memulai proses checkout deposit proyek ($500).
   - Dilengkapi console visual logger untuk verifikasi mudah saat screen recording.

3. **Whop Leads API**:
   - Form "Request an Estimate" terhubung ke endpoint server-side `/api/leads`.
   - Menggunakan `@whop/sdk` untuk mendaftarkan akun pengunjung dan membuat entitas Lead resmi di Whop Dashboard.

4. **Alur Deposit → Card-on-File → Final Balance Invoice**:
   - Deposit ($500) mengamankan jadwal proyek dan menyimpan kartu pelanggan (Setup Intent).
   - Halaman `/admin/invoices` dan endpoint `/api/invoices` mendemonstrasikan penagihan sisa saldo proyek akhir melalui Whop Invoices API (pilihan auto-charge stored payment method `payt_...` atau pengiriman invoice manual via email).

5. **Struktur Halaman Lengkap**:
   - Hero dengan trust badges & call to action.
   - Services (Repair, Replacement, Inspection).
   - Service Area (wilayah jangkauan lokal).
   - Financing Callout (pembiayaan fleksibel Klarna / Splitit / Afterpay via Whop).
   - Reviews & Testimonials.
   - Contact / Estimate Form.

---

## Mulai Lokal

```bash
npm install
cp .env.example .env.local
cp .dev.vars.example .dev.vars
npm run dev
```

Isi nilai Sandbox di `.env.local` dan `.dev.vars` sebelum membuka halaman checkout.

## Variabel Environment

| Variable                          | Lokasi                             | Kegunaan                                                          |
| --------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| `VITE_WHOP_ENVIRONMENT`           | `.env.local` / Whop build settings | `sandbox` atau `production`                                       |
| `VITE_WHOP_ACCOUNT_ID`            | `.env.local` / Whop build settings | Account ID bisnis Whop                                            |
| `VITE_WHOP_PLAN_INSPECTION`       | `.env.local` / Whop build settings | Plan ID checkout inspection ($149)                                |
| `VITE_WHOP_PLAN_DEPOSIT`          | `.env.local` / Whop build settings | Plan ID checkout deposit ($500)                                   |
| `VITE_WHOP_PLAN_REPLACEMENT`      | `.env.local` / Whop build settings | Plan ID checkout replacement ($2,500)                             |
| `APEX_WHOP_API_KEY`               | `.dev.vars` / Whop App Settings    | API key server-side untuk membuat lead & invoice                  |
| `APEX_WHOP_ACCOUNT_ID`            | `.dev.vars` / Whop App Settings    | Account ID pemilik lead & invoice                                 |
| `APEX_WHOP_ENVIRONMENT`           | `.dev.vars` / Whop App Settings    | Environment API server: `sandbox` atau `production`               |
| `APEX_WHOP_FINAL_BALANCE_PLAN_ID` | `.dev.vars` / Whop App Settings    | Varian tersembunyi yang dipakai draft invoice saldo akhir         |
| `APEX_INVOICE_ADMIN_TOKEN`        | `.dev.vars` / Whop App Settings    | Secret khusus untuk akses endpoint pembuatan invoice (opsional di sandbox) |

## Build dan Deploy

```bash
npm run typecheck
npm run lint
npm run build
npm run deploy
```
