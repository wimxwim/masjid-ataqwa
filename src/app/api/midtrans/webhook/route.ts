import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/client";
import { donations, transactions, activity_feed, audit_logs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CATEGORY_MAP } from "@/lib/fund-mapping";
import { createLogger } from "@/lib/logger";

const log = createLogger("midtrans-webhook");

/* ─── verifikasi signature HMAC Midtrans ─── */
function verifySignature(
  body: Record<string, unknown>,
  signatureHeader: string,
  serverKey: string,
): boolean {
  const orderId = String(body.order_id ?? "");
  const statusCode = String(body.status_code ?? "");
  const grossAmount = String(body.gross_amount ?? "");

  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/* ─── update status donasi berdasarkan webhook ─── */
async function handlePaymentNotification(notification: Record<string, unknown>) {
  const orderId = String(notification.order_id ?? "");
  const transactionStatus = String(notification.transaction_status ?? "");
  const fraudStatus = String(notification.fraud_status ?? "");
  const transactionId = String(notification.transaction_id ?? "");
  const paymentType = String(notification.payment_type ?? "");
  const grossAmount = Number(notification.gross_amount ?? 0);
  const statusCode = String(notification.status_code ?? "");

  /* cari donasi berdasarkan order_id (prefix: donation-{uuid}) */
  const donationId = orderId.replace(/^donation-/, "");
  const [donation] = await db
    .select()
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1);

  if (!donation) {
    log.warn("Donasi tidak ditemukan", { orderId });
    return;
  }

  /* atomic update: hanya jika belum paid */
  let paymentStatus: string | null = null;

  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") paymentStatus = "paid";
    else if (fraudStatus === "deny") paymentStatus = "failed";
    else paymentStatus = "pending";
  } else if (transactionStatus === "settlement") {
    paymentStatus = "paid";
  } else if (transactionStatus === "pending") {
    paymentStatus = "pending";
  } else if (["deny", "cancel", "expire"].includes(transactionStatus)) {
    paymentStatus = "failed";
  } else if (["refund", "partial_refund"].includes(transactionStatus)) {
    paymentStatus = "refunded";
  }

  if (!paymentStatus) return;

  await db.transaction(async (tx) => {
    await tx
      .update(donations)
      .set({
        payment_status: paymentStatus as "pending" | "paid" | "failed" | "refunded",
        midtrans_transaction_id: transactionId || donation.midtrans_transaction_id,
        paid_at: paymentStatus === "paid" ? sql`NOW()` : donation.paid_at,
      })
      .where(eq(donations.id, donationId));

    /* jika payment sukses, catat ke buku besar & activity_feed */
    if (paymentStatus === "paid" && donation.payment_status !== "paid") {
      const m = CATEGORY_MAP[donation.akad_type] ?? CATEGORY_MAP.infaq;

      const txValue: typeof transactions.$inferInsert = {
        mosque_id: donation.mosque_id,
        type: "Pemasukan",
        category: `${m!.category}${donation.program_name ? ` – ${donation.program_name}` : ""}`,
        amount: grossAmount,
        description: `Donasi online via ${paymentType} dari ${donation.donor_name ?? "Anonim"}`,
        donor_name: donation.donor_name ?? null,
        phone: donation.donor_phone ?? null,
        transaction_date: new Date().toISOString().split("T")[0]!,
        fund_type: m!.fund_type,
        akad_type: m!.akad,
      };
      await tx.insert(transactions).values(txValue);

      await tx.insert(activity_feed).values({
        mosque_id: donation.mosque_id,
        type: "donation",
        nama: donation.donor_name ?? "Anonim",
        detail: donation.program_name ?? donation.akad_type,
        jumlah: donation.amount,
      });
    }

    /* catat audit log */
    await tx.insert(audit_logs).values({
      mosque_id: donation.mosque_id,
      action: "update",
      entity_type: "donations",
      entity_id: donationId,
      metadata: {
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        transaction_id: transactionId,
        payment_type: paymentType,
        gross_amount: grossAmount,
      },
    });
  });
}

/* ─── POST: webhook dari Midtrans ─── */
export async function POST(request: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    log.warn("Webhook diterima tapi MIDTRANS_SERVER_KEY belum diisi");
    return NextResponse.json({ status: "ok" });
  }

  const body = await request.json();
  const signatureKey = String(body.signature_key ?? "");

  if (!signatureKey) {
    log.error("signature_key tidak ditemukan di body", { orderId: body.order_id });
    return NextResponse.json({ error: "Missing signature_key" }, { status: 401 });
  }

  if (!verifySignature(body, signatureKey, serverKey)) {
    log.error("Signature mismatch", { orderId: body.order_id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  /* proses synchronously — await biar serverless tidak terminate sebelum selesai */
  try {
    await handlePaymentNotification(body);
  } catch (err) {
    log.error("Webhook handler error", { error: String(err) });
  }

  return NextResponse.json({ status: "ok" });
}
