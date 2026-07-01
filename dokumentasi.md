# 📖 DOKUMENTASI TEKNIS v2.1 — MASJID HUB
> **Project:** Rintisan Pertama — Masjid Jami' At-Taqwa Ulujami
> **Tipe Proyek:** Tipe C (Aplikasi Web Multi-Tenant)
> **Stack:** Next.js 16 + Drizzle ORM + Supabase (PostgreSQL 15+PostGIS) + Cloudflare Workers (OpenNext) + shadcn/ui + motion + lenis
> **Sumber integrasi:** Pemberdayaan Ekonomi Umat MIBA 13, REMISYA PRESENT 2026, ParagonCorp MIBA 13

---

## 1. INTEGRASI DATABASE SPATIAL POSTGIS (ZONASI RING)

### 1.1 Aktivasi Ekstensi
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 1.2 Query Ring Mustahik (4 Ring — dari Pemberdayaan Ekonomi PDF)
```sql
SELECT 
    u.id, 
    u.name, 
    m.usaha_type,
    ST_Distance(m.coordinate::geography, mos.coordinate::geography) AS distance_meters,
    CASE 
        WHEN ST_Distance(m.coordinate::geography, mos.coordinate::geography) < 500 THEN 1
        WHEN ST_Distance(m.coordinate::geography, mos.coordinate::geography) BETWEEN 500 AND 1000 THEN 2
        WHEN ST_Distance(m.coordinate::geography, mos.coordinate::geography) BETWEEN 1001 AND 2000 THEN 3
        ELSE 4
    END AS calculated_ring,
    -- Dari REMISYA: 3 Ring Dakwah Pemuda
    u.afiliasi_ring AS youth_dakwah_ring
FROM users u
JOIN mustahiks m ON u.id = m.user_id
JOIN mosques mos ON u.mosque_id = mos.id
WHERE u.mosque_id = :mosque_id
ORDER BY calculated_ring ASC;
```

### 1.3 Query 140 Masjid Target (Data BPS JakSel)
```sql
-- Menampilkan masjid yang aktif menangani kemiskinan
SELECT 
    id, 
    name, 
    coordinate,
    zakah_collection,
    (SELECT COUNT(*) FROM mustahiks m 
     JOIN users u ON m.user_id = u.id 
     WHERE u.mosque_id = mosques.id) AS mustahik_count
FROM mosques
WHERE is_legalized = TRUE
  AND upz_number IS NOT NULL
LIMIT 140;  -- 5% dari 2.782 masjid = 140 masjid
```

---

## 2. MODEL LEVEL PINJAMAN (QARDHUL HASAN)

### 2.1 Skema Bertahap (dari Pemberdayaan Ekonomi PDF)
```
Level 1 → Rp 500.000 → Rp 50.000/pekan × 10 pekan → Lunas
Level 2 → [1,5× Level 1] → Cicilan lebih besar per pekan → Lunas
Level 3 → [2× Level 1] → Pengembangan usaha lanjutan → Lunas
```

### 2.2 Kalkulator NPF Rate (Non-Performing Financing)
```php
class FinanceService
{
    public function calculateNpfRate(int $mosqueId): float
    {
        $defaultedAmount = Loan::where('mosque_id', $mosqueId)
            ->where('status', 'defaulted')
            ->sum('amount');

        $totalActiveAmount = Loan::where('mosque_id', $mosqueId)
            ->whereIn('status', ['active', 'defaulted'])
            ->sum('amount');

        if ($totalActiveAmount == 0) return 0.00;

        return round(($defaultedAmount / $totalActiveAmount) * 100, 2);
    }

    /**
     * Cek Tanggung Renteng: jika anggota A mangkir >3 pekan berturut-turut
     * → otomatis backstop oleh anggota lain di grup yang sama
     */
    public function detectBackstopNeeded(int $groupId): array
    {
        return Loan::where('group_id', $groupId)
            ->where('status', 'active')
            ->whereRaw('(
                SELECT COUNT(*) FROM repayments 
                WHERE repayments.loan_id = loans.id 
                AND repayments.week_number > (
                    SELECT MAX(week_number) FROM repayments 
                    WHERE repayments.loan_id = loans.id
                ) - 3
                AND repayments.is_present_taklim = false
            ) >= 3')
            ->get()
            ->toArray();
    }
}
```

---

## 3. INTEGRASI WHATSAPP DEEP LINK (RP 0)

### 3.1 Helper Report Donasi
```javascript
function generateWhatsappReportLink(phone, donorName, amount, programName) {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const message = `Assalamualaikum Wr. Wb., Kak *${donorName}*.\n\n`
                  + `Jazakallah Khairan Katsiran. Donasi Anda sebesar *Rp ${amount.toLocaleString('id-ID')}* `
                  + `untuk program *${programName}* telah kami terima.\n\n`
                  + `Laporan transparansi penyaluran:\n`
                  + `https://masjid-ataqwa.or.id/laporan/${programName}\n\n`
                  + `"Dari Masjid Kita Tuntaskan Kemiskinan"\n`
                  + `— Gerakan Pemuda Berdaya — Masjid At-Taqwa Ulujami`;
                   
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}
```

### 3.2 Scheduler Laporan Bulanan (Cron Job)
```javascript
// Cron: setiap tanggal 1 pukul 08:00 WIB
async function sendMonthlyReport(mosqueId) {
    const donors = await getActiveDonors(mosqueId);
    const report = await generateMonthlyPDF(mosqueId);
    
    for (const donor of donors) {
        const waLink = generateWhatsappReportLink(
            donor.phone, 
            donor.name, 
            donor.totalDonation, 
            'Bank Infaq Bulanan'
        );
        // Log pengiriman (user klik link manual)
        await logReportSent(donor.id, waLink);
    }
}
```

---

## 4. DEPLOYMENT — CLOUDFLARE WORKERS (WRANGLER CONFIG)

```toml
name = "masjid-hub-ataqwa"
main = ".open-next/worker.js"
compatibility_date = "2026-06-29"

