import { db } from "@/db/client";
import { transactions, mustahiks, donatur_tetap, activity_feed } from "@/db/schema";
import { eq, and, isNull, sql, desc, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mosqueId = searchParams.get("mosqueId");
  const type = searchParams.get("type");

  if (!mosqueId) return NextResponse.json({ error: "mosqueId required" }, { status: 400 });
  if (!type || !["summary", "trend30d", "ziswaf", "activity"].includes(type)) {
    return NextResponse.json({ error: "type required: summary|trend30d|ziswaf|activity" }, { status: 400 });
  }

  try {
    await requireRole(mosqueId, "superadmin", "admin_dkm");

    if (type === "summary") {
      const [txAgg, donaturCount, mustahikCount] = await Promise.all([
        db.execute(sql`
          SELECT
            COALESCE(SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END), 0)::bigint AS total_masuk,
            COALESCE(SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END), 0)::bigint AS total_keluar
          FROM transactions
          WHERE mosque_id = ${mosqueId} AND deleted_at IS NULL
        `),
        db.execute(sql`
          SELECT COUNT(*)::int AS count FROM donatur_tetap
          WHERE mosque_id = ${mosqueId} AND status = 'Aktif' AND deleted_at IS NULL
        `),
        db.execute(sql`
          SELECT COUNT(*)::int AS count FROM mustahiks
          WHERE mosque_id = ${mosqueId} AND is_active = true AND deleted_at IS NULL
        `),
      ]);

      const row = (txAgg as unknown as Array<Record<string, unknown>>)[0] ?? {};
      const totalMasuk = Number(row.total_masuk ?? 0);
      const totalKeluar = Number(row.total_keluar ?? 0);

      return NextResponse.json({
        saldo_kas: totalMasuk - totalKeluar,
        total_masuk: totalMasuk,
        total_keluar: totalKeluar,
        donatur_aktif: Number((donaturCount as unknown as Array<Record<string, unknown>>)[0]?.count ?? 0),
        mustahik_aktif: Number((mustahikCount as unknown as Array<Record<string, unknown>>)[0]?.count ?? 0),
      });
    }

    if (type === "trend30d") {
      const rows = await db.execute(sql`
        SELECT
          TO_CHAR(transaction_date, 'YYYY-MM-DD') AS tanggal,
          COALESCE(SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END), 0)::bigint AS pemasukan,
          COALESCE(SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END), 0)::bigint AS pengeluaran
        FROM transactions
        WHERE mosque_id = ${mosqueId}
          AND deleted_at IS NULL
          AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY TO_CHAR(transaction_date, 'YYYY-MM-DD')
        ORDER BY tanggal ASC
      `);
      return NextResponse.json(rows);
    }

    if (type === "ziswaf") {
      const rows = await db.execute(sql`
        SELECT fund_type, COALESCE(SUM(amount), 0)::bigint AS total
        FROM transactions
        WHERE mosque_id = ${mosqueId}
          AND deleted_at IS NULL
          AND type = 'Pemasukan'
          AND fund_type IN (
            'zakat_fitrah', 'zakat_maal',
            'infaq_terikat', 'infaq_tidak_terikat',
            'wakaf_pokok', 'wakaf_hasil',
            'qardhul_hasan'
          )
        GROUP BY fund_type
        ORDER BY total DESC
      `);
      return NextResponse.json(rows);
    }

    if (type === "activity") {
      const rows = await db.execute(sql`
        SELECT type, nama, alamat, detail, jumlah, created_at
        FROM activity_feed
        WHERE mosque_id = ${mosqueId}
        ORDER BY created_at DESC
        LIMIT 20
      `);
      return NextResponse.json(rows);
    }

    return NextResponse.json({ error: "unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
