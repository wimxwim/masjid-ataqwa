"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Plus, Search } from "lucide-react";
import { getJamaah, createJamaah } from "@/lib/actions/jamaah";

const rtRwOptions = [
  "01/01", "01/02", "01/03", "01/04",
  "01/05", "01/06", "01/07", "01/08",
];

const peranOptions = ["Warga", "Pengurus", "REMISYA", "Muzakki"];

interface JamaahRow {
  id: string;
  nama: string;
  phone: string | null;
  alamat: string | null;
  rt_rw: string | null;
  peran: string;
}

interface JamaahTabProps {
  mosqueId: string;
}

export default function JamaahTab({ mosqueId }: JamaahTabProps) {
  const [jamNama, setJamNama] = useState("");
  const [jamTelp, setJamTelp] = useState("");
  const [jamAlamat, setJamAlamat] = useState("");
  const [jamRtRw, setJamRtRw] = useState("01/05");
  const [jamPeran, setJamPeran] = useState("Warga");
  const [jamaahList, setJamaahList] = useState<JamaahRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadJamaah = useCallback(async () => {
    try {
      const data = await getJamaah(mosqueId);
      setJamaahList(data as unknown as JamaahRow[]);
    } catch { /* auth */ }
  }, [mosqueId]);

  useEffect(() => { loadJamaah(); }, [loadJamaah]);

  const filteredJamaah = jamaahList.filter((j) => {
    const q = searchQuery.toLowerCase();
    return (
      j.nama.toLowerCase().includes(q) ||
      (j.phone ?? "").toLowerCase().includes(q) ||
      (j.alamat ?? "").toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jamNama.trim() || !jamTelp.trim() || !jamAlamat.trim()) return;
    if (!mosqueId) return;

    try {
      await createJamaah({
        mosque_id: mosqueId,
        nama: jamNama.trim(),
        phone: jamTelp.trim(),
        alamat: jamAlamat.trim(),
        rt_rw: jamRtRw,
        peran: jamPeran,
      });
      await loadJamaah();
      setJamNama("");
      setJamTelp("");
      setJamAlamat("");
      setJamRtRw("01/05");
      setJamPeran("Warga");
    } catch { /* handled */ }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5">
        <div className="bg-surface border border-outline rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-outline pb-3">
            <h3 className="font-display font-bold text-xl text-primary-deep flex items-center gap-1.5">
              <Users className="w-5 h-5 text-primary" />
              Tambah Data Jamaah / Warga
            </h3>
            <p className="text-xs text-muted mt-1">
              Input data jamaah dan warga sekitar Masjid At-Taqwa untuk database direktorat kependudukan masjid.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Nama Lengkap</label>
              <input type="text" required value={jamNama} onChange={(e) => setJamNama(e.target.value)}
                placeholder="Contoh: Ahmad Fauzan"
                className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">No. Telepon / WhatsApp</label>
              <input type="tel" required value={jamTelp} onChange={(e) => setJamTelp(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Alamat</label>
              <textarea required rows={2} value={jamAlamat} onChange={(e) => setJamAlamat(e.target.value)}
                placeholder="Contoh: Jl. H. Nawi Raya, RT 01/05, Ulujami"
                className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">RT / RW</label>
                <select value={jamRtRw} onChange={(e) => setJamRtRw(e.target.value)}
                  className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors">
                  {rtRwOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Peran / Status</label>
                <select value={jamPeran} onChange={(e) => setJamPeran(e.target.value)}
                  className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors">
                  {peranOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
            </div>
            <button type="submit"
              className="w-full bg-primary hover:bg-primary-deep active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              Simpan Data Jamaah
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="bg-surface border border-outline rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Direktori Jamaah
              </h3>
              <p className="text-xs text-muted mt-0.5">{jamaahList.length} jamaah terdaftar</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jamaah..."
                className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2 pl-9 pr-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors" />
            </div>
          </div>

          <div className="border border-outline rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg text-muted font-bold uppercase tracking-wider border-b border-outline">
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Telepon</th>
                    <th className="py-3 px-4">Alamat</th>
                    <th className="py-3 px-4 text-center">RT/RW</th>
                    <th className="py-3 px-4 text-center">Peran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJamaah.map((j) => (
                    <tr key={j.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-ink whitespace-nowrap">{j.nama}</td>
                      <td className="py-3 px-4 font-mono text-muted whitespace-nowrap">{j.phone}</td>
                      <td className="py-3 px-4 text-muted max-w-[200px] truncate" title={j.alamat ?? ""}>{j.alamat}</td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-ink">{j.rt_rw}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          j.peran === "Pengurus" ? "bg-accent/10 text-accent"
                            : j.peran === "REMISYA" ? "bg-indigo-50 text-indigo-700"
                              : j.peran === "Muzakki" ? "bg-success-subtle text-primary"
                                : "bg-bg text-muted"
                        }`}>{j.peran}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredJamaah.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted text-xs">
                        {searchQuery ? "Tidak ada jamaah yang cocok dengan pencarian." : "Belum ada data jamaah."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
