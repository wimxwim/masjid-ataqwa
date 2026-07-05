"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BookMarked } from "lucide-react";
import { GlassCard } from "@/components/design-system";

const FUND_TYPE_LABEL: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_maal: "Zakat Maal",
  infaq_terikat: "Infaq Terikat",
  infaq_tidak_terikat: "Infaq",
  wakaf_pokok: "Wakaf Pokok",
  wakaf_hasil: "Wakaf Hasil",
  qardhul_hasan: "Bank Infaq",
};

const FUND_TYPE_COLORS: Record<string, string> = {
  zakat_fitrah: "#047857",
  zakat_maal: "#059669",
  infaq_terikat: "#d97706",
  infaq_tidak_terikat: "#f59e0b",
  wakaf_pokok: "#0284c7",
  wakaf_hasil: "#38bdf8",
  qardhul_hasan: "#4f46e5",
};

interface ZiswafItem {
  fund_type: string;
  total: number;
}

interface ZiswafDonutChartProps {
  data: ZiswafItem[];
  loading?: boolean;
}

export default function ZiswafDonutChart({ data, loading }: ZiswafDonutChartProps) {
  if (loading) {
    return (
      <GlassCard rounded="2xl" className="p-6 animate-pulse shadow-2">
        <div className="h-4 bg-bg rounded w-40 mb-4" />
        <div className="h-56 bg-bg rounded-full mx-auto" style={{ maxWidth: 200 }} />
      </GlassCard>
    );
  }

  const chartData = data
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: FUND_TYPE_LABEL[d.fund_type] ?? d.fund_type,
      value: d.total,
      color: FUND_TYPE_COLORS[d.fund_type] ?? "#6b7280",
    }));

  const grandTotal = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <GlassCard hover rounded="2xl" className="p-6 flex flex-col shadow-2 hover:hover-lift-active">
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-primary" />
          Breakdown ZISWAF
        </h3>
        <p className="text-xs text-muted mt-0.5">Distribusi dana per jenis fiqih muamalah</p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-muted">
          Belum ada data ZISWAF
        </div>
      ) : (
        <>
          <div className="h-56 my-2" role="img" aria-label="Diagram donut distribusi ZISWAF">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center mb-3">
            <span className="text-xs text-muted">Total</span>
            <span className="block text-lg font-mono font-black text-ink">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {chartData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-[11px] font-medium text-muted">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono font-bold text-ink">Rp {item.value.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}
