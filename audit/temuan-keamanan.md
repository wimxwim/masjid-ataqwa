# 🔐 AUDIT KEAMANAN — Masjid At-Taqwa (masjid-ataqwa)

**Tanggal:** 2026-07-03
**Auditor:** OpenCode Security Review
**Scope:** Full codebase audit (server actions, API routes, auth, Supabase config, secrets)
**Total temuan:** 18

---

## 🔴 CRITICAL

### [ID-001] Secret produksi dalam bentuk plaintext di .env dan .dev.vars (duplikasi)
- **Severity**: Critical
- **Klasifikasi**: CWE-312 / OWASP A05:2021 (Security Misconfiguration)
- **Lokasi**: `.env` (baris 1-32), `.dev.vars` (baris 1-13)
- **Apa yang terjadi**: Semua kredensial produksi disimpan dalam bentuk plaintext di **dua file berbeda** (`.env` dan `.dev.vars`) yang sama-sama berisi secret identik — MIDTRANS_SERVER_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL (dengan password), NIK_ENCRYPTION_KEY, FONNTE_TOKEN. Jika salah satu file bocor (misal ke commit, backup, screenshot), semua infrastruktur terpapar. `.dev.vars` hanya dikecualikan di `.gitignore` tapi tidak dienkripsi.
- **Bukti** (dari `.env`):
  ```env
  SUPABASE_SECRET_KEY=sb_secret_[REDACTED]
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...[REDACTED]
  DATABASE_URL=postgresql://postgres:[REDACTED]@db.supabase.co:5432/postgres
  MIDTRANS_SERVER_KEY=Mid-server-[REDACTED]
  FONNTE_TOKEN=[REDACTED]
  NIK_ENCRYPTION_KEY=[REDACTED]
  ```
- **Dampak bisnis**: Peretas dengan akses ke file ini bisa mengakses database (Semua data mustahik, donatur, transaksi, NIK terenkripsi), mengambil alih payment gateway, mengirim WA palsu via Fonnte.
- **Rekomendasi perbaikan**:
  1. Gunakan `.env` sebagai template saja (`.env.example` sudah baik — pertahankan). Hanya 1 file `.dev.vars` untuk development.
  2. Aktifkan enkripsi secret via Cloudflare Workers Secrets atau Vercel Environment Variables.
  3. Hapus SUPABASE_SERVICE_ROLE_KEY dan SUPABASE_SECRET_KEY dari `.env` jika tidak dipakai kode.
  4. Rotasi semua secret segera.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-002] SUPABASE_SERVICE_ROLE_KEY dan SUPABASE_SECRET_KEY terdefinisi tapi tidak terpakai — risiko kebocoran
- **Severity**: Critical
- **Klasifikasi**: CWE-778 / OWASP A05:2021
- **Lokasi**: `.env` (baris 4-5), `.dev.vars` (baris 3-4)
- **Apa yang terjadi**: `SUPABASE_SECRET_KEY` (`sb_secret_...`) dan `SUPABASE_SERVICE_ROLE_KEY` (JWT service_role) didefinisikan di file env tapi **tidak pernah dipanggil** di kode sumber mana pun. Tidak ada import/grep yang menggunakan variable ini. Ini berarti mereka adalah secret menganggur yang jika bocor memberi akses super admin ke Supabase project.
- **Bukti**: Grep `SUPABASE_SERVICE_ROLE|SUPABASE_SECRET|service_role` di seluruh folder `src/` — zero results.
- **Dampak bisnis**: Jika file .env bocor, service_role key memberi akses penuh ke database Supabase (bypass RLS).
- **Rekomendasi perbaikan**: Segera hapus kedua baris dari `.env` dan `.dev.vars`. Rotasi key di dashboard Supabase.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-003] Database URL mengandung password dalam plaintext
- **Severity**: Critical
- **Klasifikasi**: CWE-312 / OWASP A05:2021
- **Lokasi**: `.env` (baris 10), `.dev.vars` (baris 5)
- **Apa yang terjadi**: Koneksi PostgreSQL langsung menggunakan kredensial dalam bentuk `postgresql://postgres:[REDACTED]@db.vqpyxpdweditudfqajge.supabase.co:5432/postgres`. Password database (REDACTED_PASSWORD) terpapar dalam plaintext. Connection string ini memberikan akses penuh ke database — read/write semua tabel tanpa melewati RLS.
- **Bukti**:
  ```
  # Dari .env baris 10:
  DATABASE_URL=postgresql://postgres:[REDACTED]@db.vqpyxpdweditudfqajge.supabase.co:5432/postgres
  ```
