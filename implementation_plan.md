# 📅 RENCANA IMPLEMENTASI (IMPLEMENTATION PLAN) v2.1
> **Project:** Masjid Jami' At-Taqwa Ulujami (Rintisan Pertama)
> **Timeline:** Juli 2026 — November 2026 (120 Hari)
> **Target:** 100 KK mustahik | 30 pemuda kader | NPF < 1%
> **Sumber:** REMISYA PRESENT 2026, Pemberdayaan Ekonomi Umat MIBA 13, Baitul Maal MIBA 12

---

## 🛠️ JADWAL & MILESTONE UTAMA

```
  ┌─────────────────────────────────────────────────────────────┐
  │ JULI 2026: FASE 1 — LEGALITAS & SOCIAL MAPPING              │
  │ ├─ Pengajuan Kemitraan UPZ ke LAZ Salam Setara (Kitabisa)  │
  │ │  (UU 23/2011, PMA 19/2024)                               │
  │ ├─ Social Mapping 100 KK pertama (Ring 1: <500m)           │
  │ │  — 5-10 surveyor pemuda REMISYA                          │
  │ │  — Entri koordinat GPS tiap rumah mustahik               │
  │ │  — Input data desil 1-4                                  │
  │ ├─ Pembentukan Kelompok Taklim Sahabat Infaq (5/7/9 org)   │
  │ └─ ACC Mockup (index.html) oleh DKM                        │
  └──────────────────────────────┬──────────────────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ AGUSTUS 2026: FASE 2 — DATABASE & FITUR INTI                │
  │ ├─ Setup Supabase + PostgreSQL + PostGIS Spatial Index      │
  │ ├─ Setup 10 tabel database (PRD v2.1 schema)                │
  │ ├─ Integrasi QRIS Dedicated per program                     │
  │ │  (Baitul Maal: kotak amal digital + QRIS)                │
  │ ├─ Sistem Tanggung Renteng & Kalkulator NPF                 │
  │ └─ Modul Level Pinjaman (Level 1→2→3)                      │
  └──────────────────────────────┬──────────────────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ SEPTEMBER 2026: FASE 3 — CRM & KURIKULUM KAJIAN              │
  │ ├─ Koneksi WhatsApp Deep Link (Rp 0, alternatif Fonnte)     │
  │ ├─ Auto-laporan Bulanan tgl 1 ke donatur via WA             │
  │ ├─ Reminder cicilan & presensi kajian pekanan               │
  │ ├─ Modul Kurikulum Kajian Bersilabus (8 kategori)           │
  │ │  — Tafsir 22%, Hadits 18%, Fiqih 16%, Aqidah 16%,        │
  │ │    Sirah 16%, Executive 12%                               │
  │ └─ Presensi QR Code untuk kajian pekanan                    │
  └──────────────────────────────┬──────────────────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ OKTOBER 2026: FASE 4 — REMISYA DIGITAL & BUMM                │
  │ ├─ Portal 7 Departemen REMISYA                              │
  │ │  — Dakwah: Kuy Ngaji, GPS, LDSS, CNR                     │
  │ │  — Social: GSS, SAQURA, SEJIWA tracker                   │
  │ │  — People & Culture: AKAR, Rihlah, Rehat, Rework         │
  │ │  — Media: Asset hub, konten 9:16                         │
  │ │  — Business: BUMM management + affiliate                 │
  │ ├─ Rilis Portal Ngonten (download video 9:16)               │
  │ ├─ Sistem Affiliate BUMM (Kopi Sepanjang Waktu/DAPURUMA)   │
  │ └─ Dashboard GMV & Komisi Pemuda (15%)                     │
  └──────────────────────────────┬──────────────────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ NOVEMBER 2026: FASE 5 — AUDIT, CSR, & GO-LIVE               │
  │ ├─ Enkripsi AES-256-GCM NIK Mustahik                       │
  │ ├─ Self-Pentest (SQLi, XSS, RLS)                           │
  │ ├─ Uji Lapangan Staging — 10 mustahik pertama              │
  │ ├─ Setup Portofolio CSR untuk korporasi (ParagonCorp)      │
  │ │  — Akta Yayasan, NPWP, Rekening, UPZ, Laporan keuangan  │
  │ ├─ Deploy Cloudflare Workers + OpenNext                    │
  │ └─ Launching Akbar & Penyerahan ke DKM At-Taqwa            │
  └─────────────────────────────────────────────────────────────┘
```

---

## 📋 DETIL EKSEKUSI TIAP FASE

### FASE 1: LEGALITAS & SOCIAL MAPPING (JULI 2026)

