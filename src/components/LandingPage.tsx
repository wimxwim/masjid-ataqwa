"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppContext } from "@/stores/app-context";
import LiveActivityFeed from "./LiveActivityFeed";
import { 
  ArrowRight, Coins, Heart, Calculator, 
  TrendingUp, Users, CheckCircle, ArrowDownToLine, Handshake, Sprout, Landmark
} from "lucide-react";
import type { HeroStats, ProgramProgress } from "@/types";
import { usePublicData } from "@/lib/queries/public";

const FUND_LABEL: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_maal: "Zakat Maal",
  infaq_terikat: "Infaq Terikat",
  infaq_tidak_terikat: "Infaq Tidak Terikat",
  wakaf_pokok: "Wakaf Pokok",
  wakaf_hasil: "Wakaf Hasil",
  qardhul_hasan: "Qardhul Hasan",
  non_halal: "Non Halal",
};

const FUND_COLOR: Record<string, string> = {
  zakat_fitrah: "bg-emerald-700",
  zakat_maal: "bg-emerald-500",
  infaq_terikat: "bg-amber-600",
  infaq_tidak_terikat: "bg-amber-400",
  wakaf_pokok: "bg-blue-600",
  wakaf_hasil: "bg-blue-400",
  qardhul_hasan: "bg-indigo-500",
  non_halal: "bg-red-500",
};

