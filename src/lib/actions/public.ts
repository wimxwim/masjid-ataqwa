"use server";

import { db } from "@/db/client";
import { mosques, transactions, activity_feed, testimonials, programs, bumm_products, donations, mustahiks, asnaf, affiliate_sales } from "@/db/schema";
import { eq, and, desc, asc, isNull, sql, gte } from "drizzle-orm";
import { cache } from "react";
import { AKAD_TO_FUND } from "@/lib/fund-mapping";

// 1. Get default mosque (first active) — cached
export const getDefaultMosque = cache(async () => {
  const [mosque] = await db
    .select()
    .from(mosques)
    .where(and(eq(mosques.is_active, true), isNull(mosques.deleted_at)))
    .limit(1);
  return mosque ?? null;
});

// 2. Get public transactions (no auth) — for Transparansi page
export async function getPublicTransactions(mosqueId: string, limit = 50) {
  return db
    .select({
      id: transactions.id,
      transaction_date: transactions.transaction_date,
      donor_name: transactions.donor_name,
      category: transactions.category,
      amount: transactions.amount,
      type: transactions.type,
    })
    .from(transactions)
    .where(and(eq(transactions.mosque_id, mosqueId), isNull(transactions.deleted_at)))
    .orderBy(desc(transactions.transaction_date))
    .limit(limit);
}

// 3. Get transactions aggregation by type and category
export async function getTransactionSummary(mosqueId: string) {
  const result = await db
    .select({
      type: transactions.type,
      category: transactions.category,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(eq(transactions.mosque_id, mosqueId), isNull(transactions.deleted_at)))
    .groupBy(transactions.type, transactions.category);

  return result;
}

// 4. Get monthly aggregation for trend chart
export async function getMonthlyTrends(mosqueId: string) {
  const result = await db
    .select({
      month: sql<string>`to_char(${transactions.transaction_date}, 'Mon')`,
      year: sql<string>`to_char(${transactions.transaction_date}, 'YYYY')`,
      monthNum: sql<string>`to_char(${transactions.transaction_date}, 'MM')`,
      type: transactions.type,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.mosque_id, mosqueId),
      isNull(transactions.deleted_at),
      gte(transactions.transaction_date, sql`NOW() - INTERVAL '6 months'`),
    ))
    .groupBy(
      sql`to_char(${transactions.transaction_date}, 'Mon')`,
      sql`to_char(${transactions.transaction_date}, 'YYYY')`,
      sql`to_char(${transactions.transaction_date}, 'MM')`,
      transactions.type,
    )
    .orderBy(sql`MIN(${transactions.transaction_date})`);

  return result;
}

// 5. Get public activity feed
export async function getPublicActivityFeed(mosqueId: string, limit = 10) {
  return db
    .select()
    .from(activity_feed)
    .where(eq(activity_feed.mosque_id, mosqueId))
    .orderBy(desc(activity_feed.created_at))
    .limit(limit);
}

// 6. Get public testimonials
export async function getPublicTestimonials(mosqueId: string) {
  return db
    .select()
    .from(testimonials)
    .where(and(
      eq(testimonials.mosque_id, mosqueId),
      eq(testimonials.is_active, true),
      isNull(testimonials.deleted_at),
    ))
    .orderBy(desc(testimonials.created_at));
}

// 7. Get featured programs
export async function getFeaturedPrograms(mosqueId: string) {
  return db
    .select({
      id: programs.id,
      name: programs.name,
      description: programs.description,
      slug: programs.slug,
      category: programs.category,
      config: programs.config,
    })
    .from(programs)
    .where(and(
      eq(programs.mosque_id, mosqueId),
      eq(programs.is_active, true),
      eq(programs.is_featured, true),
      isNull(programs.deleted_at),
    ))
    .orderBy(programs.sort_order);
}

// 8. Get BUMM products (public)
export async function getBummProductsPublic(mosqueId: string) {
  return db
    .select()
    .from(bumm_products)
    .where(and(
      eq(bumm_products.mosque_id, mosqueId),
      eq(bumm_products.is_active, true),
      isNull(bumm_products.deleted_at),
    ))
    .orderBy(desc(bumm_products.created_at));
}

// 9. Get fund-type breakdown from transactions + donations (for public transparency)
// Mapping dari @/lib/fund-mapping (AKAD_TO_FUND)

export async function getFundTypeBreakdown(mosqueId: string) {
  const [txRows, donationRows] = await Promise.all([
    db
      .select({
        fund_type: transactions.fund_type,
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.mosque_id, mosqueId),
        eq(transactions.type, "Pemasukan"),
        isNull(transactions.deleted_at),
      ))
      .groupBy(transactions.fund_type),

    db
      .select({
        akad_type: donations.akad_type,
        total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
      })
      .from(donations)
      .where(and(
        eq(donations.mosque_id, mosqueId),
        eq(donations.payment_status, "paid"),
      ))
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

  return Array.from(combined.entries()).map(([fund_type, total]) => ({
    fund_type,
    total,
  }));
}

// 10. Get asnaf list for public forms (zakat registration, mustahik verification)
export async function getPublicAsnafList(mosqueId: string) {
  return db
    .select({ id: asnaf.id, code: asnaf.code, name: asnaf.name, arabic_name: asnaf.arabic_name, description: asnaf.description })
    .from(asnaf)
    .where(and(eq(asnaf.mosque_id, mosqueId), eq(asnaf.is_active, true)))
    .orderBy(asc(asnaf.priority));
}

// 11. Get BUMM stats for BUMM page
export async function getBummStats(mosqueId: string) {
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
    profitKembali: 100, // persen — prinsip BUMM: seluruh profit untuk umat
  };
}

// 12. Get dashboard stats for landing page
export async function getDashboardStats(mosqueId: string) {
  // Total donations (paid)
  const [donationStats] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(donations)
    .where(and(
      eq(donations.mosque_id, mosqueId),
      eq(donations.payment_status, "paid"),
    ));

  // Total mustahik
  const [mustahikCount] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(mustahiks)
    .where(and(
      eq(mustahiks.mosque_id, mosqueId),
      isNull(mustahiks.deleted_at),
    ));

  // Terbantu bulan ini (distinct recipients — pengeluaran bulan berjalan)
  const [terbantuBulanIni] = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${transactions.recipient_name})`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.mosque_id, mosqueId),
      eq(transactions.type, "Pengeluaran"),
      isNull(transactions.deleted_at),
      gte(transactions.transaction_date, sql`DATE_TRUNC('month', CURRENT_DATE)`),
    ));

  // Total transactions summary
  const [incomeTotal] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.mosque_id, mosqueId),
      eq(transactions.type, "Pemasukan"),
      isNull(transactions.deleted_at),
    ));

  const [expenseTotal] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.mosque_id, mosqueId),
      eq(transactions.type, "Pengeluaran"),
      isNull(transactions.deleted_at),
    ));

  return {
    totalDonations: donationStats?.total ?? 0,
    donationCount: donationStats?.count ?? 0,
    mustahikCount: mustahikCount?.count ?? 0,
    terbantuBulanIni: terbantuBulanIni?.count ?? 0,
    totalIncome: incomeTotal?.total ?? 0,
    totalExpense: expenseTotal?.total ?? 0,
    balance: (incomeTotal?.total ?? 0) - (expenseTotal?.total ?? 0),
  };
}
