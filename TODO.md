# 📋 TODO — Masjid Hub At-Taqwa

> Dibuat: 29 Jun 2026
> Status: **🔴 PROTOTYPE** — belum siap production
> Proyek: Next.js 16 + Supabase + Drizzle ORM + Cloudflare Pages

---

## 🔴 PRIORITAS P0 — HARUS SEKARANG (sebelum apa pun)

### P0.1 Provisioning Akun & Infrastruktur

| # | Task | Detail | Effort |
|---|------|--------|--------|
| 1 | **Bikin akun Supabase** (pakai skill `kaki-tangan`) | Daftar di supabase.com pakai `wimxgooo@gmail.com`. Buat project `masjid-ataqwa`. Catat: Project Ref, URL, `sb_publishable_xxx` + `sb_secret_xxx`. | 30 menit |
| 2 | **Isi `.env` dengan kredensial asli** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `DATABASE_URL` (connection string dari Supabase SQL Editor → connection string → session pooler). | 10 menit |
| 3 | **Jalankan migrasi Drizzle** | `npm run db:migrate` → apply `0000_initial.sql` (14 tabel + RLS + triggers). | 5 menit |
| 4 | **Jalankan seed SQL** | `npm run db:seed` → insert masjid At-Taqwa + 5 program. | 5 menit |
| 5 | **Buat akun Midtrans** (jika belum) | Daftar Midtrans dashboard, ambil Server Key + Client Key. Isi `.env`. | 20 menit |
| 6 | **Buat akun Fonnte** (jika belum) | Daftar fonnte.com, ambil API Key. Isi `.env`. | 10 menit |
| 7 | **Domain `.my.id`** | Cek ketersediaan domain (mis. `ataqwa-ulujami.my.id`). Ikuti SOP `domain-management/SKILL.md`. Verifikasi KTP di PANDI. | 1-2 hari |

### P0.2 Supabase Client & Auth

| # | Task | Detail | File |
|---|------|--------|------|
| 8 | **Buat `src/lib/supabase.ts`** | Instantiate Supabase client (server + browser). | `src/lib/supabase.ts` |
| 9 | **Buat `src/middleware.ts`** | Session refresh middleware — refresh token otomatis. | `src/middleware.ts` |
| 10 | **Ganti hardcoded login → Supabase Auth** | Hapus `admin`/`taqwa123`. Pakai `supabase.auth.signInWithPassword()`. | `src/components/LoginPage.tsx`, `src/stores/app-context.tsx` |
| 11 | **Buat auth callback route** | `/auth/callback` untuk email confirmation atau OAuth. | `src/app/auth/callback/route.ts` |
| 12 | **Server Action: logout** | `supabase.auth.signOut()` di server. | `src/lib/actions/auth.ts` |
| 13 | **Server-side session verification di admin layout** | Ganti client-side `isLoggedIn` → server component check. | `src/app/(admin)/layout.tsx` |
| 14 | **Uji: login, refresh, logout** | Verifikasi session persist antar halaman. | — |

### P0.3 Keamanan — NF-01 dari Audit

| # | Task | Detail | Status |
|---|------|--------|--------|
| 15 | **Pindahkan hosting ke Cloudflare Pages** | Sudah di-setup di `package.json` (deploy script). Tapi verifikasi domain + DNS. | ⚠️ Parsial |
| 16 | **Aktifkan RLS di semua tabel** | SQL sudah ada. Tinggal verifikasi via Supabase dashboard → Table Editor → RLS on. | ⚠️ SQL ready |
| 17 | **Security headers via Cloudflare Transform Rules** | CSP, HSTS, XFO, XCTO — set di Cloudflare dashboard, bukan cuma di `next.config.ts`. | ❌ |
| 18 | **Jalankan self-pentest** | Checklist 14 tools: webapp-testing → recon → hunt-idor → hunt-api-misconfig → hunt-business-logic. | ❌ |
| 19 | **Ganti credentials admin** | Hapus `admin` / `taqwa123` dari kode. | ❌ |

---

## 🟡 PRIORITAS P1 — SEBELUM DEPLOY PRODUCTION

### P1.1 Database & Backend

| # | Task | Detail | Effort |
|---|------|--------|--------|
| 20 | **Buat server actions untuk semua CRUD** | Donasi, mustahik, santri, pinjaman, cicilan. | 2 hari |
| 21 | **Buat API route: Midtrans webhook** | Verifikasi signature SHA512, update `payment_status`, trigger notif WA. | 4 jam |
| 22 | **Buat API route: Midtrans snap token** | Generate token buat pembayaran QRIS/transfer. | 3 jam |
| 23 | **Idempotency key untuk donations** | Cegah double-charge. | 1 jam |
| 24 | **Buat server action: verifikasi donasi manual** | Untuk donasi tunai/transfer manual — DKM konfirmasi. | 3 jam |
| 25 | **Buat audit log hooks** | INSERT ke `audit_logs` otomatis untuk aksi sensitif. | 2 jam |
| 26 | **Fonnte: notifikasi WA donasi** | Kirim WA ke donatur setelah payment sukses. | 2 jam |
| 27 | **Fonnte: notifikasi WA pengingat** | Pengingat infaq mingguan, jadwal kajian. | 2 jam |