- **Dampak bisnis**: Siapa pun yang mendapatkan file ini bisa terkoneksi langsung ke database PostgreSQL tanpa firewall atau autentikasi tambahan. Data mustahik, donatur, transaksi keuangan masjid bisa dicuri/dimodifikasi.
- **Rekomendasi perbaikan**:
  1. Gunakan connection pooler Supabase (port 6543) dengan PgBouncer.
  2. Restrict database access via IP firewall di Supabase dashboard.
  3. Buat dedicated database user dengan role terbatas untuk aplikasi.
  4. Rotasi password database.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

### [ID-004] Debug endpoint `/api/debug` tanpa autentikasi — ekspos data sensitif
- **Severity**: Critical
- **Klasifikasi**: CWE-200 / OWASP A01:2021 (Broken Access Control)
- **Lokasi**: `src/app/api/debug/route.ts` (baris 8-93)
- **Apa yang terjadi**: Endpoint `GET /api/debug` bisa diakses tanpa autentikasi. Ia mengekspos nama cookie, informasi auth user, nama masjid, total donasi, jumlah mustahik, total income/expense, jumlah profile, dan jumlah membership. Ini adalah "information disclosure" endpoint yang memberikan peta infrastruktur internal ke siapa pun.
- **Bukti** (`src/app/api/debug/route.ts:8-33`):
  ```typescript
  export async function GET(request: Request) {
    const result: Record<string, unknown> = { phase: "start" };
    // ...
    const { data: { user }, error } = await supabase.auth.getUser();
    result.authUser = user?.email ?? null;
    // ...
    const [mosque] = await db.select().from(mosques)...;
    result.mosque = mosque?.name ?? "NOT_FOUND";
  ```
  Endpoint ini tidak diproteksi oleh `requireAuth()` atau middleware — hanya ada di root GET tanpa pengecekan.
- **Dampak bisnis**: Attacker bisa mengintip status database, konfigurasi masjid, dan jumlah data tanpa login. Informasi ini membantu attacker merencanakan serangan lebih lanjut.
- **Rekomendasi perbaikan**: Tambahkan `requireAuth()` di awal handler, atau hapus endpoint ini di production.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

## 🟡 HIGH

### [ID-005] Tidak ada CSRF protection di server actions dan API routes
- **Severity**: High
- **Klasifikasi**: CWE-352 / OWASP A01:2021
- **Lokasi**: Semua file di `src/lib/actions/*.ts` (26 file), `src/app/api/*/route.ts`
- **Apa yang terjadi**: Semua server action (`"use server"`) dan API route tidak menerapkan CSRF token. Next.js Server Actions secara native tidak memiliki CSRF protection (beda dengan Route Handlers). Jika attacker bisa mengarahkan admin yang sudah login ke situs external, mereka bisa memicu server action yang mengubah data (create/update/delete donasi, mustahik, transaksi, dll). API routes (`/api/admin/overview`, `/api/midtrans/token`, `/api/midtrans/webhook`) juga tidak memiliki CSRF protection.
- **Bukti**: Grep `csrf|CSRF|XSRF|xsrf|csrf_token` di seluruh `src/` — zero results.
- **Dampak bisnis**: CSRF attack bisa menyebabkan perubahan data diam-diam: penghapusan mustahik, perubahan transaksi keuangan, atau pembuatan donasi palsu.
- **Rekomendasi perbaikan**:
  1. Untuk form di server actions: implementasikan CSRF token via Supabase Auth (yang sudah provide CSRF protection via `getCsrfToken()`).
  2. Untuk API routes: gunakan custom header (e.g., `X-CSRF-Token`) atau verifikasi Origin/Referer header.
  3. Pertimbangkan menggunakan `SameSite=Strict` (cek middleware cookie set).
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

