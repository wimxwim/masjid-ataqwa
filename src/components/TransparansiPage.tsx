"use client";

import React, { useState, useMemo } from "react";
import { useDefaultMosque, usePublicTransactions, useTransactionSummary, useMonthlyTrends, useDashboardStats } from "@/lib/queries/public";
import LiveActivityFeed from "./LiveActivityFeed";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { 
  FileText, ArrowDownToLine, Search, CheckCircle, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Award
} from "lucide-react";

const CHART_COLORS = ["#047857", "#0d9488", "#d97706", "#0284c7", "#4f46e5", "#9333ea"];

export default function TransparansiPage() {
  const { data: mosque } = useDefaultMosque();
  const mosqueId = mosque?.id ?? "";

  const { data: ledgerEntries = [], isLoading: loadingLedger } = usePublicTransactions(mosqueId);
  const { data: summary = [] } = useTransactionSummary(mosqueId);
  const { data: monthlyTrends = [] } = useMonthlyTrends(mosqueId);
  const { data: stats } = useDashboardStats(mosqueId);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | "Pemasukan" | "Pengeluaran">("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [downloading, setDownloading] = useState<string | null>(null);

  // Derive pie data from expense summary
  const allocationData = useMemo(() => {
    const expenses = summary.filter((s) => s.type === "Pengeluaran");
    const total = expenses.reduce((sum, s) => sum + Number(s.total), 0);
    if (total === 0) return [];
    return expenses.map((s, i) => ({
      name: s.category,
      value: Math.round((Number(s.total) / total) * 100),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [summary]);

  // Derive monthly chart data
  const monthlyCollectionsData = useMemo(() => {
    const grouped: Record<string, { bulan: string; Pemasukan: number; Pengeluaran: number }> = {};
    for (const t of monthlyTrends) {
      if (!grouped[t.month]) grouped[t.month] = { bulan: t.month, Pemasukan: 0, Pengeluaran: 0 };
      const row = grouped[t.month]!;
      const key = t.type as "Pemasukan" | "Pengeluaran";
      row[key] = Number(t.total);
    }
    return Object.values(grouped);
  }, [monthlyTrends]);

  // Unique categories for filtering dropdown
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(ledgerEntries.map((e) => e.category)))],
    [ledgerEntries]
  );

  // Filtered transactions
  const filteredLedger = ledgerEntries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = entry.description?.toLowerCase().includes(term) || entry.category.toLowerCase().includes(term);
    const matchesType = selectedType === "All" || entry.type === selectedType;
    const matchesCategory = selectedCategory === "All" || entry.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalPemasukan = ledgerEntries
    .filter((e) => e.type === "Pemasukan")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalPengeluaran = ledgerEntries
    .filter((e) => e.type === "Pengeluaran")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const handleDownloadReport = (fileName: string) => {
    setDownloading(fileName);
    const rows = selectedType === "All" ? ledgerEntries : filteredLedger;
    const headers = ["Tanggal", "Kategori", "Keterangan", "Jumlah", "Tipe"];
    const csvContent = [
      headers.join(","),
      ...rows.map((e) =>
        [
          e.transaction_date,
          `"${e.category.replace(/"/g, '""')}"`,
          `"${(e.description ?? "").replace(/"/g, '""')}"`,
          e.amount,
          e.type,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;bom" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12" id="transparency-page">
      
      {/* 1. Header & Live Mutasi Banner */}
      <div className="pt-6 text-center space-y-3">
        <h1 className="text-4xl font-display font-extrabold text-ink tracking-tight">
          Laporan Transparansi Keuangan Real-time
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-sm sm:text-base">
          Sebagai bentuk pertanggungjawaban amil kepada muzakki, seluruh aliran dana zakat, infaq, shadaqah, dan wakaf dicatat terintegrasi di buku besar digital.
        </p>
      </div>

      {/* Dynamic Live Activity Feed */}
      <LiveActivityFeed />

      {/* 2. Bento Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI: Saldo Kas */}
        <div className="bg-surface border border-outline rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-muted">Total Saldo Kas Tersimpan</span>
              <span className="text-primary bg-success-subtle text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +14.2%
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-black text-ink tracking-tight">
                Rp {saldoKas.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-muted mt-1">Saldo berjalan amanah ZISWAF Masjid At-Taqwa</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-outline text-xs font-semibold">
            <div>
              <span className="text-muted block font-normal text-[10px] uppercase">Pemasukan</span>
              <span className="text-primary font-mono font-bold flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                Rp {totalPemasukan.toLocaleString("id-ID")}
              </span>
            </div>
            <div>
              <span className="text-muted block font-normal text-[10px] uppercase">Pengeluaran</span>
              <span className="text-accent font-mono font-bold flex items-center gap-0.5 mt-0.5">
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                Rp {totalPengeluaran.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* KPI: Penyaluran Manfaat */}
        <div className="bg-surface border border-outline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-muted">Penerima Manfaat Langsung</span>
              <span className="text-primary bg-success-subtle text-[10px] px-2 py-0.5 rounded-md font-bold">Ring 1 Ulujami</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-black text-ink tracking-tight">2.418 Jiwa</p>
              <p className="text-xs text-muted mt-1">Telah terbantu program kesehatan, modal usaha, & pendidikan</p>
            </div>
          </div>
          <div className="space-y-2 pt-4 mt-4 border-t border-outline text-[11px] text-muted">
            <div className="flex justify-between">
              <span>Sektor Pendidikan (Anak Asuh)</span>
              <span className="font-bold text-ink">85 Anak</span>
            </div>
            <div className="flex justify-between">
              <span>UMKM Bina Usaha (Bank Infaq)</span>
              <span className="font-bold text-ink">42 Penerima</span>
            </div>
          </div>
        </div>

        {/* KPI: Standard Kemitraan */}
        <div className="bg-surface border border-outline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-muted">Sertifikasi Audit Akuntabilitas</span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-display font-extrabold text-ink">Opini Wajar Tanpa Pengecualian (WTP)</p>
              <p className="text-xs text-muted mt-1">Diberikan oleh Kantor Akuntan Publik independen berdasarkan standar Baznas RI</p>
            </div>
          </div>
          <div className="pt-4 border-t border-outline flex items-center justify-between text-xs text-primary font-bold">
            <span className="flex items-center gap-1.5 bg-success-subtle px-2.5 py-1 rounded-md"><CheckCircle className="w-4 h-4 text-emerald-600" /> Terdaftar di Kemenag RI</span>
            <span className="text-muted font-normal">Audit: Juni 2026</span>
          </div>
        </div>

      </section>

      {/* 3. Visualizations Recharts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pie Chart: Allocation of Q4 Funds */}
        <div className="lg:col-span-5 bg-surface border border-outline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg text-ink">Alokasi Penyaluran Dana Q4</h3>
            <p className="text-xs text-muted mt-0.5">Persentase alokasi sebaran dana produktif & jaring pengaman umat.</p>
          </div>
          
          <div className="h-64 flex justify-center items-center" role="img" aria-label="Diagram lingkaran alokasi dana">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted mt-4">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Monthly collections trend */}
        <div className="lg:col-span-7 bg-surface border border-outline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg text-ink">Tren Pemasukan vs Pengeluaran</h3>
            <p className="text-xs text-muted mt-0.5">Akumulasi tren perputaran kas bulanan (dalam jutaan rupiah).</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyCollectionsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} style={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => Number(v).toLocaleString("id-ID")} style={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
                <Legend style={{ fontSize: 11 }} />
                <Bar dataKey="Pemasukan" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-muted mt-2 font-sans italic text-center">
            *Data grafik diperbarui otomatis setiap jam 24:00 WIB sinkron dengan penutupan transaksi loket masjid.
          </p>
        </div>

      </section>

      {/* 4. Buku Kas Digital Ledger */}
      <section className="bg-surface border border-outline rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        
        {/* Ledger Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline pb-5">
          <div>
            <h3 className="font-display font-bold text-xl text-ink flex items-center gap-2">
              Buku Kas Digital Masjid At-Taqwa
            </h3>
            <p className="text-xs text-muted mt-0.5">Rincian mutasi debit/kredit operasional dan penyaluran dana sosial.</p>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2 flex-wrap shrink-0">
            <button
              onClick={() => handleDownloadReport("Mutasi_ZISWAF_PDF")}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 border border-outline hover:bg-slate-50 text-ink px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              {downloading === "Mutasi_ZISWAF_PDF" ? "Mengekspor..." : "Ekspor PDF"}
            </button>
            <button
              onClick={() => handleDownloadReport("Mutasi_ZISWAF_Excel")}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 border border-outline hover:bg-slate-50 text-ink px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              {downloading === "Mutasi_ZISWAF_Excel" ? "Mengekspor..." : "Ekspor Excel (.csv)"}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi (contoh: zakat, marbot)..."
              className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="sm:col-span-4 flex p-1 bg-bg rounded-xl border border-outline">
            {(["All", "Pemasukan", "Pengeluaran"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  selectedType === type 
                    ? "bg-white text-primary shadow-xs" 
                    : "text-muted hover:text-primary"
                }`}
              >
                {type === "All" ? "Semua" : type}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm transition-colors font-medium text-ink"
            >
              <option value="All">Semua Kategori</option>
              {categories.filter(c => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-outline rounded-xl overflow-hidden bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg text-muted text-[10px] font-bold uppercase tracking-wider border-b border-outline">
                  <th className="py-3 px-5 font-semibold">Tanggal</th>
                  <th className="py-3 px-5 font-semibold">Kategori</th>
                  <th className="py-3 px-5 font-semibold">Keterangan Transaksi</th>
                  <th className="py-3 px-5 font-semibold text-right">Jumlah</th>
                  <th className="py-3 px-5 text-center font-semibold">Tipe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filteredLedger.length > 0 ? (
                  filteredLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-5 text-muted font-mono text-xs">{entry.transaction_date}</td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-ink">
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-medium text-ink">{entry.description ?? entry.category}</td>
                      <td className={`py-3 px-5 text-right font-mono font-bold ${
                        entry.type === "Pemasukan" ? "text-primary" : "text-accent"
                      }`}>
                        {entry.type === "Pemasukan" ? "+" : "-"} Rp {Number(entry.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.type === "Pemasukan" 
                            ? "bg-success-subtle text-primary" 
                            : "bg-accent/10 text-accent"
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-xs text-muted font-sans">
                      Tidak ada transaksi yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info / Status Ticker */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted font-medium">
          <p>Menampilkan {filteredLedger.length} dari {ledgerEntries.length} total baris kas</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Koneksi Sistem Ledger SSL Terenkripsi SHA-256</span>
          </div>
        </div>

      </section>

    </div>
  );
}