export default function LandingPage() {
  const router = useRouter();
  const { setSelectedZakatTypePreset } = useAppContext();

  const { data: apiData } = usePublicData();

  const mosque = apiData?.mosque ?? null;
  const stats = apiData?.stats ?? null;
  const featuredPrograms: Record<string, unknown>[] = apiData?.featuredPrograms ?? [];
  const allTransactions: Record<string, unknown>[] = apiData?.transactions ?? [];
  const fundBreakdown: { fund_type: string; total: number }[] = apiData?.fundBreakdown ?? [];

  const heroStats: HeroStats = {
    totalTerkumpul: stats?.totalDonations ?? 0,
    totalMustahikKK: stats?.mustahikCount ?? 0,
    terbantuBulanIni: 0,
    danaTersalurkan: stats?.totalExpense ?? 0,
    affilasiAktif: 0,
    produkTerjual: 0,
    unitUsaha: 0,
    profitKembaliUmat: 0,
    penerimaManfaatJiwa: 0,
    pendidikanAnak: 0,
    umkmBina: 0,
    totalSaldoKas: stats?.balance ?? 0,
    kenaikanSaldoPersen: 0,
    totalPemasukan: stats?.totalIncome ?? 0,
    totalPengeluaran: stats?.totalExpense ?? 0,
  };

  const programProgress: ProgramProgress[] = featuredPrograms.map((p) => {
    const prog = p as { id: string; name: string; slug: string; config: Record<string, unknown> | null };
    const cfg = prog.config as { icon?: string; color?: string; target_beneficiaries?: number; target_budget?: number } | null;
    return {
      id: prog.id,
      name: prog.name,
      slug: prog.slug,
      icon: cfg?.icon ?? "quran",
      current: 0,
      target: cfg?.target_budget ?? 0,
      unit: cfg?.target_budget ? "Rp" : "",
      penerima: cfg?.target_beneficiaries ?? 0,
    };
  });

  // Simple Zakat Quick Calculator State
  const [zakatType, setZakatType] = useState<string>("maal");
  const [assetValue, setAssetValue] = useState<string>("");
  const [fitrahCount, setFitrahCount] = useState<string>("1");
  const [calculationResult, setCalculationResult] = useState<number>(0);

  const zakatFitrahAmount = (mosque?.config as { zakat_fitrah_amount?: number } | null)?.zakat_fitrah_amount ?? 45000;

  // Auto calculate based on input changes
  React.useEffect(() => {
    const val = parseFloat(assetValue) || 0;
    if (zakatType === "maal" || zakatType === "profesi") {
      setCalculationResult(Math.round(val * 0.025));
    } else {
      const count = parseInt(fitrahCount) || 1;
      setCalculationResult(count * zakatFitrahAmount);
    }
  }, [zakatType, assetValue, fitrahCount, zakatFitrahAmount]);

  const handleDonateClick = () => {
    setSelectedZakatTypePreset("Sedekah");
    router.push("/donasi");
  };

  const handleQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculationResult > 0) {
      const typeLabel = zakatType === "maal" ? "Zakat Maal" : zakatType === "profesi" ? "Zakat Profesi" : "Zakat Fitrah";
      setSelectedZakatTypePreset(typeLabel);
      router.push(`/donasi?amount=${calculationResult}&type=${encodeURIComponent(typeLabel)}`);
    }
  };

  const bulanIni = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // Recent donations from live transactions (top 5 inflow)
  const recentDonations = allTransactions
    .filter((e: Record<string, unknown>) => e.type === "Pemasukan")
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => String(b.transaction_date).localeCompare(String(a.transaction_date)))
    .slice(0, 5)
    .map((e: Record<string, unknown>) => ({
      id: String(e.id),
      tanggal: String(e.transaction_date),
      donatur: String(e.donor_name ?? ""),
      program: String(e.category ?? ""),
      jumlah: Number(e.amount),
      status: "Berhasil" as const,
    }));

  return (
    <div className="space-y-16 pb-16" id="landing-page-container">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-radial from-emerald-950 via-emerald-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text and CTAs */}
          <div className="lg:col-span-7 space-y-6 lg:text-left text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Platform Masjid Modern Terintegrasi v2.0
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Membangun Peradaban Mulai dari <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Masjid Jami' At-Taqwa</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/80 max-w-2xl mx-auto lg:mx-0 font-sans leading-relaxed">
              Menghubungkan kebaikan muzakki, mengelola amanah dengan transparansi mutlak, dan memberdayakan mustahik menuju kemandirian ekonomi yang berkelanjutan di lingkungan Ulujami.
            </p>

            <div className="flex flex-col sm:flex-row lg:justify-start justify-center items-center gap-4 pt-2">
              <button
                onClick={handleDonateClick}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-slate-950" />
                Donasi Sekarang
              </button>
              <button
                onClick={() => {
                  const sec = document.getElementById("core-programs");
                  sec?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto bg-emerald-800/60 hover:bg-emerald-800/90 active:scale-95 border border-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
              >
                Lihat Program Unggulan
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Stunning Mosque Dome Sunset Image */}
          <div className="lg:col-span-5 relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-500/20 shadow-emerald-950/50">
            <Image
              src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80"
              alt="At-Taqwa Mosque Dome"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/60 backdrop-blur-xs p-3 rounded-xl border border-slate-700/50">
              <p className="text-white font-semibold text-xs sm:text-sm">Masjid At-Taqwa Ulujami</p>
              <p className="text-slate-300 text-[10px] mt-0.5">Membangun tatanan ekonomi masyarakat madani yang sejahtera.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Impact Stats Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y-2 lg:divide-y-0 lg:divide-x divide-gray-100">
          
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 tracking-tight">
                {heroStats.totalTerkumpul > 0
                  ? `Rp ${heroStats.totalTerkumpul.toLocaleString("id-ID")}`
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 font-medium">Terkumpul Tahun Ini</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 pt-6 lg:pt-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 tracking-tight">
                {heroStats.totalMustahikKK > 0
                  ? heroStats.totalMustahikKK.toLocaleString("id-ID")
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 font-medium">KK Mustahik Terlayani</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 pt-6 lg:pt-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 tracking-tight">
                {heroStats.terbantuBulanIni > 0
                  ? heroStats.terbantuBulanIni.toLocaleString("id-ID")
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 font-medium">Terbantu Bulan Ini</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 pt-6 lg:pt-2">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 tracking-tight">
                {heroStats.danaTersalurkan > 0
                  ? `Rp ${heroStats.danaTersalurkan.toLocaleString("id-ID")}`
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 font-medium">Dana ZISWAF Tersalurkan</p>
            </div>
          </div>

        </div>
      </section>

      {/* Breakdown per Jenis Dana (fund_type) */}
      {fundBreakdown.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Struktur Dana Masjid per Jenis</h3>
                <p className="text-xs text-gray-500 mt-0.5">Pemisahan ketat sesuai fiqih muamalah — setiap akad tercatat terpisah.</p>
              </div>
              <button
                onClick={() => router.push("/laporan")}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                Lihat Rincian Lengkap
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {fundBreakdown.map((item) => {
                const ft = item.fund_type;
                const label = FUND_LABEL[ft] ?? ft;
                const color = FUND_COLOR[ft] ?? "bg-gray-400";
                const iconMap: Record<string, string> = {
                  zakat_fitrah: "۩",
                  zakat_maal: "۩",
                  infaq_terikat: "🤝",
                  infaq_tidak_terikat: "🤲",
                  wakaf_pokok: "🏛️",
                  wakaf_hasil: "🌾",
                  qardhul_hasan: "💳",
                };
                return (
                  <div key={ft} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-slate-900">
                      Rp {item.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Live Activity Feed Stream */}
      <section className="px-4 sm:px-6 lg:px-8">
        <LiveActivityFeed />
      </section>

      {/* 3. Core Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" id="core-programs">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Pilar Kemandirian Umat
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
            Inisiatif strategis terstruktur untuk menyalurkan dana amanat secara tepat sasaran demi mencerdaskan, menyejahterakan, dan memberdayakan ekonomi warga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {featuredPrograms.map((progRaw, idx) => {
            const prog = progRaw as { id: string; name: string; description?: string; slug: string; category?: string; config: Record<string, unknown> | null };
            const cfg = prog.config as {
              icon?: string;
              color?: string;
              target_beneficiaries?: number;
              target_budget?: number;
              image_url?: string;
              badge?: string;
            } | null;

            const p = programProgress[idx];
            const targetBudget = p?.target ?? cfg?.target_budget ?? 0;
            const pct = targetBudget ? Math.round(((p?.current ?? 0) / targetBudget) * 100) : 0;
            const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

            // Mapping slug → CTA details
            const ctaMap: Record<string, { href: string; label: string; beneficiaryLabel: string }> = {
              "bank-infaq": { href: "/bank-infaq", label: "Pelajari Program & Ajukan", beneficiaryLabel: "UMKM Penerima" },
              "wakaf-domba": { href: "#donasi", label: "Ikut Wakaf Sekarang", beneficiaryLabel: "Peternakan Umat" },
              "beasiswa": { href: "#donasi", label: "Tanggung Anak Asuh", beneficiaryLabel: "Bebas Putus Sekolah" },
              "kampung-quran": { href: "#donasi", label: "Dukung Program", beneficiaryLabel: "Santri Aktif" },
            };
            const cta = ctaMap[prog.slug] ?? { href: "#donasi", label: "Dukung Program", beneficiaryLabel: "Penerima Manfaat" };

            const imgSrc = cfg?.image_url || "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=600&q=80";
            const badgeText = cfg?.badge || prog.category;

            return (
              <div key={prog.id} className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-emerald-100 transition-all overflow-hidden flex flex-col group">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <Image
                    src={imgSrc}
                    alt={prog.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {badgeText}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-xl text-emerald-950 group-hover:text-emerald-700 transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {prog.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-500">Terkumpul: <b className="text-slate-950 font-mono">{fmt(p?.current ?? 0)}</b></span>
                      <span className="text-emerald-700 font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>Target: {fmt(targetBudget)}</span>
                      <span>{cta.beneficiaryLabel}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (cta.href === "#donasi") {
                        handleDonateClick();
                      } else {
                        router.push(cta.href);
                      }
                    }}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {cta.label}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* 4. Integrated Zakat Calculator Widget */}
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
              Zakat adalah instrumen pengurang kesenjangan ekonomi sosial umat yang wajib ditunaikan bagi yang memenuhi syarat (Nisab & Haul). Hitung estimasi kewajiban zakat Anda secara instan dalam 30 detik melalui widget kalkulator mandiri ini.
            </p>
            <div className="flex gap-4 text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> Sesuai Fatwa MUI</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> Perhitungan Presisi</span>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
            <form onSubmit={handleQuickPay} className="space-y-6">
              
              {/* Type Select Tabs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">Pilih Jenis Zakat</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setZakatType("maal"); setAssetValue(""); }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      zakatType === "maal" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-gray-500 hover:text-emerald-700"
                    }`}
                  >
                    Zakat Maal
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZakatType("profesi"); setAssetValue(""); }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      zakatType === "profesi" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-gray-500 hover:text-emerald-700"
                    }`}
                  >
                    Zakat Profesi
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZakatType("fitrah"); setAssetValue(""); }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      zakatType === "fitrah" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-gray-500 hover:text-emerald-700"
                    }`}
                  >
                    Zakat Fitrah
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs */}
              {zakatType === "fitrah" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Jumlah Jiwa (Anggota Keluarga)</label>
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
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">Jiwa</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    {zakatType === "maal" ? "Total Nilai Harta Simpanan (Emas/Tabungan)" : "Total Pendapatan Bersih Bulanan"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 font-mono">Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={assetValue}
                      onChange={(e) => setAssetValue(e.target.value)}
                      placeholder="Masukkan nominal angka saja..."
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden py-3 pl-12 pr-4 rounded-xl text-sm font-mono font-semibold transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Real-time Calculation Result Panel */}
              <div className="bg-emerald-50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border border-emerald-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Estimasi Zakat Anda</p>
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
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Bayar Zakat Sekarang
                </button>
              </div>

              {/* Reference */}
              <p className="text-[11px] text-gray-400 text-center leading-relaxed font-sans">
                *Nisab Zakat Maal setara 85g Emas (~Rp 85.000.000/tahun). Nisab Zakat Profesi setara 522kg beras (~Rp 6.800.000/bulan).
                Perhitungan ini adalah estimasi awal. Penyerahan zakat dijamin 100% masuk ke buku kas zakat terintegrasi.
              </p>
            </form>
          </div>

        </div>
      </section>

      {/* 5. Transparency Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Laporan Real-time & Akuntabel
            </h2>
            <p className="text-gray-500 max-w-xl text-sm">
              Kami memegang prinsip keterbukaan menyeluruh. Setiap sen rupiah donasi yang masuk tercatat langsung di sistem dan didistribusikan secara transparan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => router.push("/laporan")}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-gray-500" />
              Lihat Laporan {bulanIni}
            </button>
            <button
              onClick={() => router.push("/laporan")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1"
            >
              Lihat Seluruh Mutasi Donasi
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Donation table preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold">Tanggal</th>
                  <th className="py-4 px-6 font-semibold">Donatur</th>
                  <th className="py-4 px-6 font-semibold">Program</th>
                  <th className="py-4 px-6 font-semibold text-right">Jumlah</th>
                  <th className="py-4 px-6 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-400 font-mono text-xs">{donation.tanggal}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{donation.donatur}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {donation.program}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-950">
                      Rp {donation.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        donation.status === "Berhasil" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : donation.status === "Diproses"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Strategic Partners Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center space-y-6" id="partner">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Mitra Strategis & Lembaga Audit</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
          
          <div className="flex items-center gap-2 border border-dashed border-gray-200 px-6 py-4 rounded-xl w-full max-w-[200px] justify-center bg-white hover:border-emerald-300 hover:shadow-xs transition-all">
            <Handshake className="w-5 h-5 text-emerald-700" />
            <span className="font-display font-extrabold text-slate-800 tracking-tight">BAZNAS</span>
          </div>

          <div className="flex items-center gap-2 border border-dashed border-gray-200 px-6 py-4 rounded-xl w-full max-w-[200px] justify-center bg-white hover:border-emerald-300 hover:shadow-xs transition-all">
            <Sprout className="w-5 h-5 text-emerald-700" />
            <span className="font-display font-extrabold text-slate-800 tracking-tight">ParagonCorp</span>
          </div>

          <div className="flex items-center gap-2 border border-dashed border-gray-200 px-6 py-4 rounded-xl w-full max-w-[200px] justify-center bg-white hover:border-emerald-300 hover:shadow-xs transition-all">
            <Landmark className="w-5 h-5 text-emerald-700" />
            <span className="font-display font-extrabold text-slate-800 tracking-tight">Global Wakaf</span>
          </div>

          <div className="flex items-center gap-2 border border-dashed border-gray-200 px-6 py-4 rounded-xl w-full max-w-[200px] justify-center bg-white hover:border-emerald-300 hover:shadow-xs transition-all">
            <Heart className="w-5 h-5 text-emerald-700" />
            <span className="font-display font-extrabold text-slate-800 tracking-tight">Rumah Zakat</span>
          </div>

        </div>
      </section>

    </div>
  );
}
