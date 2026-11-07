# Rencana: Summit Ridge Roofing

## Tujuan dan batas demo

Website Whop yang dapat dipakai ulang untuk mempresentasikan layanan roofing, permintaan estimasi, pembayaran inspeksi atau deposit, dan penagihan akhir. Nama, kontak, lokasi, layanan, dan harga disimpan dalam konfigurasi; semua identitas dan ulasan fiktif harus jelas sebagai demo. Website terhubung ke `app_6rd7jBgosXtkt3` dan `the-curiosity-labs.whop.site`.

## Fase 0 — Pembuktian platform

- Baca [sandbox](https://docs.whop.com/developer/guides/sandbox), [Elements checkout](https://docs.whop.com/elements/latest/checkout/overview), [penyimpanan metode pembayaran](https://docs.whop.com/developer/guides/save-payment-methods), [lead](https://docs.whop.com/api-reference/leads/create-lead), [dashboard view](https://docs.whop.com/developer/guides/app-views), dan [OAuth](https://docs.whop.com/developer/guides/oauth).
- Buktikan cara menyematkan ketiga route website ini dalam website Whop milik owner, termasuk dukungan iframe, kebijakan framing, dan autentikasi lintas situs. Dashboard app Whop bukan asumsi untuk permintaan embed ini.
- Buktikan bagaimana formulir anonim menghasilkan lead yang terhubung ke identitas pelanggan. Dokumentasi create lead tidak menjelaskan input nama/email/telepon sebagai field langsung.
- Pastikan OAuth Whop dan cara memeriksa peran owner pada akun yang benar bekerja dalam konteks embed. Token iframe Whop untuk app view tidak boleh diasumsikan tersedia pada iframe website biasa; contoh `verifyUserToken` pada dokumentasi app views dinyatakan tidak tersedia dalam SDK terkini.
- Gunakan akun dan API live sesuai arahan pengguna. Catat secara eksplisit bahwa hasil checkout live tidak memenuhi persyaratan sandbox awal tanpa konfirmasi penyelenggara.
- Tentukan mekanisme setup intent terpisah dan keterkaitannya dengan pembayaran deposit; token setup dan pembayaran tidak boleh diasumsikan dapat dipertukarkan.

## Fase 1 — Website dan konten

- Bangun halaman responsif dengan bagian hero, repair/replacement/inspection, service area, financing, ulasan demo, dan kontak. Sediakan penjelasan jelas tentang biaya dan contoh layanan flat-rate.
- Gunakan konfigurasi tunggal untuk nama, area, kontak, layanan, dan harga; hindari klaim lisensi, review, atau jaminan palsu.
- Verifikasi layout, navigasi keyboard, label formulir, dan tampilan desktop/mobile. Jangan menggunakan tema marketplace hasil kloning.

## Fase 2 — Leads dan tracking

- Implementasikan formulir estimasi setelah mekanisme lead terbukti. Validasi input di server, lindungi kredensial dan tampilkan sukses hanya setelah API menerima lead.
- Gunakan [tracking](https://docs.whop.com/developer/websites/tracking) untuk `service_viewed`, `estimate_requested` setelah lead dibuat, dan `deposit_started` saat memulai deposit.
- Verifikasi lead pada akun dan setiap event pada dashboard/log Whop; uji kondisi gagal dan hindari data pribadi dalam event.

## Fase 3 — Checkout dan tagihan

- Buat plan one-time: inspeksi $149, deposit $500, dan gutter cleaning $299 sebagai harga demo; catat ID plan untuk konfigurasi.
- Implementasikan komponen checkout dan BrandingElement dari dokumentasi Whop. CheckoutElement dan ExpressCheckoutElement saling eksklusif dalam satu checkout handle; gunakan konfigurasi yang didukung, jangan mengasumsikan keduanya dapat berbagi handle.
- Tambahkan persetujuan penyimpanan metode pembayaran dan ikuti alur setup intent yang telah dibuktikan. Pastikan deposit dikaitkan dengan pelanggan dan proyek yang benar.
- Buat invoice sisa saldo melalui [Invoices API](https://docs.whop.com/developer/guides/invoices), dengan idempotensi, penanganan status, dan webhook terverifikasi. Tunjukkan pengiriman manual dan auto-charge bila tersedia dan disetujui pelanggan; jangan menganggap pembuatan invoice berarti pembayaran berhasil.
- Verifikasi checkout live dengan mencoba test card yang tercantum pada panduan sandbox Whop dan memeriksa hasil pada `whop payments list`. Kartu tersebut didokumentasikan untuk sandbox: jangan mengasumsikan perilakunya di live atau bahwa kegagalan pasti tercatat. Catat kegagalan yang benar-benar terlihat sebagai bukti percobaan checkout, bukan bukti pembayaran sukses. Apple Pay/Google Pay diuji terpisah pada domain terverifikasi dan perangkat ber-wallet; jangan mengklaim sandbox telah diuji.

## Fase 4 — Dashboard owner

- Sediakan `/<random-string>/invoice`, `/<random-string>/leads`, dan `/<random-string>/pixel` sebagai halaman khusus owner pada website ini, untuk di-embed di website Whop milik owner sesuai mekanisme yang terbukti pada fase 0. String acak bukan mekanisme keamanan.
- Invoice: lihat status dan buat/kirim tagihan akhir dengan konfirmasi tindakan dan validasi nominal. Leads: lihat permintaan dari akun yang benar. Pixel: tampilkan status atau bukti event yang benar-benar disediakan API Whop, bukan data simulasi yang diklaim nyata.
- Gunakan OAuth Whop untuk identitas owner, lalu periksa peran owner dan account ID di server pada setiap request dan operasi. Tolak pengguna anonim, non-owner, dan owner akun lain. Pemeriksaan admin saja tidak membuktikan owner.
- Verifikasi URL langsung, iframe di website Whop owner, sesi kedaluwarsa, pembatasan cookie pihak ketiga, percobaan akses lintas akun, serta setiap endpoint data dan mutasi. Jangan mengekspos API key ke browser.

## Fase 5 — Verifikasi dan penyerahan

- Jalankan typecheck, build, dan tes yang relevan untuk autentikasi/otorisasi, input, penagihan, serta webhook; uji browser desktop dan mobile.
- Verifikasi deployment Whop, ketiga halaman tertanam, tiga plan, lead nyata, tiga event, percobaan checkout live dan invoice. Catat status gagal atau sukses beserta bukti dan biaya transaksi secara terpisah.
- Sertakan panduan konfigurasi, izin, variabel rahasia, pemasangan embed dan langkah uji. Laporkan secara jelas bahwa checkout diuji di live dan status persyaratan sandbox awal belum disetujui penyelenggara.
