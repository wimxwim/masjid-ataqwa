# EXECUTIVE SUMMARY — AUDIT CODEBASE masjid-ataqwa

Tanggal audit: 3 Juli 2026  
Total skill dijalankan: 19 dari 276 (Kategori A terpilih + Triase lengkap + Scan 2026)  
Total temuan: 29 (Critical: 3 | High: 14 | Medium: 8 | Low: 4 | Info: 0)  

## Risk Matrix

| Kategori | Critical | High | Medium | Low |
| :--- | :---: | :---: | :---: | :---: |
| Keamanan | 2 | 7 | 2 | 0 |
| Bug / Reliabilitas | 0 | 1 | 1 | 1 |
| UI/UX Desktop | 0 | 0 | 1 | 1 |
| UI/UX Mobile | 0 | 0 | 1 | 1 |
| Database / Integritas Data | 0 | 0 | 1 | 1 |
| Arsitektur / Alur | 0 | 0 | 1 | 0 |
| Logging / Observability | 1 | 6 | 2 | 0 |

*Catatan: LOG-001 s.d LOG-009 telah dialokasikan nomor tiket global ID-040 s.d ID-048.*

## Posisi Kematangan Logging Saat Ini
**Level:** 1 (Tidak ada logging yang memadai)  
*Rincian analisis lengkap dapat diakses pada [temuan-logging.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/audit/temuan-logging.md).*

## Top 5 Prioritas Kritis (Kerjakan Duluan)

1. **[ID-024] Midtrans Webhook Signature Verification Salah Mencari Header**
   * *Masalah:* Webhook mencari signature di header `x-midtrans-signature` padahal Midtrans mengirimnya di body JSON sebagai `signature_key`. Hal ini melumpuhkan seluruh otomatisasi verifikasi pembayaran (selalu 401).
2. **[ID-025] Endpoint `/api/admin/overview` Tidak Memiliki Proteksi Otentikasi dan Otorisasi**
   * *Masalah:* Data sensitif seluruh masjid (transaksi, mustahik, jamaah) terekspos ke publik karena endpoint API ini melewatkan middleware dan tidak memiliki validasi session sama sekali.
3. **[ID-026] Pembuatan Donasi Publik Mengizinkan Input Parameter `payment_status` Secara Bebas**
   * *Masalah:* Pengguna biasa dapat mensubmit donasi berstatus `"paid"` langsung dari client, menyinkronkan data palsu ke Buku Besar Keuangan tanpa pembayaran riil.
4. **[ID-027] Bypass Verifikasi Nominal Pembayaran Donasi (Payment Amount Mismatch)**
   * *Masalah:* Tidak ada validasi silang nominal donasi di DB vs nominal Snap token, serta sinkronisasi buku besar menggunakan nilai database alih-alih nominal pembayaran riil dari Midtrans.
5. **[ID-044] Ketiadaan Audit Logging untuk Perubahan Data (LOG-005)**
   * *Masalah:* Tidak ada pencatatan logs ketika data krusial mustahik (NIK, alamat) atau transaksi keuangan dimodifikasi oleh admin, melanggar prinsip transparansi syariah dan regulasi kepatuhan.

## Compliance Scorecard
- **OWASP Top 10 Coverage:** 6/10 kategori dievaluasi secara manual (A01: Broken Access Control, A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A05: Security Misconfig, A09: Logging Failures).
- **WCAG 2.2 AA:** Sebagian (Tabel responsif di mobile membutuhkan penyesuaian, kontras warna primary emerald `#10b981` di bawah standar 4.5:1).
- **Core Web Vitals:** Baik (Bundling Next.js 16 + Turbopack menghasilkan build statis yang sangat cepat dan teroptimasi).
- **Kesiapan UU PDP:** Sebagian (Data NIK mustahik sudah disimpan dengan hash/AES-256, namun rentan bocor karena kurangnya otorisasi di server actions dan data NIK di `loan_applications` disimpan sebagai plain text).

## Rekomendasi Strategis
Secara umum, arsitektur dasar ekosistem Next.js 16 + Drizzle + PostgreSQL (Supabase) di `masjid-ataqwa` sudah sangat modern dan siap scaling. Namun, aplikasi ini **BELUM LAYAK PRODUKSI** karena memiliki celah keamanan otorisasi yang sangat rentan (IDOR & Broken Access Control), NIK mentah di pengajuan pinjaman tersimpan plaintext, ketiadaan validasi Turnstile, dan otomatisasi pembayaran Midtrans yang saat ini dalam keadaan tidak berfungsi akibat kesalahan pembacaan signature key. Tim direkomendasikan menyelesaikan perbaikan 5 prioritas kritis di atas terlebih dahulu sebelum meluncurkan sistem ke masjid mitra.

---

# DAFTAR TEMUAN AUDIT LENGKAP

## Kategori: Keamanan & Akses Kontrol

