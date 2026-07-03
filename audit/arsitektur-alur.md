# ARSITEKTUR & ALUR DATA — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub — Ekosistem Digital Masjid
> **Tanggal:** 3 Juli 2026

---

## Peta Alur Data

```mermaid
flowchart TD
    A[User Action (UI)] --> B[API Route / Server Action]
    B --> C[Business Logic]
    C --> D[Drizzle ORM / Query]
    D --> E[Supabase (PostgreSQL)]
    E --> D
    D --> C
    C --> B
    B --> A
```

---

## Daftar Temuan & Penilaian

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

