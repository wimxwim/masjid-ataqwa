export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getDefaultMosque,
  getDashboardStats,
  getFundTypeBreakdown,
  getFeaturedPrograms,
  getPublicTransactions,
} from "@/lib/actions/public";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgramGrid } from "@/components/landing/ProgramGrid";
import { TransparencyTable } from "@/components/landing/TransparencyTable";
import { PartnerLogos } from "@/components/landing/PartnerLogos";
import { ZakatCalculator } from "@/components/landing/ZakatCalculator";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import PrayerTimes from "@/components/PrayerTimes";
import type { HeroStats } from "@/types";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const mosque = await getDefaultMosque();
  const title = mosque?.name ?? "Masjid At-Taqwa Ulujami";
  return buildMetadata({
    title,
    description: "Dari masjid kita tuntaskan kemiskinan. Kalkulator zakat, infaq & sedekah online untuk program pemberdayaan mustahik Masjid Jami' At-Taqwa Ulujami.",
    path: "/",
  });
}

export default async function HomePage() {
  const mosque = await getDefaultMosque();
  if (!mosque) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                <p>Masjid belum dikonfigurasi. Silakan hubungi administrator.</p>
      </div>
    );
  }

  const [stats, fundBreakdown, featuredPrograms, transactions] = await Promise.all([
    getDashboardStats(mosque.id),
    getFundTypeBreakdown(mosque.id),
    getFeaturedPrograms(mosque.id),
    getPublicTransactions(mosque.id, 50),
  ]);

  const mosqueConfig = mosque.config as Record<string, unknown> | null;
  const zakatFitrahAmount =
    (mosqueConfig as { zakat_fitrah_amount?: number } | null)?.zakat_fitrah_amount ?? 45000;

  const heroStats: HeroStats = {
    totalTerkumpul: stats?.totalDonations ?? 0,
    totalMustahikKK: stats?.mustahikCount ?? 0,
    terbantuBulanIni: stats?.terbantuBulanIni ?? 0,
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

  const inflowTransactions = transactions
    .filter((t) => t.type === "Pemasukan")
    .sort((a, b) => String(b.transaction_date).localeCompare(String(a.transaction_date)));

  return (
    <div className="space-y-16 pb-16" id="landing-page-container">
      <HeroSection
        stats={heroStats}
        fundBreakdown={fundBreakdown}
        mosqueName={mosque.name}
        mosqueConfig={mosqueConfig}
      />

      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full -mt-8 relative z-20">
        <PrayerTimes city="Jakarta" />
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <LiveActivityFeed />
      </section>

      <ProgramGrid programs={featuredPrograms as any} />

      <ZakatCalculator zakatFitrahAmount={zakatFitrahAmount} />

      <TransparencyTable transactions={inflowTransactions as any} />

      <PartnerLogos />
    </div>
  );
}