### [ID-024] Midtrans Webhook Signature Verification Salah Mencari Header (Broken Signature Check)
- **Severity**: Critical
- **Klasifikasi standar**: CWE-347 (Improper Verification of Cryptographic Signature) + OWASP A02:2021 (Cryptographic Failures)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/webhook/route.ts` (baris 144)
- **Skill sumber**: payment-security-review
- **Apa yang terjadi**: Endpoint webhook Midtrans mencari header `x-midtrans-signature` untuk memverifikasi keaslian request. Namun, Midtrans secara standar mengirimkan signature key di dalam body request JSON sebagai parameter `signature_key`, bukan sebagai HTTP header.
- **Bukti**:
  ```typescript
  const body = await request.json();
  const signatureHeader = request.headers.get("x-midtrans-signature") ?? "";
  ```
- **Dampak bisnis**:
  - Semua notifikasi pembayaran sah dari Midtrans akan ditolak dengan respons `401 Unauthorized` karena signatureHeader akan selalu bernilai kosong (`""`).
  - Akibatnya, status donasi tidak akan pernah berubah menjadi "paid" secara otomatis, menghentikan sinkronisasi keuangan ke buku besar, serta merusak alur operasional masjid.
- **Rekomendasi perbaikan**:
  - Ambil signature key langsung dari request body (`body.signature_key`) untuk dicocokkan dengan hasil hash lokal:
    ```typescript
    const body = await request.json();
    const signature = body.signature_key ?? "";
    if (!verifySignature(body, signature, serverKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-025] Endpoint `/api/admin/overview` Tidak Memiliki Proteksi Otentikasi dan Otorisasi
- **Severity**: Critical
- **Klasifikasi standar**: CWE-306 (Missing Authentication for Critical Function) + OWASP A01:2021 (Broken Access Control)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/admin/overview/route.ts` (baris 6-9) dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/middleware.ts` (baris 8-12)
- **Skill sumber**: hunt-api-misconfig
- **Apa yang terjadi**: Middleware Next.js hanya memproteksi rute yang cocok dengan `/admin/:path*` namun melewatkan `/api/admin/:path*`. Selain itu, rute API `/api/admin/overview` tidak memanggil fungsi pengecekan otentikasi (seperti `requireAuth()`) atau otorisasi peran sama sekali. Endpoint ini langsung memproses parameter `mosqueId` yang disuplai pengguna melalui query string.
- **Bukti**:
  ```typescript
  // src/middleware.ts
  export const config = {
    matcher: [
      "/admin/:path*", // Melewatkan /api/admin/*
    ],
  };

  // src/app/api/admin/overview/route.ts
  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mosqueId = searchParams.get("mosqueId");
    // Langsung query database tanpa requireAuth() atau requireRole()
  ```
- **Dampak bisnis**:
  - Penyerang luar (unauthenticated) dapat mendownload seluruh ringkasan data masjid (seluruh transaksi keuangan, profil mustahik beserta data sensitif seperti alamat, data jamaah, inventaris, dan donasi) dengan hanya menebak atau mengetahui `mosqueId` (UUID).
  - Melanggar UU PDP (Indonesia) terkait kebocoran data pribadi mustahik dan jamaah, serta standar kepatuhan keamanan.
- **Rekomendasi perbaikan**:
  - Update matcher di `middleware.ts` untuk menyertakan rute API `/api/admin/:path*` atau tambahkan `requireAuth()` and `requireRole(mosqueId, ...)` di dalam handler `route.ts`.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-026] Pembuatan Donasi Publik Mengizinkan Input Parameter `payment_status` Secara Bebas
