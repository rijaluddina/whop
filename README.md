# Whop Business Website

Website layanan dengan Whop Payment Elements, form estimate yang membuat Whop Lead dan conversion event, serta endpoint admin untuk membuat draft invoice saldo akhir. Informasi bisnis dan layanan berada di satu file konfigurasi; environment menyimpan integrasi Whop dan nilai khusus deployment.

## Mulai lokal

```bash
npm install
cp .env.example .env.local
cp .dev.vars.example .dev.vars
npm run dev
```

Isi nilai Sandbox sebelum membuka halaman checkout. `.env.local` berisi plan ID yang boleh tampil di browser. `.dev.vars` berisi kredensial server-side; jangan commit atau bagikan file tersebut.

## Siapkan Whop

1. Buat produk dan plan di akun Whop yang sama. Catat account ID dan plan ID untuk inspection, deposit, dan replacement.
2. Isi `VITE_WHOP_PLAN_INSPECTION`, `VITE_WHOP_PLAN_DEPOSIT`, `VITE_WHOP_PLAN_REPLACEMENT`, dan `VITE_WHOP_ENVIRONMENT` di `.env.local`.
3. Isi `APEX_WHOP_API_KEY`, `APEX_WHOP_ACCOUNT_ID`, `APEX_WHOP_ENVIRONMENT`, dan `APEX_INVOICE_ADMIN_TOKEN` di `.dev.vars` untuk local Worker.
4. Sebelum deploy, atur secret server di Whop App Settings, termasuk token admin invoice yang dibuat acak (minimal 32 karakter). Gunakan plan ID dan API key dari environment yang sama: semuanya Sandbox untuk uji coba atau semuanya Live untuk production.
5. Pastikan jumlah harga yang ditampilkan pada `businessConfig.plans` cocok dengan harga plan Whop. Harga final checkout tetap ditentukan oleh Whop.

API key harus memiliki izin membuat lead (`lead:manage`) dan conversion event (`event:create`). Jika memakai endpoint invoice, key juga memerlukan izin Whop invoice (`invoice:create`, `member:email:read`, `member:basic:read`, `payment:basic:read`). Jangan gunakan awalan `VITE_` pada nama API key atau secret server lain karena variabel `VITE_` dapat masuk ke bundle browser.

Endpoint `POST /api/invoices` hanya menerima request dengan `Authorization: Bearer <APEX_INVOICE_ADMIN_TOKEN>`. Ia membuat **draft** invoice Whop, bukan mengirim atau menagih pelanggan. Buat token dengan `openssl rand -hex 32`, lalu kirim JSON `{ "name": "Customer", "email": "customer@example.com", "description": "Final balance — roof replacement", "amountCents": 125000 }`; `amountCents` adalah integer dalam sen. Finalisasi dan pengiriman invoice dilakukan dari Whop Dashboard setelah detail pekerjaan diperiksa. Jangan pernah menaruh token admin di frontend.

## Sesuaikan untuk bisnis lain

Edit [`src/lib/config/business.ts`](src/lib/config/business.ts):

- `company`: nama, tagline, kontak, alamat, wilayah layanan, mata uang, locale, warna, ulasan, trust badges, tautan sosial, dan footer.
- `services`: judul, deskripsi, dan daftar fitur setiap kartu layanan.
- `plans`: nama, harga dalam unit minor mata uang (contoh USD 149 = `14900`), ringkasan checkout, detail, serta metadata. Cocokkan juga plan ID di `.env.local` dan Whop Dashboard.

Edit `index.html` untuk judul, deskripsi SEO, dan favicon di `public/favicon.svg`. Beberapa heading/CTA umum dan ilustrasi ikon masih berada di komponen halaman. Template ini berisi contoh ulasan dan klaim trust; ganti dengan informasi asli sebelum dipakai bisnis nyata.

## Environment variables

Salin `.env.example` ke `.env.local`. Variabel yang tersedia:

| Variable | Lokasi | Kegunaan |
| --- | --- | --- |
| `VITE_WHOP_ENVIRONMENT` | `.env.local` / Whop build settings | `sandbox` atau `production` |
| `VITE_WHOP_PLAN_INSPECTION` | `.env.local` / Whop build settings | Plan ID checkout inspection |
| `VITE_WHOP_PLAN_DEPOSIT` | `.env.local` / Whop build settings | Plan ID checkout deposit |
| `VITE_WHOP_PLAN_REPLACEMENT` | `.env.local` / Whop build settings | Plan ID checkout replacement |
| `APEX_WHOP_API_KEY` | `.dev.vars` / Whop App Settings | API key server-side untuk membuat lead |
| `APEX_WHOP_ACCOUNT_ID` | `.dev.vars` / Whop App Settings | Account ID pemilik lead |
| `APEX_WHOP_ENVIRONMENT` | `.dev.vars` / Whop App Settings | Environment API server: `sandbox` atau `production` |
| `APEX_INVOICE_ADMIN_TOKEN` | `.dev.vars` / Whop App Settings | Bearer secret khusus untuk akses endpoint pembuatan draft invoice |

Nilai `VITE_*` bersifat publik. API key dan secret hanya dimasukkan pada `.dev.vars` lokal atau Whop App Settings.

## Build dan deploy

```bash
npm run typecheck
npm run lint
npm run build
npm run deploy
```

Whop App ID untuk deploy dibaca dari `whop.app.json`. Ganti `app_id` agar menunjuk ke Whop app milik bisnis yang akan menerima deploy. Metode pembayaran yang ditampilkan juga bergantung pada konfigurasi Whop, domain yang diverifikasi, browser, perangkat, dan wilayah pembeli.
