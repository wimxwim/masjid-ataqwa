import { db } from "@/db/client";
import { donations, mosques } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  ArrowLeft,
  MessageCircle,
  BarChart3,
  Users,
  Landmark,
} from "lucide-react";
import Link from "next/link";
import { AKAD_LABEL } from "@/lib/labels";
import {
  IslamicDivider,
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

export default async function PaymentSuccessPage(props: {
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

  const paidAt = donation.paid_at
    ? new Date(donation.paid_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date(donation.created_at!).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <StatusReceipt
      status="success"
      icon={<CheckCircle className="w-8 h-8" />}
      title="Pembayaran Berhasil!"
      message="Alhamdulillah, donasi Anda telah tercatat sebagai amanah yang sah."
      primaryAction={{
        label: "Donasi Lagi",
        href: "/donasi",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
      secondaryAction={{
        label: "Ke Beranda",
        href: "/",
      }}
    >
      {/* Detail transaksi */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <ReceiptRow
          label="ID Transaksi"
          value={donation.id.slice(0, 8).toUpperCase()}
          mono
        />
        {donation.midtrans_transaction_id && (
          <ReceiptRow
            label="Midtrans ID"
            value={donation.midtrans_transaction_id}
            mono
          />
        )}
        <ReceiptRow
          label="Donatur"
          value={donation.donor_name ?? "Hamba Allah"}
        />
        <ReceiptRow
          label="Program"
          value={
            donation.program_name ??
            AKAD_LABEL[donation.akad_type] ??
            donation.akad_type
          }
        />
        <ReceiptRow
          label="Metode"
          value={donation.payment_method?.toUpperCase() ?? "-"}
        />
        <ReceiptRow label="Waktu" value={paidAt} />
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
          <span className="text-muted font-bold text-xs">Total Dibayarkan</span>
          <span className="font-mono font-black text-primary-deep text-lg">
            Rp {donation.amount.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Amanah mosque */}
      {mosque && (
        <div className="glass rounded-2xl p-4 flex gap-3 items-start text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
          <Landmark className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <b>{mosque.name}</b> — Donasi Anda akan dikelola secara amanah dan
            transparan. Setiap rupiah tercatat dalam sistem keuangan masjid yang
            diaudit secara berkala.
          </div>
        </div>
      )}

      {/* Ayat */}
      <div className="glass border border-accent/20 rounded-2xl p-4 space-y-3">
        <IslamicDivider />
        <p className="font-arabic text-lg sm:text-xl text-center text-ink leading-relaxed">
          &ldquo;Ya Allah, terimalah dari kami, sesungguhnya Engkau Maha Mendengar
          lagi Maha Mengetahui.&rdquo;
        </p>
        <p className="text-[11px] text-accent/90 text-center font-sans">
          (QS. Al-Baqarah: 127)
        </p>
      </div>

      {/* CTA link cards */}
      <div className="space-y-3">
        <Link
          href="#"
          className="flex items-center gap-3 glass rounded-2xl p-3 hover-lift hover:hover-lift-active transition-all"
        >
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="text-xs font-bold text-ink">Grup WhatsApp Donatur</p>
            <p className="text-[10px] text-muted">
              Update program & laporan dampak langsung di HP. Segera hadir!
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
            <p className="text-xs font-bold text-ink">Pantau Dampak Donasi</p>
            <p className="text-[10px] text-muted">
              Lihat laporan keuangan real-time & penyaluran dana.
            </p>
          </div>
        </Link>

        <Link
          href="/laporan"
          className="flex items-center gap-3 glass rounded-2xl p-3 hover-lift hover:hover-lift-active transition-all"
        >
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="text-xs font-bold text-ink">Kenali Penerima Manfaat</p>
            <p className="text-[10px] text-muted">
              Lihat mustahik yang terbantu dari donasi Anda.
            </p>
          </div>
        </Link>
      </div>
    </StatusReceipt>
  );
}
