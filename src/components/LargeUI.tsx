"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface LargeButtonProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

export function LargeButton({ icon: Icon, label, description, href, onClick, variant = "primary" }: LargeButtonProps) {
  const base =
    "flex items-center gap-3 w-full text-left py-4 px-5 rounded-xl text-base font-bold transition-all";
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-sm",
    secondary: "bg-surface hover:bg-bg border border-outline text-ink",
    ghost: "hover:bg-bg text-ink border border-transparent",
  };

  const content = (
    <>
      {Icon && (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="font-bold text-base">{label}</div>
        {description && <p className="text-xs opacity-80 mt-0.5">{description}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${variants[variant]}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {content}
    </button>
  );
}

interface GridNavProps {
  items: {
    icon: LucideIcon;
    label: string;
    description: string;
    href: string;
  }[];
  columns?: 2 | 3 | 4;
}

export function GridNav({ items, columns = 3 }: GridNavProps) {
  const cols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${cols[columns]} gap-4`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-surface border border-outline hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-success-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="font-bold text-base text-ink">{item.label}</div>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
}

export function StatCard({ icon: Icon, label, value, sublabel }: StatCardProps) {
  return (
    <div className="bg-surface border border-outline p-6 rounded-2xl shadow-xs flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-success-subtle text-primary flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider block">{label}</span>
        <span className="text-2xl font-mono font-black text-ink tracking-tight block mt-1">{value}</span>
        {sublabel && <span className="text-[11px] text-primary font-medium bg-success-subtle px-1.5 py-0.5 rounded mt-1.5 inline-block">{sublabel}</span>}
      </div>
    </div>
  );
}
