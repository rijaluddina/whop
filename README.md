# Summit Ridge Roofing

Website roofing untuk Whop dengan formulir estimasi, checkout, dan dashboard owner. Harga dan ID plan ada di [src/demo-config.ts](src/demo-config.ts). Plan yang tercantum menggunakan pembayaran live.

## Persiapan

Siapkan Node.js, pnpm, app Whop yang terhubung melalui `whop.app.json`, serta akun Resend dengan domain pengirim yang telah diverifikasi. Jalankan perintah dari direktori proyek:

```bash
cd /home/rjlddna/Documents/freelance/roofing/websit
pnpm install
```

Ada tiga file konfigurasi yang digunakan:

| File | Fungsi |
| --- | --- |
| `.dev.thrive.local` | Konfigurasi akun dan dashboard untuk skrip deploy; juga menjadi sumber nilai pengembangan lokal. |
| `.secrets.thrive.local` | Secret OAuth, webhook, Resend, dan sesi untuk skrip deploy; juga menjadi sumber nilai pengembangan lokal. |
| `.dev.vars` | Konfigurasi yang dibaca server saat menjalankan aplikasi di komputer lokal. |

Ketiga file tersebut diabaikan oleh Git. Jangan unggah atau bagikan isinya. Buat dua file pertama dari contoh berikut; `cp -n` mempertahankan file yang sudah ada:

```bash
cp -n .dev.thrive.local.example .dev.thrive.local
cp -n .secrets.thrive.local.example .secrets.thrive.local
```

Buka kedua file dan ganti semua nilai contoh dengan nilai Anda. Tulis setiap nilai pada baris `NAMA=nilai` tanpa tanda kutip; skrip deploy membaca teks setelah tanda `=` secara langsung.

### Isi `.dev.thrive.local`

| Variabel | Nilai yang diisi |
| --- | --- |
| `OWNER_DASHBOARD_USERNAME` | Username untuk login dashboard owner, maksimal 128 karakter. |
| `OWNER_DASHBOARD_PASSWORD` | Password dashboard, minimal 32 karakter. |
| `OWNER_ROUTE_SLUG` | Slug rahasia pilihan Anda, hanya huruf, angka, dan tanda hubung; dipakai dalam URL dashboard. |
| `WHOP_ACCOUNT_ID` | ID bisnis Whop live, berawalan `biz_`; dipakai saat menjalankan aplikasi lokal. |
| `WHOP_API_KEY` | API key bisnis Whop live dengan izin yang diperlukan; dipakai secara lokal dan oleh skrip pendaftaran webhook. |
| `WHOP_CLIENT_ID` | App ID Whop, berawalan `app_`; untuk OAuth lokal. |
| `WHOP_REDIRECT_URI` | URL callback OAuth yang sesuai dengan alamat aplikasi, untuk pengembangan lokal. |
| `WHOP_PIXEL_HOSTNAME` | Hostname website tanpa `https://`, untuk pengembangan lokal. |
| `WHOP_ENVIRONMENT` | Isi `production` untuk menggunakan konfigurasi live. |

### Isi `.secrets.thrive.local`

| Variabel | Nilai yang diisi |
| --- | --- |
| `WHOP_CLIENT_SECRET` | Client secret dari pengaturan OAuth app Whop. |
| `WHOP_WEBHOOK_SECRET` | Signing secret webhook Whop, berawalan `ws_`. |
| `RESEND_API_KEY` | API key Resend. |
| `ESTIMATE_EMAIL_FROM` | Alamat pengirim pada domain yang telah diverifikasi di Resend, misalnya `hello@domain-anda.com`. |
| `SESSION_SECRET` | Secret acak minimal 32 karakter untuk menandatangani sesi. Skrip deploy membuat dan menyimpannya otomatis jika belum ada. |

Untuk membuat `SESSION_SECRET` sendiri, jalankan `openssl rand -hex 32`, lalu simpan hasilnya sebagai `SESSION_SECRET=hasil` di `.secrets.thrive.local`. Gunakan nilai yang sama setiap kali deploy agar sesi yang ada tetap berlaku.

Daftarkan callback `https://summit-roofing-thrive.whop.site/auth/callback` di pengaturan OAuth app Whop. Jika memakai domain lain, sesuaikan URL tersebut. Izin Whop yang diperlukan tercantum di [scripts/app-permissions.json](scripts/app-permissions.json).

## Menjalankan secara lokal

