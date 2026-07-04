import { db } from "@/db/client";
import { transactions, mustahiks, jamaah, inventaris, donations, programs } from "@/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mosqueId = searchParams.get("mosqueId");
  if (!mosqueId) return NextResponse.json({ error: "mosqueId required" }, { status: 400 });

  try {
    await requireRole(mosqueId, "superadmin", "admin_dkm");
    const [txRows, mustahikRows, jamaahRows, invRows, donationRows] = await Promise.all([
      db
        .select()
        .from(transactions)
        .where(and(eq(transactions.mosque_id, mosqueId), isNull(transactions.deleted_at)))
        .orderBy(desc(transactions.transaction_date))
        .limit(100),
      db
        .select()
        .from(mustahiks)
        .where(and(eq(mustahiks.mosque_id, mosqueId), isNull(mustahiks.deleted_at)))
        .orderBy(mustahiks.name)
        .limit(200),
      db
        .select()
        .from(jamaah)
        .where(eq(jamaah.mosque_id, mosqueId))
        .limit(200),
      db
        .select()
        .from(inventaris)
        .where(and(eq(inventaris.mosque_id, mosqueId), isNull(inventaris.deleted_at)))
        .limit(100),
      db
        .select()
        .from(donations)
        .where(eq(donations.mosque_id, mosqueId))
        .orderBy(desc(donations.created_at))
        .limit(100),
    ]);

    return NextResponse.json({
      transactions: txRows,
      mustahik: mustahikRows,
      jamaah: jamaahRows,
      inventaris: invRows,
      donations: donationRows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
