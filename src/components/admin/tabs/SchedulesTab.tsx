"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, BookOpen, Plus } from "lucide-react";
import { getJadwalImam, createJadwal } from "@/lib/actions/jadwal-imam";

interface JadwalImamRow {
  id: string;
  tanggal: string;
  hari: string | null;
  imam_subuh: string | null;
  imam_maghrib_isya: string | null;
  khatib_jumat: string | null;
}

interface SchedulesTabProps {
  mosqueId: string;
}

export default function SchedulesTab({ mosqueId }: SchedulesTabProps) {
  const [schTanggal, setSchTanggal] = useState("");
  const [schHari, setSchHari] = useState("Senin");
  const [schSubuh, setSchSubuh] = useState("");
  const [schMaghrib, setSchMaghrib] = useState("");
  const [schKhatib, setSchKhatib] = useState("");
  const [jadwalImamList, setJadwalImamList] = useState<JadwalImamRow[]>([]);

  const loadImam = useCallback(async () => {
    try {
      const data = await getJadwalImam(mosqueId);
      setJadwalImamList(data as unknown as JadwalImamRow[]);
    } catch { /* auth */ }
  }, [mosqueId]);

  useEffect(() => { loadImam(); }, [loadImam]);

  const handleAddImam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schTanggal || !schSubuh || !schMaghrib) return;

    try {
      await createJadwal({
        mosque_id: mosqueId,
        tanggal: schTanggal,
        hari: schHari,
        imam_subuh: schSubuh,
        imam_maghrib_isya: schMaghrib,
        khatib_jumat: schKhatib || null,
      });
      await loadImam();
      setSchTanggal("");
      setSchSubuh("");
      setSchMaghrib("");
      setSchKhatib("");
    } catch { /* handled */ }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start reveal">
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-strong rounded-2xl shadow-2 p-6 space-y-4">
          <h4 className="font-display font-bold text-base text-ink flex items-center gap-2 border-b border-outline/50 pb-2">
            <Calendar className="w-4.5 h-4.5 text-primary" />
            Log Jadwal Imam &amp; Khatib
          </h4>

          <form onSubmit={handleAddImam} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase">Hari</label>
                <select value={schHari} onChange={(e) => setSchHari(e.target.value)}
                  className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-1">
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                  <option value="Ahad">Ahad</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase">Tanggal</label>
                <input type="date" required value={schTanggal} onChange={(e) => setSchTanggal(e.target.value)}
                  className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2 px-3 rounded-xl text-xs font-mono transition-all shadow-1" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Imam Shalat Subuh</label>
              <input type="text" required value={schSubuh} onChange={(e) => setSchSubuh(e.target.value)}
                placeholder="Contoh: Ust. Hilman Syafi'i"
                className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Imam Maghrib &amp; Isya</label>
              <input type="text" required value={schMaghrib} onChange={(e) => setSchMaghrib(e.target.value)}
                placeholder="Contoh: Ust. M. Ridwan"
                className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">Khatib Jumat (Khusus Jumat)</label>
              <input type="text" value={schKhatib} onChange={(e) => setSchKhatib(e.target.value)}
                placeholder="Contoh: K.H. Syarif Rahmat, MA"
                className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-1" />
            </div>
            <button type="submit"
              className="w-full bg-primary hover:bg-primary-deep text-white font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-glow active:scale-95 transition-all text-xs py-2.5 flex items-center justify-center gap-1 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Simpan Jadwal Harian
            </button>
          </form>
        </div>

        <div className="glass-strong rounded-2xl shadow-2 p-6 space-y-4">
          <h4 className="font-display font-bold text-base text-ink flex items-center gap-2 border-b border-outline/50 pb-2">
            <BookOpen className="w-4.5 h-4.5 text-primary" />
            Tambah Kajian Rutin
          </h4>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
            <p className="text-xs text-muted italic">Fitur tambah kajian akan tersambung ke database pada update berikutnya.</p>
          </form>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="glass-strong rounded-2xl shadow-2 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-outline pb-2.5">
            <h4 className="font-display font-extrabold text-ink text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Schedules Imam Shalat &amp; Khatib Jumat Berjalan
            </h4>
            <span className="text-xs bg-bg text-muted font-mono font-bold px-2 py-0.5 rounded border border-outline">
              {jadwalImamList.length} Jadwal
            </span>
          </div>

          <div className="glass overflow-hidden rounded-[var(--radius-card)] shadow-2 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg text-muted font-bold uppercase tracking-wider border-b border-outline">
                  <th className="p-3">Hari, Tanggal</th>
                  <th className="p-3">Subuh</th>
                  <th className="p-3">Maghrib &amp; Isya</th>
                  <th className="p-3">Khatib Jumat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/50">
                {jadwalImamList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted text-[11px]">
                      Belum ada jadwal imam &amp; khatib.
                    </td>
                  </tr>
                ) : (
                  jadwalImamList.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-3 font-semibold text-ink">{item.hari}, {item.tanggal}</td>
                      <td className="p-3 text-muted">{item.imam_subuh}</td>
                      <td className="p-3 text-muted">{item.imam_maghrib_isya}</td>
                      <td className="p-3 font-semibold text-primary">{item.khatib_jumat ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
