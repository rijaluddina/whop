# Summit Ridge Roofing

Template demo Whop Websites untuk layanan roofing. Harga dan plan checkout ada di [src/demo-config.ts](src/demo-config.ts). Checkout menggunakan plan live dan pembayaran berhasil dapat menimbulkan tagihan nyata.

## Pengembangan

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

Untuk menguji fitur server secara lokal, isi file `.dev.vars` dengan konfigurasi berikut dan jalankan `pnpm dev`. Redirect OAuth harus didaftarkan persis seperti URL yang dipakai. Setup metode pembayaran memerlukan URL HTTPS.

| Nama | Isi |
| --- | --- |
| `WHOP_CLIENT_ID` | ID app Whop |
| `WHOP_CLIENT_SECRET` | Secret OAuth app |
| `WHOP_REDIRECT_URI` | URL absolut yang berakhir dengan `/auth/callback` |
| `SESSION_SECRET` | Secret acak minimal 32 karakter |
| `WHOP_ACCOUNT_ID` | ID bisnis Whop dengan awalan `biz_` |
| `WHOP_API_KEY` | Kunci server yang terikat ke bisnis tersebut |
| `WHOP_WEBHOOK_SECRET` | Signing secret webhook dari Whop |
| `OWNER_DASHBOARD_PASSWORD` | Password acak minimal 32 karakter, khusus operator dashboard |
| `OWNER_ROUTE_SLUG` | Slug dashboard pilihan operator, berisi huruf, angka, atau tanda hubung |
| `WHOP_PIXEL_HOSTNAME` | Hostname situs, tanpa protokol atau path |
| `RESEND_API_KEY` | API key Resend untuk email konfirmasi estimasi |
| `ESTIMATE_EMAIL_FROM` | Alamat pengirim pada domain yang diverifikasi di Resend |

`WHOP_ACCOUNT_ID` dan `WHOP_API_KEY` hanya untuk pengembangan lokal. Di runtime hosted Whop, `WHOP_ACCOUNT_ID` disuntikkan otomatis dan panggilan API server-side ditandatangani proxy runtime dengan key milik app — lihat [Hosting](https://docs.whop.com/developer/websites/hosting.md). Karena itu keduanya tidak diset sebagai secret produksi oleh `scripts/set-production-secrets.sh`.

Gunakan izin API sesuai endpoint yang dipakai. Daftar lengkap izin yang dibutuhkan site ini tersimpan di [scripts/app-permissions.json](scripts/app-permissions.json) dan bisa diterapkan dengan `pnpm exec whop apps permissions <app_id> --requested_permissions "$(cat scripts/app-permissions.json)"` (butuh login `whop login --method api-key` yang memiliki izin `developer:update_app_authorization`, atau atur dari dashboard). Alur invoice native memerlukan izin baca pembayaran, penagihan, pembuatan plan inline, dan baca email member untuk konfirmasi penerima. Alur lead memerlukan izin baca dan kelola lead beserta izin baca member dan produk. Tambahkan izin checkout configuration, setup intent, member, dan event sesuai dokumentasi endpoint.

## Deploy di Whop

1. Jalankan `pnpm exec whop auth login` dan pastikan akun yang aktif memiliki akses ke app yang tertera di `whop.app.json`.
2. Daftarkan URL callback produksi di pengaturan OAuth app. Masukkan konfigurasi produksi melalui `pnpm exec whop apps secrets set` — `scripts/set-production-secrets.sh` menggunakan `.secrets.thrive.local` dan `.dev.thrive.local` yang tidak di-track git. Jangan masukkan nilai secret ke repository.
3. Jalankan `pnpm exec whop apps deploy`. Gunakan `pnpm exec whop apps builds list` untuk memeriksa build.
4. Daftarkan webhook produksi ke `/api/whop-webhook` dengan event `setup_intent.succeeded`, `payment.succeeded`, dan `payment.failed`. `scripts/register-webhook.sh` mendaftarkannya lewat API, mem-pin `api_version_date` 2026-10-24 agar payload cocok dengan pembacaan REST app, dan menampilkan secret penandatangan sekali.

Buka `/<slug>/leads`, `/<slug>/invoice`, atau `/<slug>/pixel` langsung melalui HTTPS. Masukkan username `owner` dan password dashboard pada dialog browser. Akses ini memakai kredensial operator yang dikonfigurasi di server. Embed ditunda. Uji permintaan estimasi, setup metode pembayaran, pembayaran deposit, dan invoice pada sesi yang sesuai. Cek pembayaran dan event di Whop sebelum menganggap pengujian berhasil.

Untuk email konfirmasi estimasi, verifikasi domain pengirim di Resend, isi `RESEND_API_KEY` dan `ESTIMATE_EMAIL_FROM` di `.secrets.thrive.local` (produksi, dikirim oleh `scripts/set-production-secrets.sh`) serta `.dev.vars` (pengembangan lokal). Lead tetap disimpan jika email tidak terkirim; form menampilkan status email secara terpisah. Resend menggunakan ID permintaan untuk mencegah email duplikat saat permintaan diulang.