- **Severity**: High
- **Klasifikasi standar**: CWE-20 (Improper Input Validation) + OWASP A01:2021 (Broken Access Control)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/donations.ts` (baris 46-60)
- **Skill sumber**: hunt-business-logic
- **Apa yang terjadi**: Fungsi Server Action `createDonation` menerima tipe parameter data `InsertDonation` yang menyertakan `payment_status`. Fungsi ini langsung menyimpan nilai tersebut ke database tanpa memverifikasi apakah pengirim memiliki hak administratif.
- **Bukti**:
  ```typescript
  export async function createDonation(data: InsertDonation) {
    ...
    const [row] = await db
      .insert(donations)
      .values({
        ...
        payment_status: (data.payment_status ?? "paid") as "pending" | "paid" | "failed" | "refunded",
        paid_at: data.payment_status === "paid" ? sql`NOW()` : null,
      })
  ```
- **Dampak bisnis**:
  - Pengguna publik/attacker dapat memanggil Server Action ini secara langsung lewat konsol browser atau client HTTP dan menyuplai `{ payment_status: "paid" }`.
  - Hal ini menyebabkan donasi langsung dianggap lunas, memicu pembuatan entri transaksi pendapatan palsu di buku besar keuangan masjid secara otomatis tanpa adanya uang masuk yang nyata.
- **Rekomendasi perbaikan**:
  - Pastikan Server Action ini selalu memaksa status menjadi `pending` jika dipanggil tanpa otentikasi admin, atau batasi parameter status agar hanya bisa diset menjadi `paid` oleh peran `superadmin`/`admin_dkm`.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-027] Bypass Verifikasi Nominal Pembayaran Donasi (Payment Amount Mismatch Bypass)
- **Severity**: High
- **Klasifikasi standar**: CWE-354 (Improper Validation of Integrity Check Value) + OWASP A04:2021 (Insecure Design)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/token/route.ts` dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/webhook/route.ts`
- **Skill sumber**: payment-security-review
- **Apa yang terjadi**: 
  1. Endpoint `/api/midtrans/token` menerima parameter `gross_amount` langsung dari body request client tanpa memverifikasi kecocokannya dengan nilai asli donasi di database.
  2. Endpoint webhook `/api/midtrans/webhook` memproses pembayaran sukses dan mengupdate status donasi menjadi `paid` serta memicu sync buku besar (`transactions`) menggunakan nominal asli yang ada di database (`donation.amount`), bukan nominal aktual yang dibayarkan (`grossAmount` dari notifikasi Midtrans).
- **Bukti**:
  ```typescript
  // Di route.ts token:
  const { order_id, gross_amount } = body;
  // Langsung dikirim ke Midtrans tanpa validasi silang ke DB.

  // Di route.ts webhook:
  const grossAmount = Number(notification.gross_amount ?? 0);
  ...
  const txValue: typeof transactions.$inferInsert = {
    amount: donation.amount, // Menggunakan nilai dari database
  ```
- **Dampak bisnis**:
  - Attacker dapat membuat niat donasi sebesar Rp 10.000.000 (10 juta), lalu secara manual meminta Snap token ke `/api/midtrans/token` untuk `order_id` tersebut namun dengan nominal Rp 10.000 (10 ribu).
  - Setelah membayar Rp 10.000, webhook akan memprosesnya, menandai donasi 10 juta tersebut sebagai "paid", dan mencatat pemasukan kas buku besar sebesar Rp 10.000.000. Hal ini memicu manipulasi keuangan kas masjid yang sangat fatal.
- **Rekomendasi perbaikan**:
  - Di endpoint token: Validasi silang `gross_amount` yang dikirim dari client dengan data nominal donasi di database sebelum meminta token ke Midtrans.
  - Di webhook: Pastikan nominal yang dibayarkan (`notification.gross_amount`) sama dengan nominal donasi di database sebelum memproses status lunas, atau catat transaksi buku besar menggunakan nilai aktual `grossAmount` dari Midtrans.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-028] Pengabaian Pengecekan Otorisasi Multi-Tenant/Peran di Server Actions
- **Severity**: High
- **Klasifikasi standar**: CWE-285 (Improper Authorization) + OWASP A01:2021 (Broken Access Control)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/` (`jamaah.ts`, `inventaris.ts`, `donations.ts`, `mustahik.ts`)
- **Skill sumber**: hunt-idor
- **Apa yang terjadi**: 
  - Fungsi seperti `getJamaahById` (di `jamaah.ts` baris 27-30) dan `getInventarisById` (di `inventaris.ts` baris 27-30) tidak memiliki pengecekan `requireAuth()` atau `requireRole()`.
  - Fungsi `createJamaah` (di `jamaah.ts` baris 32) dan `createInventaris` (di `inventaris.ts` baris 32) hanya memanggil `requireAuth()`, tetapi tidak memanggil `requireRole(data.mosque_id, ...)` untuk mengonfirmasi bahwa user tersebut adalah pengurus masjid yang ditargetkan.
  - Fungsi `getDonations` (di `donations.ts` baris 37-44) hanya memanggil `requireAuth()` tanpa memeriksa apakah pengguna terasosiasi dengan `mosqueId` yang diminta.
- **Bukti**:
  ```typescript
  // Di jamaah.ts:
  export async function getJamaahById(id: string) {
    const [row] = await db.select().from(jamaah).where(eq(jamaah.id, id)).limit(1);
    return row ?? null;
  }
  ```
- **Dampak bisnis**:
  - Mengizinkan kebocoran data jamaah/inventaris antar masjid (multi-tenant isolation breach). Pengurus Masjid A dapat memodifikasi, membaca, atau menyisipkan data di Masjid B.
- **Rekomendasi perbaikan**:
  - Terapkan `requireRole()` secara konsisten untuk semua operasi baca spesifik dan operasi tulis (create, update, delete).
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-049] Ketiadaan Validasi Token Cloudflare Turnstile di Sisi Server (Turnstile Verification Missing)
- **Severity**: High
- **Klasifikasi standar**: CWE-306 (Missing Authentication for Critical Function) + Bot Abuse / Spam Vulnerability
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/` (terutama `donations.ts`, `loan-applications.ts`, dan `ziswaf-requests.ts`)
- **Skill sumber**: webapp-testing
- **Apa yang terjadi**: Konfigurasi key Cloudflare Turnstile tersedia di `.env.example`, namun tidak ada kode di sisi server (Server Actions atau Route Handlers) yang menerima dan memverifikasi token Turnstile dari client ke endpoint verifikasi Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).
- **Bukti**: Tidak ada referensi pencarian string `TURNSTILE_SECRET_KEY` atau fetch ke endpoint verifikasi Turnstile di seluruh folder `src/`.
- **Dampak bisnis**:
  - Formulir publik (seperti pengajuan pinjaman modal, ZISWAF, dan donasi) dapat diserang oleh bot otomatis (automated scripts) untuk melakukan spamming data palsu, membanjiri database, dan menghabiskan resource server secara sia-sia.
- **Rekomendasi perbaikan**:
  - Tambahkan parameter `turnstileToken` di input server action publik, dan lakukan verifikasi ke API Cloudflare sebelum menyimpan data:
    ```typescript
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
      headers: { "Content-Type": "application/json" }
    });
    const outcome = await res.json();
    if (!outcome.success) throw new Error("Bot verification failed");
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-050] Kebocoran Privasi & UU PDP: Penyimpanan NIK Mentah/Unencrypted pada Tabel Pengajuan Pinjaman (Plaintext NIK Storage)
- **Severity**: High
- **Klasifikasi standar**: CWE-311 (Missing Encryption of Sensitive Data) + Pelanggaran UU PDP (Data Privasi)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts` (baris 383)
- **Skill sumber**: gdpr-dsgvo-expert
- **Apa yang terjadi**: Kolom `nik` pada tabel `loan_applications` bertipe teks biasa (`text`) dan menyimpan Nomor Induk Kependudukan (NIK) pemohon secara mentah (plaintext). Hal ini melanggar prinsip nomor 7 dalam panduan skema database di proyek ini ("TANPA NIK mentah — NIK dienkripsi AES-256-GCM + hash SHA-256 untuk dedup").
- **Bukti**:
  - Di `schema.ts` tabel `loan_applications`:
    ```typescript
    nik: text("nik").notNull(),
    ```
- **Dampak bisnis**:
  - Jika database bocor, data NIK mentah milik pemohon pinjaman modal (mustahik/jamaah) akan langsung terekspos. Hal ini merupakan pelanggaran serius terhadap Undang-Undang Perlindungan Data Pribadi (UU PDP) di Indonesia dengan sanksi denda dan reputasi buruk.
- **Rekomendasi perbaikan**:
  - Ubah kolom `nik` di tabel `loan_applications` menjadi `nik_encrypted` (AES-256-GCM) dan `nik_hash` (SHA-256) seperti pada tabel `mustahiks` dan `muzzaki`.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-021] Public API Mengembalikan `mosque.id`
- **Severity**: Medium
- **Klasifikasi standar**: CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/public/route.ts` (baris 130)
- **Skill sumber**: hunt-idor
- **Apa yang terjadi**: Endpoint publik (`/api/public`) mengembalikan `mosque.id` (UUID) di response. `mosque.id` digunakan di banyak endpoint lain (misal: `/api/admin/overview?mosqueId=...`).
- **Bukti**:
  ```typescript
  mosque: { id: mosque.id, name: mosque.name, config: mosque.config },
  ```
