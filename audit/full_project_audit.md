# 🔍 LAPORAN AUDIT PROYEK & RENCANA IMPLEMENTASI MASJID HUB
**Project:** Masjid Jami' At-Taqwa Ulujami & Ekosistem Digital Masjid Hub  
**Kelas Sistem:** Enterprise Grade (Sertifikasi Awwwards/Stripe Level)  
**Metodologi Audit:** Static Code Analysis, Dependency Mapping, Database Schema Matching, Security Vulnerability Analysis  
**Dokumen Induk:** [web20juta.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/audit/web20juta.md)  
**Tanggal Audit:** Juli 2026

---

## 📋 DAFTAR ISI LAPORAN AUDIT
1. [Bagian 1: Struktur Folder & Analisis Arsitektur](#bagian-1-struktur-folder--analisis-arsitektur)
2. [Bagian 2: Laporan Temuan Audit (Security, UI/UX, Database, & Performa)](#bagian-2-laporan-temuan-audit-security-uiux-database--performa)
3. [Bagian 3: Rencana Implementasi & Roadmap Pengembangan](#bagian-3-rencana-implementasi--roadmap-pengembangan)

---

## BAGIAN 1: STRUKTUR FOLDER & ANALISIS ARSITEKTUR

Proyek `masjid-ataqwa` dibangun di atas arsitektur **Next.js 16 (App Router)** yang dideploy ke **Cloudflare Workers** menggunakan OpenNext adapter. 

### 1.1 Struktur Direktori Proyek
```
masjid-ataqwa/
├── src/
│   ├── app/                      ← Routing Next.js App Router
│   │   ├── (admin)/admin/        ← Rute Pengelola (Mustahik, ZIS, KQ, dll)
│   │   ├── (public)/             ← Rute Publik (Donasi, Transparansi, dll)
│   │   ├── api/                  ← Webhook API & Endpoint Asinkron
│   │   └── auth/                 ← Handler OAuth & Auth Callback
│   ├── components/               ← React Components (MustahikTable, KtpScanner, GisPage)
│   ├── db/                       ← Database Client & Drizzle Schema/Migrations
│   ├── hooks/                    ← Kustom React Hooks
│   ├── lib/                      ← Helper, Server Actions, & Supabase Clients
│   └── stores/                   ← State Management (App Context)
├── drizzle.config.ts             ← Konfigurasi Drizzle Kit Migrations
├── open-next.config.ts           ← Cloudflare OpenNext Adapter Config
└── wrangler.jsonc                ← Konfigurasi wrangler Workers Deployment
```

---

## BAGIAN 2: LAPORAN TEMUAN AUDIT

Berdasarkan hasil pemindaian statis (*static scan*) codebase proyek, ditemukan beberapa temuan penting kategori keamanan, UI/UX, database, dan performa yang harus segera diselesaikan sebelum rilis production.

### 2.1 Temuan Keamanan: Broken Function Level Authorization (RBAC)

#### AUD-SEC-001: Missing Role Enforcement in Mustahik Server Actions
*   **ID**: AUD-SEC-001
*   **Category**: Security Vulnerability (Broken Access Control)
*   **Severity**: Critical
*   **Description**: Fungsi server actions untuk manipulasi data mustahik (`createMustahik`, `updateMustahik`, `deleteMustahik`) di [mustahik.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/mustahik.ts) hanya melakukan pengecekan autentikasi profil via `requireAuth()`, tetapi tidak pernah memverifikasi peran (*role*) pengguna via `requireRole()`.
*   **Root Cause**: Developer mengimpor `requireAuth` dari server auth helper [server.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/auth/server.ts), namun lupa menyematkan pemanggilan `requireRole` untuk menyaring akses khusus bagi peran administrasi (seperti `superadmin`, `admin_dkm`, `social_lead`).
*   **Business Impact**: Setiap pengguna terdaftar (termasuk user dengan role `mustahik` atau publik umum yang memiliki akun) dapat memanggil server actions ini secara langsung melalui konsol browser untuk menambah, mengubah, atau menghapus data mustahik di database Masjid At-Taqwa, merusak integritas data penerima bantuan.
*   **Technical Impact**: Bypass otorisasi RBAC (Role-Based Access Control) di tingkat server actions.
*   **Evidence**: Pada baris 40, 96, dan 153 di file [mustahik.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/mustahik.ts) hanya terdapat `await requireAuth();`.
*   **Industry Standard**: OWASP Top 10 A01:2021-Broken Access Control menetapkan bahwa setiap endpoint API dan server action wajib memvalidasi izin hak akses peran pengguna sebelum mengeksekusi manipulasi database.
*   **Recommendation**: Tambahkan pemeriksaan `requireRole` setelah `resolveMosqueId` atau `requireAuth` di file tindakan mustahik:
    ```typescript
    const mid = await resolveMosqueId();
    await requireRole(mid, "superadmin", "admin_dkm", "social_lead");
    ```
*   **Priority**: Critical (P0)
*   **Estimated Complexity**: Low (3 menit perbaikan).

---

#### AUD-SEC-002: Missing Role Enforcement in Muzzaki Server Actions
*   **ID**: AUD-SEC-002
*   **Category**: Security Vulnerability (Broken Access Control)
*   **Severity**: Critical
*   **Description**: Server actions untuk penambahan dan modifikasi data wajib zakat muzzaki di [muzzaki.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/muzzaki.ts) tidak menyaring otorisasi peran, membiarkan data pribadi pembayar zakat rentan dimodifikasi oleh pihak tidak berwenang.
*   **Root Cause**: Tidak adanya pemanggilan `requireRole` di dalam fungsi `createMuzzaki`, `updateMuzzaki`, dan `deleteMuzzaki` di file tindakan.
*   **Business Impact**: Kebocoran hak manipulasi data keuangan zakat dan informasi muzzaki.
*   **Technical Impact**: Hilangnya batasan otorisasi RBAC pada data kepatuhan zakat muzzaki.
*   **Evidence**: Hasil grep search `requireAuth` di file tindakan muzzaki menunjukkan tidak adanya verifikasi peran.
*   **Industry Standard**: Kepatuhan regulasi UU Perlindungan Data Pribadi (PDP) mewajibkan enkripsi data sensitif (seperti NIK muzzaki) dan pembatasan akses data hanya untuk amil pengelola zakat yang sah.
*   **Recommendation**: Batasi aksi muzzaki hanya untuk DKM amil zakat:
    ```typescript
    await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
    ```
*   **Priority**: Critical (P0)
*   **Estimated Complexity**: Low.

---

### 2.2 Temuan UI/UX & Fungsional

#### AUD-UI-001: Dummy PDF/CSV Export Implementation on Transparency Page
*   **ID**: AUD-UI-001
*   **Category**: UI/UX & Functional Bug
*   **Severity**: Medium
*   **Description**: Tombol ekspor laporan keuangan di halaman [TransparansiPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/TransparansiPage.tsx) tidak benar-benar mengunduh dokumen laporan riil. Ekspor hanya memicu efek timeout visual selama 1.5 detik.
*   **Root Cause**: Fungsi `handleDownloadReport` di [TransparansiPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/TransparansiPage.tsx) baris 85–90 berupa implementasi tiruan (*mock implementation*) menggunakan `setTimeout`.
*   **Business Impact**: Donatur korporasi dan jamaah tidak dapat mencetak dokumen laporan pertanggungjawaban kas masjid untuk keperluan dokumentasi fisik/pajak.
*   **Technical Impact**: Ketiadaan fungsi konversi data JSON ke file CSV atau PDF.
*   **Evidence**:
    ```typescript
    const handleDownloadReport = (fileName: string) => {
      setDownloading(fileName);
      setTimeout(() => {
        setDownloading(null);
      }, 1500);
    };
    ```
*   **Industry Standard**: Sistem akuntansi transparan wajib menyediakan dokumen laporan yang dapat diunduh dalam format standar akuntansi (CSV/Excel/PDF).
*   **Recommendation**: Ganti fungsi tiruan dengan implementasi ekspor CSV berbasis browser atau pasang pustaka ekspor PDF client-side:
    ```typescript
    const handleDownloadReport = (fileName: string) => {
      setDownloading(fileName);
      const csvContent = "data:text/csv;charset=utf-8," 
        + ledgerEntries.map(e => `${e.transaction_date},${e.type},${e.category},${e.amount}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      setDownloading(null);
    };
    ```
*   **Priority**: High (P1)
*   **Estimated Complexity**: Medium (20 menit).

---

#### AUD-UI-002: Resolved - Blank Map Box in GIS Portal Page
*   **ID**: AUD-UI-002
*   **Category**: UI/UX Rendering Bug
*   **Severity**: High
*   **Description**: Halaman pemetaan koordinat sebaran mustahik di `/admin/gis` mengalami masalah rendering ubin peta (*tile layers*), menyajikan kotak kosong tak berbentuk.
*   **Root Cause**: Ketiadaan impor pustaka CSS bawaan Leaflet (`leaflet/dist/leaflet.css`) di file komponen [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx).
*   **Status**: **RESOLVED** (Telah diperbaiki melalui modifikasi impor CSS di baris 6 [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx)).

---

### 2.3 Temuan Database & Kinerja

#### AUD-DB-001: Precision Risk on Bigint Deserialization in Client Side
*   **ID**: AUD-DB-001
*   **Category**: Database & Architecture Issue
*   **Severity**: Low
*   **Description**: Beberapa kolom nominal keuangan besar didefinisikan menggunakan `bigint("amount", { mode: "number" })` di [schema.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts). Pada JavaScript, jika data melebihi `Number.MAX_SAFE_INTEGER` (`9,007,199,254,740,991`), presisi nilai rupiah akan hilang.
*   **Root Cause**: Konfigurasi Drizzle ORM `{ mode: "number" }` memaksa database bigint diubah langsung ke tipe primitif number JS.
*   **Business Impact**: Untuk skala masjid teritorial, dana kelolaan tidak akan menembus Rp 9 Quadriliun (sehingga aman dalam jangka pendek). Namun untuk pertumbuhan jangka panjang jejaring multi-masjid berskala nasional, hal ini dapat menimbulkan kerentanan pembulatan hitungan uang.
*   **Technical Impact**: Kehilangan presisi hitungan matematika di client-side untuk angka di atas 9 digit kuadriliun rupiah.
*   **Evidence**: Kolom `amount` pada tabel `donations` and `acquisition_value` pada tabel `wakaf_assets` menggunakan mode number.
*   **Industry Standard**: Untuk nilai keuangan presisi tinggi, standardisasi software akuntansi menyarankan mode representasi string pada data transfer, atau memprosesnya menggunakan pustaka BigDecimal.
*   **Recommendation**: Biarkan mode default bigint Drizzle (tanpa paksa ke `{ mode: "number" }`) jika data yang diolah merupakan nominal makro, lalu gunakan parser di frontend.
*   **Priority**: Low (P3)
*   **Estimated Complexity**: Medium (memerlukan refactor parsing data).

---

## BAGIAN 3: RENCANA IMPLEMENTASI & ROADMAP PENGEMBANGAN

Roadmap perbaikan dan pengembangan disusun dalam 4 prioritas utama (*Critical, High, Medium, Low*) demi pencapaian kriteria kematangan sistem *production-ready*:

```
               ROADMAP PRIORITAS PENGEMBANGAN
 ┌────────────────────────────────────────────────────────┐
 │                                                        │
 │  P0: CRITICAL (Bypass RBAC Otorisasi Actions)          │
 │  P1: HIGH (Fitur Ekspor Kas Riil & Anti-Bot Donasi)   │
 │  P2: MEDIUM (Lazy Loading Recharts & Leaflet Bundle)   │
 │  P3: LOW (Refactor Bigint Parsing Precision)           │
 │                                                        │
 └────────────────────────────────────────────────────────┘
```

### 3.1 Tugas Prioritas P0 — CRITICAL (Keamanan Sistem)
1.  **Enforce requireRole di Semua API Tindakan Admin**:
    *   *Deskripsi*: Modifikasi [mustahik.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/mustahik.ts), [muzzaki.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/muzzaki.ts), dan [employees.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/employees.ts) agar menyertakan `requireRole(mid, "superadmin", "admin_dkm", ...)` setelah autentikasi.
    *   *Target Selesai*: 1 Hari.
2.  **Validasi Middleware Route Protection**:
    *   *Deskripsi*: Pastikan middleware di [middleware.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/middleware.ts) tidak dapat dilewati dengan manipulasi request header di Cloudflare Workers.

### 3.2 Tugas Prioritas P1 — HIGH (Fungsional & Fitur Rilis)
1.  **Ekspor Data Riil Penuh ke CSV/PDF**:
    *   *Deskripsi*: Ganti timeout dummy di [TransparansiPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/TransparansiPage.tsx) dengan download generator CSV dinamis dari database.
2.  **Integrasi Pembayaran Midtrans Snap**:
    *   *Deskripsi*: Selesaikan sisa TODO P0.1 #5 dan #6 (Midtrans & Fonnte setup) untuk menggantikan status pembayaran tiruan ke sistem QRIS/Snap pembayaran riil.
3.  **Proteksi Formulir Donasi via Cloudflare Turnstile**:
    *   *Deskripsi*: Pasang widget Turnstile di [ZakatPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/ZakatPage.tsx) untuk menangani serangan bot spam donasi palsu.

### 3.3 Tugas Prioritas P2 — MEDIUM (Optimasi Performa & Keterbacaan)
1.  **Lazy Loading Component Bundle**:
    *   *Deskripsi*: Terapkan dynamic imports Next.js pada visualisasi chart Recharts di [TransparansiPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/TransparansiPage.tsx) agar bundle awal halaman publik berkurang hingga ~120KB.
2.  **Visualisasi Map Leaflet Cluster**:
    *   *Deskripsi*: Tambahkan clustering marker pada [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx) agar saat jumlah mustahik membengkak ke 2.000+ data, performa rendering peta desktop/seluler tidak mengalami patahan fps.

---

[LAPORAN AUDIT SELESAI]