### [ID-006] Tidak ada rate limiting — login brute force, API abuse
- **Severity**: High
- **Klasifikasi**: CWE-307 / OWASP A04:2021 (Insecure Design)
- **Lokasi**: `src/lib/actions/auth.ts` (login/signup), semua API routes
- **Apa yang terjadi**: Tidak ada rate limiting di endpoint login, signup, maupun API. Attacker bisa melakukan brute force password Supabase tanpa hambatan. Juga tidak ada rate limiting di endpoint Midtrans token generation maupun endpoint lain yang bisa dipanggil berulang.
- **Bukti**: Grep `rate.limit|rateLimit|throttle|bruteforce` di seluruh `src/` — zero results.
- **Dampak bisnis**: Akun admin bisa dibobol via brute force. Token Midtrans bisa digenerate berulang tanpa biaya (walau amount divalidasi). Endpoint publik bisa di-DDoS.
- **Rekomendasi perbaikan**:
  1. Implementasi rate limiting di middleware (Cloudflare Rate Limiting — gratis untuk prevent).
  2. Tambahkan exponential backoff di server action login.
  3. Batasi jumlah request per IP per menit di wrangler.jsonc atau Cloudflare WAF.
- **Effort estimate**: Kecil (via Cloudflare) / Sedang (custom implementasi)
- **Status**: Belum dikerjakan

### [ID-007] Server action `getAsnafById` dan `getTransaction` tanpa scope mosque_id — IDOR
- **Severity**: High
- **Klasifikasi**: CWE-639 / OWASP A01:2021 (Broken Access Control)
- **Lokasi**: 
  - `src/lib/actions/asnaf.ts` (baris 29-31)
  - `src/lib/actions/inventaris.ts` (baris 28-30)
  - `src/lib/actions/jadwal-imam.ts` (baris 29-31)
  - `src/lib/actions/jamaah.ts` (baris 28-30)
  - `src/lib/actions/mustahik.ts` (baris 34-36)
  - `src/lib/actions/transactions.ts` (baris 108-111)
  - `src/lib/actions/activity.ts` (tidak ada di getActivityFeed untuk single item)
- **Apa yang terjadi**: Fungsi `getAsnafById`, `getInventarisById`, `getJadwalById`, `getJamaahById`, `getMustahikById`, `getTransaction` hanya menggunakan `eq(table.id, id)` tanpa filter `mosque_id`. Ini berarti admin dari Masjid A bisa membaca data milik Masjid B jika mengetahui UUID. Walaupun `requireRole()` di fungsi update/delete sudah benar, fungsi read tidak memvalidasi bahwa data yang dibaca milik masjid yang sama.
- **Bukti** (`src/lib/actions/asnaf.ts:29-31`):
  ```typescript
  export async function getAsnafById(id: string) {
    const [row] = await db.select().from(asnaf).where(eq(asnaf.id, id)).limit(1);
    return row ?? null;
  }
  ```
  Bandingkan dengan `getMushafirById` (`src/lib/actions/mushafir.ts:34-37`) yang SUDAH benar dengan filter mosque_id:
  ```typescript
  const [row] = await db.select().from(mushafir_aid).where(and(eq(mushafir_aid.id, id), eq(mushafir_aid.mosque_id, mid))).limit(1);
  ```
- **Dampak bisnis**: Data sensitif masjid (mustahik, jamaah, transaksi keuangan) bisa diakses lintas tenant. Ini melanggar prinsip pemisahan data multi-tenant.
- **Rekomendasi perbaikan**: Tambahkan filter `and(eq(table.mosque_id, mid))` di semua fungsi `get*ById` yang masih kurang, seperti yang sudah dilakukan di `getMushafirById`, `getMuzzakiById`, dll.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-008] Turnstile token tidak mandatory di loan application — proteksi anti-spam bisa di-skip
- **Severity**: High
- **Klasifikasi**: CWE-807 / OWASP A04:2021
- **Lokasi**: `src/lib/actions/loan-applications.ts` (baris 42-45)
- **Apa yang terjadi**: Turnstile token hanya diverifikasi jika ada di request (`if (data.turnstileToken)`). Kalau attacker menghapus field `turnstileToken` dari request, verifikasi di-skip. Ini membuat endpoint pengajuan pinjaman rawan spam dan abuse.
- **Bukti** (`src/lib/actions/loan-applications.ts:42-45`):
  ```typescript
  if (data.turnstileToken) {
    const valid = await verifyTurnstile(data.turnstileToken);
    if (!valid) throw new Error("Verifikasi keamanan gagal...");
  }
  ```
