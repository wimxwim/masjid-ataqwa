"use client";

import React, { useState } from "react";
import { Activity, Flame, ShieldCheck, Landmark, ShoppingCart, User, Heart, Calculator, Info } from "lucide-react";
import { useDefaultMosque, usePublicActivityFeed } from "@/lib/queries/public";

const TYPE_LABEL: Record<string, string> = {
  donation: "Infaq/Shadaqah",
  zakat: "Zakat",
  bumm: "BUMM Belanja",
  mustahik: "Mustahik",
};

function formatWaktu(date: Date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function LiveActivityFeed() {
  const { data: mosque } = useDefaultMosque();
  const { data: feedData = [] } = usePublicActivityFeed(mosque?.id ?? "");

  const [density, setDensity] = useState<"ramai" | "sepi">("ramai");
  const [paused, setPaused] = useState<boolean>(false);

  const displayEvents = feedData.slice(0, 5);
  const tallyTotal = feedData.reduce((sum, item) => sum + Number(item.jumlah ?? 0), 0);

  const getEventBadge = (type: string) => {
    switch (type) {
      case "donation":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
            <Heart className="w-2.5 h-2.5 fill-emerald-800" /> Infaq/Shadaqah
          </span>
        );
      case "zakat":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100">
            <Landmark className="w-2.5 h-2.5" /> Zakat
          </span>
        );
      case "bumm":
        return (
          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-100">
            <ShoppingCart className="w-2.5 h-2.5" /> BUMM Belanja
          </span>
        );
      case "mustahik":
        return (
          <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-violet-100">
            <User className="w-2.5 h-2.5" /> Mustahik
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto" id="live-activity-feed">
      <div className="lg:col-span-5 bg-radial from-slate-900 to-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black font-mono text-emerald-400">ALIRAN KEBAIKAN REAL-TIME</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
            Timbangan Kebaikan Berputar Tiada Henti
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Memonitor secara live pergerakan dana masuk, penuaian zakat, dan pemberdayaan usaha BUMM At-Taqwa Ulujami oleh jamaah.
          </p>
        </div>

        <div className="my-8 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 relative z-10">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5 text-amber-400" /> TALLY HARI INI</span>
            <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px]">SINKRON</span>
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight">
            Rp {tallyTotal.toLocaleString("id-ID")}
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            *Merupakan penjumlahan otomatis seluruh transaksi yang diproses sistem At-Taqwa dalam siklus hari ini.
          </p>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frekuensi Aktivitas Masjid</span>
            <button onClick={() => setPaused(!paused)} className="text-[10px] text-amber-400 hover:underline font-mono">
              {paused ? "▶ MULAI" : "⏸ JEDA"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button onClick={() => setDensity("ramai")} className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${density === "ramai" ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/10" : "text-slate-400 hover:text-white"}`}>
              <Flame className="w-3.5 h-3.5" /> Padat & Ramai (2s)
            </button>
            <button onClick={() => setDensity("sepi")} className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${density === "sepi" ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/10" : "text-slate-400 hover:text-white"}`}>
              <Activity className="w-3.5 h-3.5" /> Tenang & Rileks (12s)
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500 animate-pulse" /> Papan Aktivitas Jamaah Aktif
            </span>
            <span className="text-xs bg-white text-slate-500 px-2.5 py-1 rounded-full border border-gray-100 shadow-2xs font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi Amil
            </span>
          </div>

          <div className="space-y-3 min-h-[340px] flex flex-col justify-start">
            {displayEvents.length > 0 ? (
              displayEvents.map((evt: any, idx: number) => (
                <div key={evt.id} className={`bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex justify-between items-start gap-4 transition-all duration-700 hover:scale-[1.01] hover:border-emerald-100 animate-slide-up`} style={{ opacity: 1 - idx * 0.22 }}>
                  <div className="space-y-2">
                    <div className="flex items-center flex-wrap gap-2">
                      {getEventBadge(evt.type)}
                      <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">• {formatWaktu(new Date(evt.created_at))}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {evt.nama}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                        Alamat: <span className="text-slate-700 font-semibold">{evt.alamat}</span>
                      </p>
                      <p className="text-xs text-slate-600 italic leading-relaxed bg-slate-50 border border-slate-100/50 p-2 rounded-lg mt-2 font-medium">&ldquo;{evt.detail}&rdquo;</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-600 font-bold block">Nominal</span>
                    <span className="text-base font-mono font-extrabold text-emerald-950">Rp {Number(evt.jumlah).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center py-16">
                <div className="text-center text-sm text-slate-400 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-medium">Belum ada aktivitas hari ini</p>
                  <p className="text-xs">Admin dapat menambahkan aktivitas dari panel admin</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl flex gap-2 items-start text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>
              Papan aktivitas ini mencerminkan <b>transparansi absolut</b> yang diusung oleh pengurus Masjid At-Taqwa Ulujami. Kepercayaan umat adalah marwah perjuangan kami.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
