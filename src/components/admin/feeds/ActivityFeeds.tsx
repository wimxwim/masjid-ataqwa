"use client";

import React from "react";
import { HandCoins, Landmark, Receipt } from "lucide-react";

interface ActivityItem {
  type: string;
  nama: string;
  alamat: string | null;
  detail: string | null;
  jumlah: number | null;
  created_at: string;
}

interface ActivityFeedsProps {
  data: ActivityItem[];
  loading?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function FeedColumn({
  title,
  icon: Icon,
  items,
  accentColor,
  iconBg,
}: {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: ActivityItem[];
  accentColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-surface border border-outline rounded-2xl shadow-sm p-5">
      <h4 className="font-display font-bold text-sm text-ink flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-xs text-muted py-4 text-center">Belum ada data</p>
      ) : (
        <div className="space-y-2.5">
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg/50 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: iconBg, color: accentColor }}>
                {item.nama.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{item.nama}</p>
                {item.detail && <p className="text-[10px] text-muted truncate">{item.detail}</p>}
                <p className="text-[10px] text-muted">{timeAgo(item.created_at)}</p>
              </div>
              {item.jumlah != null && item.jumlah > 0 && (
                <span className="text-xs font-mono font-bold shrink-0" style={{ color: accentColor }}>
                  Rp {item.jumlah.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActivityFeeds({ data, loading }: ActivityFeedsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-outline rounded-2xl shadow-sm p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const donasi = data.filter((d) => d.type === "donation" || d.type === "zakat");
  const bankInfaq = data.filter((d) => d.type === "bumm");
  const pengeluaran = data.filter((d) => d.type === "mustahik");

  return (
    <div>
      <h3 className="font-display font-bold text-lg text-ink mb-4">Aktivitas Terbaru</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeedColumn
          title="Donasi Terbaru"
          icon={HandCoins}
          items={donasi}
          accentColor="#10b981"
          iconBg="#ecfdf5"
        />
        <FeedColumn
          title="Bank Infaq"
          icon={Landmark}
          items={bankInfaq}
          accentColor="#4f46e5"
          iconBg="#eef2ff"
        />
        <FeedColumn
          title="Penyaluran"
          icon={Receipt}
          items={pengeluaran}
          accentColor="#ef4444"
          iconBg="#fef2f2"
        />
      </div>
    </div>
  );
}