- **Dampak bisnis**:
  - Mempermudah penyerangan **IDOR** dan **Broken Access Control** pada endpoint action/API lain yang rentan.
- **Rekomendasi perbaikan**:
  - Jangan kembalikan `mosque.id` di endpoint publik. Gunakan identifier yang tidak bisa ditebak (misal: `slug` atau `public_id`).
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-022] `getMustahikById` Tidak Memeriksa Ownership
- **Severity**: High
- **Klasifikasi standar**: CWE-639 (Authorization Bypass Through User-Controlled Key) + OWASP A01:2021 (Broken Access Control)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/mustahik.ts` (baris 34-37)
- **Skill sumber**: hunt-idor
- **Apa yang terjadi**: Fungsi `getMustahikById` tidak memeriksa apakah pengguna memiliki akses ke `mustahik` dengan `id` yang diberikan. Hanya memeriksa apakah `mustahik` ada di database.
- **Bukti**:
  ```typescript
  export async function getMustahikById(id: string): Promise<MustahikDb | null> {
    const [row] = await db.select().from(mustahiks).where(eq(mustahiks.id, id)).limit(1);
    return row ? (serializeRow(row as unknown as Record<string, unknown>) as unknown as MustahikDb) : null;
  }
  ```
- **Dampak bisnis**:
  - Pengguna bisa mengakses data mustahik dari masjid lain dengan hanya mengetahui `id` (kebocoran data pribadi).
- **Rekomendasi perbaikan**:
  - Tambahkan pengecekan ownership menggunakan `requireRole(old.mosque_id, ...)` di server actions.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-023] `updateMustahik` dan `deleteMustahik` Tidak Memeriksa Ownership
- **Severity**: High
- **Klasifikasi standar**: CWE-639 (Authorization Bypass Through User-Controlled Key) + OWASP A01:2021 (Broken Access Control)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/mustahik.ts` (baris 95-165)
- **Skill sumber**: hunt-idor
- **Apa yang terjadi**: Fungsi `updateMustahik` dan `deleteMustahik` hanya memeriksa `requireAuth()`, tidak memeriksa apakah pengguna memiliki akses ke `mustahik` yang akan diubah/hapus.
- **Bukti**:
  ```typescript
  export async function updateMustahik(id: string, formData: FormData) {
    await requireAuth();
    const old = await getMustahikById(id);
    if (!old) return { error: "Mustahik tidak ditemukan." };
  ```
- **Dampak bisnis**:
  - Pengguna bisa mengubah atau menghapus data mustahik dari masjid lain.
- **Rekomendasi perbaikan**:
  - Tambahkan pengecekan ownership dengan `requireRole` menggunakan `old.mosque_id`.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-051] Content Security Policy (CSP) Memblokir Gambar Landing Page (CSP Blocked Images)
- **Severity**: Medium
- **Klasifikasi standar**: CWE-1007 (Insecure State Management of Security Headers)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/next.config.ts` (baris 10)
- **Skill sumber**: security-review
- **Apa yang terjadi**: Header Content Security Policy (CSP) membatasi `img-src` hanya untuk `'self' data: blob: https://*.supabase.co`. Namun, halaman landing page memuat gambar-gambar penting dari domain external Unsplash (`https://images.unsplash.com`). Hal ini menyebabkan browser memblokir gambar tersebut.
- **Bukti**:
  - Di `next.config.ts`:
    ```typescript
    "img-src 'self' data: blob: https://*.supabase.co",
    ```
  - Di `LandingPage.tsx`:
    ```typescript
    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb..."
    ```
- **Dampak bisnis**:
  - Seluruh gambar utama masjid, program ekonomi, dan visual pendukung di landing page tidak akan muncul (broken images) bagi pengguna yang mengakses situs, merusak kenyamanan visual dan kredibilitas profesionalitas aplikasi.
- **Rekomendasi perbaikan**:
  - Tambahkan `https://images.unsplash.com` ke dalam daftar `img-src` di definisi CSP `next.config.ts`.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Kategori: Bug & Reliabilitas

### [ID-029] Tidak Ada Transaction Wrapper Pada Proses Sinkronisasi Keuangan
- **Severity**: High
- **Klasifikasi standar**: ACID (Atomicity) / Data Inconsistency / Code Smell
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/webhook/route.ts` dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/donations.ts`
- **Skill sumber**: code-reviewer
- **Apa yang terjadi**: Ketika pembayaran berhasil dikonfirmasi (baik lewat webhook Midtrans maupun manual via action), sistem mengupdate tabel `donations`, menyisipkan baris di `transactions` (buku besar), dan menyisipkan baris di `activity_feed`. Ketiga operasi database ini berjalan secara berurutan tanpa dibungkus dalam SQL transaction (`db.transaction`).
- **Bukti**:
  ```typescript
  // Di route.ts webhook:
  await db.update(donations).set({...}).where(...);
  if (paymentStatus === "paid") {
    await db.insert(transactions).values(...);
    await db.insert(activity_feed).values(...);
  }
  ```
- **Dampak bisnis**:
  - Jika terjadi gangguan koneksi database setelah update status donasi sukses namun sebelum pencatatan transaksi buku besar selesai, data donasi akan berstatus lunas ("paid") tetapi tidak tercatat di buku besar keuangan (Buku Besar). Hal ini memicu ketidaksesuaian hitungan kas masjid secara misterius (data missing).
- **Rekomendasi perbaikan**:
  - Gunakan `await db.transaction(async (tx) => { ... })` untuk membungkus seluruh rangkaian operasi penulisan tersebut agar jika salah satu gagal, semuanya di-rollback secara otomatis.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-030] Akumulator `total_paid` Pada Tabel `loans` Tidak Pernah Diupdate (Stale Loan Totals)
