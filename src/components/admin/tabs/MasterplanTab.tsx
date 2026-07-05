"use client";

import React, { useState } from "react";
import { Sparkles, ShoppingBag, TrendingUp, Coins } from "lucide-react";
import { formatNominal } from "@/lib/format";

interface YearData {
  tahun: number;
  label: string;
  target: string[];
}

const ROADMAP_DATA: YearData[] = [
  {
    tahun: 1,
    label: "Fondasi & Infrastruktur Digital",
    target: ["Digital dashboard", "Database mustahik", "ZIS digital", "Bank Infaq rintisan"],
  },
  {
    tahun: 2,
    label: "Ekspansi Program Pemberdayaan",
    target: ["Wakaf Domba 100 ekor", "Beasiswa 50 anak", "BUMM rintisan"],
  },
  {
    tahun: 3,
    label: "Skala & Dampak Ekonomi Umat",
    target: ["Bank Infaq solid", "BUMM 10 pemuda", "Mustahik naik kelas"],
  },
  {
    tahun: 4,
    label: "Desa Binaan & Jaringan 15 Masjid",
    target: ["Bina 5 kelurahan", "Jaringan 15 masjid", "Produk UMKM tembus pasar"],
  },
  {
    tahun: 5,
    label: "Kemandirian & Dana Abadi Masjid",
    target: ["Wakaf uang terkumpul 1M", "Dana abadi 500jt", "100% mustahik Ring1-2 naik kelas"],
  },
];

const USAHA_LIST = [
  { id: "kopi", label: "Kedai Kopi At-Taqwa", price: 15000, margin: 0.4, stateKey: "usahaKopiSales" as const },
  { id: "kaos", label: "Kaos At-Taqwa Distro", price: 85000, margin: 0.35, stateKey: "usahaKaosSales" as const },
  { id: "web", label: "Layanan Web & Design", price: 500000, margin: 0.7, stateKey: "usahaWebSales" as const },
];

function formatRp(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

export default function MasterplanTab() {
  const [selectedRoadmapYear, setSelectedRoadmapYear] = useState<number>(1);
  const [usahaKopiSales, setUsahaKopiSales] = useState<number>(0);
  const [usahaKaosSales, setUsahaKaosSales] = useState<number>(0);
  const [usahaWebSales, setUsahaWebSales] = useState<number>(0);

  const usahaSales: Record<string, number> = {
    usahaKopiSales,
    usahaKaosSales,
    usahaWebSales,
  };

  const setUsahaSales = {
    usahaKopiSales: setUsahaKopiSales,
    usahaKaosSales: setUsahaKaosSales,
    usahaWebSales: setUsahaWebSales,
  };

  const currentYear = ROADMAP_DATA.find((y) => y.tahun === selectedRoadmapYear) ?? ROADMAP_DATA[0]!;

  const usahaCalc = USAHA_LIST.map((u) => {
    const sales = usahaSales[u.stateKey] ?? 0;
    const revenue = sales * u.price;
    const profit = sales * u.price * u.margin;
    return { ...u, sales, revenue, profit };
  });

  const totalProfit = usahaCalc.reduce((sum, u) => sum + u.profit, 0);

  return (
    <div className="space-y-10">
      <section className="glass-strong rounded-2xl shadow-2 p-6 lg:p-8 reveal">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg text-ink">Roadmap 5 Tahun Masjid Berdaya</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {ROADMAP_DATA.map((y) => (
            <button
              key={y.tahun}
              onClick={() => setSelectedRoadmapYear(y.tahun)}
              className={`w-16 h-16 rounded-full font-display font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center leading-tight active:scale-95 ${
                selectedRoadmapYear === y.tahun
                  ? "bg-primary text-white shadow-glow scale-110"
                  : "glass border-white/40 text-muted hover:bg-surface/80 hover:text-primary"
              }`}
            >
              <span className="text-[10px] font-semibold">Tahun</span>
              <span className="text-lg">{y.tahun}</span>
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4 border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold shadow-md shadow-primary/20">
              {currentYear.tahun}
            </span>
            <h3 className="font-display font-bold text-base text-ink">{currentYear.label}</h3>
          </div>
          <ul className="space-y-2">
            {currentYear.target.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glass-strong rounded-2xl shadow-2 p-6 lg:p-8 reveal">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg text-ink">Simulasi Usaha Unit Pemuda (BUMM)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {USAHA_LIST.map((u) => {
            const val = usahaSales[u.stateKey];
            const setter = setUsahaSales[u.stateKey];
            return (
              <div key={u.id} className="glass rounded-2xl p-5 space-y-3 shadow-2 hover-lift hover:hover-lift-active">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="font-display font-semibold text-sm text-ink">{u.label}</span>
                </div>
                <div className="text-[11px] text-muted space-y-1">
                  <p>Harga: {formatRp(u.price)}/pcs</p>
                  <p>Margin: {(u.margin * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted block mb-1">
                    Estimasi Penjualan / Bulan
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    value={formatNominal(val ?? 0)}
                    onChange={(e) => setter(Number(e.target.value.replace(/\D/g, "")) || 0)}
                    className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-mono transition-all shadow-1"
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass overflow-hidden rounded-[var(--radius-card)] shadow-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg text-muted font-bold uppercase tracking-wider border-b border-outline">
                <th className="py-3 px-4">Unit Usaha</th>
                <th className="py-3 px-4 text-right">Sales</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {usahaCalc.map((u) => (
                <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-ink">{u.label}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted">{u.sales} pcs</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-ink">{formatRp(u.revenue)}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted">{(u.margin * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-primary">{formatRp(u.profit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary/5 border-t-2 border-primary">
                <td className="py-4 px-4 font-bold text-sm text-ink" colSpan={4}>
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Total Estimasi Laba Bersih / Bulan
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-mono font-black text-base text-primary">
                  {formatRp(totalProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