- **Dampak bisnis**: Attacker bisa mengirim ribuan pengajuan pinjaman palsu tanpa captcha, membanjiri sistem.
- **Rekomendasi perbaikan**: Jadikan Turnstile token WAJIB untuk akses publik. Hapus conditional `if (data.turnstileToken)` — selalu verifikasi.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-009] Webhook Midtrans dieksekusi secara async — race condition dan missing error handling
- **Severity**: High
- **Klasifikasi**: CWE-754 / OWASP A09:2021
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts` (baris 152-154)
- **Apa yang terjadi**: `handlePaymentNotification()` dipanggil dengan `.catch()` tanpa `await`. Kode response `{ status: "ok" }` dikirim ke Midtrans SEBELUM notifikasi selesai diproses. Jika terjadi error di tengah proses (misal koneksi DB putus), Midtrans sudah mendapat 200 OK dan tidak akan mengirim ulang notifikasi. Donasi yang seharusnya tercatat sebagai "paid" bisa hilang.
- **Bukti** (`src/app/api/midtrans/webhook/route.ts:152-154`):
  ```typescript
  handlePaymentNotification(body).catch((err) => {
    log.error("Webhook handler error", { error: String(err) });
  });
  return NextResponse.json({ status: "ok" });
  ```
- **Dampak bisnis**: Kehilangan data pembayaran. Donatur sudah membayar tapi sistem tidak mencatat. Reputasi masjid tercederai.
- **Rekomendasi perbaikan**: Gunakan `await handlePaymentNotification(body)` atau queue. Pastikan response 200 hanya dikirim setelah proses selesai. Atau gunakan message queue (Queues Cloudflare) untuk reliabilitas.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-010] Webhook Midtrans tanpa verifikasi IP asal
- **Severity**: High
- **Klasifikasi**: CWE-345 / OWASP A01:2021
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts` (baris 130-157)
- **Apa yang terjadi**: Endpoint webhook hanya memverifikasi signature HMAC tapi TIDAK memverifikasi bahwa request berasal dari IP Midtrans. Siapa pun bisa mengirim request ke endpoint ini. Signature HMAC memang mempersulit spoofing, tapi tanpa IP filtering, attacker tetap bisa melakukan replay attack atau timing attack.
- **Bukti**: Tidak ada pengecekan IP atau whitelist di `webhook/route.ts`.
  ```
  IP Midtrans production (menurut docs): 103.10.63.0/24, 103.28.18.0/24
  ```
- **Dampak bisnis**: Walaupun signature sudah diverifikasi, best practice untuk payment gateway adalah verifikasi IP origin sebagai defense-in-depth.
- **Rekomendasi perbaikan**: Tambahkan verifikasi bahwa request berasal dari IP range Midtrans. Untuk Cloudflare Workers, gunakan `request.headers.get("CF-Connecting-IP")`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-011] Turnstile secret key menggunakan test key di production
- **Severity**: High
- **Klasifikasi**: CWE-477 / OWASP A05:2021
- **Lokasi**: `.env` (baris 13-14), `.dev.vars` (baris 6-7)
- **Apa yang terjadi**: Turnstile keys masih menggunakan test keys (`1x00000000000000000000AA`). Test keys ini selalu melewati verifikasi (selalu return success), jadi tidak ada proteksi captcha yang sesungguhnya.
- **Bukti**:
  ```
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
  TURNSTILE_SECRET_KEY=1x00000000000000000000000000000000AA
  ```
  Ini adalah test keys Cloudflare Turnstile — "always passes" keys.
- **Dampak bisnis**: Form publik (loan applications) tidak punya proteksi bot yang sesungguhnya. Robot bisa submit form kapan saja.
- **Rekomendasi perbaikan**: Ganti dengan real keys dari Cloudflare Dashboard → Turnstile.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

## 🟠 MEDIUM

