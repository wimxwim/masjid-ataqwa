"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, AlertCircle, ShieldCheck, Heart,
  Coins, Wallet, Landmark, ArrowRight, CreditCard, Info
} from "lucide-react";
import { useAppContext } from "@/stores/app-context";
import { useDefaultMosque } from "@/lib/queries/public";
import { createDonation } from "@/lib/actions/donations";
import { Turnstile } from "@marsidev/react-turnstile";
import { formatNominal } from "@/lib/format";
import { loadSnapScript, snapPay } from "@/lib/midtrans";

interface ZakatPageProps {
  initialSelectedType?: string;
}

export default function ZakatPage({ initialSelectedType }: ZakatPageProps) {
  const router = useRouter();
  const { triggerToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<"mal" | "profesi" | "infaq">("mal");

  useEffect(() => {
    if (initialSelectedType) {
      if (initialSelectedType.toLowerCase().includes("profesi")) {
        setActiveTab("profesi");
      } else if (initialSelectedType.toLowerCase().includes("fitrah") || initialSelectedType.toLowerCase().includes("sedekah") || initialSelectedType.toLowerCase().includes("infaq")) {
        setActiveTab("infaq");
      } else {
        setActiveTab("mal");
      }
    }
  }, [initialSelectedType]);

  const { data: mosque } = useDefaultMosque();
  const mosqueId = mosque?.id ?? "";
  const mosqueConfig = (mosque?.config ?? {}) as Record<string, unknown>;

  const [malGold, setMalGold] = useState<string>("");
  const [malCash, setMalCash] = useState<string>("");
  const [malStocks, setMalStocks] = useState<string>("");
  const [malDebts, setMalDebts] = useState<string>("");
  const [malTotal, setMalTotal] = useState<number>(0);
  const malNisab = (mosqueConfig.zakat_maal_nisab as number) ?? 85000000;
  const [malIsObligatory, setMalIsObligatory] = useState<boolean>(false);
  const [malZakat, setMalZakat] = useState<number>(0);

  const [profMonthlySalary, setProfMonthlySalary] = useState<string>("");
  const [profOtherIncome, setProfOtherIncome] = useState<string>("");
  const [profTotal, setProfTotal] = useState<number>(0);
  const profNisab = (mosqueConfig.zakat_profesi_nisab as number) ?? 6824000;
  const [profIsObligatory, setProfIsObligatory] = useState<boolean>(false);
  const [profZakat, setProfZakat] = useState<number>(0);

  const [infaqAmount, setInfaqAmount] = useState<number>(100000);
  const [infaqCustomAmount, setInfaqCustomAmount] = useState<string>("");
  const [infaqContributor, setInfaqContributor] = useState<string>("");
  const [infaqIsAnonymous, setInfaqIsAnonymous] = useState<boolean>(false);
  const [infaqProgram, setInfaqProgram] = useState<string>("Bank Infaq Qardhul Hasan");

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<"summary" | "processing" | "success">("summary");
  const [paymentMethod, setPaymentMethod] = useState<string>("qris");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentProgramName, setPaymentProgramName] = useState<string>("");
  const [contributorName, setContributorName] = useState<string>("Hamba Allah");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  useEffect(() => {
    const gold = parseFloat(malGold) || 0;
    const cash = parseFloat(malCash) || 0;
    const stocks = parseFloat(malStocks) || 0;
    const debts = parseFloat(malDebts) || 0;

    const netAssets = (gold + cash + stocks) - debts;
    const finalNet = netAssets > 0 ? netAssets : 0;
    setMalTotal(finalNet);

    if (finalNet >= malNisab) {
      setMalIsObligatory(true);
      setMalZakat(Math.round(finalNet * 0.025));
    } else {
      setMalIsObligatory(false);
      setMalZakat(0);
    }
  }, [malGold, malCash, malStocks, malDebts, malNisab]);

  useEffect(() => {
    const salary = parseFloat(profMonthlySalary) || 0;
    const other = parseFloat(profOtherIncome) || 0;
    const total = salary + other;
    setProfTotal(total);

    if (total >= profNisab) {
      setProfIsObligatory(true);
      setProfZakat(Math.round(total * 0.025));
    } else {
      setProfIsObligatory(false);
      setProfZakat(0);
    }
  }, [profMonthlySalary, profOtherIncome, profNisab]);

  const handleOpenPayment = (amount: number, program: string, defaultName?: string) => {
    setPaymentAmount(amount);
    setPaymentProgramName(program);
    setContributorName(infaqIsAnonymous ? "Hamba Allah" : defaultName || "Muzakki");
    setTurnstileToken(""); // Reset token on open
    setPaymentStep("summary");
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!turnstileToken) {
      triggerToast("Verifikasi Gagal", "Mohon tunggu kotak captcha selesai memverifikasi Anda.");
      return;
    }
    setPaymentStep("processing");

    const akadMap: Record<string, "zakat_fitrah" | "zakat_mal" | "infaq" | "sedekah" | "wakaf" | "fidyah"> = {
      "Zakat Maal": "zakat_mal",
      "Zakat Profesi": "zakat_mal",
      "Bank Infaq Qardhul Hasan": "infaq",
      "Wakaf Domba Produktif": "wakaf",
      "Beasiswa Anak Asuh": "infaq",
      "Infaq Operasional Masjid": "infaq",
    };

    if (mosqueId && paymentAmount > 0) {
      try {
        const row = await createDonation({
          mosque_id: mosqueId,
          donor_name: contributorName === "Hamba Allah" ? null : contributorName,
          amount: paymentAmount,
          akad_type: akadMap[paymentProgramName] ?? "infaq",
          program_name: paymentProgramName,
          payment_method: paymentMethod === "bsi" ? "transfer" : "qris",
          payment_status: "pending",
          cf_turnstile_response: turnstileToken,
        });

        const tokenRes = await fetch("/api/midtrans/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: `donation-${row.id}`,
            gross_amount: paymentAmount,
            donor_name: contributorName === "Hamba Allah" ? null : contributorName,
            akad_type: akadMap[paymentProgramName] ?? "infaq",
          }),
        });

        if (!tokenRes.ok) {
          throw new Error("Gagal mendapatkan token pembayaran");
        }

        const { token } = await tokenRes.json();

        await loadSnapScript();

        snapPay(token, {
          onSuccess: () => {
            router.push(`/payment/success?order_id=${row.id}`);
          },
          onPending: () => {
            router.push(`/payment/pending?order_id=${row.id}`);
          },
          onError: () => {
            triggerToast("Pembayaran Gagal", "Transaksi dibatalkan. Silakan coba lagi.");
            setPaymentStep("summary");
          },
          onClose: () => {
            setPaymentStep("summary");
          },
        });
      } catch (e: any) {
        triggerToast("Gagal", e.message || "Gagal memproses donasi");
        setPaymentStep("summary");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12" id="zakat-calculator-page">

      <div className="text-center space-y-3 pt-6">
        <h1 className="text-4xl font-display font-extrabold text-ink tracking-tight">
          Kalkulator Zakat At-Taqwa
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-sm sm:text-base">
          Tunaikan rukun Islam ke-3 dengan presisi. Sistem menghitung otomatis nilai nishab real-time sesuai kaidah fiqih kontemporer.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="flex bg-gray-100 p-1 rounded-2xl max-w-lg w-full">
          <button
            onClick={() => setActiveTab("mal")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "mal" ? "bg-surface text-primary shadow-md" : "text-muted hover:text-emerald-700"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Zakat Mal
          </button>
          <button
            onClick={() => setActiveTab("profesi")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "profesi" ? "bg-surface text-primary shadow-md" : "text-muted hover:text-emerald-700"
            }`}
          >
            <Coins className="w-4 h-4" />
            Zakat Profesi
          </button>
          <button
            onClick={() => setActiveTab("infaq")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "infaq" ? "bg-surface text-primary shadow-md" : "text-muted hover:text-emerald-700"
            }`}
          >
            <Heart className="w-4 h-4" />
            Infaq & Sedekah
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline shadow-lg p-6 sm:p-8">
          {activeTab === "mal" && (
            <div className="space-y-6">
              <div className="border-b border-outline pb-4">
                <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Kalkulator Zakat Mal (Harta Kekayaan)
                </h3>
                <p className="text-xs text-muted mt-1">Zakat atas simpanan emas, perak, tabungan, deposito, atau investasi yang mengendap 1 tahun.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Nilai Emas / Perak Fisik yang Disimpan</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(malGold)}
                      onChange={(e) => setMalGold(e.target.value.replace(/\D/g, ""))}
                      placeholder="Masukkan nominal angka..."
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Saldo Tabungan / Deposito / Bank Rekening</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(malCash)}
                      onChange={(e) => setMalCash(e.target.value.replace(/\D/g, ""))}
                      placeholder="Masukkan nominal angka..."
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Investasi / Saham / Reksa Dana / Surat Berharga</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(malStocks)}
                      onChange={(e) => setMalStocks(e.target.value.replace(/\D/g, ""))}
                      placeholder="Masukkan nominal angka..."
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Utang Jatuh Tempo / Cicilan Bulanan (Pengurang Harta)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(malDebts)}
                      onChange={(e) => setMalDebts(e.target.value.replace(/\D/g, ""))}
                      placeholder="Masukkan nominal angka..."
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profesi" && (
            <div className="space-y-6">
              <div className="border-b border-outline pb-4">
                <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  Kalkulator Zakat Profesi (Pendapatan Bulanan)
                </h3>
                <p className="text-xs text-muted mt-1">Zakat atas pendapatan gaji, komisi, royalty, atau honorarium bulanan.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Gaji Pokok Bersih Bulanan</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(profMonthlySalary)}
                      onChange={(e) => setProfMonthlySalary(e.target.value.replace(/\D/g, ""))}
                      placeholder="Contoh: 10000000"
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Tunjangan / Bonus / Pendapatan Lain Bulanan</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNominal(profOtherIncome)}
                      onChange={(e) => setProfOtherIncome(e.target.value.replace(/\D/g, ""))}
                      placeholder="Contoh: 1500000"
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "infaq" && (
            <div className="space-y-6">
              <div className="border-b border-outline pb-4">
                <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Formulir Infaq & Sedekah
                </h3>
                <p className="text-xs text-muted mt-1">Donasikan infaq terbaik Anda demi memakmurkan program pemberdayaan ekonomi umat.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-2">Pilih Nominal Infaq</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[25000, 50000, 100000, 250000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setInfaqAmount(amt);
                          setInfaqCustomAmount("");
                        }}
                        className={`py-3 px-4 border rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
                          infaqAmount === amt && infaqCustomAmount === ""
                            ? "bg-primary text-white border-primary shadow-md"
                            : "bg-surface hover:bg-gray-50 text-muted border-outline"
                        }`}
                      >
                        Rp {amt.toLocaleString("id-ID")}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setInfaqAmount(0);
                        setInfaqCustomAmount("1000000");
                      }}
                      className={`py-3 px-4 border rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        infaqAmount === 0
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-surface hover:bg-gray-50 text-muted border-outline"
                      }`}
                    >
                      Nominal Kustom
                    </button>
                  </div>
                </div>

                {infaqAmount === 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Masukkan Nominal Kustom</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        min="5000"
                        value={formatNominal(infaqCustomAmount)}
                        onChange={(e) => setInfaqCustomAmount(e.target.value.replace(/\D/g, ""))}
                        placeholder="Contoh: 1000000"
                        className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Salurkan untuk Program</label>
                  <select
                    value={infaqProgram}
                    onChange={(e) => setInfaqProgram(e.target.value)}
                    className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 px-4 rounded-xl text-sm transition-colors font-medium text-ink"
                  >
                    <option value="Bank Infaq Qardhul Hasan">Bank Infaq Qardhul Hasan (UMKM)</option>
                    <option value="Wakaf Domba Produktif">Wakaf Domba Produktif (Ekonomi Masjid)</option>
                    <option value="Beasiswa Anak Asuh">Beasiswa Pendidikan Anak Yatim & Dhuafa</option>
                    <option value="Infaq Operasional Masjid">Infaq Umum & Operasional Masjid</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className={infaqIsAnonymous ? "opacity-50 pointer-events-none" : ""}>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Nama Lengkap Anda (Muzakki)</label>
                    <input
                      type="text"
                      disabled={infaqIsAnonymous}
                      value={infaqContributor}
                      onChange={(e) => setInfaqContributor(e.target.value)}
                      placeholder="Masukkan nama lengkap..."
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 px-4 rounded-xl text-sm transition-colors"
                    />
                  </div>

                  <div className="pb-3 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={infaqIsAnonymous}
                        onChange={(e) => setInfaqIsAnonymous(e.target.checked)}
                        className="w-4.5 h-4.5 accent-primary rounded border-gray-300"
                      />
                      <span className="text-xs font-semibold text-ink">Donasikan sebagai Hamba Allah</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">

          <div className="bg-surface rounded-2xl border border-outline shadow-lg overflow-hidden">
            <div className="bg-ink text-white p-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-xl pointer-events-none" />
              <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest font-mono">Ringkasan Kewajiban</p>
              <h3 className="font-display font-bold text-xl mt-1 text-white">Lembar Perhitungan</h3>
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "mal" && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-medium">Harta Terdaftar</span>
                    <span className="font-mono font-bold text-ink">Rp {malTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-medium">Batas Nishab (85g Emas)</span>
                    <span className="font-mono text-muted">Rp {malNisab.toLocaleString("id-ID")}</span>
                  </div>
                  <hr className="border-outline" />

                  <div className={`p-4 rounded-xl flex gap-3 border ${
                    malIsObligatory
                      ? "bg-success-subtle text-primary border-primary/20"
                      : "bg-accent/10 text-accent border-accent/20"
                  }`}>
                    {malIsObligatory ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs">Wajib Zakat Maal</h4>
                          <p className="text-[11px] leading-relaxed mt-0.5">Total harta simpanan Anda sudah melampaui batas nisab wajib zakat emas.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs">Belum Wajib Zakat</h4>
                          <p className="text-[11px] leading-relaxed mt-0.5">Harta Anda masih berada di bawah batas nisab emas. Anda dianjurkan berinfaq biasa.</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-bg rounded-xl p-5 border border-outline text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Kewajiban Zakat Maal (2.5%)</p>
                    <p className="text-3xl font-mono font-extrabold text-ink">
                      Rp {malZakat.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenPayment(malZakat, "Zakat Maal", "Muzakki Zakat Mal")}
                    disabled={malZakat === 0}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 ${
                      malZakat > 0
                        ? "bg-primary hover:bg-primary-deep text-white shadow-primary/10 cursor-pointer"
                        : "bg-gray-100 text-muted cursor-not-allowed"
                    }`}
                  >
                    Tunaikan Zakat Maal Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTab === "profesi" && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-medium">Pendapatan Bulanan</span>
                    <span className="font-mono font-bold text-ink">Rp {profTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-medium">Nishab Bulanan (522kg Beras)</span>
                    <span className="font-mono text-muted">Rp {profNisab.toLocaleString("id-ID")}</span>
                  </div>
                  <hr className="border-outline" />

                  <div className={`p-4 rounded-xl flex gap-3 border ${
                    profIsObligatory
                      ? "bg-success-subtle text-primary border-primary/20"
                      : "bg-accent/10 text-accent border-accent/20"
                  }`}>
                    {profIsObligatory ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs">Wajib Zakat Profesi</h4>
                          <p className="text-[11px] leading-relaxed mt-0.5">Pendapatan kotor bulanan Anda sudah melampaui batas nishab setara beras.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs">Belum Wajib Zakat</h4>
                          <p className="text-[11px] leading-relaxed mt-0.5">Pendapatan bulanan belum mencapai nisab. Kami sarankan mengalirkan infaq sukarela.</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-bg rounded-xl p-5 border border-outline text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Kewajiban Zakat Bulanan (2.5%)</p>
                    <p className="text-3xl font-mono font-extrabold text-ink">
                      Rp {profZakat.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenPayment(profZakat, "Zakat Profesi", "Muzakki Zakat Profesi")}
                    disabled={profZakat === 0}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 ${
                      profZakat > 0
                        ? "bg-primary hover:bg-primary-deep text-white shadow-primary/10 cursor-pointer"
                        : "bg-gray-100 text-muted cursor-not-allowed"
                    }`}
                  >
                    Tunaikan Zakat Bulanan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTab === "infaq" && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-medium">Program Tujuan</span>
                    <span className="font-semibold text-ink text-right">{infaqProgram}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-medium">Pemberi Sedekah</span>
                    <span className="font-semibold text-ink">{infaqIsAnonymous ? "Hamba Allah" : infaqContributor || "Donatur"}</span>
                  </div>
                  <hr className="border-outline" />

                  <div className="bg-bg rounded-xl p-5 border border-outline text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Jumlah Nilai Infaq</p>
                    <p className="text-3xl font-mono font-extrabold text-ink">
                      Rp {((infaqAmount === 0 ? parseFloat(infaqCustomAmount) : infaqAmount) || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const finalInfaqVal = (infaqAmount === 0 ? parseFloat(infaqCustomAmount) : infaqAmount) || 0;
                      handleOpenPayment(finalInfaqVal, infaqProgram, infaqContributor);
                    }}
                    disabled={((infaqAmount === 0 ? parseFloat(infaqCustomAmount) : infaqAmount) || 0) < 5000}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 ${
                      ((infaqAmount === 0 ? parseFloat(infaqCustomAmount) : infaqAmount) || 0) >= 5000
                        ? "bg-primary hover:bg-primary-deep text-white shadow-primary/10 cursor-pointer"
                        : "bg-gray-100 text-muted cursor-not-allowed"
                    }`}
                  >
                    Salurkan Infaq Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-accent/10 rounded-2xl border border-accent/20 p-6 flex gap-4">
            <Info className="w-6 h-6 text-accent shrink-0" />
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-sm text-amber-950">Apa itu Nisab & Haul?</h4>
              <p className="text-xs text-accent/80 leading-relaxed font-sans">
                <b>Nisab</b> adalah batas minimum kepemilikan harta agar diwajibkan zakat (sebesar 85 gram emas atau setara untuk zakat maal). <b>Haul</b> adalah jangka waktu kepemilikan harta mengendap selama 1 tahun qamariyah.
              </p>
            </div>
          </div>

        </div>

      </div>

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-outline max-w-md w-full overflow-hidden animate-scale-up">

            <div className="bg-emerald-950 text-white px-6 py-4 flex justify-between items-center border-b border-emerald-900">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span className="font-display font-bold text-sm">Gerbang Amanah ZISWAF</span>
              </div>
              {paymentStep !== "processing" && (
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="text-emerald-300 hover:text-white font-bold"
                >
                  Tutup
                </button>
              )}
            </div>

            {paymentStep === "summary" && (
              <div className="p-6 space-y-6">
                <div className="text-center space-y-1.5">
                  <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Pembayaran Anda</p>
                  <p className="text-3xl font-mono font-black text-primary-deep">
                    Rp {paymentAmount.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="bg-bg border border-outline rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-muted">Muzakki / Donatur:</span>
                    <span className="font-semibold text-ink">{contributorName || "Hamba Allah"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Program Tujuan:</span>
                    <span className="font-semibold text-ink text-right">{paymentProgramName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status Pajak:</span>
                    <span className="text-primary font-semibold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Sertifikasi Syariah</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted">Pilih Metode Pembayaran</label>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setPaymentMethod("qris")}
                      type="button"
                      className={`flex items-center justify-between p-3 border rounded-xl text-left transition-all ${
                        paymentMethod === "qris"
                          ? "bg-success-subtle/50 border-primary shadow-xs"
                          : "bg-surface border-outline hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs font-bold text-ink">QRIS Instan (Gopay / ShopeePay / OVO)</p>
                          <p className="text-[10px] text-muted">Verifikasi instan, scan langsung sukses</p>
                        </div>
                      </div>
                      <span className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        {paymentMethod === "qris" && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("bsi")}
                      type="button"
                      className={`flex items-center justify-between p-3 border rounded-xl text-left transition-all ${
                        paymentMethod === "bsi"
                          ? "bg-success-subtle/50 border-primary shadow-xs"
                          : "bg-surface border-outline hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Landmark className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs font-bold text-ink">Bank Syariah Indonesia (BSI) VA</p>
                          <p className="text-[10px] text-muted">Kode Virtual Account: 451881XXXXXXXX</p>
                        </div>
                      </div>
                      <span className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        {paymentMethod === "bsi" && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={!turnstileToken}
                  className="w-full bg-primary hover:bg-primary-deep disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Konfirmasi & Bayar Sekarang
                </button>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="p-12 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-lg text-ink">Menghubungkan ke Gerbang Syariah</h4>
                  <p className="text-xs text-muted">Mohon tunggu beberapa detik, transaksi Anda sedang diverifikasi secara real-time...</p>
                </div>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="p-8 text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-primary rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-primary-deep">Tunaikan Sempurna!</h3>
                  <p className="text-sm text-muted">
                    Alhamdulillah, dana sebesar <b className="text-primary font-mono">Rp {paymentAmount.toLocaleString("id-ID")}</b> telah berhasil diterima di rekening yayasan Masjid At-Taqwa.
                  </p>
                  <p className="text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg p-2.5 font-sans leading-relaxed">
                    "Semoga Allah memberikan pahala atas harta yang telah diserahkan, menjadikannya pembersih diri, dan melimpahkan keberkahan pada sisa harta Anda." (Doa Amil)
                  </p>
                </div>

                <div className="bg-bg border border-outline rounded-xl p-3 text-xs font-mono text-muted text-left space-y-1">
                  <div>ID Transaksi: ATQ-{Math.floor(Math.random() * 900000 + 100000)}</div>
                  <div>Metode: {paymentMethod.toUpperCase()} - Terverifikasi</div>
                  <div>Program: {paymentProgramName}</div>
                </div>

                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="w-full bg-ink hover:bg-primary-deep text-white font-bold py-3 rounded-xl text-xs transition-all"
                >
                  Kembali ke Halaman Zakat
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
