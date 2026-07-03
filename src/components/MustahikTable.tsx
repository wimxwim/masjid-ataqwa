"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getMustahiks, createMustahik, updateMustahik, deleteMustahik } from "@/lib/actions/mustahik";
import { getAsnafList } from "@/lib/actions/asnaf";
import type { InsertAsnaf } from "@/lib/actions/asnaf";
import { MustahikDb } from "@/types";
import { Search, Plus, X, Pencil, Trash2, MapPin, Navigation, ScanLine } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false, 
  loading: () => <div className="h-[200px] flex items-center justify-center bg-bg border border-outline rounded-xl text-xs text-muted">Memuat Peta Interaktif...</div> 
});
import KtpScanner from "@/components/KtpScanner";
import type { KtpData } from "@/components/KtpScanner";
import { hashNik } from "@/lib/nik-utils";

const PROGRAM_TYPES = [
  { value: "", label: "Pilih Program" },
  { value: "zakat", label: "Zakat" },
  { value: "infaq", label: "Infaq/Sedekah" },
  { value: "qardhul_hasan", label: "Qardhul Hasan" },
  { value: "beasiswa", label: "Beasiswa" },
  { value: "pemberdayaan", label: "Pemberdayaan" },
];

export default function MustahikTable() {
  const [data, setData] = useState<MustahikDb[]>([]);
  const [asnafList, setAsnafList] = useState<(InsertAsnaf & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRing, setFilterRing] = useState<number | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MustahikDb | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [d, a] = await Promise.all([getMustahiks(), getAsnafList()]);
      setData(d);
      setAsnafList(a as (InsertAsnaf & { id: string })[]);
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((m) => {
    if (filterRing !== "all" && m.ring_number !== filterRing) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.phone?.includes(q));
  });

  const ringLabel = (r: number | null) => {
    if (!r) return "-";
    const labels = ["", "Ring 1", "Ring 2", "Ring 3", "Ring 4"];
    return labels[r] || `Ring ${r}`;
  };

  const desilLabel = (d: string | null) => {
    if (!d) return "-";
    const labels: Record<string, string> = { "1": "Desil 1", "2": "Desil 2", "3": "Desil 3", "4": "Desil 4" };
    return labels[d] || d;
  };

  const ringColor = (r: number | null) => {
    if (!r) return "bg-gray-100 text-gray-600";
    const colors = ["", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-orange-100 text-orange-700", "bg-red-100 text-red-700"];
    return colors[r] || "bg-gray-100 text-gray-600";
  };

  const asnafName = (id: string | null) => {
    if (!id) return "-";
    return asnafList.find((a) => a.id === id)?.name || "-";
  };

  const programLabel = (p: string | null) => {
    if (!p) return "-";
    return PROGRAM_TYPES.find((pt) => pt.value === p)?.label || p;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Manajemen Mustahik</h2>
          <p className="text-sm text-muted">{data.length} mustahik terdaftar</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Mustahik
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Cari nama atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline bg-surface text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={filterRing}
          onChange={(e) => setFilterRing(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-3 py-2 rounded-xl border border-outline bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">Semua Ring</option>
          <option value={1}>Ring 1</option>
          <option value={2}>Ring 2</option>
          <option value={3}>Ring 3</option>
          <option value={4}>Ring 4</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>
      )}

      {/* Table */}
      <div className="bg-surface border border-outline rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted text-sm">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted text-sm">
            {data.length === 0 ? "Belum ada data mustahik. Klik 'Tambah Mustahik' untuk memulai." : "Tidak ada hasil pencarian."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg border-b border-outline text-left text-muted text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Asnaf</th>
                  <th className="px-4 py-3 font-semibold">Program</th>
                  <th className="hidden md:table-cell px-4 py-3 font-semibold">NIM</th>
                  <th className="px-4 py-3 font-semibold">Ring</th>
                  <th className="hidden md:table-cell px-4 py-3 font-semibold">Desil</th>
                  <th className="hidden md:table-cell px-4 py-3 font-semibold">Had Kifayah</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{m.name}</div>
                      {m.phone && <div className="text-xs text-muted">{m.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {asnafName(m.asnaf_id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{programLabel(m.program_type)}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-muted font-mono text-xs">{m.nomor_induk_mustahik || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${ringColor(m.ring_number)}`}>
                        {ringLabel(m.ring_number)}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-muted">{desilLabel(m.desil_level)}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-muted">
                      {m.had_kifayah_score != null ? m.had_kifayah_score.toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {m.lat && m.lng && (
                          <Link
                            href={`https://www.google.com/maps?q=${m.lat},${m.lng}`}
                            target="_blank"
                            className="hidden md:inline-flex p-2.5 rounded-lg hover:bg-bg text-muted hover:text-primary transition-colors"
                            title="Buka di Google Maps"
                          >
                            <MapPin className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => { setEditing(m); setShowForm(true); setError(""); }}
                          className="p-2.5 rounded-lg hover:bg-bg text-muted hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Hapus ${m.name}?`)) return;
                            const res = await deleteMustahik(m.id);
                            if (res.error) { setError(res.error); return; }
                            load();
                          }}
                          className="p-2.5 rounded-lg hover:bg-bg text-muted hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <MustahikForm
          asnafList={asnafList}
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function MustahikForm({
  asnafList,
  initial,
  onClose,
  onSaved,
}: {
  asnafList: (InsertAsnaf & { id: string })[];
  initial: MustahikDb | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [nikRaw, setNikRaw] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const nikHashRef = useRef<HTMLInputElement>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolokasi tidak didukung browser ini.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (latRef.current) latRef.current.value = pos.coords.latitude.toFixed(6);
        if (lngRef.current) lngRef.current.value = pos.coords.longitude.toFixed(6);
        setGpsLoading(false);
      },
      (err) => {
        setError(`Gagal dapat lokasi: ${err.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleScan = async (ktp: KtpData) => {
    if (nameRef.current && ktp.name) nameRef.current.value = ktp.name;
    if (addressRef.current && ktp.address) addressRef.current.value = ktp.address;
    setNikRaw(ktp.nik);
    if (nikHashRef.current) nikHashRef.current.value = ktp.nikHash;
  };

  const handleClearScan = () => {
    if (nameRef.current) nameRef.current.value = "";
    setNikRaw("");
    if (nikHashRef.current) nikHashRef.current.value = "";
    if (addressRef.current) addressRef.current.value = "";
  };

  const handleNikManual = async (nik: string) => {
    setNikRaw(nik);
    if (nik.length === 16 && nikHashRef.current) {
      nikHashRef.current.value = await hashNik(nik);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (nikRaw.length > 0 && nikRaw.length !== 16) {
      setError("NIK harus 16 digit.");
      setSubmitting(false);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const res = initial
      ? await updateMustahik(initial.id, fd)
      : await createMustahik(fd);
    if (res?.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface rounded-2xl border border-outline shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-outline">
          <h3 className="font-display font-bold text-lg text-ink">
            {initial ? "Edit Mustahik" : "Tambah Mustahik Baru"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-muted hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>
          )}

          {/* KTP Scanner — hanya untuk create */}
          {!initial && (
            <div className="bg-bg rounded-xl border border-outline p-3">
              <KtpScanner onScan={handleScan} onClear={handleClearScan} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-ink mb-1">Nama *</label>
              <input
                ref={nameRef}
                name="name"
                defaultValue={initial?.name || ""}
                required
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Telepon</label>
              <input
                name="phone"
                defaultValue={initial?.phone || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Ring</label>
              <select
                name="ring_number"
                defaultValue={initial?.ring_number || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Pilih Ring</option>
                <option value="1">Ring 1 (&lt;500m)</option>
                <option value="2">Ring 2 (500m - 1km)</option>
                <option value="3">Ring 3 (&gt;1km)</option>
              </select>
            </div>

            {/* Asnaf */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-ink mb-1">Kategori Asnaf</label>
              <select
                name="asnaf_id"
                defaultValue={initial?.asnaf_id || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Pilih Asnaf</option>
                {asnafList.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.arabic_name})</option>
                ))}
              </select>
            </div>

            {/* Sub Asnaf */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Sub Asnaf</label>
              <input
                name="sub_asnaf"
                defaultValue={initial?.sub_asnaf || ""}
                placeholder="Misal: janda, anak yatim"
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Program Type */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Jenis Program</label>
              <select
                name="program_type"
                defaultValue={initial?.program_type || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {PROGRAM_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            {/* NIM Mustahik */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                Nomor Induk Mustahik
              </label>
              <input
                name="nomor_induk_mustahik"
                defaultValue={initial?.nomor_induk_mustahik || ""}
                placeholder="NIM-2026-001"
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Had Kifayah */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Had Kifayah Score</label>
              <input
                name="had_kifayah_score"
                type="number"
                defaultValue={initial?.had_kifayah_score || ""}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-ink mb-1">Alamat *</label>
              <textarea
                ref={addressRef}
                name="address"
                defaultValue={initial?.address || ""}
                required
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Desil</label>
              <select
                name="desil_level"
                defaultValue={initial?.desil_level || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Pilih Desil</option>
                <option value="1">Desil 1</option>
                <option value="2">Desil 2</option>
                <option value="3">Desil 3</option>
                <option value="4">Desil 4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Pendapatan/Bulan</label>
              <input
                name="monthly_income"
                type="number"
                defaultValue={initial?.monthly_income || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Tanggungan</label>
              <input
                name="dependents"
                type="number"
                defaultValue={initial?.dependents || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Jenis Usaha</label>
              <input
                name="usaha_type"
                defaultValue={initial?.usaha_type || ""}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* NIK */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                <ScanLine className="w-3 h-3 inline mr-1 text-primary" />NIK
              </label>
              <input
                value={nikRaw}
                onChange={(e) => handleNikManual(e.target.value)}
                placeholder="Scan KTP atau ketik manual"
                maxLength={16}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-[10px] text-muted mt-0.5">NIK otomatis di-hash SHA-256 — aman</p>
              <input type="hidden" name="nik_hash" ref={nikHashRef} />
            </div>

            {/* Koordinat — GPS Picker */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-ink mb-2 flex justify-between items-center">
                <span>Titik Kordinat Lokasi Mustahik</span>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={gpsLoading}
                  className="px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-[10px] font-medium transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  <Navigation className={`w-3 h-3 ${gpsLoading ? "animate-pulse" : ""}`} />
                  {gpsLoading ? "Mendeteksi..." : "Gunakan GPS HP"}
                </button>
              </label>
              
              <div className="mb-2 relative z-0">
                <MapPicker 
                  defaultLat={initial?.lat || undefined} 
                  defaultLng={initial?.lng || undefined} 
                  onPositionChange={(lat, lng) => {
                    if (latRef.current) latRef.current.value = lat.toString();
                    if (lngRef.current) lngRef.current.value = lng.toString();
                  }} 
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={latRef}
                  name="lat"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  defaultValue={initial?.lat || ""}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-xl border border-outline bg-surface text-sm text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-not-allowed"
                />
                <input
                  ref={lngRef}
                  name="lng"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  defaultValue={initial?.lng || ""}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-xl border border-outline bg-surface text-sm text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted mt-1">Geser pin di peta untuk mengubah koordinat secara otomatis.</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-ink mb-1">Catatan</label>
              <textarea
                name="notes"
                defaultValue={initial?.notes || ""}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-outline bg-bg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
          </div>

          {initial && (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                name="is_active"
                type="checkbox"
                value="true"
                defaultChecked={initial.is_active !== false}
                className="rounded border-outline"
              />
              Aktif
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline text-sm text-ink hover:bg-bg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              {submitting ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Mustahik"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