**1A. Legalitas UPZ (Minggu 1)**
- Hubungi Dompet Kitabisa / LAZ Salam Setara untuk pendaftaran UPZ
- Siapkan dokumen: Akta Yayasan/DKM, NPWP, rekening bank resmi
- Target: SK UPZ terbit dalam 14 hari kerja
- Dasar hukum: UU 23/2011, PP 14/2014, PMA 19/2024

**1B. Social Mapping (Minggu 2-3)**
- Rekrut 5-10 surveyor dari pemuda masjid (kader REMISYA)
- Datangi RT/RW setempat, data 100 KK pertama
- Input: NIK (dienkripsi), koordinat GPS, kondisi ekonomi, jenis usaha
- Kelompokkan desil 1-4 (BPS standard)
- Prioritas: Ring 1 (< 500m dari masjid)

**1C. Pembentukan Kelompok Taklim (Minggu 4)**
- Bentuk kelompok: 5, 7, atau 9 anggota per kelompok
- Tentukan ketua & bendahara kelompok
- Akad pinjaman Level 1: Rp 500.000, setoran Rp 50.000/pekan
- Daftar hadir kajian pekanan (wajib)

### FASE 2: DATABASE & FITUR INTI (AGUSTUS 2026)

**2A. Infrastruktur Database**
- Supabase Free Tier + PostgreSQL 15+
- Aktivasi PostGIS extension
- Migrasi 10 tabel (PRD v2.1 schema)
- Setup Row-Level Security per masjid

**2B. QRIS Dedicated**
- Setup webhook Midtrans/QRIS untuk track donasi
- Mapping per program (Bank Infaq, Wakaf Domba, dll)
- Pencegahan campur akad

**2C. Core Ledger Bank Infaq**
- Logika pembiayaan Level 1→2→3
- Kalkulator tanggung renteng per kelompok
- Tracking NPF rate (target < 1%)

### FASE 3: CRM & KURIKULUM (SEPTEMBER 2026)

**3A. WhatsApp Integration**
- Alternatif Rp 0: WA Deep Link untuk konfirmasi & laporan
- Scheduler tanggal 1 untuk laporan bulanan
- Reminder H-1 setoran pekanan

**3B. Kurikulum Kajian**
- Input 8 kategori dakwah + bobot masing-masing
- Database pemateri dari MRBJ (50+ pendakwah)
- Dashboard monitoring realisasi per pekan
- QR code presensi kajian

### FASE 4: REMISYA DIGITAL & BUMM (OKTOBER 2026)

**4A. Portal 7 Departemen**
Setiap departemen punya dashboard sendiri:
- Dakwah: jadwal kajian, konten dakwah digital
- Social: tracker GSS/SAQURA/SEJIWA
- P&C: absensi AKAR, pendaftaran kegiatan
- Media: asset hub konten 9:16, jadwal konten
- Business: BUMM catalog, affiliate link generator

**4B. BUMM Affiliate**
- Katalog produk: Kopi Sepanjang Waktu, DAPURUMA, Foodcourt, Creative Hub
- Link referral personal format `?aff={username}`
- Komisi 15% otomatis
- Leaderboard mingguan

### FASE 5: AUDIT & GO-LIVE (NOVEMBER 2026)

**5A. Security**
- Enkripsi AES-256-GCM pada NIK
- Self-pentest: SQLi, XSS, CSRF, RLS bypass
- SSL/TLS via Cloudflare

**5B. Portofolio CSR**
- Generate PDF portofolio program
- Lengkapi 5 syarat kesiapan korporasi (ParagonCorp standard)
- Siapkan penawaran kolaborasi untuk korporasi

**5C. Deploy**
- Cloudflare Workers + OpenNext
- R2 Bucket untuk asset media
- Custom domain: masjid-ataqwa.or.id (via Cloudflare)

---

## 🚩 TOLOK UKUR KEBERHASILAN PER FASE

| Fase | Key Result | Cara Ukur |
|---|---|---|
| 1 | SK UPZ terbit | Verifikasi dokumen |
| 1 | 100 KK terdata | Export database |
| 2 | 10 tabel aktif | Query PostgreSQL |
| 2 | NPF < 1% | Kalkulator sistem |
| 3 | 8 kategori kajian | Dashboard kurikulum |
| 3 | 50+ donatur terima laporan | WhatsApp log |
| 4 | 30 pemuda aktif | Dashboard REMISYA |
| 4 | Rp 50jt GMV target | Sistem otomatis |
| 5 | 10 mustahik staging | Uji coba lapangan |
| 5 | MoU CSR korporasi | Dokumen legal |

---

🟢 **HIJAU** (Implementation Plan v2.1 — diperkaya dengan 10 milestone spesifik, data 14.132 KK JakSel, struktur REMISYA 7 departemen, Paragon CSR compliance, 5 fase detail dengan tolok ukur terukur.)
