"use client";

import React from "react";
import { Users, TrendingUp, FolderHeart, ShieldCheck, BookMarked, ArrowRight, BookOpen, Globe } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { LedgerEntry } from "@/types";
import { DonationSummary } from "@/lib/queries/admin";
import { AKAD_TO_FUND } from "@/lib/fund-mapping";

interface OverviewTabProps {
  mustahikCount: number;
  jamaahData: { peran: string }[];
  ledgerEntries: LedgerEntry[];
  donationSummary?: DonationSummary;
  onNavigateToLaporan: () => void;
}

const PIE_COLORS = ["#047857", "#d97706", "#0284c7", "#4f46e5", "#ec4899", "#10b981", "#8b5cf6", "#65a30d", "#dc2626", "#7c3aed"];

const FUND_TYPE_LABEL: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_maal: "Zakat Maal",
  infaq_terikat: "Infaq Terikat",
  infaq_tidak_terikat: "Infaq Tidak Terikat",
  wakaf_pokok: "Wakaf Pokok",
  wakaf_hasil: "Wakaf Hasil",
  qardhul_hasan: "Qardhul Hasan",
  non_halal: "Non Halal",
};

const FUND_TYPE_COLORS: Record<string, string> = {
  zakat_fitrah: "#047857",
  zakat_maal: "#059669",
  infaq_terikat: "#d97706",
  infaq_tidak_terikat: "#f59e0b",
  wakaf_pokok: "#0284c7",
  wakaf_hasil: "#38bdf8",
  qardhul_hasan: "#4f46e5",
  non_halal: "#dc2626",
};

/** Label donasi akad_type → bahasa awam */
const akadLabel: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_mal: "Zakat Maal",
  infaq: "Infaq / Sedekah",
  sedekah: "Infaq / Sedekah",
  wakaf: "Wakaf",
  fidyah: "Fidyah",
};

