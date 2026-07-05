"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accentColor: string;
  iconBg: string;
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({ label, value, icon: Icon, accentColor, iconBg, subtitle, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-outline rounded-2xl shadow-xs p-5 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-7 bg-gray-200 rounded w-28" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline rounded-2xl shadow-xs p-5 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: accentColor }}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">{label}</span>
          <span className="text-2xl font-mono font-black text-ink tracking-tight block">{value}</span>
          {subtitle && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block" style={{ color: accentColor, backgroundColor: iconBg }}>
              {subtitle}
            </span>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: accentColor }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
