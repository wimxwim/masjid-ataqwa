# Membership Role Enum Fix

> Ditemukan saat development (Juni 2026). Catatan sebelum push/deploy.

## Masalah

Halaman admin muncul "Gagal memuat data" karena server action `requireRole()` ngecek role string yang gak cocok dengan database enum.

## Akar Masalah

**Database enum `role` berisi** (dari `schema.ts`):
`superadmin`, `admin_dkm`, `finance_director`, `dakwah_lead`, `social_lead`, `people_culture`, `media_pub`, `business_lead`, `affiliate_youth`, `mustahik`

**Tapi server action tadinya ngecek:**
- `"admin"` → gak ada (harusnya `"superadmin"`, `"admin_dkm"`)
- `"bendahara"` → gak ada (harusnya `"finance_director"`)
- `"takmir"` → gak ada (harusnya `"admin_dkm"`)

## Fix

### 1. Database — Insert memberships

```sql
INSERT INTO memberships (profile_id, mosque_id, role, is_active)
SELECT p.id, m.id, 'superadmin', true
FROM profiles p, mosques m
WHERE p.email IN ('admin@ataqwa.or.id', 'wafi@gmail.com')
  AND m.slug = 'ataqwa-ulujami';
```

### 2. Code — Role string fix (10 files)

| File | Old | New |
|------|-----|-----|
| donatur-tetap.ts | `"admin", "bendahara"` | `"superadmin", "admin_dkm", "finance_director"` |
| testimonials.ts | `"admin", "bendahara"` | `"superadmin", "admin_dkm", "finance_director"` |
| transactions.ts | `"admin", "bendahara"` | `"superadmin", "admin_dkm", "finance_director"` |
| inventaris.ts | `"admin", "takmir"` | `"superadmin", "admin_dkm"` |
| jadwal-imam.ts | `"admin", "takmir"` | `"superadmin", "admin_dkm"` |
| jamaah.ts | `"admin", "takmir"` | `"superadmin", "admin_dkm"` |
| programs.ts | `"admin", "dakwah_lead"` | `"superadmin", "admin_dkm", "dakwah_lead"` |
| santri.ts | `"admin", "dakwah_lead"` | `"superadmin", "admin_dkm", "dakwah_lead"` |
| mushafir.ts | `"admin", "social_lead"` | `"superadmin", "admin_dkm", "social_lead"` |
| activity.ts | `"admin", "media_pub"` | `"superadmin", "admin_dkm", "media_pub"` |
| employees.ts | `"admin", "people_culture"` | `"superadmin", "admin_dkm", "people_culture"` |

## Ke Depan

Kalau mau bikin user baru dari halaman signup, pastikan:
1. Profile entry dibuat di tabel `profiles` (saat ini gak otomatis — perlu trigger/hook)
2. Membership diassign dengan role yang sesuai
