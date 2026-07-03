import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/client";
import { donations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";

const log = createLogger("midtrans-token");

/* ─── POST: generate Snap transaction token ─── */
export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        { error: "Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY dan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY di .env" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { order_id, gross_amount, donor_name, donor_phone, akad_type } = body;

    if (!order_id || !gross_amount || gross_amount <= 0) {
      return NextResponse.json({ error: "order_id dan gross_amount wajib" }, { status: 400 });
    }

    /* cross-validate amount against stored donation */
    const donationId = order_id.replace(/^donation-/, "");
    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation) {
      return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
    }

    if (Number(gross_amount) !== donation.amount) {
      log.warn("Amount mismatch", { clientAmount: gross_amount, dbAmount: donation.amount });
      return NextResponse.json({ error: "Jumlah donasi tidak valid" }, { status: 400 });
    }

    /* ─── request Snap token ke Midtrans API ─── */
    const baseUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const payload = {
      transaction_details: {
        order_id,
        gross_amount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: donor_name ?? "Donatur",
        phone: donor_phone ?? "",
      },
    };

    const credentials = Buffer.from(serverKey + ":").toString("base64");

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      log.redacted("Token error from Midtrans API", { status: response.status, errBody });
      return NextResponse.json(
        { error: "Gagal mendapatkan token pembayaran" },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
    });
  } catch (error) {
    log.redacted("Unexpected error", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
