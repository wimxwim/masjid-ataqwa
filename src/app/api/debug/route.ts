import { db } from "@/db/client";
import { mosques, donations, transactions, mustahiks, programs, activity_feed } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, unknown> = { phase: "start" };
  const errs: string[] = [];

  try {
    const [mosque] = await db
      .select()
      .from(mosques)
      .where(and(eq(mosques.is_active, true), isNull(mosques.deleted_at)))
      .limit(1);
    result.mosque = mosque?.name ?? "NOT_FOUND";
    if (!mosque) { result.errors = ["No mosque"]; return NextResponse.json(result); }

    try {
      const [dStats] = await db
        .select({ total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`, count: sql<number>`COUNT(*)` })
        .from(donations)
        .where(and(eq(donations.mosque_id, mosque.id), eq(donations.payment_status, "paid")));
      result.donations = dStats;
    } catch (e) { errs.push("donations:" + String(e)); }

    try {
      const [mCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(mustahiks)
        .where(and(eq(mustahiks.mosque_id, mosque.id), isNull(mustahiks.deleted_at)));
      result.mustahiks = mCount;
    } catch (e) { errs.push("mustahiks:" + String(e)); }

    try {
      const [inc] = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(and(eq(transactions.mosque_id, mosque.id), eq(transactions.type, "Pemasukan"), isNull(transactions.deleted_at)));
      result.income = inc;
    } catch (e) { errs.push("income:" + String(e)); }

    try {
      const [exp] = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(and(eq(transactions.mosque_id, mosque.id), eq(transactions.type, "Pengeluaran"), isNull(transactions.deleted_at)));
      result.expense = exp;
    } catch (e) { errs.push("expense:" + String(e)); }

    try {
      const feed = await db.select().from(activity_feed).where(eq(activity_feed.mosque_id, mosque.id)).limit(3);
      result.activityFeedCount = feed.length;
    } catch (e) { errs.push("feed:" + String(e)); }

  } catch (e) { errs.push("TOP:" + String(e)); }

  result.errors = errs;
  return NextResponse.json(result);
}
