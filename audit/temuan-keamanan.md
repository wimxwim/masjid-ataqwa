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
  - Penyerang bisa menggunakan `mosque.id` untuk mengakses endpoint admin atau action files yang rentan IDOR.
  - Mempermudah serangan **IDOR** dan **Broken Access Control**.
  - Pelanggaran **OWASP A01:2021** (Broken Access Control).
- **Rekomendasi perbaikan**:
  - Jangan kembalikan `mosque.id` di endpoint publik.
  - Gunakan identifier yang tidak bisa ditebak (misal: `slug` atau `public_id`).
  - Jika harus menggunakan UUID, pastikan semua endpoint lain memeriksa ownership dengan benar.
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
  - Pengguna bisa mengakses data mustahik dari masjid lain dengan hanya mengetahui `id`.
  - Pelanggaran **SOC 2 CC6.1** (Logical Access Controls).
  - Risiko kebocoran data sensitif (NIK, alamat, kondisi ekonomi).
- **Rekomendasi perbaikan**:
  - Tambahkan pengecekan ownership dengan `requireRole`:
    ```typescript
    const old = await getMustahikById(id);
    if (!old) return { error: "Mustahik tidak ditemukan." };
    const { membership } = await requireRole(old.mosque_id, "admin_dkm", "social_lead");
    ```
  - Pastikan semua action files yang menggunakan `getMustahikById` juga memeriksa ownership.
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
  - Pelanggaran **SOC 2 CC6.1** (Logical Access Controls).
  - Risiko sabotase data dan kebocoran informasi.
- **Rekomendasi perbaikan**:
  - Tambahkan pengecekan ownership dengan `requireRole`:
    ```typescript
    const { membership } = await requireRole(old.mosque_id, "admin_dkm", "social_lead");
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

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
  - Akibatnya, status donasi tidak akan pernah berubah menjadi "paid" secara otomatis, menghentikan sinkronisasi keuangan ke buku besar, serta merusak alur operasional masjid (donatur tidak mendapat notifikasi sukses dan data dinilai "missing").
- **Rekomendasi perbaikan**:
  - Ambil signature key langsung dari request body (`body.signature_key`) untuk dicocokkan dengan hasil hash lokal:
    ```typescript
    const body = await request.json();
    const signature = body.signature_key ?? "";
    if (!verifySignature(body, signature, serverKey)) { ... }
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
    if (!mosqueId) return NextResponse.json({ error: "mosqueId required" }, { status: 400 });
    // Langsung query database tanpa requireAuth()
  ```
- **Dampak bisnis**:
  - Penyerang luar (unauthenticated) dapat mendownload seluruh ringkasan data masjid (seluruh transaksi keuangan, profil mustahik beserta data sensitif seperti alamat, data jamaah, inventaris, dan donasi) dengan hanya menebak atau mengetahui `mosqueId` (UUID).
  - Melanggar UU PDP (Indonesia) terkait kebocoran data pribadi mustahik dan jamaah, serta standar kepatuhan keamanan.
- **Rekomendasi perbaikan**:
  - Update matcher di `middleware.ts` untuk menyertakan rute API `/api/admin/:path*` atau tambahkan `requireAuth()` dan `requireRole(mosqueId, ...)` di dalam handler `route.ts`.
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