### [ID-012] Input validation tidak konsisten — FormData tanpa Zod di beberapa action
- **Severity**: Medium
- **Klasifikasi**: CWE-20 / OWASP A03:2021 (Injection)
- **Lokasi**: 
  - `src/lib/actions/mustahik.ts` (baris 39-93, 96-152) — createMustahik, updateMustahik
  - `src/lib/actions/settings.ts` (baris 46-89) — updateMosqueSettings
  - `src/lib/actions/auth.ts` (baris 7-49) — login, signup
- **Apa yang terjadi**: Beberapa server action menggunakan `FormData` langsung tanpa validasi Zod. Data di-cast paksa (`as string`) tanpa sanitasi. Validasi hanya minimal (`if (!name || !address)`). Tidak ada validasi tipe data numerik (parseInt/parseFloat tanpa NaN check), email, atau panjang karakter.
- **Bukti** (`src/lib/actions/mustahik.ts:44-55`):
  ```typescript
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const monthly_income = formData.get("monthly_income") as string;
  // ...
  monthly_income: monthly_income ? parseInt(monthly_income) : null,
  // ...
  if (!name || !address) return { error: "Nama dan alamat wajib diisi." };
  ```
  Tidak ada validasi: format phone, range angka, panjang string, XSS payload di name/address.
- **Dampak bisnis**: Penyisipan karakter khusus di kolom nama/alamat yang dirender di halaman admin bisa menyebabkan XSS. Data tidak standar menyulitkan pelaporan. NIK palsu/ganda tidak terdeteksi.
- **Rekomendasi perbaikaan**: Gunakan Zod schema untuk semua server action yang menerima FormData. Contoh sudah ada di `createDonationSchema` untuk donations dan `createLoanApplicationSchema` untuk loan applications.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

### [ID-013] CSP menggunakan `'unsafe-inline'` dan `'unsafe-eval'` — memungkinkan XSS
- **Severity**: Medium
- **Klasifikasi**: CWE-79 / OWASP A03:2021
- **Lokasi**: `next.config.ts` (baris 8)
- **Apa yang terjadi**: Content-Security-Policy menetapkan `'unsafe-inline'` dan `'unsafe-eval'` untuk script-src. Ini melemahkan proteksi XSS karena memungkinkan eksekusi script inline dan eval(). Walaupun ada alasan teknis (Next.js butuh inline script untuk hydration dan dev), di production seharusnya bisa diatur lebih ketat dengan nonce atau hash.
- **Bukti** (`next.config.ts:8`):
  ```typescript
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
  ```
- **Dampak bisnis**: Jika ada reflected XSS di aplikasi, attacker bisa mengeksekusi JavaScript tanpa dicegah CSP.
- **Rekomendasi perbaikan**: 
  1. Pisahkan CSP untuk development vs production.
  2. Di production, gunakan strict CSP dengan nonce (`'strict-dynamic'`).
  3. Hapus `'unsafe-eval'` jika tidak benar-benar diperlukan.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

### [ID-014] XSS potensial via image_url dan photo_ktp_url tanpa validasi URL
- **Severity**: Medium
- **Klasifikasi**: CWE-79 / OWASP A03:2021
- **Lokasi**: 
  - `src/lib/actions/testimonials.ts` (baris 55) — `image_url`
  - `src/lib/actions/bumm.ts` (baris 46) — `image_url`
  - `src/lib/actions/mushafir.ts` (baris 69) — `photo_ktp_url`
- **Apa yang terjadi**: URL gambar (image_url, photo_ktp_url) diterima langsung dari user/admin tanpa validasi format URL, protokol, atau domain. Walaupun disimpan di database, ketika URL ini dirender di tag `<img>` atau sebagai background-image, tidak ada jaminan URL tersebut aman. Bisa `javascript:` URL atau URL yang mengarah ke phishing site.
- **Bukti** (`src/lib/actions/testimonials.ts:55`):
  ```typescript
  image_url: data.image_url ?? null,
  ```
  Tidak ada validasi format URL, tidak ada sanitasi.
