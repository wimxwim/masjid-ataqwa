import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ order_id?: string; status_code?: string; transaction_status?: string; message?: string }>;

export default async function PaymentErrorPage(props: { searchParams: SearchParams }) {
  const { order_id, status_code, transaction_status, message } = await props.searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-surface rounded-2xl border border-outline shadow-lg overflow-hidden">

        <div className="bg-red-950 text-white px-6 py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-2xl">Pembayaran Gagal</h1>
          <p className="text-red-200 text-sm">
            Transaksi Anda tidak dapat diproses. Silakan coba kembali.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {message && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 leading-relaxed">
              {message}
            </div>
          )}

          {(order_id || status_code || transaction_status) && (
            <div className="bg-bg border border-outline rounded-xl p-4 space-y-3 text-xs">
              {order_id && (
                <div className="flex justify-between">
                  <span className="text-muted">Order ID</span>
                  <span className="font-mono font-bold text-ink">{order_id}</span>
                </div>
              )}
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
            </div>
          )}

          <div className="bg-bg border border-outline rounded-xl p-4 text-xs text-muted space-y-2">
            <p><b>Penyebab umum:</b></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Saldo tidak mencukupi</li>
              <li>Batas transaksi harian terlampaui</li>
              <li>Koneksi terputus saat verifikasi</li>
              <li>Kode QRIS telah kedaluwarsa</li>
              <li>Virtual Account tidak aktif</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link
              href="/donasi"
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-deep text-white font-bold py-3 rounded-xl text-xs transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 bg-surface hover:bg-gray-50 text-ink font-bold py-3 rounded-xl text-xs border border-outline transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Ke Beranda
            </Link>
          </div>

          <p className="text-center text-[10px] text-muted">
            Butuh bantuan? Hubungi pengurus masjid melalui nomor kontak yang tersedia di halaman Contact.
          </p>
        </div>

      </div>
    </div>
  );
}
