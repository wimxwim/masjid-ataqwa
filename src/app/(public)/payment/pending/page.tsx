import { db } from "@/db/client";
import { donations, mosques } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  Clock,
  CreditCard,
  ArrowLeft,
  Info,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  ReceiptDivider,
  ReceiptRow,
  StatusReceipt,
} from "@/components/design-system";

type SearchParams = Promise<{
  order_id?: string;
  status_code?: string;
  transaction_status?: string;
}>;

/** Resolve order_id — Midtrans may send "donation-{uuid}" or just the raw UUID */
function resolveDonationId(orderId: string): string {
  return orderId.replace(/^donation-/, "");
}

export default async function PaymentPendingPage(props: {
  searchParams: SearchParams;
}) {
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
    <StatusReceipt
      status="pending"
      icon={<Clock className="w-8 h-8" />}
      title="Menunggu Konfirmasi"
      message="Pesanan donasi Anda telah tercatat. Silakan selesaikan pembayaran sesuai metode yang dipilih."
      primaryAction={{
        label: "Kembali ke Donasi",
        href: "/donasi",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
      secondaryAction={{
        label: "Ke Beranda",
        href: "/",
      }}
    >
      {/* Detail donasi */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <ReceiptRow
          label="ID Donasi"
          value={donation.id.slice(0, 8).toUpperCase()}
          mono
        />
        <ReceiptRow
          label="Donatur"
          value={donation.donor_name ?? "Hamba Allah"}
        />
        <ReceiptRow
          label="Program"
          value={donation.program_name ?? donation.akad_type}
        />
        <ReceiptRow
          label="Metode"
          value={donation.payment_method?.toUpperCase() ?? "-"}
        />
        {status_code && (
          <ReceiptRow label="Status Code" value={status_code} mono />
        )}
        {transaction_status && (
          <ReceiptRow
            label="Transaction Status"
            value={transaction_status}
            mono
          />
        )}
        <ReceiptDivider />
        <div className="flex justify-between items-center">
          <span className="text-muted font-bold text-xs">Total Tagihan</span>
          <span className="font-mono font-black text-amber-700 text-lg">
            Rp {donation.amount.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Petunjuk pembayaran */}
      <div className="glass border-amber-200/50 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          Petunjuk Pembayaran
        </h3>

        {donation.payment_method === "qris" && (
          <div className="text-xs text-amber-800 dark:text-amber-200 space-y-2">
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
          <div className="glass rounded-xl p-3 space-y-1 text-xs">
            <p className="text-muted">Rekening Tujuan</p>
            <p className="font-bold text-ink">{mosque.bank_name}</p>
            <p className="font-mono font-black text-lg text-ink tracking-wider">
              {mosque.bank_account_number}
            </p>
            <p className="text-muted text-[10px]">
              a.n. {mosque.bank_account_name ?? mosque.name}
            </p>
          </div>
        )}

        {isExpired && (
          <div className="glass border-red-200/50 rounded-lg p-3 text-[11px] text-red-700 dark:text-red-300">
            Pesanan ini telah melebihi batas waktu pembayaran (24 jam). Silakan
            buat donasi baru.
          </div>
        )}
      </div>

      {/* Bantuan & laporan */}
      <div className="space-y-3">
        <Link
          href="#"
          className="flex items-center gap-3 glass rounded-2xl p-3 hover-lift hover:hover-lift-active transition-all"
        >
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="text-xs font-bold text-ink">Ada kendala bayar?</p>
            <p className="text-[10px] text-muted">
              Hubungi pengurus masjid via WhatsApp untuk bantuan.
            </p>
          </div>
        </Link>

        <Link
          href="/laporan"
          className="flex items-center gap-3 glass rounded-2xl p-3 hover-lift hover:hover-lift-active transition-all"
        >
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="text-xs font-bold text-ink">Lihat Laporan Keuangan</p>
            <p className="text-[10px] text-muted">
              Pantau transparansi dana masjid secara real-time.
            </p>
          </div>
        </Link>
      </div>

      {!isExpired && (
        <p className="text-center text-[10px] text-muted">
          Estimasi verifikasi: 1×24 jam setelah transfer. Hubungi{" "}
          {mosque?.name ?? "kami"} jika ada kendala.
        </p>
      )}
    </StatusReceipt>
  );
}