### P1.2 Fitur ZIS Digital (Donasi)

| # | Task | Detail | File |
|---|------|--------|------|
| 28 | **Integrasi Midtrans Snap** | Ganti dummy → real payment. QRIS + Transfer + CC. | `src/components/ZakatPage.tsx` |
| 29 | **Pilih akad donasi (zakat/infaq/sedekah/wakaf/fidyah)** | Dropdown akad → hitung nominal per akad. | `ZakatPage.tsx` |
| 30 | **History donasi per donatur** | Data asli dari database, bukan in-memory. | — |
| 31 | **QRIS statis masjid** | Tampilkan QRIS image di halaman donasi. | — |

### P1.3 Manajemen Mustahik

| # | Task | Detail |
|---|------|--------|
| 32 | **CRUD mustahik di admin** | Dari database, bukan in-memory. |
| 33 | **Peta Leaflet (GIS) — data nyata** | Ambil dari `mustahiks.lat`/`.lng`, bukan mock. |
| 34 | **Ring System (Ring 1-4)** | Filter peta berdasarkan ring. |
| 35 | **Upload foto mustahik ke R2** | Form upload + signed URL. |

### P1.4 Keuangan Transparan

| # | Task | Detail |
|---|------|--------|
| 36 | **Laporan real-time** | Total per akad, periode, program — query ke database. |
| 37 | **Export PDF** | Laporan bulanan exportable. |
| 38 | **Grafik keuangan (recharts)** | Pie chart per akad, bar chart bulanan. |

### P1.5 Admin Dashboard

| # | Task | Detail |
|---|------|--------|
| 39 | **Tambahkan menu admin lengkap** | Donasi, Mustahik, Santri, Bank Infaq, Inventaris, Jadwal. |
| 40 | **CRUD jadwal kajian + imam** | Form + kalender. |
| 41 | **CRUD inventaris** | Barang, kondisi, asal. |
| 42 | **Live Activity Feed dari DB** | Ambil dari `audit_logs` atau `donations` real-time. |

---

## 🟢 PRIORITAS P2 — SETELAH PRODUCTION STABIL

### P2.1 Bank Infaq Qardhul Hasan (Fase 2)

| # | Task | Detail |
|---|------|--------|
| 43 | **Aktifkan program Bank Infaq** | Balik `is_active = true` di seed. |
| 44 | **CRUD Sahabat Infaq Groups** | Form + tanggung renteng. |
| 45 | **CRUD pinjaman + cicilan** | Hitung otomatis, tracking overdue. |
| 46 | **Dashboard NPF (Non Performing Financing)** | NPF flag + report. |
| 47 | **Presensi taklim (syarat pinjaman)** | Check-in via WA atau form. |

### P2.2 BUMM & Ekonomi Masjid

| # | Task | Detail |
|---|------|--------|
| 48 | **Aktifkan program BUMM** | Balik `is_active = true`. |
| 49 | **CRUD produk BUMM** | Nama, harga, stok, gambar. |
| 50 | **Sistem affiliate pemuda** | Link referral, komisi otomatis. |
| 51 | **Keranjang + checkout nyata** | Ganti mock → database. |

### P2.3 Kampung Quran

| # | Task | Detail |
|---|------|--------|
| 52 | **CRUD santri** | Data real dari database. |
| 53 | **Presensi santri** | Check-in harian. |
| 54 | **Setoran hafalan** | Tracking juz + surah. |

### P2.4 Pembayaran & Integrasi

| # | Task | Detail |
|---|------|--------|
| 55 | **Rate limiting untuk form publik** | Cloudflare Turnstile + server-side rate limit. |
| 56 | **Backup otomatis database** | Supabase backup atau pg_dump ke R2. |

### P2.5 Pengalaman

| # | Task | Detail |
|---|------|--------|
| 57 | **Dark mode toggle** | Persist ke localStorage / Supabase. |
| 58 | **Animasi dan transisi (Motion)** | Apply ke komponen yang belum. |
| 59 | **Loading states + skeleton** | Tiap komponen yang query DB. |
| 60 | **Error boundaries** | Per segmen halaman. |
| 61 | **Offline fallback** | Service worker untuk landing page. |

---

## 🟣 PRIORITAS P3 — NICE TO HAVE / MASA DEPAN

| # | Task | Detail |
|---|------|--------|
| 62 | **Multi-masjid (scaling 15+ masjid)** | Validasi RLS per `mosque_id` sudah benar. |
| 63 | **Supabase Realtime untuk feed live** | Subscribe ke tabel `donations` + `audit_logs`. |
| 64 | **WA CRM siklus bulanan (MRBJ model)** | Jadwal otomatis ke mustahik + donatur. |
| 65 | **Wakaf Domba — program bergulir** | Tracking domba, hasil, distribusi. |
| 66 | **Beasiswa Anak Asuh** | Data penerima + laporan prestasi. |
| 67 | **One-Click Print laporan tahunan** | Neraca, NPF, arus kas. |
| 68 | **Role-based dashboard** | Peran: superadmin, finance_director, dakwah_lead, dll masing-masing dashboard. |
| 69 | **Data export (CSV/Excel)** | Donasi, mustahik, santri. |
| 70 | **Dark mode komplet** | Semua komponen. |
| 71 | **PWA (Progressive Web App)** | Installable, offline-capable. |