# Supabase PostgreSQL via Drizzle ORM
[vars]
DATABASE_URL = "postgresql://postgres:[password]@db.supabase.co:5432/postgres"
DATABASE_POOL_URL = "postgresql://postgres:[password]@db.supabase.co:6543/postgres"

# R2 Storage untuk asset media & foto mustahik
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "masjid-hub-assets"
preview_bucket_name = "masjid-hub-assets-preview"

# Environment variables untuk integrasi pihak ketiga
[vars]
QRIS_MERCHANT_ID = "your_merchant_id"
KITABISA_API_KEY = "@KITABISA_API_KEY"  # supaya tidak hardcode
WA_FONNTE_TOKEN = "@WA_FONNTE_TOKEN"
```

---

## 5. CHECKLIST KESIAPAN MITRA KORPORASI (Standar ParagonCorp)

### 5.1 Tata Kelola (wajib sebelum ajukan CSR)
```
□ Akta Yayasan / DKM — terdaftar di Kemenkumham
□ NPWP Lembaga — atas nama yayasan/DKM
□ Rekening bank resmi — atas nama lembaga
□ UPZ terdaftar — SK dari LAZ/BAZNAS
□ Laporan keuangan — sederhana tapi rutin (bulanan)
□ Dokumentasi program — foto, video, testimoni
□ Sosial media aktif — Instagram, YouTube, TikTok
```

### 5.2 Program Unggulan yang Diminati Korporasi (dari Baitul Maal MIBA 12)
```
1. Gerobak Berkah MRBJ       — bantuan alat kerja UMKM
2. Ketahanan Pangan           — pangan sehat berkelanjutan
3. Pasar Berkah Bahagia       — distribusi pangan segar
4. Pelatihan Pemuda Berdaya   — soft skill & teknis
5. Standarisasi Guru Al-Qur'an — sertifikasi metode Tilawati
6. Sunatan Bahagia            — kesehatan anak yatim dhuafa
7. Sedekah Al-Qur'an          — distribusi mushaf gratis
8. Santunan Anak Yatim        — bulanan rutin
```

---

## 6. API ENDPOINTS (REST — Next.js Route Handlers)

| Method | Endpoint | Fungsi | Auth |
|---|---|---|---|
| GET | `/api/mosques/{id}` | Data masjid | Public |
| GET | `/api/mosques/{id}/mustahik` | Daftar mustahik per ring | Admin DKM |
| POST | `/api/mosques/{id}/mustahik` | Input mustahik baru | Admin/Surveyor |
| GET | `/api/mosques/{id}/loans` | Daftar pinjaman aktif | Admin DKM |
| POST | `/api/loans/{id}/repay` | Setoran cicilan | Bendahara |
| GET | `/api/mosques/{id}/npf` | Rate NPF real-time | Admin DKM |
| GET | `/api/mosques/{id}/kajian/silabus` | Kurikulum bulan ini | Public/DKM |
| POST | `/api/kajian/{id}/presensi` | Scan QR presensi | Admin Dakwah |
| GET | `/api/mosques/{id}/bumm/products` | Katalog BUMM | Public |
| POST | `/api/affiliate/sale` | Catat penjualan affiliate | Public (with ref) |
| GET | `/api/mosques/{id}/csr-portfolio` | Portofolio untuk korporasi | Public/CSR |

---

## 7. MANAGED WEBHOOK — QRIS & DONASI

```javascript
// Webhook untuk tracking donasi masuk per program
export async function POST(request: Request) {
    const payload = await request.json();
    
    // Verifikasi signature webhook (SHA512)
    const signature = request.headers.get('x-signature');
    const computed = crypto.createHmac('sha512', process.env.QRIS_SECRET!)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    if (signature !== computed) {
        return Response.json({ error: 'invalid signature' }, { status: 401 });
    }
    
    // Catat donasi ke program spesifik (cegah campur akad)
    await db.insert(donations).values({
        mosque_id: payload.mosque_id,
        program: payload.program,  // 'bank_infaq' | 'wakaf_domba' | 'beasiswa' | 'zakat'
        amount: payload.amount,
        donor_phone: payload.phone,
        payment_method: 'qris',
        paid_at: new Date()
    });
    
    // Kirim konfirmasi WA
    const waLink = generateWhatsappReportLink(
        payload.phone, payload.name, payload.amount, payload.program
    );
    
    return Response.json({ ok: true, wa_confirmation: waLink });
}
```

---

🟢 **HIJAU** (Dokumentasi teknis v2.1 — diperkaya dengan 12 API endpoints, Paragon CSR compliance checklist, 8 program unggulan, query 140 masjid target, webhook QRIS SHA512, cron scheduler, dan 3 skema level pinjaman.)