- **Dampak bisnis**: Jika image_url dengan `javascript:` protocol dirender tanpa sanitasi, bisa terjadi XSS. URL phishing merusak reputasi masjid.
- **Rekomendasi perbaikan**: Validasi URL dengan Zod `z.string().url()` dan pastikan hanya protokol HTTPS. Pertimbangkan upload gambar via Supabase Storage (dengan policy) daripada menyimpan URL external.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-015] Logging sensitive data berpotensi bocor via log aggregation
- **Severity**: Medium
- **Klasifikasi**: CWE-532 / OWASP A09:2021
- **Lokasi**: Berbagai file — `src/lib/logger.ts`, `src/app/api/midtrans/token/route.ts` (baris 79), `src/app/api/midtrans/webhook/route.ts` (baris 153)
- **Apa yang terjadi**: Beberapa lokasi log memasukkan data sensitif atau seluruh objek request ke log. Meskipun `logger.ts` sudah punya redact function untuk key tertentu, objek `changes` di audit_logs dan `data` di beberapa log mengandung data yang bisa saja berisi informasi sensitif. Midtrans token route mengirim objek response tanpa redaksi di log error.
- **Bukti** (`src/lib/logger.ts:4-6`):
  ```typescript
  const SENSITIVE_KEYS = new Set([
    "token", "password", "secret", "key", "authorization",
    "card_number", "cvv", "card_expire", "bank",
  ]);
  ```
  Redaksi didasarkan pada key name, bukan konteks. Key yang tidak masuk daftar tidak akan ter-redact.
- **Dampak bisnis**: Log error yang mengandung NIK (walau encrypted), nomor telepon, alamat bisa bocor ke logging service (Cloudflare Observability, etc).
- **Rekomendasi perbaikan**: Audit semua logging call dan pastikan PII tidak dikirim ke log. Tambahkan key `nik`, `phone`, `address`, `email` ke sensitive keys.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [ID-016] User enumeration via login error message — Supabase default
- **Severity**: Medium
- **Klasifikasi**: CWE-209 / OWASP A01:2021
- **Lokasi**: `src/lib/actions/auth.ts` (baris 19-20)
- **Apa yang terjadi**: Login error message digeneralisasi menjadi "Email atau password salah." — ini sudah baik. Namun Supabase auth API sendiri secara default bisa membedakan "user not found" vs "wrong password" via response time. Perlu dicek apakah Supabase project sudah disable user enumeration.
- **Bukti** (`src/lib/actions/auth.ts:19-20`):
  ```typescript
  if (error) {
    return { error: "Email atau password salah." };
  }
  ```
  Message sudah digeneralisasi (baik). Tapi Supabase default setting mungkin masih membocorkan user existence via timing.
- **Dampak bisnis**: Attacker bisa memverifikasi email mana yang terdaftar, mempermudah social engineering.
- **Rekomendasi perbaikan**: Di Supabase dashboard → Authentication → Settings → disable "Isolate user by email" dan set "Rate limit" untuk email verification. Atau aktifkan CAPTCHA di halaman login.
- **Effort estimate**: Kecil
- **Status**: Perlu verifikasi manual

