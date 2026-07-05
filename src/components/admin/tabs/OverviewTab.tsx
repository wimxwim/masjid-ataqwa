"use client";

import React from "react";
import { Users, TrendingUp, Wallet, Landmark, BookOpen } from "lucide-react";
import { useAdminDashboardSummary, useAdminTrend30d, useAdminZiswafBreakdown, useAdminActivityFeeds } from "@/lib/queries/admin";
import StatCard from "@/components/admin/cards/StatCard";
import TrendLineChart from "@/components/admin/charts/TrendLineChart";
import ZiswafDonutChart from "@/components/admin/charts/ZiswafDonutChart";
import ActivityFeeds from "@/components/admin/feeds/ActivityFeeds";

interface OverviewTabProps {
  mosqueId: string;
}

function formatRp(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function OverviewTab({ mosqueId }: OverviewTabProps) {
  const { data: summary, isLoading: loadingSummary } = useAdminDashboardSummary(mosqueId);
  const { data: trend, isLoading: loadingTrend } = useAdminTrend30d(mosqueId);
  const { data: ziswaf, isLoading: loadingZiswaf } = useAdminZiswafBreakdown(mosqueId);
  const { data: activity, isLoading: loadingActivity } = useAdminActivityFeeds(mosqueId);

  return (
    <div className="space-y-8">
      {/* 5 Kartu Statistik */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 reveal">
        <StatCard
          label="Saldo Kas"
          value={summary ? formatRp(summary.saldo_kas) : "—"}
          icon={Wallet}
          accentColor="#4f46e5"
          iconBg="#eef2ff"
          subtitle="Total Pemasukan - Pengeluaran"
          loading={loadingSummary}
        />
        <StatCard
          label="Total Pemasukan"
          value={summary ? formatRp(summary.total_masuk) : "—"}
          icon={TrendingUp}
          accentColor="#10b981"
          iconBg="#ecfdf5"
          subtitle="Semua sumber dana masuk"
          loading={loadingSummary}
        />
        <StatCard
          label="Total Pengeluaran"
          value={summary ? formatRp(summary.total_keluar) : "—"}
          icon={BookOpen}
          accentColor="#ef4444"
          iconBg="#fef2f2"
          subtitle="Operasional + Penyaluran"
          loading={loadingSummary}
        />
        <StatCard
          label="Donatur Aktif"
          value={summary ? `${summary.donatur_aktif} Orang` : "—"}
          icon={Landmark}
          accentColor="#d97706"
          iconBg="#fffbeb"
          subtitle="Berkomitmen rutin bulanan"
          loading={loadingSummary}
        />
        <StatCard
          label="Mustahik Aktif"
          value={summary ? `${summary.mustahik_aktif} KK` : "—"}
          icon={Users}
          accentColor="#0284c7"
          iconBg="#f0f9ff"
          subtitle="Penerima manfaat terdata"
          loading={loadingSummary}
        />
      </section>

      {/* Baris 2: Chart Tren + Donut ZISWAF */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 reveal">
        <div className="lg:col-span-3">
          <TrendLineChart data={trend ?? []} loading={loadingTrend} />
        </div>
        <div className="lg:col-span-2">
          <ZiswafDonutChart data={ziswaf ?? []} loading={loadingZiswaf} />
        </div>
      </section>

      {/* Baris 3: Activity Feeds */}
      <div className="reveal">
        <ActivityFeeds data={activity ?? []} loading={loadingActivity} />
      </div>
    </div>
  );
}
