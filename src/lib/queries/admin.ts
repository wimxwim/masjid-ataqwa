"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { LedgerEntry, MustahikDb, Inventaris } from "@/types";

/* ─── Type Adapters ─── */

export function toLedgerEntry(tx: {
  id: string;
  transaction_date: string | null;
  description: string | null;
  type: string;
  category: string;
  amount: number;
  fund_type?: string | null;
  akad_type?: string | null;
}): LedgerEntry {
  return {
    id: tx.id,
    tanggal: tx.transaction_date ?? "",
    keterangan: tx.description ?? tx.category,
    tipe: tx.type as "Pemasukan" | "Pengeluaran",
    kategori: tx.category,
    jumlah: tx.amount,
    fund_type: tx.fund_type ?? undefined,
    akad_type: tx.akad_type ?? undefined,
  };
}

export function toInventaris(item: {
  id: string;
  nama_barang: string;
  jumlah: number | null;
  satuan: string | null;
  kondisi: string | null;
  asal: string | null;
}): Inventaris {
  return {
    id: item.id,
    namaBarang: item.nama_barang,
    jumlah: item.jumlah ?? 1,
    satuan: item.satuan ?? "Unit",
    kondisi: (item.kondisi ?? "Baik") as "Baik" | "Rusak Ringan" | "Rusak Berat",
    asal: (item.asal ?? "Wakaf") as "Wakaf" | "Pembelian Kas",
  };
}

export function toMustahikShort(db: MustahikDb): {
  id: string;
  name: string;
  ring_number: number | null;
  desil_level: string | null;
  is_active: boolean | null;
} {
  return {
    id: db.id,
    name: db.name,
    ring_number: db.ring_number,
    desil_level: db.desil_level,
    is_active: db.is_active,
  };
}

/* ─── Combined overview hook (calls API route instead of server actions) ─── */

export function useAdminOverview(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.overview(mosqueId),
    queryFn: async () => {
      const res = await fetch(`/api/admin/overview?mosqueId=${mosqueId}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{
        transactions: Array<Record<string, unknown>>;
        mustahik: Array<Record<string, unknown>>;
        jamaah: Array<Record<string, unknown>>;
        inventaris: Array<Record<string, unknown>>;
        donations: Array<Record<string, unknown>>;
      }>;
    },
    enabled: !!mosqueId,
  });
}

/* ─── Legacy single-entity hooks (now read from overview) ─── */

export function useAdminTransactions(mosqueId: string, type?: string) {
  const { data } = useAdminOverview(mosqueId);
  return useQuery({
    queryKey: queryKeys.admin.transactions(mosqueId, type),
    queryFn: () => {
      const list = (data?.transactions ?? []) as Parameters<typeof toLedgerEntry>[0][];
      return type ? list.filter((t) => t.type === type) : list;
    },
    enabled: !!mosqueId && !!data,
  });
}

export function useAdminMustahik(mosqueId: string) {
  const { data } = useAdminOverview(mosqueId);
  return useQuery({
    queryKey: queryKeys.admin.mustahik(mosqueId),
    queryFn: () => data?.mustahik as MustahikDb[] | undefined ?? [],
    enabled: !!mosqueId && !!data,
  });
}

export function useAdminJamaah(mosqueId: string) {
  const { data } = useAdminOverview(mosqueId);
  return useQuery({
    queryKey: queryKeys.admin.jamaah(mosqueId),
    queryFn: () => data?.jamaah as Array<Record<string, unknown>> | undefined ?? [],
    enabled: !!mosqueId && !!data,
  });
}

export function useAdminInventaris(mosqueId: string) {
  const { data } = useAdminOverview(mosqueId);
  return useQuery({
    queryKey: queryKeys.admin.inventaris(mosqueId),
    queryFn: () => (data?.inventaris ?? []) as Parameters<typeof toInventaris>[0][],
    enabled: !!mosqueId && !!data,
  });
}

export function useAdminDonations(mosqueId: string) {
  const { data } = useAdminOverview(mosqueId);
  return useQuery({
    queryKey: [...queryKeys.admin.all, "donations", mosqueId] as const,
    queryFn: () => {
      const rows = (data?.donations ?? []) as Array<Record<string, unknown>>;
      const paid = rows.filter((r) => r.payment_status === "paid");
      return {
        total: paid.reduce((s, r) => s + (r.amount as number), 0),
        items: paid.map((r) => ({
          akad_type: (r.akad_type as string | null) ?? "",
          program_name: (r.program_name as string | null) ?? null,
          amount: r.amount as number,
          donor_name: (r.donor_name as string | null) ?? null,
          paid_at: (r.paid_at as string | null) ?? null,
        })),
      } satisfies DonationSummary;
    },
    enabled: !!mosqueId && !!data,
  });
}

/* ─── Dashboard hooks ─── */
async function fetchDashboard(mosqueId: string, type: string) {
  const url = `/api/admin/dashboard?mosqueId=${encodeURIComponent(mosqueId)}&type=${type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Dashboard ${type} failed: ${res.status}`);
  return res.json() as Promise<unknown>;
}

export interface DashboardSummary {
  saldo_kas: number;
  total_masuk: number;
  total_keluar: number;
  donatur_aktif: number;
  mustahik_aktif: number;
}

export interface DashboardTrend {
  tanggal: string;
  pemasukan: number;
  pengeluaran: number;
}

export interface DashboardZiswaf {
  fund_type: string;
  total: number;
}

export interface DashboardActivity {
  type: string;
  nama: string;
  alamat: string | null;
  detail: string | null;
  jumlah: number | null;
  created_at: string;
}

export function useAdminDashboardSummary(mosqueId: string) {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.admin.dashboard(mosqueId).summary,
    queryFn: () => fetchDashboard(mosqueId, "summary") as Promise<DashboardSummary>,
    enabled: !!mosqueId,
  });
}

export function useAdminTrend30d(mosqueId: string) {
  return useQuery<DashboardTrend[]>({
    queryKey: queryKeys.admin.dashboard(mosqueId).trend30d,
    queryFn: () => fetchDashboard(mosqueId, "trend30d") as Promise<DashboardTrend[]>,
    enabled: !!mosqueId,
  });
}

export function useAdminZiswafBreakdown(mosqueId: string) {
  return useQuery<DashboardZiswaf[]>({
    queryKey: queryKeys.admin.dashboard(mosqueId).ziswaf,
    queryFn: () => fetchDashboard(mosqueId, "ziswaf") as Promise<DashboardZiswaf[]>,
    enabled: !!mosqueId,
  });
}

export function useAdminActivityFeeds(mosqueId: string) {
  return useQuery<DashboardActivity[]>({
    queryKey: queryKeys.admin.dashboard(mosqueId).activity,
    queryFn: () => fetchDashboard(mosqueId, "activity") as Promise<DashboardActivity[]>,
    enabled: !!mosqueId,
  });
}

/* ─── Donation summary type for overview ─── */
export type DonationSummary = {
  total: number;
  items: { akad_type: string; program_name: string | null; amount: number; donor_name: string | null; paid_at: string | null }[];
};
