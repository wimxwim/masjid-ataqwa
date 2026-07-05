export const dynamic = "force-dynamic";

import { Suspense } from "react";
import {
  getDefaultMosque,
  getPublicTransactions,
  getTransactionSummary,
  getMonthlyTrends,
  getDashboardStats,
} from "@/lib/actions/public";
import TransparansiClient from "@/components/TransparansiClient";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Laporan Transparansi",
  description: "Laporan keuangan transparan Masjid Jami' At-Taqwa Ulujami — pemasukan, penyaluran, dan distribusi dana secara real-time.",
  path: "/laporan",
});

export default async function LaporanPage() {
  const mosque = await getDefaultMosque();
  if (!mosque) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <p>Masjid belum dikonfigurasi. Silakan hubungi administrator.</p>
      </div>
    );
  }

  const [ledgerEntries, summary, monthlyTrends, stats] = await Promise.all([
    getPublicTransactions(mosque.id),
    getTransactionSummary(mosque.id),
    getMonthlyTrends(mosque.id),
    getDashboardStats(mosque.id),
  ]);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted">Memuat laporan...</div>}>
      <TransparansiClient
        ledgerEntries={ledgerEntries}
        summary={summary}
        monthlyTrends={monthlyTrends}
        stats={stats}
        mosqueName={mosque.name}
      />
    </Suspense>
  );
}
