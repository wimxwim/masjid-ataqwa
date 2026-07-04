import { db } from "@/db/client";
import { mosques, donations, transactions, mustahiks, programs, activity_feed, testimonials, bumm_products, affiliate_sales } from "@/db/schema";
import { eq, and, desc, asc, isNull, sql, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AKAD_TO_FUND } from "@/lib/fund-mapping";

export const dynamic = "force-dynamic";

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

  const [terbantuBulanIni] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${transactions.recipient_name})` })
    .from(transactions)
    .where(and(
      eq(transactions.mosque_id, mosqueId),
      eq(transactions.type, "Pengeluaran"),
      isNull(transactions.deleted_at),
      gte(transactions.transaction_date, sql`DATE_TRUNC('month', CURRENT_DATE)`),
    ));

  return {
    totalDonations: Number(donationStats?.total ?? 0),
    donationCount: Number(donationStats?.count ?? 0),
    mustahikCount: Number(mustahikCount?.count ?? 0),
    terbantuBulanIni: Number(terbantuBulanIni?.count ?? 0),
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

async function getBummStats(mosqueId: string) {
  const [productCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bumm_products)
    .where(and(eq(bumm_products.mosque_id, mosqueId), eq(bumm_products.is_active, true), isNull(bumm_products.deleted_at)));

  const [salesStats] = await db
    .select({
      totalProducts: sql<number>`COALESCE(SUM(${affiliate_sales.quantity}), 0)`,
      totalGmv: sql<number>`COALESCE(SUM(${affiliate_sales.total_gmv}), 0)`,
      totalCommission: sql<number>`COALESCE(SUM(${affiliate_sales.earned_commission}), 0)`,
    })
    .from(affiliate_sales)
    .innerJoin(bumm_products, eq(affiliate_sales.product_id, bumm_products.id))
    .where(eq(bumm_products.mosque_id, mosqueId));

  const [resellerCount] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${affiliate_sales.referrer_id})` })
    .from(affiliate_sales)
    .innerJoin(bumm_products, eq(affiliate_sales.product_id, bumm_products.id))
    .where(eq(bumm_products.mosque_id, mosqueId));

  return {
    resellerAktif: Number(resellerCount?.count ?? 0),
    produkTerjual: Number(salesStats?.totalProducts ?? 0),
    unitUsaha: Number(productCount?.count ?? 0),
    profitKembali: 100,
  };
}

export async function GET() {
  try {
    const mosque = await getDefaultMosque();
    if (!mosque) return NextResponse.json({ error: "No active mosque" }, { status: 404 });

    const [stats, fundBreakdown, featuredPrograms, transactions, activityFeed, testimonials, bummStats] = await Promise.all([
      getDashboardStats(mosque.id),
      getFundTypeBreakdown(mosque.id),
      getFeaturedPrograms(mosque.id),
      getPublicTransactions(mosque.id),
      getPublicActivityFeed(mosque.id),
      getPublicTestimonials(mosque.id),
      getBummStats(mosque.id),
    ]);

    return NextResponse.json({
      mosque: { name: mosque.name, config: mosque.config },
      stats,
      fundBreakdown,
      featuredPrograms,
      transactions,
      activityFeed,
      testimonials,
      bummStats,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