export default function OverviewTab({ mustahikCount, jamaahData, ledgerEntries, donationSummary, onNavigateToLaporan }: OverviewTabProps) {
  const router = useRouter();

  const totalPemasukanBukuKas = ledgerEntries
    .filter((e) => e.tipe === "Pemasukan")
    .reduce((sum, e) => sum + e.jumlah, 0);

  const totalPengeluaran = ledgerEntries
    .filter((e) => e.tipe === "Pengeluaran")
    .reduce((sum, e) => sum + e.jumlah, 0);

  const totalDonasiOnline = donationSummary?.total ?? 0;
  const totalPenerimaan = totalPemasukanBukuKas + totalDonasiOnline;

  const remisyaCount = jamaahData.filter((j) => j.peran === "REMISYA").length;

  // Pie: breakdown per fund_type dari buku kas
  const fundTypeMap = ledgerEntries.reduce((acc: Record<string, number>, item) => {
    if (item.tipe === "Pemasukan") {
      const ft = item.fund_type || "infaq_tidak_terikat";
      acc[ft] = (acc[ft] || 0) + item.jumlah;
    }
    return acc;
  }, {} as Record<string, number>);

  // Breakdown per fund_type dari donasi online
  const donasiFundMap: Record<string, number> = {};
  for (const d of donationSummary?.items ?? []) {
    const ft = AKAD_TO_FUND[d.akad_type] ?? "infaq_tidak_terikat";
    donasiFundMap[ft] = (donasiFundMap[ft] || 0) + d.amount;
  }

  const allFundTypes = new Set([...Object.keys(fundTypeMap), ...Object.keys(donasiFundMap)]);
  const combinedFundData = Array.from(allFundTypes)
    .map((key) => ({
      name: FUND_TYPE_LABEL[key] ?? key,
      bukuKas: fundTypeMap[key] ?? 0,
      donasiOnline: donasiFundMap[key] ?? 0,
      total: (fundTypeMap[key] ?? 0) + (donasiFundMap[key] ?? 0),
      color: FUND_TYPE_COLORS[key] ?? "#6b7280",
    }))
    .sort((a, b) => b.total - a.total);

  const combinedPieData = combinedFundData.map((item) => ({
    name: item.name,
    value: item.total,
    color: item.color,
  }));

  const recentTransactions = ledgerEntries.slice(0, 6);
  const recentDonations = (donationSummary?.items ?? []).slice(0, 5);

  const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 4 Kartu Utama */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-outline p-6 rounded-2xl shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Mustahik Ring 1</span>
            <span className="text-3xl font-mono font-black text-ink tracking-tight">{mustahikCount} KK</span>
            <span className="text-[10px] text-primary font-medium bg-success-subtle px-1.5 py-0.5 rounded mt-1.5 inline-block">Terdata Radius 500m</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-success-subtle text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* ─── TOTAL PENERIMAAN (Buku Kas + Donasi Online) ─── */}
        <div className="bg-surface border border-outline p-6 rounded-2xl shadow-xs flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Penerimaan Dana Masjid</span>
            <div className="w-10 h-10 rounded-xl bg-success-subtle text-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-mono font-black text-ink tracking-tight">
            {fmt(totalPenerimaan)}
          </span>
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Buku Kas (catatan bendahara)
              </span>
              <span className="font-mono font-semibold text-ink">{fmt(totalPemasukanBukuKas)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Donasi Online / ZISWAF Digital
              </span>
              <span className="font-mono font-semibold text-ink">{fmt(totalDonasiOnline)}</span>
            </div>
          </div>
          <p className="text-[9px] text-muted mt-1 italic">
            * Kedua sumber dijumlah otomatis. Landing Page publik menampilkan angka Donasi Online.
          </p>
        </div>

        <div className="bg-surface border border-outline p-6 rounded-2xl shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Penyaluran Mustahik</span>
            <span className="text-2xl font-mono font-black text-ink tracking-tight">
              {fmt(totalPengeluaran)}
            </span>
            <span className="text-[10px] text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded mt-1.5 inline-block">Gaji & Santunan Sosial</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <FolderHeart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-outline p-6 rounded-2xl shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Remaja REMISYA</span>
            <span className="text-3xl font-mono font-black text-ink tracking-tight">
              {remisyaCount} Kader
            </span>
            <span className="text-[10px] text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Milenial Berdaya Aktif</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Baris 2: Buku Besar + Pie + Donasi Online */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Buku Besar Kas */}
        <div className="lg:col-span-7 bg-surface border border-outline rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-outline pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Buku Kas — Catatan Bendahara
              </h3>
              <p className="text-xs text-muted mt-0.5">Pemasukan & pengeluaran yang dicatat manual oleh pengurus.</p>
            </div>
            <button
              onClick={onNavigateToLaporan}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              Buka Laporan Publik
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-outline rounded-xl overflow-hidden bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg text-muted font-bold uppercase tracking-wider border-b border-outline">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-right">Jumlah</th>
                    <th className="py-3 px-4 text-center">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 px-4 text-muted font-mono text-xs">{tx.tanggal}</td>
                      <td className="py-3 px-4 font-semibold text-ink max-w-[200px] truncate" title={tx.keterangan}>{tx.keterangan}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${
                        tx.tipe === "Pemasukan" ? "text-primary" : "text-accent"
                      }`}>
                        {fmt(tx.jumlah)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          tx.tipe === "Pemasukan" ? "bg-success-subtle text-primary" : "bg-accent/10 text-accent"
                        }`}>
                          {tx.tipe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Breakdown per Jenis Dana (fund_type) */}
        <div className="lg:col-span-5 bg-surface border border-outline rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-primary" />
              Breakdown per Jenis Dana
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Klasifikasi fiqih muamalah — zakat, infaq, wakaf, dan qardh dipisah ketat.
            </p>
          </div>

          <div className="h-56 my-4">
            {combinedPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={combinedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {combinedPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `Rp ${val.toLocaleString("id-ID")}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">Belum ada data pemasukan.</div>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5">
            {combinedFundData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-[11px] font-medium text-muted">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono font-bold text-ink">{fmt(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Baris 3: Donasi Online Terbaru */}
      {recentDonations.length > 0 && (
        <div className="bg-surface border border-outline rounded-2xl shadow-sm p-6">
          <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            Donasi Online / ZISWAF Digital — Terbaru
          </h3>
          <p className="text-xs text-muted -mt-3 mb-4">
            Donasi yang masuk lewat sistem digital (website, QRIS, transfer). Total: {fmt(totalDonasiOnline)} dari {donationSummary?.items.length ?? 0} transaksi.
          </p>
          <div className="border border-outline rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg text-muted font-bold uppercase tracking-wider border-b border-outline">
                    <th className="py-3 px-4">Donatur</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Program</th>
                    <th className="py-3 px-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentDonations.map((d, i) => (
                    <tr key={i} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-ink">{d.donor_name ?? "Anonim"}</td>
                      <td className="py-3 px-4 text-muted">{akadLabel[d.akad_type] ?? d.akad_type}</td>
                      <td className="py-3 px-4 text-muted max-w-[150px] truncate">{d.program_name ?? "—"}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-primary">{fmt(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
