"use client";

import { useState, useMemo, useCallback, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
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
  Users, TrendingUp, Map, BookOpen, Globe, FolderHeart,
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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { triggerToast } = useAppContext();

  const activeTab = tabParam && ["inflow", "outflow", "schedules", "jamaah", "assets", "mustahik", "donatur", "masterplan"].includes(tabParam)
    ? tabParam as "inflow" | "outflow" | "schedules" | "jamaah" | "assets" | "mustahik" | "donatur" | "masterplan"
    : "overview";

  const { data: defaultMosque } = useDefaultMosque();
  const mosqueId = defaultMosque?.id ?? "";

  const { data: dbTransactions } = useAdminTransactions(mosqueId);
  const { data: dbMustahik } = useAdminMustahik(mosqueId);
  const { data: dbJamaah } = useAdminJamaah(mosqueId);
  const { data: dbInventaris } = useAdminInventaris(mosqueId);
  const { data: donationSummary } = useAdminDonations(mosqueId);

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
    () => (dbJamaah ?? []).map((j) => ({ peran: String((j as Record<string, unknown>).peran ?? "Warga") })),
    [dbJamaah],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8 animate-fade-in" id="admin-dashboard-page">

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 pb-6 border-b border-outline">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink tracking-tight">
            Dashboard Masjid
          </h1>
          <p className="text-sm text-muted mt-1">Ringkasan tata kelola Masjid Jami&apos; At-Taqwa Ulujami</p>
        </div>

        <div className="flex gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => router.push("/admin/gis")}
            className="flex-1 sm:flex-initial bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" />
            Buka Peta Mustahik
          </button>
        </div>
      </div>

      {/* Tab Content — hanya 1 tab aktif */}
      {activeTab === "overview" && (
        <OverviewTab mosqueId={mosqueId} />
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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <div className="flex items-center justify-center h-64 text-muted text-sm">Memuat dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
