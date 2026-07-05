import { db } from "@/db/client";
import { donations, mosques } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CheckCircle, Landmark, ArrowLeft, MessageCircle, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { AKAD_LABEL } from "@/lib/labels";

type SearchParams = Promise<{ order_id?: string; status_code?: string; transaction_status?: string }>;

/** Resolve order_id — Midtrans may send "donation-{uuid}" or just the raw UUID */
function resolveDonationId(orderId: string): string {
  return orderId.replace(/^donation-/, "");
}

export default async function PaymentSuccessPage(props: { searchParams: SearchParams }) {
  const { order_id, status_code, transaction_status } = await props.searchParams;
  if (!order_id) redirect("/donasi");

  const donationId = resolveDonationId(order_id);

  const [donation] = await db
    .select()
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1);

  if (!donation) redirect("/donasi");

  const [mosque] = await db
    .select()
    .from(mosques)
    .where(eq(mosques.id, donation.mosque_id))
    .limit(1);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-surface rounded-2xl border border-outline shadow-lg overflow-hidden">

        <div className="bg-emerald-950 text-white px-6 py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-2xl">Pembayaran Berhasil!</h1>
          <p className="text-emerald-200 text-sm">
            Alhamdulillah, donasi Anda telah tercatat sebagai amanah yang sah.
          </p>
        </div>

        <div className="p-6 space-y-5">

          <div className="bg-bg border border-outline rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">ID Transaksi</span>
              <span className="font-mono font-bold text-ink">{donation.id.slice(0, 8).toUpperCase()}</span>
            </div>
            {donation.midtrans_transaction_id && (
              <div className="flex justify-between">
                <span className="text-muted">Midtrans ID</span>
                <span className="font-mono font-bold text-ink">{donation.midtrans_transaction_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Donatur</span>
              <span className="font-semibold text-ink">{donation.donor_name ?? "Hamba Allah"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Program</span>
              <span className="font-semibold text-ink text-right">{donation.program_name ?? AKAD_LABEL[donation.akad_type] ?? donation.akad_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Metode</span>
              <span className="font-semibold text-ink">{donation.payment_method?.toUpperCase() ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Waktu</span>
              <span className="font-semibold text-ink">
                {donation.paid_at
                  ? new Date(donation.paid_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
                  : new Date(donation.created_at!).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {status_code && (
              <div className="flex justify-between">
                <span className="text-muted">Status Code</span>
                <span className="font-mono text-ink">{status_code}</span>
              </div>
            )}
            {transaction_status && (
              <div className="flex justify-between">
                <span className="text-muted">Transaction Status</span>
                <span className="font-mono text-ink">{transaction_status}</span>
              </div>
            )}
            <hr className="border-outline" />
            <div className="flex justify-between items-center">
              <span className="text-muted font-bold">Total Dibayarkan</span>
              <span className="font-mono font-black text-primary-deep text-lg">
                Rp {donation.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {mosque && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start">
              <Landmark className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <b>{mosque.name}</b> — {" "}
                Donasi Anda akan dikelola secara amanah dan transparan. Setiap rupiah tercatat dalam sistem keuangan masjid yang diaudit secara berkala.
              </div>
            </div>
          )}

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-[11px] text-accent/80 leading-relaxed font-sans">
            &ldquo;Ya Allah, terimalah dari kami, sesungguhnya Engkau Maha Mendengar lagi Maha Mengetahui.&rdquo; (QS. Al-Baqarah: 127)
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-emerald-900">Grup WhatsApp Donatur</p>
                <p className="text-[10px] text-emerald-700">Dapatkan update program & laporan dampak langsung di HP. Segera hadir!</p>
              </div>
            </div>

            <Link
              href="/laporan"
              className="flex items-center gap-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl p-3 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-blue-900">Pantau Dampak Donasi Anda</p>
                <p className="text-[10px] text-blue-700">Lihat laporan keuangan real-time & penyaluran dana</p>
              </div>
            </Link>

            <Link
              href="/laporan"
              className="flex items-center gap-3 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-xl p-3 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-purple-900">Kenali Penerima Manfaat</p>
                <p className="text-[10px] text-purple-700">Lihat siapa saja mustahik yang terbantu dari donasi Anda</p>
              </div>
            </Link>
          </div>

          <div className="flex gap-3">
            <Link
              href="/donasi"
              className="flex-1 flex items-center justify-center gap-1.5 bg-ink hover:bg-primary-deep text-white font-bold py-3 rounded-xl text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Donasi Lagi
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 bg-surface hover:bg-gray-50 text-ink font-bold py-3 rounded-xl text-xs border border-outline transition-all"
            >
              Ke Beranda
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
