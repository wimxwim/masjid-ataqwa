import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import {
  ReceiptRow,
  StatusReceipt,
} from "@/components/design-system";

type SearchParams = Promise<{
  order_id?: string;
  status_code?: string;
  transaction_status?: string;
  message?: string;
}>;

export default async function PaymentErrorPage(props: {
  searchParams: SearchParams;
}) {
  const { order_id, status_code, transaction_status, message } =
    await props.searchParams;

  return (
    <StatusReceipt
      status="error"
      icon={<AlertCircle className="w-8 h-8" />}
      title="Pembayaran Gagal"
      message="Transaksi Anda tidak dapat diproses. Silakan periksa kembali atau coba lagi."
      primaryAction={{
        label: "Coba Lagi",
        href: "/donasi",
        icon: <RefreshCw className="w-4 h-4" />,
      }}
      secondaryAction={{
        label: "Ke Beranda",
        href: "/",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
    >
      {message && (
        <div className="glass border-red-200/50 rounded-2xl p-4 text-xs text-red-800 dark:text-red-200 leading-relaxed">
          {message}
        </div>
      )}

      {(order_id || status_code || transaction_status) && (
        <div className="glass rounded-2xl p-4 space-y-3">
          {order_id && (
            <ReceiptRow label="Order ID" value={order_id} mono />
          )}
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
        </div>
      )}

      <div className="glass rounded-2xl p-4 text-xs text-muted space-y-3">
        <p className="font-bold text-ink">Penyebab umum:</p>
        <ul className="list-disc list-inside space-y-1 leading-relaxed">
          <li>Saldo tidak mencukupi</li>
          <li>Batas transaksi harian terlampaui</li>
          <li>Koneksi terputus saat verifikasi</li>
          <li>Kode QRIS telah kedaluwarsa</li>
          <li>Virtual Account tidak aktif</li>
        </ul>
      </div>

      <p className="text-center text-[10px] text-muted">
        Butuh bantuan? Hubungi pengurus masjid melalui nomor kontak yang
        tersedia di halaman Contact.
      </p>
    </StatusReceipt>
  );
}