1. Buat `.dev.vars` di direktori proyek. Salin baris variabel dari `.dev.thrive.local` dan `.secrets.thrive.local` ke file tersebut, termasuk `SESSION_SECRET`. Jangan menyalin komentar contoh sebagai nilai. Jika `.dev.vars` sudah ada, perbarui isinya tanpa menghapus nilai yang masih Anda perlukan.
2. Untuk OAuth lokal, atur `WHOP_REDIRECT_URI=http://localhost:3000/auth/callback` di `.dev.vars` dan daftarkan URL yang sama di pengaturan OAuth Whop jika Whop menerima callback tersebut. Untuk alur yang memerlukan HTTPS, gunakan alamat HTTPS yang dapat diakses dan daftarkan callback yang sesuai.
3. Jalankan:

```bash
pnpm dev
```

Buka `http://localhost:3000`. Untuk pemeriksaan kode dan build, jalankan `pnpm typecheck` dan `pnpm build`. Perubahan pada kedua file `.local` tidak otomatis memperbarui `.dev.vars`; salin nilai yang berubah ke `.dev.vars` juga.

## Deploy di Whop

1. Pastikan `whop.app.json` menunjuk app Whop yang benar, lalu login dan periksa akun CLI:

   ```bash
   pnpm exec whop auth login
   ```

2. Buat webhook di dashboard Whop dengan URL `https://summit-roofing-thrive.whop.site/api/whop-webhook` dan event `setup_intent.succeeded`, `payment.succeeded`, dan `payment.failed`. Simpan signing secret-nya di `.secrets.thrive.local`. Untuk domain lain, sesuaikan URL. Alternatifnya, `bash scripts/register-webhook.sh` mendaftarkan webhook menggunakan `WHOP_API_KEY` dari `.dev.thrive.local`; simpan secret yang ditampilkan ke `.secrets.thrive.local`.
3. Setelah kedua file `.local` diisi, kirim konfigurasi ke app:

   ```bash
   bash scripts/set-production-secrets.sh
   ```

   Skrip mengambil app ID dari `whop.app.json`, membuat `SESSION_SECRET` jika belum ada, dan memakai domain `summit-roofing-thrive.whop.site` secara default untuk callback dan hostname Pixel. Untuk domain lain, jalankan skrip dengan `SITE_DOMAIN=domain-anda.com` di depannya dan daftarkan callback yang sesuai di Whop. `WHOP_ACCOUNT_ID` disediakan oleh runtime Whop dan panggilan API server ditandatangani oleh proxy Whop; skrip tidak mengunggah `WHOP_API_KEY` lokal.
4. Deploy dan periksa build:

   ```bash
   WHOP_ENVIRONMENT=production pnpm exec whop apps deploy
   pnpm exec whop apps builds list
   ```

   Perintah deploy menetapkan mode live secara eksplisit, termasuk jika `.dev.vars` memiliki nilai lain.

## Dashboard owner dan email

Buka `/<slug>/leads`, `/<slug>/invoice`, atau `/<slug>/pixel` melalui HTTPS, dengan `<slug>` sesuai `OWNER_ROUTE_SLUG`. Jika belum login, Anda diarahkan ke `/<slug>/login`. Masukkan `OWNER_DASHBOARD_USERNAME` dan `OWNER_DASHBOARD_PASSWORD`. Sesi berlaku 12 jam dan dapat diakhiri dengan **Log out**.

Email konfirmasi estimasi dikirim melalui Resend menggunakan `RESEND_API_KEY` dan `ESTIMATE_EMAIL_FROM`. Lead tetap disimpan jika email gagal dikirim; formulir menampilkan status email secara terpisah.

## Event Pixel

Situs memanggil `whop.track` untuk event berikut:

- `service_viewed`: ketika setidaknya separuh kartu layanan terlihat di halaman utama, sekali per kartu selama halaman tersebut terbuka.
- `estimate_requested`: setelah permintaan estimasi berhasil disimpan dan server mengembalikan ID lead. Situs juga mengirim event `lead` pada saat itu.
- `deposit_started`: saat checkout deposit dibuka, atau setelah konfigurasi checkout deposit berhasil dibuat dalam alur setup pembayaran.
- `checkout_completed`: setelah checkout mengembalikan hasil pembayaran.

Whop mencatat page view dan event checkout otomatis. Dashboard `/<slug>/pixel` menampilkan tiga event kustom pertama, `pixel.page`, event yang nama tipenya mengandung `checkout`, dan `payment.completed` dari data Whop. Event `lead` dan `checkout_completed` yang diterima sebagai `pixel.custom` tidak termasuk dalam filter dashboard saat ini.

Dashboard meminta event akun untuk tujuh hari terakhir, 25 event Whop per halaman, lalu menerapkan filter tampilan. Karena penyaringan dilakukan setelah data diterima, sebuah halaman dapat kosong meskipun ada event yang cocok pada halaman berikutnya. Gunakan **Older events** bila tersedia; tombol itu tetap berada dalam rentang tujuh hari yang sama. Kolom tanpa data ditampilkan sebagai `—`, dan waktu ditampilkan dalam UTC.
