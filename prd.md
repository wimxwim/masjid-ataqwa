# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) v2.1 — MASJID HUB
> **Project:** Rintisan Pertama — Masjid Jami' At-Taqwa Ulujami
> **Tipe Proyek:** Tipe C (Aplikasi Web Multi-Tenant) — Gerakan Masjid Indonesia Berdaya (GMIB)
> **Sumber Data:** REMISYA PRESENT 2026, Pemberdayaan Ekonomi Umat MIBA 13, Baitul Maal MIBA 12, Dakwah Inklusif, ParagonCorp MIBA 13, Masjid Berdaya Kitabisa

---

## 1. VISI BESAR & LANDASAN DATA

### 1.1 Mengapa Masjid Hub?
```
┌──────────────────────────────────────────────────────────────┐
│ DATA KEMISKINAN JAKARTA SELATAN (BPS 2025)                   │
│                                                              │
│  Populasi        : 2.331.411 jiwa                            │
│  Rakyat Miskin   : 70.660 jiwa (3,23%)                       │
│  Keluarga Miskin : 14.132 KK                                 │
│  Jumlah Masjid   : 2.782                                     │
│  Target Solusi   : 140 masjid aktif (5% dari total)           │
│                    100 KK per masjid                          │
│                    14.000 KK tertangani (= 99% kebutuhan)     │
│  UMK JakSel 2026 : Rp 5.396.761/bulan                        │
│  Garis Miskin    : Rp 1.079.352/bulan/jiwa (JakSel)          │
└──────────────────────────────────────────────────────────────┘
```

**Satu kalimat:** Dengan 5% masjid JakSel aktif, kita bisa menyelesaikan kemiskinan 14.132 KK. Masjid Hub adalah alat untuk mencapai itu.

### 1.2 Filosofi — 5 Pilar Kemakmuran Masjid (GMIB)
```
BAITULLAH (Ibadah)        → Manajemen kebersihan & Ri'ayah
BAITUL DAKWAH (Kajian)    → Kurikulum silabus 8 kategori
BAITUL MAAL (ZISWAF)      → QRIS digital + LAZ/UPZ legal
BAITUL TARBIYAH (Pendidikan) → Beasiswa & sertifikasi guru Al-Qur'an
BAITUL MUAMALAH (Ekonomi) → Bank Infaq + BUMM + Affiliate
```

---

## 2. FITUR UTAMA (Berdasarkan Kebutuhan 5 Pilar)

### 2.1 Baitul Muamalah — Modul Bank Infaq Qardhul Hasan (PRIORITAS #1)
Sistem pembiayaan mikro syariah tanpa riba, dengan mekanisme kelompok dan tanggung renteng yang sudah terbukti oleh MRBJ (NPF 0.2%).

**Mekanisme Pinjaman (dari Pemberdayaan Ekonomi Umat):**
```
Level 1: Pinjaman Rp 500.000 → Setoran Rp 50.000/pekan × 10 pekan
Level 2: Setelah L1 lunas → Pinjaman lebih besar
Level 3: Setelah L2 lunas → Pengembangan usaha lanjutan
```

**Perbandingan Pinjol vs Bank Infaq (data real PDF):**
| Aspek | Pinjol / Rentenir | Bank Infaq (Qardhul Hasan) |
|---|---|---|
| Bunga | 30.000/hari (650.000+/21 hari) | 0% (Qardhul Hasan) |
| Total bayar | Rp 650.000+ untuk Rp 500.000 | Rp 500.000 (pokok) |
| Dampak | Memiskinkan | Memberdayakan |
| Mekanisme | Individual, tidak ada pembinaan | Kelompok (5/7/9), ada kajian pekanan |

**Struktur Pengurus Bank Infaq:**
```
Ketua → Wakil Ketua → Bendahara → Pencatat/Admin → 5-10 Surveyor
```

### 2.2 Baitul Dakwah — Kurikulum Kajian Bersilabus
Modul manajemen kajian dengan silabus terstruktur — data dari Dakwah Inklusif PDF:

| Kategori | Bobot | Kitab / Materi |
|---|---|---|
| Tafsir Al-Qur'an | 22% | Tafsir Jalalain, Ibnu Katsir |
| Hadits | 18% | Riyadhus Shalihin, Nashoihul Ibad |
| Fiqih | 16% | Perbandingan 4 Madzhab |
| Aqidah / Tauhid | 16% | Ahlus Sunnah Wal Jamaah |
| Sejarah / Sirah | 16% | Shiroh Nabawiyah |
| Kajian Executive | 12% | Praktisi bisnis & profesional muslim |

### 2.3 Baitul Maal — Manajemen ZISWAF Digital
- **QRIS Dedicated** per program (pencegahan campur akad dana)
- **Kotak Amal Digital** — donasi via QRIS, transfer, platform Kitabisa
- **Campaign Digital** — landing page donasi terintegrasi
- **Kolaborasi Mitra Strategis** — portofolio untuk CSR korporasi (ParagonCorp, dll)
- **Pelaporan Otomatis** — PDF laporan transparansi (WA link, auto-scheduler)

### 2.4 Baitul Tarbiyah — Manajemen Pendidikan
- Beasiswa anak asuh & monitoring TPQ/Tahfidz
- Sertifikasi & standarisasi guru Al-Qur'an (metode Tilawati)
- Modul sedekah Al-Qur'an & program santunan

### 2.5 Baitullah — Modul Operasional Masjid
- Manajemen jadwal imam & khatib
- Ri'ayah (kebersihan & fasilitas)
- Pengumuman digital & dashboard jadwal

### 2.6 Baitul Muamalah — BUMM & Masjid Affiliate (PRIORITAS #2)
Sistem BUMM (Badan Usaha Milik Masjid) dan affiliate generasi muda, diadopsi dari struktur REMISYA Business Department:

**Produk BUMM Terdaftar:**
- **Kopi Sepanjang Waktu** — Coffee shop masjid
- **DAPURUMA** — Roti dan bakery
- **Foodcourt DKM MRBJ**
- **Creative Hub & RSG MRBJ** (Gedung Serba Guna)

**Masjid Affiliate Generator:**
- Link referral personal: `?aff={username}`
- Komisi 15% untuk pemuda penggerak
- Dashboard GMV & ranking penjualan mingguan
- Portal konten 9:16 (Ngonten) — GPS, Kuy Ngaji, LDSS, SEJIWA

### 2.7 Struktur Organisasi REMISYA Digital (Modul Kaderisasi)
Adaptasi dari REMISYA MRBJ — 7 departemen:

```
1. DAKWAH DEPT
   Program: Kuy Ngaji, GPS, LDSS, CNR, Belajar Khusyuk Shalat

2. SOCIAL DEPT
   Program: GSS (Sedekah Sampah), SAQURA (Quran), SEJIWA (Kesehatan)

3. PEOPLE & CULTURE DEPT
   Program: AKAR (Akademi Remisya), Rihlah, Rehat, Rework, Re-Standing

4. MEDIA & PUBLICATION DEPT
   Fungsi: Medsos, peliputan, konsep visual, branding

5. BUSINESS DEPT
   Program: CEO Talk, Class of Marriage, BUMM management

6. (Digital Extension) — FINANCE DEPT
   Fungsi: Manajemen keuangan organisasi, laporan kas

7. (Digital Extension) — GENERAL SECRETARY
   Fungsi: Administrasi organisasi, arsip notulensi
```

### 2.8 Klasifikasi Market Dakwah Pemuda (3 Ring)
```
Ring 1 — Penggerak        → Volunteer aktif → akses BUMM Affiliate
Ring 2 — Rutin            → Jamaah tetap   → program kajian & kaderisasi
Ring 3 — Enggan           → Perlu pendekatan 2D (Display & Delivery), konten digital
```

---

## 3. FITUR KHUSUS APLIKASI

### 3.1 Geographic Ring Map (PostGIS)
- Zonasi teritorial 4 ring untuk distribusi mustahik yang adil
- **Ring 1**: < 500 m — prioritas mutlak
- **Ring 2**: 500 m — 1 km
- **Ring 3**: 1 km — 2 km
- **Ring 4**: > 2 km

