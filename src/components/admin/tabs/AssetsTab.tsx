"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Inventaris } from "@/types";
import { Hammer, Plus } from "lucide-react";
import { getInventaris, createInventaris } from "@/lib/actions/inventaris";

interface AssetsTabProps {
  mosqueId: string;
  inventarisList: Inventaris[];
  setInventarisList: React.Dispatch<React.SetStateAction<Inventaris[]>>;
}

export default function AssetsTab({ mosqueId, inventarisList, setInventarisList }: AssetsTabProps) {
  const [invNama, setInvNama] = useState("");
  const [invJumlah, setInvJumlah] = useState("");
  const [invSatuan, setInvSatuan] = useState("Unit");
  const [invKondisi, setInvKondisi] = useState<"Baik" | "Rusak Ringan" | "Rusak Berat">("Baik");
  const [invAsal, setInvAsal] = useState<"Wakaf" | "Pembelian Kas">("Wakaf");

  const loadInventaris = useCallback(async () => {
    try {
      const data = await getInventaris(mosqueId);
      setInventarisList(data.map((item: any) => ({
        id: item.id,
        namaBarang: item.nama_barang,
        jumlah: item.jumlah ?? 1,
        satuan: item.satuan ?? "Unit",
        kondisi: item.kondisi ?? "Baik",
        asal: item.asal ?? "Wakaf",
      })));
    } catch { /* auth */ }
  }, [mosqueId, setInventarisList]);

  useEffect(() => { loadInventaris(); }, [loadInventaris]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(invJumlah);
    if (!invNama || isNaN(qtyNum) || qtyNum <= 0) return;

    try {
      await createInventaris({
        mosque_id: mosqueId,
        nama_barang: invNama,
        jumlah: qtyNum,
        satuan: invSatuan,
        kondisi: invKondisi,
        asal: invAsal,
      });
      await loadInventaris();
      setInvNama("");
      setInvJumlah("");
      setInvSatuan("Unit");
      setInvKondisi("Baik");
      setInvAsal("Wakaf");
    } catch { /* handled */ }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-surface border border-outline rounded-2xl shadow-sm p-6 space-y-4">
        <h4 className="font-display font-bold text-base text-ink flex items-center gap-2 border-b border-outline/50 pb-2">
          <Hammer className="w-4.5 h-4.5 text-primary" />
          Catat Barang Inventaris Baru
        </h4>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase">Nama Barang</label>
            <input type="text" required value={invNama} onChange={(e) => setInvNama(e.target.value)}
              placeholder="Contoh: Karpet Sajadah Turki"
              className="w-full bg-bg border border-outline py-1.5 px-2.5 rounded-lg text-xs font-semibold" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Jumlah</label>
              <input type="number" required min="1" value={invJumlah} onChange={(e) => setInvJumlah(e.target.value)}
                placeholder="Contoh: 10"
                className="w-full bg-bg border border-outline py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Satuan</label>
              <select value={invSatuan} onChange={(e) => setInvSatuan(e.target.value)}
                className="w-full bg-bg border border-outline py-1.5 px-2.5 rounded-lg text-xs font-semibold">
                <option value="Unit">Unit</option>
                <option value="Buah">Buah</option>
                <option value="Set">Set</option>
                <option value="Paket">Paket</option>
                <option value="Lusin">Lusin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Kondisi</label>
              <select value={invKondisi} onChange={(e) => setInvKondisi(e.target.value as "Baik" | "Rusak Ringan" | "Rusak Berat")}
                className="w-full bg-bg border border-outline py-1.5 px-2.5 rounded-lg text-xs font-semibold">
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Asal</label>
              <select value={invAsal} onChange={(e) => setInvAsal(e.target.value as "Wakaf" | "Pembelian Kas")}
                className="w-full bg-bg border border-outline py-1.5 px-2.5 rounded-lg text-xs font-semibold">
                <option value="Wakaf">Wakaf</option>
                <option value="Pembelian Kas">Pembelian Kas</option>
              </select>
            </div>
          </div>
          <button type="submit"
            className="w-full bg-primary hover:bg-primary-deep text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Daftarkan Aset
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 bg-surface border border-outline rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-outline pb-2.5">
          <h4 className="font-display font-extrabold text-ink text-sm flex items-center gap-2">
            <Hammer className="w-4 h-4 text-primary" />
            Daftar Inventaris Fisik Masjid
          </h4>
          <span className="text-xs bg-bg text-slate-500 font-mono font-bold px-2 py-0.5 rounded border border-outline">
            {inventarisList.length} Barang
          </span>
        </div>

        <div className="border border-outline rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg text-muted font-bold uppercase tracking-wider border-b border-outline">
                <th className="p-3">Nama Barang</th>
                <th className="p-3 text-center">Jumlah</th>
                <th className="p-3 text-center">Satuan</th>
                <th className="p-3 text-center">Kondisi</th>
                <th className="p-3 text-center">Asal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventarisList.map((item) => (
                <tr key={item.id} className="hover:bg-bg/50">
                  <td className="p-3 font-semibold text-ink">{item.namaBarang}</td>
                  <td className="p-3 text-center font-mono font-bold text-ink">{item.jumlah}</td>
                  <td className="p-3 text-center font-medium text-muted">{item.satuan}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.kondisi === "Baik"
                        ? "bg-success-subtle text-primary border border-primary/20"
                        : item.kondisi === "Rusak Ringan"
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "bg-red-50 text-red-700 border border-red-100"
                    }`}>{item.kondisi}</span>
                  </td>
                  <td className="p-3 text-center font-medium text-muted">{item.asal}</td>
                </tr>
              ))}
              {inventarisList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted text-xs">
                    Belum ada data inventaris.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
