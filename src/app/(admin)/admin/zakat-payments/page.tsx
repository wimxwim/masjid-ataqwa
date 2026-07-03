import { Construction, Receipt } from "lucide-react";
import React from "react";

export default function ZakatPaymentsPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
        <Receipt className="w-10 h-10" />
        <div className="absolute -bottom-2 -right-2 bg-amber-100 text-amber-700 p-1.5 rounded-full border border-amber-200">
          <Construction className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="font-display font-bold text-2xl text-ink">Kasir Pembayaran Zakat</h2>
        <p className="text-muted text-sm">
          Modul penerimaan zakat (Fitrah & Mal) secara luring/tunai di masjid dengan cetak kuitansi sedang dalam tahap perapihan (Fase 2).
        </p>
      </div>
      <div className="bg-surface border border-outline px-6 py-4 rounded-xl text-xs text-muted font-mono flex gap-3 items-center">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Backend API (zakat-payments.ts) sudah siap
      </div>
    </div>
  );
}
