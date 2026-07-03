import { db } from "@/db/client";
import { mosques, donations, transactions, mustahiks, programs, activity_feed, testimonials } from "@/db/schema";
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AKAD_TO_FUND } from "@/lib/fund-mapping";

async function getDefaultMosque() {
  const [mosque] = await db
    .select()
    .from(mosques)
    .where(and(eq(mosques.is_active, true), isNull(mosques.deleted_at)))
    .limit(1);
  return mosque ?? null;
}

async function getDashboardStats(mosqueId: string) {
  const [donationStats] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(donations)
    .where(and(eq(donations.mosque_id, mosqueId), eq(donations.payment_status, "paid")));

  const [mustahikCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(mustahiks)
    .where(and(eq(mustahiks.mosque_id, mosqueId), isNull(mustahiks.deleted_at)));

  const [incomeTotal] = await db
    .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(eq(transactions.mosque_id, mosqueId), eq(transactions.type, "Pemasukan"), isNull(transactions.deleted_at)));

  const [expenseTotal] = await db
    .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(eq(transactions.mosque_id, mosqueId), eq(transactions.type, "Pengeluaran"), isNull(transactions.deleted_at)));

  return {
    totalDonations: Number(donationStats?.total ?? 0),
    donationCount: Number(donationStats?.count ?? 0),
    mustahikCount: Number(mustahikCount?.count ?? 0),
    totalIncome: Number(incomeTotal?.total ?? 0),
    totalExpense: Number(expenseTotal?.total ?? 0),
    balance: Number(incomeTotal?.total ?? 0) - Number(expenseTotal?.total ?? 0),
  };
}

async function getFundTypeBreakdown(mosqueId: string) {
  const [txRows, donationRows] = await Promise.all([
    db
      .select({
        fund_type: transactions.fund_type,
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.mosque_id, mosqueId), eq(transactions.type, "Pemasukan"), isNull(transactions.deleted_at)))
      .groupBy(transactions.fund_type),
    db
      .select({
        akad_type: donations.akad_type,
        total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
      })
      .from(donations)
      .where(and(eq(donations.mosque_id, mosqueId), eq(donations.payment_status, "paid")))
      .groupBy(donations.akad_type),
  ]);

  const combined = new Map<string, number>();
  for (const r of txRows) {
    combined.set(r.fund_type, (combined.get(r.fund_type) ?? 0) + Number(r.total));
  }
  for (const r of donationRows) {
    const ft = AKAD_TO_FUND[r.akad_type] ?? "infaq_tidak_terikat";
    combined.set(ft, (combined.get(ft) ?? 0) + Number(r.total));
  }
  return Array.from(combined.entries()).map(([fund_type, total]) => ({ fund_type, total }));
}

async function getFeaturedPrograms(mosqueId: string) {
  return db
    .select()
    .from(programs)
    .where(and(eq(programs.mosque_id, mosqueId), eq(programs.is_active, true), eq(programs.is_featured, true), isNull(programs.deleted_at)))
    .orderBy(programs.sort_order);
}

async function getPublicTransactions(mosqueId: string) {
  return db
    .select()
    .from(transactions)
    .where(and(eq(transactions.mosque_id, mosqueId), isNull(transactions.deleted_at)))
    .orderBy(desc(transactions.transaction_date))
    .limit(50);
}

async function getPublicActivityFeed(mosqueId: string) {
  return db
    .select()
    .from(activity_feed)
    .where(eq(activity_feed.mosque_id, mosqueId))
    .orderBy(desc(activity_feed.created_at))
    .limit(10);
}

async function getPublicTestimonials(mosqueId: string) {
  return db
    .select()
    .from(testimonials)
    .where(and(eq(testimonials.mosque_id, mosqueId), eq(testimonials.is_active, true), isNull(testimonials.deleted_at)))
    .orderBy(desc(testimonials.created_at));
}

export async function GET() {
  try {
    const mosque = await getDefaultMosque();
    if (!mosque) return NextResponse.json({ error: "No active mosque" }, { status: 404 });

    const [stats, fundBreakdown, featuredPrograms, transactions, activityFeed, testimonials] = await Promise.all([
      getDashboardStats(mosque.id),
      getFundTypeBreakdown(mosque.id),
      getFeaturedPrograms(mosque.id),
      getPublicTransactions(mosque.id),
      getPublicActivityFeed(mosque.id),
      getPublicTestimonials(mosque.id),
    ]);

    return NextResponse.json({
      mosque: { name: mosque.name, config: mosque.config },
      stats,
      fundBreakdown,
      featuredPrograms,
      transactions,
      activityFeed,
      testimonials,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
