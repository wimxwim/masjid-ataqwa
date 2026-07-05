"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/design-system";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accentColor: string;
  iconBg: string;
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  iconBg,
  subtitle,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <GlassCard rounded="2xl" className="p-5 animate-pulse shadow-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-bg rounded w-20" />
            <div className="h-7 bg-bg rounded w-28" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-bg" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      hover
      glow
      rounded="2xl"
      className="p-5 shadow-2 border-l-4 hover-lift hover:hover-lift-active"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
            {label}
          </span>
          <span className="text-2xl font-mono font-black text-ink tracking-tight block">
            {value}
          </span>
          {subtitle && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block"
              style={{ color: accentColor, backgroundColor: iconBg }}
            >
              {subtitle}
            </span>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg, color: accentColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </GlassCard>
  );
}