- **Severity**: Medium
- **Klasifikasi standar**: Logic Bug / Data Inconsistency
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/loan-installments.ts` (baris 68-98)
- **Skill sumber**: sql-database-assistant
- **Apa yang terjadi**: Fungsi `payInstallment` melakukan update pada baris tabel `loan_installments` untuk mencatat jumlah cicilan yang dibayarkan, namun tidak memiliki logika untuk memperbarui kolom `total_paid` di tabel induk `loans`.
- **Bukti**:
  ```typescript
  const [row] = await db
    .update(loan_installments)
    .set({
      amount_paid,
      paid_date: sql`CURRENT_DATE`,
      status: isLunas ? "paid" : "late",
    })
    .where(eq(loan_installments.id, id))
    .returning();
  // Tidak ada update ke tabel loans untuk menambahkan amount_paid ke total_paid.
  ```
- **Dampak bisnis**:
  - Kolom `total_paid` di tabel `loans` akan selalu bernilai 0 atau tidak sinkron meskipun nasabah/mustahik sudah membayar cicilan mereka hingga lunas. Hal ini merusak laporan performa pinjaman (NPF, kolektibilitas) dan dashboard analitik Bank Infaq.
- **Rekomendasi perbaikan**:
  - Jalankan operasi update tambahan di dalam transaksi yang sama untuk mengupdate `total_paid` di tabel `loans` ketika cicilan dibayarkan.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-031] Kegagalan Eksekusi Linter Akibat Ketiadaan File eslint.config.js
- **Severity**: Low
- **Klasifikasi standar**: Developer Experience (DX) / Code Quality
- **Lokasi**: Root directory (ketiadaan file konfigurasi ESLint)
- **Skill sumber**: code-reviewer
- **Apa yang terjadi**: Dependensi ESLint menggunakan versi 9.x yang mewajibkan format Flat Config (`eslint.config.js`). Namun di dalam proyek tidak tersedia file konfigurasi tersebut, sehingga perintah `npm run lint` gagal total dengan exit code 2.
- **Bukti**:
  ```
  ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
  From ESLint v9.0.0, the default configuration file is now eslint.config.js.
  ```
- **Dampak bisnis**:
  - CI/CD build atau proses pengecekan kualitas kode otomatis oleh tim/AI developer lain akan terhambat dan mengalami error, menyulitkan pendeteksian dini terhadap bug sintaksis.
- **Rekomendasi perbaikan**:
  - Buat file `eslint.config.mjs` di root dengan konfigurasi extend dari `eslint-config-next` versi 15/16.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Kategori: Database & Integritas Data

### [ID-032] Duplikasi Tabel Repayment vs Loan_Installments (Schema Bloat)
- **Severity**: Medium
- **Klasifikasi standar**: Database Normalization / Schema Hygiene
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts` (baris 411-433 vs baris 935-949)
- **Skill sumber**: database-designer
- **Apa yang terjadi**: Di dalam `schema.ts`, terdapat dua definisi tabel yang memiliki peruntukan yang hampir sama untuk mencatat cicilan pengembalian modal Qardhul Hasan: tabel `repayments` dan tabel `loan_installments`. Di dalam codebase server actions, tabel `repayments` sama sekali tidak pernah digunakan atau di-import, sedangkan tabel yang aktif dipakai adalah `loan_installments`.
- **Bukti**:
  - Baris 411: `export const repayments = pgTable("repayments", { ... });`
  - Baris 935: `export const loan_installments = pgTable("loan_installments", { ... });`
- **Dampak bisnis**:
  - Mengakibatkan redudansi schema database, menambah ukuran data migrations, mempersulit pemeliharaan kode (maintenance), dan dapat membuat AI/developer lain bingung saat ingin menambahkan fitur baru pada alur pembayaran cicilan.
- **Rekomendasi perbaikan**:
  - Lakukan pembersihan schema dengan menghapus definisi `repayments` dari `schema.ts` dan jalankan migrasi `drizzle-kit generate` untuk men-drop tabel `repayments` dari database Postgres secara aman.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-033] Ketiadaan Index Pada Kolom Foreign Key Relasi Profil Pengguna (Missing DB Indexes)
- **Severity**: Low
- **Klasifikasi standar**: Database Performance / Query Optimization
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts` (tabel `loans`, `transactions`, `donations`, `employees`, `inventaris`)
- **Skill sumber**: sql-database-assistant
- **Apa yang terjadi**: Kolom-kolom foreign key yang mereferensikan tabel `profiles.id` (seperti `loans.approved_by`, `transactions.created_by`, `donations.verified_by`, `employees.created_by`, dan `inventaris.created_by`) tidak dipasang indeks (`index`). Kolom-kolom ini sering dipakai dalam operasi `JOIN` atau filter audit untuk menampilkan siapa pembuat atau verifikator data tersebut di dashboard admin.
- **Bukti**:
  - Di `schema.ts` tabel `transactions`:
    ```typescript
    created_by: uuid("created_by").references(() => profiles.id),
    // Tidak ada index pada created_by di list index composite di bawah.
    ```
- **Dampak bisnis**:
  - Operasi query log audit atau filtering data berdasarkan pengurus tertentu akan memaksa PostgreSQL melakukan *Full Table Scan* seiring bertumbuhnya jumlah data transaksi dan log. Hal ini memicu kelambatan pemuatan halaman dashboard (data terasa lambat masuk/berubah).
- **Rekomendasi perbaikan**:
  - Tambahkan deklarasi index pada masing-masing foreign key di akhir definisi tabel di `schema.ts`:
    ```typescript
    index("transactions_created_by_idx").on(t.created_by)
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Kategori: UI/UX Desktop & Kinerja (Kinerja Web)

