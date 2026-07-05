"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface TrendData {
  tanggal: string;
  pemasukan: number;
  pengeluaran: number;
}

interface TrendLineChartProps {
  data: TrendData[];
  loading?: boolean;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} rb`;
  return String(value);
}

function formatTanggal(tgl: string): string {
  const d = new Date(tgl);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function TrendLineChart({ data, loading }: TrendLineChartProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-outline rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-ink">Tren 30 Hari Terakhir</h3>
      </div>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-muted">
          Belum ada transaksi 30 hari terakhir
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="tanggal"
                tickFormatter={formatTanggal}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatCompact}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  `Rp ${Number(value).toLocaleString("id-ID")}`,
                  String(name) === "pemasukan" ? "Pemasukan" : "Pengeluaran",
                ]}
                labelFormatter={(label) => formatTanggal(label)}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Legend
                formatter={(value: unknown) => (String(value) === "pemasukan" ? "Pemasukan" : "Pengeluaran")}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="pemasukan"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="pengeluaran"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
