"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { logout } from "@/lib/actions/auth";
import { useDefaultMosque } from "@/lib/queries/public";
import {
  useAdminTransactions,
  useAdminMustahik,
  useAdminJamaah,
  useAdminInventaris,
  useAdminDonations,
  toLedgerEntry,
  toInventaris,
} from "@/lib/queries/admin";
import type { LedgerEntry, Inventaris } from "@/types";
import type { DonationSummary } from "@/lib/queries/admin";
import {
  Users, TrendingUp, Landmark,
  Map, LogOut, ArrowRight, BookMarked,
  Coins, ArrowDownToLine, Calendar, FolderHeart, Hammer,
  FileCheck, Heart, Activity, Sparkles
} from "lucide-react";

import OverviewTab from "@/components/admin/tabs/OverviewTab";
import InflowTab from "@/components/admin/tabs/InflowTab";
import OutflowTab from "@/components/admin/tabs/OutflowTab";
import SchedulesTab from "@/components/admin/tabs/SchedulesTab";
import JamaahTab from "@/components/admin/tabs/JamaahTab";
import AssetsTab from "@/components/admin/tabs/AssetsTab";
import MustahikTab from "@/components/admin/tabs/MustahikTab";
import DonaturTab from "@/components/admin/tabs/DonaturTab";
import MasterplanTab from "@/components/admin/tabs/MasterplanTab";

export default function DashboardPage() {
  const router = useRouter();
  const { appToast, triggerToast, user } = useAppContext();

  const [activeTab, setActiveTab] = useState<"overview" | "inflow" | "outflow" | "schedules" | "jamaah" | "assets" | "mustahik" | "donatur" | "masterplan">("overview");

  // ─── Active mosque ───
  const { data: defaultMosque } = useDefaultMosque();
  const mosqueId = defaultMosque?.id ?? "";

  // ─── Admin data hooks (enabled only when mosqueId is available) ───
  const { data: dbTransactions } = useAdminTransactions(mosqueId);
  const { data: dbMustahik } = useAdminMustahik(mosqueId);
  const { data: dbJamaah } = useAdminJamaah(mosqueId);
  const { data: dbInventaris } = useAdminInventaris(mosqueId);
  const { data: donationSummary } = useAdminDonations(mosqueId);

  // ─── Local state initialised from DB once ───
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [inventarisList, setInventarisList] = useState<Inventaris[]>([]);
  const txInit = useRef(false);
  const invInit = useRef(false);

  useEffect(() => {
    if (dbTransactions && !txInit.current) {
      setLedgerEntries(dbTransactions.map(toLedgerEntry));
      txInit.current = true;
    }
  }, [dbTransactions]);

  useEffect(() => {
    if (dbInventaris && !invInit.current) {
      setInventarisList(dbInventaris.map(toInventaris));
      invInit.current = true;
    }
  }, [dbInventaris]);

  const handleAddLedgerEntry = useCallback((entry: LedgerEntry) => {
    setLedgerEntries((prev) => [entry, ...prev]);
    triggerToast("Transaksi Berhasil", "Mutasi berhasil diverifikasi dan dicatat pada sistem.");
  }, [triggerToast]);

  const mustahikCount = useMemo(
    () => dbMustahik?.length ?? 0,
    [dbMustahik],
  );

  const jamaahList = useMemo(
    () => (dbJamaah ?? []).map((j) => ({ peran: j.peran ?? "Warga" })),
    [dbJamaah],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8 animate-fade-in" id="admin-dashboard-page">

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-b border-outline pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-extrabold text-ink tracking-tight">
              At-Taqwa Luminous Management Hub
            </h1>
            <span className="text-xs bg-success-subtle text-primary font-black px-2.5 py-1 rounded-full uppercase tracking-wider">PENGURUS INTI</span>
          </div>
          <p className="text-muted text-xs sm:text-sm mt-1">Konsol tata kelola digital Masjid Jami&apos; At-Taqwa: Rekam keuangan, jadwal da&apos;i, inventaris fisik, direktori jamaah, dan peta amil.</p>
        </div>

        <div className="flex gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => router.push("/admin/gis")}
            className="flex-1 sm:flex-initial bg-primary hover:bg-primary-deep active:scale-95 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" />
            Buka Peta GIS Mustahik
          </button>
          <button
            onClick={() => { logout(); }}
            className="border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-outline pb-px overflow-x-auto flex gap-1.5 scrollbar-thin">
        {[
          { id: "overview", label: "Overview & Tren", icon: Activity },
          { id: "donatur", label: "Donatur Tetap", icon: Heart },
          { id: "masterplan", label: "Masterplan 5 Th & Usaha", icon: Sparkles },
          { id: "inflow", label: "Input Kas Masuk", icon: Coins },
          { id: "outflow", label: "Pencatatan Keluar", icon: ArrowDownToLine },
          { id: "schedules", label: "Penjadwalan Masjid", icon: Calendar },
          { id: "jamaah", label: "Direktori Jamaah", icon: Users },
          { id: "assets", label: "Aset & Inventaris", icon: Hammer },
          { id: "mustahik", label: "Mustahik & GIS", icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3 px-4.5 rounded-t-xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all border-b-2 shrink-0 ${
                isActive
                  ? "border-primary text-primary bg-success-subtle/50"
                  : "border-transparent text-muted hover:text-primary hover:bg-bg"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          mustahikCount={mustahikCount}
          jamaahData={jamaahList}
          ledgerEntries={ledgerEntries}
          donationSummary={donationSummary}
          onNavigateToLaporan={() => router.push("/laporan")}
        />
      )}

      {activeTab === "inflow" && (
        <InflowTab mosqueId={mosqueId} onAddLedgerEntry={handleAddLedgerEntry} />
      )}

      {activeTab === "outflow" && (
        <OutflowTab mosqueId={mosqueId} onAddLedgerEntry={handleAddLedgerEntry} />
      )}

      {activeTab === "schedules" && (
        <SchedulesTab mosqueId={mosqueId} />
      )}

      {activeTab === "jamaah" && (
        <JamaahTab mosqueId={mosqueId} />
      )}

      {activeTab === "assets" && (
        <AssetsTab
          mosqueId={mosqueId}
          inventarisList={inventarisList}
          setInventarisList={setInventarisList}
        />
      )}

      {activeTab === "mustahik" && (
        <MustahikTab />
      )}

      {activeTab === "donatur" && (
        <DonaturTab mosqueId={mosqueId} onAddLedgerEntry={handleAddLedgerEntry} />
      )}

      {activeTab === "masterplan" && (
        <MasterplanTab />
      )}
    </div>
  );
}