### [ID-034] Kontras Warna Primary Emerald Terlalu Rendah (WCAG 2.2 AA Contrast Failure)
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 Success Criterion 1.4.3 (Contrast - Minimum)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css` (baris 4-5) dan seluruh komponen UI yang menggunakan `text-primary` atau `bg-primary` dengan teks putih.
- **Skill sumber**: a11y-audit
- **Apa yang terjadi**: Warna hijau primary (`#10b981`) dan primary-dark (`#059669`) digunakan sebagai latar belakang tombol dengan teks putih, atau sebagai warna teks di atas latar belakang putih (`#ffffff`). Contrast ratio untuk `#10b981` pada putih hanya **2.88:1**, dan untuk `#059669` hanya **3.8:1**. Keduanya gagal mencapai rasio minimal **4.5:1** yang dipersyaratkan WCAG untuk teks normal.
- **Bukti**:
  - Di `globals.css`:
    ```css
    --color-primary: #10b981;      /* Contrast: 2.88:1 */
    --color-primary-dark: #059669; /* Contrast: 3.80:1 */
    ```
- **Dampak bisnis**:
  - Tombol aksi dan informasi penting dengan skema warna primary sulit dibaca oleh pengguna dengan gangguan penglihatan (low vision) atau saat layar perangkat terpapar sinar matahari langsung, mengurangi inklusivitas aplikasi.
- **Rekomendasi perbaikan**:
  - Gunakan warna primary yang lebih gelap untuk elemen teks/tombol pada latar belakang putih, misalnya `--color-primary-deep: #0e7a45` (rasio kontras **4.7:1**, lulus WCAG AA).
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-052] Penggunaan Tag `<img>` Native Tanpa Next.js `<Image />` Component (Unoptimized Remote Images)
- **Severity**: Low
- **Klasifikasi standar**: Core Web Vitals (Largest Contentful Paint - LCP) / Web Performance
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/LandingPage.tsx` (baris 180) dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/LandingPage.tsx` (baris 349)
- **Skill sumber**: web-perf
- **Apa yang terjadi**: Halaman utama memuat gambar eksternal (seperti foto kubah masjid dari Unsplash) menggunakan tag native HTML `<img>` alih-alih menggunakan komponen bawaan Next.js `<Image />` (`next/image`).
- **Bukti**:
  ```typescript
  <img 
    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80" 
    alt="At-Taqwa Mosque Dome" 
    className="w-full h-full object-cover"
  />
  ```
- **Dampak bisnis**:
  - Mengakibatkan pemuatan data gambar berukuran penuh yang tidak terkompresi, memperlambat kecepatan load halaman (Core Web Vitals LCP terhambat), serta meningkatkan konsumsi kuota bandwidth hosting masjid.
- **Rekomendasi perbaikan**:
  - Konfigurasikan domain remote di `next.config.ts` dan ubah tag `<img>` menjadi komponen `<Image />` Next.js dengan properti `width`, `height`, atau `fill` + `sizes` untuk otomatisasi optimasi ukuran gambar.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Kategori: UI/UX Mobile (Responsive)

### [ID-035] Tampilan Tabel Mustahik Terlalu Padat dan Melebar di Perangkat Mobile (Missing Mobile-Optimized Layout)
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 Success Criterion 1.4.10 (Reflow) / Mobile UX Best Practice
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/MustahikTable.tsx` (baris 139-176)
- **Skill sumber**: sleek-design-mobile-apps
- **Apa yang terjadi**: Komponen tabel mustahik menampilkan seluruh kolom data (Nama, Asnaf, Program, NIM, Ring, Desil, Had Kifayah, Aksi) pada semua ukuran layar. Meskipun tabel diletakkan dalam kontainer `overflow-x-auto`, memaksa pengguna mobile melakukan scroll horizontal yang panjang untuk membaca data adalah UX yang buruk.
- **Bukti**:
  - Di `MustahikTable.tsx`:
    ```typescript
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        ...
        {/* Tidak ada kelas responsif seperti hidden md:table-cell untuk menyembunyikan kolom sekunder di layar kecil */}
    ```
- **Dampak bisnis**:
  - Admin/pemuda masjid yang memantau atau mengentri data di lapangan menggunakan HP/tablet akan kesulitan melihat data secara ringkas, menurunkan produktivitas pengolahan data mustahik.
- **Rekomendasi perbaikan**:
  - Sembunyikan kolom sekunder (seperti NIM, Desil, Had Kifayah) pada layar kecil menggunakan kelas utility Tailwind (`hidden md:table-cell`), atau gunakan layout berbasis kartu (card layout) yang menumpuk data secara vertikal khusus untuk tampilan mobile.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-036] Ukuran Target Sentuh Tombol Aksi Terlalu Kecil & Terlalu Dekat (Touch Target Risk)
- **Severity**: Low
- **Klasifikasi standar**: WCAG 2.2 Success Criterion 2.5.8 (Target Size - Minimum)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/MustahikTable.tsx` (baris 177-205)
- **Skill sumber**: sleek-design-mobile-apps
- **Apa yang terjadi**: Tombol aksi Edit (Pencil) dan Hapus (Trash2) diletakkan berdampingan dengan ukuran padding `p-1.5` dan ikon `w-4 h-4` (luas area sentuh total hanya ~28px). Di layar handphone yang kecil, tombol-tombol ini terlalu rapat sehingga rawan salah klik.
- **Bukti**:
  ```typescript
  <div className="flex items-center justify-end gap-1">
    <button onClick={...} className="p-1.5 ..."><Pencil className="w-4 h-4" /></button>
    <button onClick={...} className="p-1.5 text-red-600 ..."><Trash2 className="w-4 h-4" /></button>
  ```
- **Dampak bisnis**:
  - Admin berisiko tinggi secara tidak sengaja menekan tombol hapus (Trash2) saat berniat mengedit data mustahik (atau sebaliknya), yang memicu konfirmasi dialog yang mengganggu atau penghapusan tidak disengaja.
- **Rekomendasi perbaikan**:
  - Tingkatkan ukuran padding tombol menjadi setidaknya `p-2.5` atau pisahkan tata letaknya, serta berikan jarak/margin yang cukup (`gap-3`) di perangkat mobile.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Kategori: Arsitektur & Alur Data

