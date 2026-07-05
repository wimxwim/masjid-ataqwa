"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { Calculator, CheckCircle } from "lucide-react";
import { formatNominal } from "@/lib/format";
import {
  GlassCard,
  IslamicDivider,
  SectionHeader,
  SectionShell,
} from "@/components/design-system";

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
    <SectionShell id="kalkulator-zakat" className="bg-bg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center reveal">
        {/* Left: copy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-glow">
            <Calculator className="w-6 h-6" />
          </div>

          <SectionHeader
            eyebrow="Kewajiban Umat"
            title="Hitung & Tunaikan Kewajiban Zakat Secara Akurat"
            description="Zakat adalah instrumen pengurang kesenjangan ekonomi sosial umat yang wajib ditunaikan bagi yang memenuhi syarat (Nisab & Haul). Hitung estimasi kewajiban zakat Anda dalam 30 detik."
            size="large"
          />

          <div className="flex flex-col sm:flex-row gap-3 text-xs font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Sesuai Fatwa
              MUI
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Perhitungan
              Presisi
            </span>
          </div>

          <IslamicDivider className="max-w-xs" />
        </div>

        {/* Right: form card */}
        <div className="lg:col-span-7">
          <GlassCard variant="strong" rounded="3xl" className="p-6 sm:p-8">
            <form onSubmit={handleQuickPay} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2.5">
                  Pilih Jenis Zakat
                </label>
                <div className="glass p-1 rounded-xl">
                  {(["maal", "profesi", "fitrah"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setZakatType(type);
                        setAssetValue("");
                      }}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                        zakatType === type
                          ? "bg-surface text-emerald-800 shadow-glow font-bold"
                          : "text-muted hover:text-emerald-700"
                      }`}
                    >
                      Zakat {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {zakatType === "fitrah" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Jumlah Jiwa (Anggota Keluarga)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={fitrahCount}
                      onChange={(e) => setFitrahCount(e.target.value)}
                      placeholder="Contoh: 4"
                      className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-1"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
                      Jiwa
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    {zakatType === "maal"
                      ? "Total Nilai Harta Simpanan (Emas/Tabungan)"
                      : "Total Pendapatan Bersih Bulanan"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(assetValue)}
                      onChange={(e) =>
                        setAssetValue(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Masukkan nominal angka saja..."
                      className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-3 pl-12 pr-4 rounded-xl text-sm font-mono font-semibold transition-all shadow-1"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="glass border border-accent/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-100 tracking-wider">
                    Estimasi Zakat Anda
                  </p>
                  <p className="text-xl sm:text-2xl font-mono font-black text-ink mt-0.5">
                    Rp {calculationResult.toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={calculationResult === 0}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${
                    calculationResult > 0
                      ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/15 hover:shadow-glow cursor-pointer"
                      : "bg-gray-200 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Bayar Zakat Sekarang
                </button>
              </div>

              <p className="text-[11px] text-muted text-center leading-relaxed font-sans">
                *Nisab Zakat Maal setara 85g Emas (~Rp 85.000.000/tahun). Nisab
                Zakat Profesi setara 522kg beras (~Rp 6.800.000/bulan).
                Perhitungan ini adalah estimasi awal. Penyerahan zakat dijamin
                100% masuk ke buku kas zakat terintegrasi.
              </p>
            </form>
          </GlassCard>
        </div>
      </div>
    </SectionShell>
  );
}