### 3.2 Kelompok Taklim Sahabat Infaq
- Formasi kelompok: 5, 7, atau 9 orang
- Wajib hadir kajian pekanan (tracking via QR code)
- Tanggung renteng otomatis jika ada anggota menunggak
- Presensi terintegrasi dengan QR code

### 3.3 Wakaf Produktif Hewan Ternak (Sheep Fattening)
Yield real dari audit MRBJ:
```
Tahun 1444H: 100 Ekor → Yield 27.3%
Tahun 1445H: 120 Ekor → Yield 31.9%
Tahun 1446H: 150 Ekor → Yield 33.0%
Tahun 1447H: 190 Ekor → Yield 30.6%
```

---

## 4. SKEMA DATABASE UTAMA (POSTGRESQL & POSTGIS)

```sql
-- Aktivasi ekstensi PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Multi-Tenant Masjid
CREATE TABLE mosques (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    coordinate GEOMETRY(Point, 4326),
    npwp VARCHAR(50),
    upz_number VARCHAR(100),      -- izin UPZ dari LAZ
    upz_legalized_date DATE,      -- tanggal legalisasi
    zakah_collection DECIMAL,     -- total ZIS terkumpul
    is_legalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User — role mencakup 7 departemen REMISYA
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    mosque_id INT REFERENCES mosques(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    -- role: 'admin_dkm' | 'finance_director' | 'dakwah_lead'
    --       | 'social_lead' | 'people_culture' | 'media_pub'
    --       | 'business_lead' | 'affiliate_youth' | 'mustahik'
    department VARCHAR(50),
    -- department: 'dakwah' | 'social' | 'people_culture'
    --           | 'media' | 'business' | 'finance' | 'secretary'
    afiliasi_ring INT CHECK (afiliasi_ring BETWEEN 1 AND 3),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mustahik dengan enkripsi & pemetaan Ring
CREATE TABLE mustahiks (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nik_encrypted VARCHAR(512) NOT NULL,   -- AES-256-GCM
    coordinate GEOMETRY(Point, 4326),      -- untuk Ring PostGIS
    desil_level INT CHECK (desil_level BETWEEN 1 AND 4),
    ring_number INT CHECK (ring_number BETWEEN 1 AND 4),
    health_insurance_id VARCHAR(100),       -- BPJS TK
    usaha_type VARCHAR(100),                -- jenis UMKM
    status VARCHAR(50) DEFAULT 'unverified'
);

-- 4. Kelompok Taklim Sahabat Infaq
CREATE TABLE sahabat_infaq_groups (
    id SERIAL PRIMARY KEY,
    mosque_id INT REFERENCES mosques(id),
    group_name VARCHAR(255) NOT NULL,
    leader_id INT REFERENCES users(id),
    member_count INT CHECK (member_count IN (5, 7, 9)),
    total_pokok DECIMAL(12,2) NOT NULL,         -- total pinjaman kelompok
    weekly_payment DECIMAL(12,2) NOT NULL,       -- per anggota per pekan
    current_level INT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pinjaman Qardhul Hasan
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    mustahik_id INT REFERENCES users(id),
    group_id INT REFERENCES sahabat_infaq_groups(id),
    amount NUMERIC(12, 2) NOT NULL,
    weekly_payment NUMERIC(12, 2) NOT NULL,
    week_duration INT DEFAULT 10,
    current_level INT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Repayment + Tanggung Renteng + Presensi Kajian
CREATE TABLE repayments (
    id SERIAL PRIMARY KEY,
    loan_id INT REFERENCES loans(id),
    amount_paid NUMERIC(12, 2) NOT NULL,
    week_number INT NOT NULL,
    is_present_taklim BOOLEAN DEFAULT TRUE,   -- presensi kajian
    backstopped_by_user_id INT REFERENCES users(id),  -- penanggung renteng
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Kurikulum Kajian Bersilabus
CREATE TABLE kajian_silabus (
    id SERIAL PRIMARY KEY,
    mosque_id INT REFERENCES mosques(id),
    category VARCHAR(50) NOT NULL,     -- tafsir | hadits | fiqih | aqidah | sirah | executive
    weight_pct DECIMAL(5,2) NOT NULL,  -- persentase bobot
    kitab VARCHAR(255),                -- kitab rujukan
    total_sessions INT DEFAULT 0,
    month_year DATE NOT NULL
);

-- 8. Produk BUMM
CREATE TABLE bumm_products (
    id SERIAL PRIMARY KEY,
    mosque_id INT REFERENCES mosques(id),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50),              -- kopi | bakery | foodcourt | creative_hub
    price NUMERIC(12, 2) NOT NULL,
    commission_pct NUMERIC(5, 2) DEFAULT 15.00,
    stock INT DEFAULT 0
);

-- 9. Affiliate Sales Tracker
CREATE TABLE affiliate_sales (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES bumm_products(id),
    referrer_user_id INT REFERENCES users(id),
    quantity INT NOT NULL,
    total_gmv NUMERIC(12, 2) NOT NULL,
    earned_commission NUMERIC(12, 2) NOT NULL,
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Program Unggulan (untuk portofolio CSR korporasi)
CREATE TABLE unggulan_programs (
    id SERIAL PRIMARY KEY,
    mosque_id INT REFERENCES mosques(id),
    program_name VARCHAR(255) NOT NULL,
    category VARCHAR(50),              -- ekonomi | kesehatan | pendidikan | pangan
    total_beneficiaries INT DEFAULT 0,
    total_budget DECIMAL(12,2),
    impact_description TEXT,
    partner_corporation VARCHAR(255),  -- nama korporasi jika ada CSR
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. PERSYARATAN NON-FUNGSIONAL (NFR)

### 5.1 Kepatuhan Hukum & Keamanan
- **Enkripsi AES-256-GCM**: Kolom `nik_encrypted` di mustahiks
- **Tenant Isolation**: Row-Level Security PostgreSQL — antar masjid tidak bocor
- **UPZ Legal Compliance**: Sistem menyediakan field legalitas UPZ, NPWP, rekening resmi lembaga — syarat minimal mitra CSR korporasi (sesuai standar ParagonCorp)

### 5.2 Kesiapan Mitra Korporasi (dari ParagonCorp PDF)
Checklist yang harus dipenuhi sistem:
```
✅ Akta Yayasan/DKM — disimpan di sistem dokumen
✅ NPWP Lembaga — field di tabel mosques
✅ Rekening bank resmi — tersimpan untuk integrasi QRIS
✅ UPZ terdaftar — di track status legalisasi
✅ Laporan keuangan rutin — auto-generate PDF bulanan
```

### 5.3 Estetika & Branding
- **Palette**: Emerald Bright (`#10b981`), Emerald Deep (`#0e7a45`), Gold Warm (`#c8a84e`), Bg Light (`#f9fafb`)
- **Font**: Outfit (heading) + Inter (body/data)
- **Style**: Glassmorphism modern, backdrop-blur, transisi halus
- **Filosofi Branding**: **ROMANTIS** — Ramah Orang Muda, Ramah Anak-anak, Ramah Lansia, Ramah Disabilitas, Ramah Musawafir
- **Skor Lighthouse**: Target minimal **95/100**

---

## 6. METRIK KEBERHASILAN (OKR)

| Objective | Key Result |
|---|---|
| Pengentasan Kemiskinan | 100 KK mustahik aktif di Bank Infaq (Q3 2026) |
| Legalitas UPZ | Terdaftar di LAZ Salam Setara (Juli 2026) |
| Kaderisasi Pemuda | 30 pemuda aktif di REMISYA structure (Q4 2026) |
| BUMM GMV | Rp 50jt/bulan transaksi affiliate (Q4 2026) |
| Kolaborasi Korporasi | 1 MoU CSR dengan korporasi (ParagonCorp target) |
| NPF Rate | < 1% (target MRBJ: 0.2%) |

---

🟢 **HIJAU** (PRD v2.1 — diperkaya data kemiskinan real BPS JakSel, struktur REMISYA 7 departemen, 50+ program spesifik, tabel pinjol vs Bank Infaq, checklist kesiapan korporasi ParagonCorp, 10 tabel database lengkap, OKR terukur.)
