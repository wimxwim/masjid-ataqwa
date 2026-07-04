"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getMushafirAid, createMushafir, updateMushafir, deleteMushafir } from "@/lib/actions/mushafir";
import type { InsertMushafir } from "@/lib/actions/mushafir";
import KtpScanner from "@/components/KtpScanner";
import type { KtpData } from "@/components/KtpScanner";
import { Search, Plus, X, Pencil, Trash2, ScanLine, Navigation } from "lucide-react";

export default function AdminMushafirPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getMushafirAid>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(typeof data)[number] | null>(null);
  const [error, setError] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const nikRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) { setError("Geolokasi tidak didukung."); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (latRef.current) latRef.current.value = pos.coords.latitude.toFixed(6);
        if (lngRef.current) lngRef.current.value = pos.coords.longitude.toFixed(6);
        setGpsLoading(false);
      },
      (err) => { setError(`Gagal dapat lokasi: ${err.message}`); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getMushafirAid()); }
    catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.name ?? "").toLowerCase().includes(q) || (m.phone?.includes(q)) || (m.nik_hash?.includes(q));
  });

  const aidTypeIcon: Record<string, string> = {
    "Uang Tunai": "💰", Sembako: "📦", Transport: "🚌", Obat: "💊", Lainnya: "📋",
  };

  const handleScan = (ktp: KtpData) => {
    if (nikRef.current) nikRef.current.value = ktp.nik;
    if (nameRef.current && ktp.name) nameRef.current.value = ktp.name;
    if (addressRef.current && ktp.address) addressRef.current.value = ktp.address;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const rawNik = (form.get("nik_raw") as string) || "";
    const payload: InsertMushafir = {
      name: form.get("name") as string,
      phone: (form.get("phone") as string) || null,
      nik: rawNik || null,
      address: (form.get("address") as string) || null,
      photo_ktp_url: null,
      aid_type: form.get("aid_type") as string,
      amount: parseInt(form.get("amount") as string) || 0,
      lat: form.get("lat") ? parseFloat(form.get("lat") as string) : null,
      lng: form.get("lng") ? parseFloat(form.get("lng") as string) : null,
      notes: (form.get("notes") as string) || null,
      given_date: form.get("given_date") as string,
    };
    try {
      if (editing) {
        await updateMushafir(editing.id, payload);
      } else {
        await createMushafir(payload);
      }
      setShowForm(false); setEditing(null); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Bantuan Mukim / Musafir</h2>
          <p className="text-sm text-muted">{data.length} penerima bantuan</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Bantuan
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari nama/NIK..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Bantuan" : "Tambah Bantuan Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Scan KTP section */}
              {!editing && (
                <div className="bg-bg rounded-xl border border-outline p-3">
                  <KtpScanner
                    onScan={handleScan}
                    onClear={() => {
                      if (nameRef.current) nameRef.current.value = "";
                      if (nikRef.current) nikRef.current.value = "";
                      if (addressRef.current) addressRef.current.value = "";
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Nama Penerima *</label>
                  <input ref={nameRef} name="name" defaultValue={editing?.name ?? ""} required className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Telepon</label>
                  <input name="phone" type="tel" defaultValue={editing?.phone ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink flex items-center gap-1 mb-1">
                    <ScanLine className="w-3 h-3 text-primary" /> NIK (16 digit)
                  </label>
                  <input ref={nikRef} name="nik_raw" defaultValue={editing?.nik_hash ?? ""} placeholder="Scan KTP atau ketik manual" maxLength={16}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                  <p className="text-[10px] text-muted mt-0.5">NIK otomatis di-hash SHA-256 — aman</p>
                </div>
                <div><label className="text-xs font-medium text-ink block mb-1">Jenis Bantuan *</label>
                  <select name="aid_type" defaultValue={editing?.aid_type ?? "Uang Tunai"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    <option value="Uang Tunai">Uang Tunai</option><option value="Sembako">Sembako</option>
                    <option value="Transport">Transport</option><option value="Obat">Obat</option><option value="Lainnya">Lainnya</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Nominal (Rp)</label>
                  <input name="amount" type="number" defaultValue={editing?.amount ?? 0} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Tanggal *</label>
                  <input name="given_date" type="date" defaultValue={editing?.given_date ?? new Date().toISOString().split("T")[0]} required
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">Alamat</label>
                <input ref={addressRef} name="address" defaultValue={editing?.address ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Lokasi (GPS)</label>
                <div className="flex items-center gap-2">
                  <input ref={latRef} name="lat" type="number" step="any" placeholder="Latitude" defaultValue={editing?.lat ?? ""}
                    className="flex-1 px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                  <input ref={lngRef} name="lng" type="number" step="any" placeholder="Longitude" defaultValue={editing?.lng ?? ""}
                    className="flex-1 px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                  <button type="button" onClick={getLocation} disabled={gpsLoading}
                    className="px-3 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0">
                    <Navigation className={`w-4 h-4 ${gpsLoading ? "animate-pulse" : ""}`} />
                    {gpsLoading ? "..." : "Lokasi Saya"}
                  </button>
                </div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">Catatan</label>
                <textarea name="notes" defaultValue={editing?.notes ?? ""} rows={2} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {editing ? "Simpan" : "Tambah"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-outline rounded-xl text-sm text-muted hover:bg-bg">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-outline overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted">Memuat...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">Belum ada data bantuan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Penerima</th>
                <th className="text-left p-3 font-medium text-muted">Bantuan</th>
                <th className="text-right p-3 font-medium text-muted">Nominal</th>
                <th className="text-left p-3 font-medium text-muted">Tanggal</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((m) => (
                <tr key={m.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3"><div className="font-medium text-ink">{m.name}</div>
                    {m.nik_hash && <div className="text-xs text-muted">NIK: ••••{m.nik_hash.slice(-4)}</div>}</td>
                  <td className="p-3"><span className="text-lg mr-1">{aidTypeIcon[m.aid_type] ?? "📋"}</span> {m.aid_type}</td>
                  <td className="p-3 text-right font-mono text-sm">{m.amount != null && m.amount > 0 ? `Rp ${m.amount.toLocaleString("id-ID")}` : "—"}</td>
                  <td className="p-3 text-muted">{m.given_date}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(m); setShowForm(true); setError(""); }}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={async () => { if (confirm("Hapus data bantuan ini?")) { await deleteMushafir(m.id); load(); } }}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
