"use client";

import React, { useState } from "react";
import { LedgerEntry } from "@/types";
import { Coins, CheckCircle2, Sparkles, Send, Loader2 } from "lucide-react";
import { createTransaction } from "@/lib/actions/transactions";
import { toLedgerEntry } from "@/lib/queries/admin";

const INFLOW_CATEGORIES = [
  "Kotak Amal Harian",
  "Kotak Amal Jumat",
  "Donasi Langsung / Tunai",
  "Zakat Fitrah Beras/Uang",
  "Zakat Maal (Tabungan/Emas)",
  "Infaq Program Anak Asuh",
  "Infaq Bank Infaq Syariah",
  "Wakaf Produktif Domba",
  "Wakaf Uang Masjid",
];

interface InflowTabProps {
  mosqueId: string;
  onAddLedgerEntry: (entry: LedgerEntry) => void;
}

export default function InflowTab({ mosqueId, onAddLedgerEntry }: InflowTabProps) {
  const [inflowCategory, setInflowCategory] = useState("Kotak Amal Jumat");
  const [inflowAmount, setInflowAmount] = useState("");
  const [inflowSource, setInflowSource] = useState("");
  const [inflowPhone, setInflowPhone] = useState("");
  const [inflowNotes, setInflowNotes] = useState("");
  const [simulatedWA, setSimulatedWA] = useState<{ open: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const amountNum = parseFloat(inflowAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (!mosqueId) {
      setSubmitError("Data masjid belum tersedia. Coba refresh halaman.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateNow = new Date();
      const dateStr = dateNow.toISOString().split("T")[0] || "";

      const created = await createTransaction({
        mosque_id: mosqueId,
        type: "Pemasukan",
        category: inflowCategory,
        amount: amountNum,
        description: inflowNotes || null,
        donor_name: inflowSource || null,
        phone: inflowPhone || null,
        notes: inflowNotes || null,
        transaction_date: dateStr,
      });

      const mapped: LedgerEntry = toLedgerEntry(created);
      onAddLedgerEntry(mapped);

      if (inflowPhone) {
        const donor = inflowSource || "Hamba Allah";
        const waText = `*KWITANSI DIGITAL MASJID AT-TAQWA ULUJAMI*\n----------------------------------------\nJazakumullah Khairan Katsiran.\nTelah diterima dana ZISWAF:\n\n• *Donatur*: ${donor}\n• *Kategori*: ${inflowCategory}\n• *Nominal*: Rp ${amountNum.toLocaleString("id-ID")}\n• *Tanggal*: ${dateStr}\n• *Keterangan*: ${inflowNotes || "Infaq Masjid"}\n\nSemoga menjadi pembersih harta dan bernilai pahala melimpah di sisi Allah SWT. Aamiin.\n\n_Sistem Keuangan At-Taqwa Modern_`;
        setSimulatedWA({ open: true, text: waText });
      }

      setInflowAmount("");
      setInflowSource("");
      setInflowPhone("");
      setInflowNotes("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-outline pb-3">
          <h3 className="font-display font-bold text-xl text-primary-deep flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-primary" />
            Catat Penerimaan Dana (Inflow)
          </h3>
          <p className="text-xs text-muted mt-1">Gunakan formulir ini untuk mencatat uang masuk dari kotak amal, donasi, zakat, atau wakaf.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs">
          <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <span className="font-bold text-amber-800">Catat bukti transaksi:</span>{" "}
            <span className="text-amber-700">Simpan foto kwitansi/bukti transfer di arsip masjid dan catat nomor referensi pada kolom keterangan.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Sumber / Kategori Penerimaan</label>
              <select
                value={inflowCategory}
                onChange={(e) => setInflowCategory(e.target.value)}
                className={inputClass}
                disabled={isSubmitting}
              >
                {INFLOW_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Jumlah Rupiah (Nominal)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted">Rp</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={inflowAmount}
                  onChange={(e) => setInflowAmount(e.target.value)}
                  placeholder="Masukkan nominal saja..."
                  disabled={isSubmitting}
                  className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 pl-9 pr-4 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Nama Donatur / Muzakki</label>
              <input
                type="text"
                value={inflowSource}
                onChange={(e) => setInflowSource(e.target.value)}
                placeholder="Contoh: H. Salman / Hamba Allah"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">No. WhatsApp (Simulasi Kwitansi WA)</label>
              <input
                type="tel"
                value={inflowPhone}
                onChange={(e) => setInflowPhone(e.target.value)}
                placeholder="Masukkan no WA untuk kirim kwitansi..."
                disabled={isSubmitting}
                className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Keterangan / Catatan Tambahan</label>
            <textarea
              rows={2}
              value={inflowNotes}
              onChange={(e) => setInflowNotes(e.target.value)}
              placeholder="Keterangan peruntukan atau detail transfer..."
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-deep active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Verifikasi & Simpan Penerimaan Kas</>
            )}
          </button>
        </form>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-success-subtle border border-primary/20 rounded-2xl p-6 space-y-3">
          <h4 className="font-display font-extrabold text-primary-deep text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary animate-bounce" />
            Fitur Integrasi Kwitansi WA
          </h4>
          <p className="text-xs text-primary leading-relaxed font-medium">
            Sistem secara cerdas menyimulasikan pengiriman slip kwitansi penerimaan dana ZISWAF langsung ke WhatsApp Donatur. Silakan isi input No. WhatsApp di sebelah untuk mencoba.
          </p>
        </div>

        {simulatedWA && (
          <div className="bg-[#e5ddd5] rounded-2xl p-4 shadow-md border border-outline font-sans space-y-3 relative max-w-sm mx-auto animate-slide-up">
            <div className="bg-[#075e54] text-white p-3 rounded-t-xl -mx-4 -mt-4 flex justify-between items-center shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#075e54] font-bold text-xs shrink-0">
                  🕌
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">Sekretariat At-Taqwa</h5>
                  <p className="text-[10px] text-emerald-200 leading-none">Online</p>
                </div>
              </div>
              <button
                onClick={() => setSimulatedWA(null)}
                className="text-emerald-200 hover:text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="bg-[#dcf8c6] text-ink p-3 rounded-lg text-xs leading-relaxed font-mono whitespace-pre-wrap shadow-xs relative">
              {simulatedWA.text}
              <span className="absolute bottom-1 right-2 text-[10px] text-muted">
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} ✓✓
              </span>
            </div>

            <div className="flex gap-2 justify-center pt-1">
              <span className="text-[10px] text-muted font-semibold flex items-center gap-1">
                <Send className="w-3 h-3" /> Kwitansi Sukses Terkirim (Simulasi)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
