# ⚓ APP_ANCHOR — Masjid Hub At-Taqwa

> **Tanggal:** 29 Jun 2026
> **Mode:** Prototype → Database Connected
> **Lampu:** 🟡 KUNING (auth sudah ke Supabase, tapi belum siap production)

---

## 🎯 Goal

Membangun Masjid Hub — ekosistem digital masjid berfitur lengkap (ZIS, manajemen mustahik, bank infaq, kajian, BUMM) berbasis Next.js 16 + Supabase + Drizzle ORM. Dimulai dari Masjid Jami' At-Taqwa Ulujami.

---

## ⚠️ Constraints & Preferences

- **Pemilik tidak bisa baca kode** — semua laporan harus bahasa awam
- **Vercel Hobby melanggar ToS untuk situs klien** — target deploy Cloudflare Pages
- **Stack final:** Next.js 16 (App Router, Server Components), Supabase (PostgreSQL + RLS multi-tenant), Tailwind CSS v4, Cloudflare Workers via OpenNext, Midtrans Snap (pembayaran), Fonnte (WA)
- **Pekerjaan akun asli pemilik** WAJIB pakai `kaki-tangan` (chrome-direct --headed)
- **Semua tools gratis** — klien hanya bayar domain

---

## ✅ Done (Sprint 1: 29 Jun 2026)

### Infrastruktur & Akun

| Task | Detail |
|------|--------|
| Supabase project dibuat | `masjid-ataqwa` (ref: `vqpyxpdweditudfqajge`), org `wimxgo's Org`, region Singapore, plan Free |
| `.env` terisi | Supabase URL, publishable key, secret key, DATABASE_URL direct |
| Migrasi database (17 tabel) | Drizzle-kit migrate — semua tabel, types, indexes, foreign keys applied |
| RLS + triggers + helpers | 30 RLS policies, 4 helper functions, audit protect trigger, 9 updated_at triggers applied |
| Seed data | Masjid At-Taqwa Ulujami + 5 program (ZIS, Bank Infaq, Kampung Quran, BUMM, Kajian) |

### Kode & Auth

| Task | File |
|------|------|
| Supabase server client | `src/lib/supabase/server.ts` |
| Supabase browser client | `src/lib/supabase/client.ts` |
| Supabase middleware SSR | `src/lib/supabase/middleware.ts` |
| Next.js middleware (route protection) | `src/middleware.ts` |
| Auth server actions (login/signup/logout) | `src/lib/actions/auth.ts` |
| Auth callback route (OAuth) | `src/app/auth/callback/route.ts` |
| Login page → Supabase Auth | `src/components/LoginPage.tsx` |
| App context → Supabase session listener | `src/stores/app-context.tsx` |
| Admin layout → server-side session check | `src/app/(admin)/layout.tsx` |
| Dashboard → real user data | `src/components/DashboardPage.tsx` |
| Header → session-aware | `src/components/Header.tsx` |
| **Build: ✅ Compiled** | 9 halaman, semua static/dynamic route OK |

---

## 🔄 In Progress

| Item | Detail |
|------|--------|
| **Fitur inti ZIS (donasi)** | Landing page donasi + Midtrans integration |
| **Manajemen mustahik** | CRUD + peta Leaflet.js |
| **Dashboard keuangan** | Laporan real-time per akad |

---

## 🔴 Blocker

- **Midtrans key** belum diisi (perlu akun Midtrans — lihat TODO P0.1 #5)
- **Fonnte key** belum diisi (perlu akun Fonnte — lihat TODO P0.1 #6)
- **Domain .my.id** belum dibeli (perlu verifikasi KTP PANDI — lihat TODO P0.1 #7)
- **Cloudflare Turnstile** belum diisi (anti-bot untuk form donasi)

---

## 🧠 Key Decisions

1. **Drizzle ORM + auto-generated migration**: manual `0000_initial.sql` sebagai referensi RLS, tapi eksekusi migrasi pakai drizzle-kit (auto-generated) + RLS terpisah
2. **Supabase Auth gantikan hardcoded admin/taqwa123**: sudah full terintegrasi (login, signup via email/password, OAuth siap)
3. **Route protection via middleware**: bukan client-side `useEffect` — semua admin routes dicek di server
4. **Variable naming**: pakai `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (bukan `ANON_KEY`) — konsisten dengan format token Supabase 2026

---

## 📋 Next Steps

1. **Akun Midtrans** — daftar, isi `.env`, integrasi Snap pembayaran
2. **Akun Fonnte** — daftar, isi `.env`, integrasi notifikasi WA
3. **Domain .my.id** — beli + verifikasi PANDI + arahkan ke Cloudflare
4. **Deploy ke Cloudflare Pages** — testing staging
5. **Self-pentest** sebelum serah terima ke klien

---

## 📁 Relevant Files

| Area | Path |
|------|------|
| Schema Drizzle | `src/db/schema/` (14 file, 17 tabel) |
| Migration (auto) | `src/db/migrations/0000_good_machine_man.sql` |
| RLS + triggers | `src/db/migrations/0000_initial.sql` (baris 346-527) |
| Seed data | `src/db/seed.sql` |
| Supabase client (browser) | `src/lib/supabase/client.ts` |
| Supabase client (server) | `src/lib/supabase/server.ts` |
| Supabase middleware SSR | `src/lib/supabase/middleware.ts` |
| Next.js middleware | `src/middleware.ts` |
| Auth actions | `src/lib/actions/auth.ts` |
| Login page | `src/components/LoginPage.tsx` |
| App context | `src/stores/app-context.tsx` |
| Admin layout | `src/app/(admin)/layout.tsx` |
| Dashboard | `src/components/DashboardPage.tsx` |
| Header | `src/components/Header.tsx` |
| TODO | `TODO.md` (241 baris, 71 task) |
| .env (kredensial) | `.env` |
