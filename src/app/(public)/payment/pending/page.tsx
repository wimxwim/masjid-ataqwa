import { db } from "@/db/client";
import { donations, mosques } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Clock, CreditCard, Landmark, ArrowLeft, Info, MessageCircle, BarChart3 } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ order_id?: string; status_code?: string; transaction_status?: string }>;

/** Resolve order_id — Midtrans may send "donation-{uuid}" or just the raw UUID */
function resolveDonationId(orderId: string): string {
  return orderId.replace(/^donation-/, "");
}

export default async function PaymentPendingPage(props: { searchParams: SearchParams }) {
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

  const isExpired = donation.created_at
    ? Date.now() - new Date(donation.created_at).getTime() > 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-surface rounded-2xl border border-outline shadow-lg overflow-hidden">

        <div className="bg-amber-950 text-white px-6 py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-2xl">Menunggu Konfirmasi</h1>
          <p className="text-amber-200 text-sm">
            Pesanan donasi Anda telah tercatat. Silakan selesaikan pembayaran sesuai metode yang dipilih.
          </p>
          <p className="text-amber-300 text-xs font-medium">
            Estimasi waktu verifikasi: 1×24 jam setelah transfer
          </p>
        </div>

        <div className="p-6 space-y-5">

          <div className="bg-bg border border-outline rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">ID Donasi</span>
              <span className="font-mono font-bold text-ink">{donation.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Donatur</span>
              <span className="font-semibold text-ink">{donation.donor_name ?? "Hamba Allah"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Program</span>
              <span className="font-semibold text-ink text-right">{donation.program_name ?? donation.akad_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Metode</span>
              <span className="font-semibold text-ink">{donation.payment_method?.toUpperCase() ?? "-"}</span>
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
              <span className="text-muted font-bold">Total Tagihan</span>
              <span className="font-mono font-black text-amber-700 text-lg">
                Rp {donation.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Petunjuk Pembayaran
            </h3>

            {donation.payment_method === "qris" && (
              <div className="text-xs text-amber-800 space-y-2">
                <p>1. Buka aplikasi GoPay, ShopeePay, OVO, atau M-Banking Anda.</p>
                <p>2. Pilih menu <b>QRIS</b> / <b>Scan QR</b>.</p>
                <p>3. Scan kode QR yang tersedia di halaman ini.</p>
                <p className="flex items-center gap-2 mt-2">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Atau lakukan transfer ke rekening masjid:</span>
                </p>
              </div>
            )}

            {mosque?.bank_name && mosque?.bank_account_number && (
              <div className="bg-white border border-amber-200 rounded-lg p-3 space-y-1 text-xs">
                <p className="text-muted">Rekening Tujuan</p>
                <p className="font-bold text-ink">{mosque.bank_name}</p>
                <p className="font-mono font-black text-lg text-ink tracking-wider">{mosque.bank_account_number}</p>
                <p className="text-muted text-[10px]">a.n. {mosque.bank_account_name ?? mosque.name}</p>
              </div>
            )}

            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[11px] text-red-700">
                Pesanan ini telah melebihi batas waktu pembayaran (24 jam). Silakan buat donasi baru.
              </div>
            )}

            <Link
              href="/donasi"
              className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs transition-all"
            >
              Kembali ke Donasi
            </Link>
          </div>

          {!isExpired && (
            <div className="text-center">
              <p className="text-[10px] text-muted">
                Setelah transfer, halaman ini akan otomatis terverifikasi dalam 1×24 jam.
                Hubungi {mosque?.name ?? "kami"} jika ada kendala.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-emerald-900">Ada kendala bayar?</p>
                <p className="text-[10px] text-emerald-700">Hubungi pengurus masjid via WhatsApp untuk bantuan</p>
              </div>
            </div>
            <Link
              href="/laporan"
              className="flex items-center gap-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl p-3 transition-colors"
            >
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-blue-900">Lihat Laporan Keuangan</p>
                <p className="text-[10px] text-blue-700">Pantau transparansi dana masjid secara real-time</p>
              </div>
            </Link>
          </div>

          <div className="flex gap-3">
            <Link
              href="/donasi"
              className="flex-1 flex items-center justify-center gap-1.5 bg-ink hover:bg-primary-deep text-white font-bold py-3 rounded-xl text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Donasi Lain
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
