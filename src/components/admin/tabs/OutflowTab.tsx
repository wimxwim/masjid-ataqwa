"use client";

import { useState } from "react";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import type { LedgerEntry } from "@/types";
import { createTransaction, type FundType } from "@/lib/actions/transactions";
import { toLedgerEntry } from "@/lib/queries/admin";

const FUND_SOURCES: { value: FundType; label: string }[] = [
  { value: "infaq_tidak_terikat", label: "Infaq Tidak Terikat (Operasional)" },
  { value: "infaq_terikat", label: "Infaq Terikat (Program Khusus)" },
  { value: "zakat_fitrah", label: "Zakat Fitrah (8 Asnaf)" },
  { value: "zakat_maal", label: "Zakat Maal (8 Asnaf)" },
  { value: "wakaf_hasil", label: "Hasil Wakaf Produktif" },
  { value: "qardhul_hasan", label: "Qardhul Hasan (Piutang)" },
];

const EXPENSE_CATEGORIES = [
  "Honor Pengurus / Marbot",
  "Honor Ustadz/Kajian",
  "Honor Imam Besar/Khatib",
  "Operasional Rutin (Listrik/Air)",
  "Pemeliharaan Gedung/AC/Audio",
  "Biaya Kegiatan / Ramadhan",
  "Infaq Masjid Lain",
  "Belanja Perlengkapan Ibadah",
  "Santunan Mustahik / Beasiswa",
] as const;

interface OutflowTabProps {
  mosqueId: string;
  onAddLedgerEntry: (entry: LedgerEntry) => void;
}

export default function OutflowTab({ mosqueId, onAddLedgerEntry }: OutflowTabProps) {
  const [outflowCategory, setOutflowCategory] = useState("Honor Ustadz/Kajian");
  const [outflowAmount, setOutflowAmount] = useState("");
  const [outflowRecipient, setOutflowRecipient] = useState("");
  const [outflowAmil, setOutflowAmil] = useState("H. Bendahara");
  const [outflowFundSource, setOutflowFundSource] = useState<FundType>("infaq_tidak_terikat");
  const [outflowNotes, setOutflowNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const amountNum = Number(outflowAmount);
    if (!outflowAmount || amountNum <= 0) return;

    if (!mosqueId) {
      setSubmitError("Data masjid belum tersedia. Coba refresh halaman.");
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0] ?? "";

      const created = await createTransaction({
        mosque_id: mosqueId,
        type: "Pengeluaran",
        category: outflowCategory,
        amount: amountNum,
        description: outflowNotes || null,
        recipient_name: outflowRecipient || null,
        notes: outflowNotes || null,
        transaction_date: today,
        fund_type: outflowFundSource,
      });

      const mapped: LedgerEntry = toLedgerEntry(created);
      onAddLedgerEntry(mapped);

      setOutflowCategory("Honor Ustadz/Kajian");
      setOutflowAmount("");
      setOutflowRecipient("");
      setOutflowAmil("H. Bendahara");
      setOutflowFundSource("infaq_tidak_terikat");
      setOutflowNotes("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
          <ArrowDownToLine className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Dana Keluar</h3>
          <p className="text-sm text-slate-500">Catat pengeluaran dan otorisasi pengurangan saldo kas masjid</p>
        </div>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Kategori Pengeluaran
              </label>
              <select
                value={outflowCategory}
                onChange={(e) => setOutflowCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jumlah (Rp)
              </label>
              <input
                type="number"
                placeholder="0"
                value={outflowAmount}
                onChange={(e) => setOutflowAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Pihak Penerima
              </label>
              <input
                type="text"
                placeholder="Nama penerima dana"
                value={outflowRecipient}
                onChange={(e) => setOutflowRecipient(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Petugas Verifikator
              </label>
              <input
                type="text"
                value={outflowAmil}
                onChange={(e) => setOutflowAmil(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Sumber Dana
              </label>
              <select
                value={outflowFundSource}
                onChange={(e) => setOutflowFundSource(e.target.value as FundType)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {FUND_SOURCES.map((fs) => (
                  <option key={fs.value} value={fs.value}>
                    {fs.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:col-span-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Keterangan / Catatan
          </label>
          <textarea
            rows={4}
            placeholder="Deskripsi pengeluaran (opsional)"
            value={outflowNotes}
            onChange={(e) => setOutflowNotes(e.target.value)}
            disabled={isSubmitting}
            className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><ArrowDownToLine className="h-4 w-4" /> Otorisasi & Kurangi Saldo Kas Masjid</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
