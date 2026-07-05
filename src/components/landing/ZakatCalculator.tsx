"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { Calculator, CheckCircle } from "lucide-react";
import { formatNominal } from "@/lib/format";

interface ZakatCalculatorProps {
  zakatFitrahAmount: number;
}

export function ZakatCalculator({ zakatFitrahAmount }: ZakatCalculatorProps) {
  const router = useRouter();
  const { setSelectedZakatTypePreset } = useAppContext();

  const [zakatType, setZakatType] = useState<string>("maal");
  const [assetValue, setAssetValue] = useState<string>("");
  const [fitrahCount, setFitrahCount] = useState<string>("1");
  const [calculationResult, setCalculationResult] = useState(0);

  useEffect(() => {
    const val = parseFloat(assetValue) || 0;
    if (zakatType === "maal" || zakatType === "profesi") {
      setCalculationResult(Math.round(val * 0.025));
    } else {
      const count = parseInt(fitrahCount) || 1;
      setCalculationResult(count * zakatFitrahAmount);
    }
  }, [zakatType, assetValue, fitrahCount, zakatFitrahAmount]);

  const handleQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculationResult > 0) {
      const typeLabel =
        zakatType === "maal"
          ? "Zakat Maal"
          : zakatType === "profesi"
            ? "Zakat Profesi"
            : "Zakat Fitrah";
      setSelectedZakatTypePreset(typeLabel);
      router.push(
        `/donasi?amount=${calculationResult}&type=${encodeURIComponent(typeLabel)}`,
      );
    }
  };

  return (
    <section className="bg-slate-50 py-16 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Hitung & Tunaikan Kewajiban Zakat Secara Akurat
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Zakat adalah instrumen pengurang kesenjangan ekonomi sosial umat yang wajib
            ditunaikan bagi yang memenuhi syarat (Nisab & Haul). Hitung estimasi kewajiban
            zakat Anda secara instan dalam 30 detik melalui widget kalkulator mandiri ini.
          </p>
          <div className="flex gap-4 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Sesuai Fatwa MUI
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Perhitungan Presisi
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
          <form onSubmit={handleQuickPay} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2.5">
                Pilih Jenis Zakat
              </label>
              <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-xl">
                {(["maal", "profesi", "fitrah"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setZakatType(type);
                      setAssetValue("");
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      zakatType === type
                        ? "bg-white text-emerald-800 shadow-xs font-bold"
                        : "text-gray-500 hover:text-emerald-700"
                    }`}
                  >
                    Zakat {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {zakatType === "fitrah" ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                  Jumlah Jiwa (Anggota Keluarga)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={fitrahCount}
                    onChange={(e) => setFitrahCount(e.target.value)}
                    placeholder="Contoh: 4"
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden py-3 px-4 rounded-xl text-sm font-semibold transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                    Jiwa
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                  {zakatType === "maal"
                    ? "Total Nilai Harta Simpanan (Emas/Tabungan)"
                    : "Total Pendapatan Bersih Bulanan"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 font-mono">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNominal(assetValue)}
                    onChange={(e) => setAssetValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="Masukkan nominal angka saja..."
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden py-3 pl-12 pr-4 rounded-xl text-sm font-mono font-semibold transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div className="bg-emerald-50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border border-emerald-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Estimasi Zakat Anda
                </p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-emerald-950 mt-0.5">
                  Rp {calculationResult.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                type="submit"
                disabled={calculationResult === 0}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-all ${
                  calculationResult > 0
                    ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/15 cursor-pointer"
                    : "bg-gray-200 text-gray-600 cursor-not-allowed"
                }`}
              >
                Bayar Zakat Sekarang
              </button>
            </div>

            <p className="text-[11px] text-gray-600 text-center leading-relaxed font-sans">
              *Nisab Zakat Maal setara 85g Emas (~Rp 85.000.000/tahun). Nisab Zakat Profesi
              setara 522kg beras (~Rp 6.800.000/bulan). Perhitungan ini adalah estimasi awal.
              Penyerahan zakat dijamin 100% masuk ke buku kas zakat terintegrasi.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