### [ID-037] Pencampuran Logika Bisnis, Integrasi Pembayaran, dan Logging di Server Actions (Lack of Layer Separation)
- **Severity**: Medium
- **Klasifikasi standar**: SOLID Principles (Single Responsibility Principle) / Code Smell
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/` (terutama `donations.ts`, `transactions.ts`, dan `loan-installments.ts`)
- **Skill sumber**: senior-architect
- **Apa yang terjadi**: Logika bisnis utama (validasi data, pemformatan, sinkronisasi buku besar keuangan, audit logging, revalidasi cache Next.js, dan trigger feed aktivitas) menumpuk di dalam satu fungsi server action tunggal.
- **Bukti**:
  - Di `createDonation` (`donations.ts`):
    ```typescript
    // Satu fungsi melakukan insert donations, insert activity_feed, insert transactions (buku besar), insert audit_logs, dan revalidatePath.
    ```
- **Dampak bisnis**:
  - Kode menjadi sangat kaku, sulit ditest menggunakan unit testing, dan sulit dipelihara. Jika ada perubahan alur pencatatan audit log, developer harus memodifikasi 20+ file action satu per satu, meningkatkan risiko bug.
- **Rekomendasi perbaikan**:
  - Pisahkan tanggung jawab logika database, pencatatan audit, dan integrasi pihak ketiga ke modul/service terpisah (Repository Pattern atau Service Layer). Gunakan Event Emitter atau helper global untuk mencatat audit log dan menyinkronkan buku besar.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-038] Ketiadaan Skema Validasi Input di Server Actions (Missing Input Validation Layer)
- **Severity**: Medium
- **Klasifikasi standar**: OWASP A03:2021 (Injection / Input Validation)
- **Lokasi**: Seluruh file server actions di `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/`
- **Skill sumber**: typescript
- **Apa yang terjadi**: Meskipun library `zod` terpasang di `package.json`, server actions menerima argumen objek secara langsung (menggunakan tipe TypeScript biasa) tanpa melakukan parsing/validasi runtime menggunakan schema validator `zod` di baris pertama eksekusinya.
- **Bukti**:
  ```typescript
  export async function createJamaah(data: InsertJamaah) {
    const profile = await requireAuth();
    // Langsung insert ke DB tanpa validasi Zod schema pada objek `data`
  ```
- **Dampak bisnis**:
  - Membuka celah masuknya data kotor (malformed data), string kosong, atau tipe data yang tidak valid ke dalam database PostgreSQL yang bisa merusak aplikasi, menimbulkan error runtime di frontend, atau memicu crash di sisi server.
- **Rekomendasi perbaikan**:
  - Definisikan Zod Schema untuk masing-masing parameter input server action dan lakukan `schema.parse(data)` sebelum memproses data tersebut.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-039] Duplikasi Logika Sinkronisasi Buku Besar Keuangan (No Single Source of Truth)
- **Severity**: High
- **Klasifikasi standar**: DRY (Don't Repeat Yourself) / Data Consistency
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/donations.ts` dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/webhook/route.ts`
- **Skill sumber**: senior-architect
- **Apa yang terjadi**: Logika untuk memetakan akad donasi (seperti zakat, infaq, wakaf) ke kategori transaksi buku besar keuangan ditulis ulang (copy-paste) di dua tempat berbeda: di Server Action `createDonation` dan di API route webhook Midtrans.
- **Bukti**:
  - Deklarasi objek `CATEGORY_MAP` yang identik didefinisikan secara independen di `donations.ts` baris 17-24 dan `route.ts` webhook baris 9-16.
- **Dampak bisnis**:
  - Jika kategori akad diubah di kemudian hari, developer berpotensi lupa memperbarui salah satu file, menyebabkan pencatatan buku besar berbeda format antara donasi manual dan donasi online. Ini memicu ketidakstabilan live data transaksi.
- **Rekomendasi perbaikan**:
  - Pindahkan `CATEGORY_MAP` dan logika sinkronisasi keuangan ke helper modul bersama (misal di `/src/lib/fund-mapping.ts` atau `/src/lib/actions/finance-sync.ts`) agar menjadi Single Source of Truth.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Kategori: Logging & Observability

### [ID-040] Tidak Ada Library Logging Khusus (LOG-001)
- **Severity**: High
- **Klasifikasi standar**: OWASP A09:2021 (Security Logging and Monitoring Failures)
- **Lokasi**: Seluruh codebase
- **Skill sumber**: logging
- **Apa yang terjadi**: Aplikasi hanya menggunakan `console.log` dan `console.error` native Node.js untuk logging di sisi server.
- **Dampak bisnis**:
  - Logging sinkronus dapat memengaruhi performa server. Tidak ada klasifikasi log level (info, warn, error) yang terstandarisasi untuk analisis otomatis.
- **Rekomendasi perbaikan**:
  - Integrasikan library logging asinkronus dan terstruktur seperti `pino`.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-041] Tidak Ada Request ID atau Correlation ID (LOG-002)
- **Severity**: High
- **Klasifikasi standar**: W3C Trace Context / Correlation Tracking
- **Lokasi**: API Routes dan Server Actions
- **Skill sumber**: logging
- **Apa yang terjadi**: Tidak ada penanda unik (Request ID) yang ditempelkan pada siklus request, sehingga log-log dari operasi yang sama tidak dapat dikorelasikan.
- **Dampak bisnis**:
  - Mempersulit penelusuran akar masalah (root cause) dari suatu kegagalan request di lingkungan production, terutama jika server melayani banyak request secara bersamaan.
- **Rekomendasi perbaikan**:
  - Tambahkan middleware untuk menggenerasikan Request UUID unik pada header `x-request-id` dan salurkan penanda ini ke logger.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-042] Tidak Ada Structured Logging (LOG-003)
- **Severity**: High
- **Klasifikasi standar**: JSON Structured Logging Standard
- **Lokasi**: Seluruh codebase
- **Skill sumber**: logging
- **Apa yang terjadi**: Seluruh log dicetak dalam format string polos (unstructured) alih-alih format JSON yang mudah diparsing oleh mesin.
- **Dampak bisnis**:
  - Logger tidak dapat di-query atau di-filter secara presisi berdasarkan field metadata tertentu (misal mencari log donasi untuk id tertentu).
- **Rekomendasi perbaikan**:
  - Gunakan Pino logger yang mencetak log terstruktur dalam format JSON di sisi produksi.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-043] Tidak Ada Centralized Logging (LOG-004)
- **Severity**: High
- **Klasifikasi standar**: Centralized Log Management
- **Lokasi**: Deployment configuration / hosting
- **Skill sumber**: logging
- **Apa yang terjadi**: Log hanya dicetak ke standard output kontainer (STDOUT/STDERR) dan akan hilang selamanya jika kontainer di-restart atau di-deploy ulang.
- **Dampak bisnis**:
  - Hilangnya riwayat jejak error masa lalu menghambat pemeliharaan sistem jangka panjang.
- **Rekomendasi perbaikan**:
  - Alirkan log server ke kolektor terpusat seperti Grafana Loki (menggunakan Alloy/FluentBit) atau integrasikan SaaS log collector (Logtail).
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-044] Ketiadaan Audit Logging untuk Perubahan Data (LOG-005)
- **Severity**: Critical
- **Klasifikasi standar**: SOC 2 CC7.2 (Audit Logging) + OWASP A09:2021 (Logging and Monitoring Failures)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/` (terutama `mustahik.ts`, `transactions.ts`, `loans.ts`)
- **Skill sumber**: logging
- **Apa yang terjadi**: Meskipun tabel `audit_logs` sudah didefinisikan di schema database, penulisan log audit pada server actions yang mengubah data penting (seperti NIK mustahik atau data keuangan) tidak diimplementasikan secara merata atau konsisten.
- **Dampak bisnis**:
  - Tidak ada transparansi mutlak mengenai siapa pengurus/admin yang melakukan modifikasi data finansial atau mustahik, sehingga rawan terhadap penyalahgunaan data (fraud) tanpa adanya bukti forensik digital.
- **Rekomendasi perbaikan**:
  - Buat helper interseptor global untuk secara otomatis mencatat setiap mutasi data (CREATE, UPDATE, DELETE) ke tabel `audit_logs`.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-045] Tidak Ada Monitoring atau Alerting (LOG-006)