### [ID-017] Webhook Midtrans verifikasi signature tidak mencakup seluruh field penting
- **Severity**: Medium
- **Klasifikasi**: CWE-347 / OWASP A01:2021
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts` (baris 12-31)
- **Apa yang terjadi**: Fungsi `verifySignature` menggunakan formula `orderId + statusCode + grossAmount + serverKey`. Ini adalah formula yang benar untuk Midtrans webhook. Namun Midtrans documentation menyebutkan bahwa signature bisa mencakup field tambahan tergantung versi API. Perlu dipastikan bahwa implementasi cocok dengan versi Midtrans Snap yang digunakan.
- **Bukti** (`src/app/api/midtrans/webhook/route.ts:21-24`):
  ```typescript
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  ```
  Implementasi sudah benar (timingSafeEqual juga sudah dipakai).
- **Dampak bisnis**: Jika Midtrans mengupdate API signature formula, webhook bisa gagal verifikasi dan donasi tidak tercatat.
- **Rekomendasi perbaikan**: Tambahkan test untuk memverifikasi signature terhadap sample payload Midtrans. Cek versi Snap API yang digunakan dan dokumentasi signature terkini.
- **Effort estimate**: Kecil
- **Status**: Perlu verifikasi manual

---

## 🟢 INFO

### [ID-018] Middleware hanya proteksi /admin dan /api/admin — /api/midtrans tidak terproteksi
- **Severity**: Info
- **Klasifikasi**: OWASP A01:2021
- **Lokasi**: `src/middleware.ts` (baris 15-19)
- **Apa yang terjadi**: Middleware `updateSession` hanya aktif untuk path `/admin/:path*` dan `/api/admin/:path*`. Endpoint `/api/midtrans/*` dan `/api/debug/*` dan `/api/public/*` tidak di-proxy oleh middleware, sehingga tidak ada session refresh untuk endpoint ini.
- **Bukti** (`src/middleware.ts:15-19`):
  ```typescript
  export const config = {
    matcher: [
      "/admin/:path*",
      "/api/admin/:path*",
    ],
  };
  ```
- **Dampak bisnis**: Endpoint yang tidak kena middleware tidak akan mendapat session cookie refresh. Ini sudah sesuai design — midtrans dan public endpoint seharusnya tidak require auth.
- **Rekomendasi perbaikan**: (Tidak perlu perubahan — informasional)
- **Effort estimate**: -
- **Status**: Informasi

### [ID-019] `resolveMosqueId()` fallback ke masjid pertama — bisa ambigu di multi-tenant
- **Severity**: Info
- **Klasifikasi**: OWASP A01:2021
- **Lokasi**: `src/lib/actions/_helpers.ts` (baris 6-15)
- **Apa yang terjadi**: `resolveMosqueId()` mengambil masjid aktif pertama jika `mosqueId` tidak diberikan. Di konteks multi-masjid, ini bisa menyebabkan data dari masjid yang salah diakses jika parameter mosque_id tidak dikirim dengan benar.
- **Bukti** (`src/lib/actions/_helpers.ts:7-14`):
  ```typescript
  export async function resolveMosqueId(mosqueId?: string | null): Promise<string> {
    if (mosqueId) return mosqueId;
    const [row] = await db
      .select({ id: mosques.id })
      .from(mosques)
      .where(and(eq(mosques.is_active, true), isNull(mosques.deleted_at)))
      .limit(1);
    if (!row) throw new Error("Tidak ada masjid aktif. Hubungi admin.");
    return row.id;
  }
  ```
- **Dampak bisnis**: Saat fitur multi-masjid aktif, fungsi ini perlu di-replace dengan logic yang mengambil mosque_id dari session/user membership.
- **Rekomendasi perbaikan**: Sudah diberi parameter opsional `mosqueId?`. OK untuk Fase 1 (1 masjid). Catat untuk Fase 2 multi-masjid.
- **Effort estimate**: -
- **Status**: Informasi — perlu dimonitor saat multi-tenant aktif

---

## 📊 RINGKASAN EKSEKUTIF

| Kategori | Jumlah | ID |
|----------|--------|----|
| 🔴 Critical | 4 | ID-001, ID-002, ID-003, ID-004 |
| 🟡 High | 7 | ID-005, ID-006, ID-007, ID-008, ID-009, ID-010, ID-011 |
| 🟠 Medium | 5 | ID-012, ID-013, ID-014, ID-015, ID-016, ID-017 |
| 🟢 Info | 2 | ID-018, ID-019 |

**3 prioritas utama yang harus segera dikerjakan:**
1. **ID-001, ID-002, ID-003** — Rotasi dan amankan secret (Critical — data breach risk)
2. **ID-004** — Proteksi atau hapus debug endpoint (Critical — information disclosure)
3. **ID-009** — Fix webhook handler dengan await (High — payment data loss risk)

### Yang sudah baik:
- ✅ Penggunaan Drizzle ORM dengan parameterized queries (SQL injection minimal)
- ✅ Tidak ada `dangerouslySetInnerHTML` atau `innerHTML` langsung
- ✅ Enkripsi NIK dengan AES-256-GCM (walau key ada di env file)
- ✅ Audit logging di setiap operasi CRUD
- ✅ Role-based access control (`requireRole`)
- ✅ Webhook signature verification dengan timing-safe compare
- ✅ Security headers sudah baik (HSTS, XFO, XCTO, CSP, RP, PP)
- ✅ Password hashing via Supabase Auth (bukan custom)
- ✅ Generalisasi error message login
- ✅ Redacted logging untuk key sensitif
