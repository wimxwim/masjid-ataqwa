import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { mosques, donations, transactions, mustahiks, profiles, memberships } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "@/lib/actions/_helpers";

export async function GET(request: Request) {
  /* debug endpoint hanya aktif di development/testing */
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  /* proteksi — hanya admin yang bisa akses debug */
  try {
    const mid = await resolveMosqueId();
    await requireRole(mid, "superadmin");
  } catch {
    return NextResponse.json({ error: "Unauthorized: Superadmin only" }, { status: 401 });
  }

  const result: Record<string, unknown> = { phase: "start" };
  const errs: string[] = [];

  /* 1. Cookie check */
  try {
    const c = await cookies();
    const allCookies = c.getAll();
    result.cookieNames = allCookies.map((ck) => ck.name);
    result.cookieCount = allCookies.length;
    result.rawCookieHeader = request.headers.get("cookie") ?? "(none)";
  } catch (e) { errs.push("cookies:" + String(e)); }

  /* 1b. headers() API check */
  try {
    const h = await (await import("next/headers")).headers();
    result.headersCookie = h.get("cookie") ?? "(none from headers())";
  } catch (e: unknown) {
    result.headersCookie = "ERR:" + String(e);
  }

  /* 2. Auth check */
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    result.authUser = user?.email ?? null;
    result.authError = error?.message ?? null;
    const { data: { session } } = await supabase.auth.getSession();
    result.hasSession = !!session;
  } catch (e) { errs.push("auth:" + String(e)); }

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
      const profileCount = await db.select({ count: sql<number>`COUNT(*)` }).from(profiles);
      result.profileCount = profileCount[0]?.count ?? 0;
    } catch (e) { errs.push("profiles:" + String(e)); }

    try {
      const membershipCount = await db.select({ count: sql<number>`COUNT(*)` }).from(memberships);
      result.membershipCount = membershipCount[0]?.count ?? 0;
    } catch (e) { errs.push("memberships:" + String(e)); }
  } catch (e) { errs.push("TOP:" + String(e)); }

  result.errors = errs;
  return NextResponse.json(result);
}
