/**
 * Backfill NIK plaintext → encrypted untuk data loan_applications existing
 * sebelum migrasi 0013 (yang tidak punya nik_encrypted).
 *
 * Jalankan SEBELUM migrasi 0015_drop_nik_plaintext:
 *   npx tsx scripts/backfill-nik.ts
 *
 * Atau langsung via drizzle-kit:
 *   1. Jalankan script ini
 *   2. npx drizzle-kit migrate
 */
import { db } from "../src/db/client";
import { loan_applications } from "../src/db/schema";
import { encryptNik, hashNikServer } from "../src/lib/nik-crypto";
import { eq, isNull } from "drizzle-orm";

async function main() {
  const rows = await db
    .select({ id: loan_applications.id, nik: loan_applications.nik })
    .from(loan_applications)
    .where(isNull(loan_applications.nik_encrypted));

  console.log(`Found ${rows.length} rows with missing nik_encrypted`);

  for (const row of rows) {
    if (!row.nik) continue;
    await db
      .update(loan_applications)
      .set({
        nik_encrypted: encryptNik(row.nik),
        nik_hash: hashNikServer(row.nik),
      })
      .where(eq(loan_applications.id, row.id));
    console.log(`  Encrypted NIK for ${row.id}`);
  }

  console.log("Done. Now run: npx drizzle-kit migrate");
}

main().catch(console.error);