---

## 🔬 STATUS ARSITEKTUR SAAT INI

### ✅ SUDAH DIBANGUN (tapi perlu review)

| Komponen | Status | Catatan |
|----------|--------|---------|
| Scaffold Next.js 16 + Tailwind v4 + TypeScript | ✅ | — |
| Drizzle ORM schema (14 tabel) | ✅ | Siap, tapi belum pernah di-run |
| SQL migrasi (RLS + helpers + triggers) | ✅ | 530 lines — siap jalan |
| Seed data masjid At-Taqwa | ✅ | Siap jalan |
| Halaman publik (home, donasi, bank-infaq, bumm, laporan, login) | ✅ | UI siap, logic dummy |
| Halaman admin (dashboard, GIS mustahik) | ✅ | UI siap, data mock |
| React Context state management | ✅ | Semua data in-memory |
| Types & interfaces | ✅ | 17 type definitions |
| CSP + security headers (next.config.ts) | ✅ | Perlu ditingkatkan |
| Leaflet peta | ✅ | Data masih dummy |
| Recharts grafik | ✅ | Data masih dummy |
| Responsive layout | ✅ | Tailwind breakpoints |

### ❌ BELUM ADA SAMA SEKALI

| Komponen | Dampak |
|----------|--------|
| 🔴 **Supabase client** | Aplikasi TIDAK terhubung ke database |
| 🔴 **Auth mekanisme** | Masih `admin` / `taqwa123` hardcoded |
| 🔴 **Server Actions / API routes** | Tidak ada backend sama sekali |
| 🔴 **Midtrans payment** | Donasi cuma mock — tidak ada transaksi real |
| 🔴 **Fonnte WA** | Tidak ada notifikasi |
| ❌ **Cloudflare R2 storage** | Foto mustahik / produk belum bisa upload |
| ❌ **Turnstile anti-spam** | Token belum diisi |
| ❌ **Tests** | Zero test — unit, integration, e2e |
| ❌ **Middleware** | Tidak ada route protection |
| ❌ **Security checklist** | Belum pernah dijalankan |
| ❌ **Self-pentest** | Belum pernah dilakukan |

### ⚠️ PARSIAL / PERLU DITINGKATKAN

| Komponen | Status | Yang Kurang |
|----------|--------|-------------|
| SEO metadata | ⚠️ | Hanya root layout, belum per-halaman |
| Error boundaries | ⚠️ | Belum ada |
| Loading states | ⚠️ | Data masih sync (in-memory) |
| Dark mode | ⚠️ | CSS variable sudah, toggle belum |
| Animasi | ⚠️ | Motion sudah installed, belum terpakai |
| Admin routes | ⚠️ | Baru 2 dari 8-10 yang direncanakan |
| Cloudflare deployment | ⚠️ | Sudah di-setup di package.json, tapi belum pernah di-test |

---

## ⚡ RINGKASAN EKSEKUTIF UNTUK PEMILIK

**Apa yang sudah jadi?**
Tampilan website Masjid At-Taqwa sudah selesai dibangun — halaman utama, donasi, bank infaq, BUMM, laporan, login, dashboard admin, dan peta mustahik. Semua halaman sudah terlihat bagus dan responsif di HP maupun laptop.

**Apa yang BELUM jadi? (kritikal)**
1. **Database belum nyambung** — semua data cuma contoh sementara. Kalau direfresh, ilang semua.
2. **Login masih pakai password contoh** (`admin`/`taqwa123`) — belum pake sistem login beneran.
3. **Belum bisa terima uang** — tombol donasi cuma pura-pura, belum nyambung ke Midtrans.
4. **Belum deploy ke internet** — cuma jalan di komputer lokal.

**Apa yang harus dikerjakan sekarang?**
- Paling penting: bikin akun Supabase (database gratis), isi kredensial, jalankan migrasi → website bisa simpan data beneran.
- Kedua: ganti login pake Supabase Auth → password aman.
- Ketiga: sambungin Midtrans → donasi beneran bisa masuk.
- Keempat: deploy ke Cloudflare → bisa diakses publik.

---

## 📌 LEGENDA PRIORITAS

| Label | Arti | Timeline |
|-------|------|----------|
| **🔴 P0** | HARUS SEKARANG — blocking semua progress | Sebelum lanjut |
| **🟡 P1** | SEBELUM PRODUCTION — security & core fitur | 2-3 minggu |
| **🟢 P2** | SETELAH STABIL — fitur pendukung | 1-2 bulan |
| **🟣 P3** | NICE TO HAVE — masa depan | Sesuai kebutuhan |

Artefak pendukung: `ARSITEKTUR.md` (desain sistem), `DESIGN.md` (tema), `dokumentasi.md` (panduan), `CHANGELOG.md` (riwayat).
