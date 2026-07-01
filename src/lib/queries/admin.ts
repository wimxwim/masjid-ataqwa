"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getTransactions } from "@/lib/actions/transactions";
import { getMustahiks } from "@/lib/actions/mustahik";
import { getJamaah } from "@/lib/actions/jamaah";
import { getInventaris } from "@/lib/actions/inventaris";
import { getDonaturTetap } from "@/lib/actions/donatur-tetap";
import { getPrograms } from "@/lib/actions/programs";
import { getMushafirAid } from "@/lib/actions/mushafir";
import { getEmployees } from "@/lib/actions/employees";
import { getActivityFeed } from "@/lib/actions/activity";
import { getSantri } from "@/lib/actions/santri";
import { getDonations } from "@/lib/actions/donations";
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

/* ─── Hooks ─── */

export function useAdminTransactions(mosqueId: string, type?: string) {
  return useQuery({
    queryKey: queryKeys.admin.transactions(mosqueId, type),
    queryFn: () => getTransactions(mosqueId, type),
    enabled: !!mosqueId,
  });
}

export function useAdminMustahik(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.mustahik(mosqueId),
    queryFn: () => getMustahiks(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminJamaah(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.jamaah(mosqueId),
    queryFn: () => getJamaah(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminInventaris(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.inventaris(mosqueId),
    queryFn: () => getInventaris(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminDonaturTetap(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.donatur(mosqueId),
    queryFn: () => getDonaturTetap(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminPrograms(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.programs(mosqueId),
    queryFn: () => getPrograms(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminMushafir(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.mushafir(mosqueId),
    queryFn: () => getMushafirAid(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminEmployees(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.employees(mosqueId),
    queryFn: () => getEmployees(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminActivity(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.activity(mosqueId),
    queryFn: () => getActivityFeed(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useAdminSantri(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.admin.santri(mosqueId),
    queryFn: () => getSantri(mosqueId),
    enabled: !!mosqueId,
  });
}

/* ─── Donation summary type for overview ─── */
export type DonationSummary = {
  total: number;
  items: { akad_type: string; program_name: string | null; amount: number; donor_name: string | null; paid_at: string | null }[];
};

export function useAdminDonations(mosqueId: string) {
  return useQuery({
    queryKey: [...queryKeys.admin.all, "donations", mosqueId] as const,
    queryFn: async () => {
      const rows = await getDonations(mosqueId);
      const paid = rows.filter((d) => d.payment_status === "paid");
      return {
        total: paid.reduce((s, d) => s + d.amount, 0),
        items: paid.map((d) => ({
          akad_type: d.akad_type,
          program_name: d.program_name,
          amount: d.amount,
          donor_name: d.donor_name,
          paid_at: d.paid_at?.toISOString() ?? null,
        })),
      } satisfies DonationSummary;
    },
    enabled: !!mosqueId,
  });
}