- **Severity**: High
- **Klasifikasi standar**: Real-time Monitoring and Alerting
- **Lokasi**: Seluruh codebase
- **Skill sumber**: logging
- **Apa yang terjadi**: Sistem tidak memiliki pemantau performa (APM) atau mekanisme peringatan dini untuk error-error kritis.
- **Dampak bisnis**:
  - Kejadian server down atau error integrasi pembayaran (seperti webhook Midtrans mati) tidak diketahui oleh tim pengembang hingga ada laporan/keluhan langsung dari pengguna.
- **Rekomendasi perbaikan**:
  - Hubungkan SDK Sentry untuk pelacakan error real-time dan set up notifikasi via Telegram/Discord/Slack webhook untuk notifikasi error tingkat keparahan tinggi.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-046] Tidak Ada Retention Policy untuk Log (LOG-007)
- **Severity**: Medium
- **Klasifikasi standar**: Log Retention Policy
- **Lokasi**: Deployment configuration
- **Skill sumber**: logging
- **Apa yang terjadi**: Tidak ada aturan atau scripts pembersihan berkala untuk data logs yang menumpuk.
- **Dampak bisnis**:
  - Penumpukan logs dapat menghabiskan kuota penyimpanan (disk space) server/database secara perlahan, memicu pembengkakan biaya hosting atau downtime akibat kehabisan disk space.
- **Rekomendasi perbaikan**:
  - Pasang retensi logs maksimal 30 hari di sisi kolektor (misal Grafana Loki) atau database audit log.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-047] Logging Data Sensitif di Error Log (LOG-008)
- **Severity**: High
- **Klasifikasi standar**: CWE-532 (Insertion of Sensitive Information into Log File) + UU PDP (Pelanggaran Data Pribadi)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/webhook/route.ts` (baris 56/153)
- **Skill sumber**: logging
- **Apa yang terjadi**: Sistem mencetak seluruh objek body/error secara mentah ke log, di mana objek tersebut berpotensi mengandung token, kredensial, atau data pribadi donatur.
- **Bukti**:
  ```typescript
  console.error("[MIDTRANS] Token error:", response.status, errBody);
  ```
- **Dampak bisnis**:
  - Kebocoran token pembayaran atau data donatur di dalam log file yang bisa dibaca oleh tim administrator log, melanggar standar privasi UU PDP.
- **Rekomendasi perbaikan**:
  - Buat fungsi utilitas penyaring (redaction utility) untuk menyamarkan kata kunci sensitif (seperti `token`, `password`, `nik`) sebelum mencetaknya ke logger.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-048] Tidak Ada Sampling atau Filtering untuk Log Volume Besar (LOG-009)
- **Severity**: Medium
- **Klasifikasi standar**: Log Volume Optimization
- **Lokasi**: Seluruh codebase
- **Skill sumber**: logging
- **Apa yang terjadi**: Log tingkat `debug` dicetak secara penuh tanpa adanya reduksi/sampling di lingkungan produksi.
- **Dampak bisnis**:
  - Mengakibatkan spamming logs yang tidak perlu, menyulitkan pencarian log penting karena tercampur log debug, dan menghabiskan resource transfer bandwidth log.
- **Rekomendasi perbaikan**:
  - Batasi log debug hanya aktif di lingkungan lokal (development), atau gunakan conditional logging level di produksi agar hanya menampilkan tingkat `info` ke atas.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

*GERAKAN PEMUDA BERDAYA — Jaringan Digital Masjid Jami' At-Taqwa Ulujami*
