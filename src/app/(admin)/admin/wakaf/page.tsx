"use client";

import { useState, useEffect, useCallback } from "react";
import { getWakafAssets, createWakafAsset, updateWakafAsset, deleteWakafAsset, type InsertWakafAsset } from "@/lib/actions/wakaf";
import { Search, Plus, X, Pencil, Trash2, Landmark, MapPin, TrendingUp } from "lucide-react";
import { formatNominal } from "@/lib/format";

type Wakaf = Awaited<ReturnType<typeof getWakafAssets>>[number];

const ASSET_TYPES = ["tanah", "bangunan", "uang_tunai", "kendaraan", "buku", "peralatan", "saham", "other"];
const NAZHIR_TYPES = ["perorangan", "organisasi", "yayasan", "other"];
const BENEFICIARY_TYPES = ["umum", "spesifik", "keluarga", "other"];
const STATUS_OPTIONS = ["aktif", "dikelola", "dialihkan", "rusak", "dijual"];

export default function AdminWakafPage() {
  const [data, setData] = useState<Wakaf[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Wakaf | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("tanah");
  const [formDescription, setFormDescription] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formNazhir, setFormNazhir] = useState("");
  const [formNazhirType, setFormNazhirType] = useState("perorangan");
  const [formWakif, setFormWakif] = useState("");
  const [formCertNumber, setFormCertNumber] = useState("");
  const [formAcqValue, setFormAcqValue] = useState("");
  const [formCurValue, setFormCurValue] = useState("");
  const [formIsProductive, setFormIsProductive] = useState(false);
  const [formBeneficiaryType, setFormBeneficiaryType] = useState("umum");
  const [formStatus, setFormStatus] = useState("aktif");
  const [formNotes, setFormNotes] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getWakafAssets()); }
    catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.asset_name.toLowerCase().includes(q) || (a.location?.toLowerCase().includes(q));
  });

  const resetForm = () => {
    setFormName(""); setFormType("tanah"); setFormDescription(""); setFormLocation("");
    setFormNazhir(""); setFormNazhirType("perorangan"); setFormWakif("");
    setFormCertNumber(""); setFormAcqValue(""); setFormCurValue("");
    setFormIsProductive(false); setFormBeneficiaryType("umum"); setFormStatus("aktif"); setFormNotes("");
  };

  const openEdit = (w: Wakaf) => {
    setEditing(w);
    setFormName(w.asset_name); setFormType(w.asset_type); setFormDescription(w.description ?? "");
    setFormLocation(w.location ?? ""); setFormNazhir(w.nazhir_name ?? ""); setFormNazhirType(w.nazhir_type ?? "perorangan");
    setFormWakif(w.wakif_name ?? ""); setFormCertNumber(w.certificate_number ?? "");
    setFormAcqValue(w.acquisition_value?.toString() ?? ""); setFormCurValue(w.current_value?.toString() ?? "");
    setFormIsProductive(w.is_productive ?? false); setFormBeneficiaryType(w.beneficiary_type ?? "umum");
    setFormStatus(w.status ?? "aktif"); setFormNotes(w.notes ?? "");
    setShowForm(true); setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const payload: InsertWakafAsset = {
      asset_name: formName,
      asset_type: formType,
      description: formDescription || null,
      location: formLocation || null,
      nazhir_name: formNazhir || null,
      nazhir_type: formNazhirType,
      wakif_name: formWakif || null,
      certificate_number: formCertNumber || null,
      acquisition_value: parseFloat(formAcqValue) || 0,
      current_value: parseFloat(formCurValue) || 0,
      is_productive: formIsProductive,
      beneficiary_type: formBeneficiaryType,
      status: formStatus,
      notes: formNotes || null,
    };
    try {
      if (editing) { await updateWakafAsset(editing.id, payload); }
      else { await createWakafAsset(payload); }
      setShowForm(false); setEditing(null); resetForm(); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { aktif: "bg-emerald-100 text-emerald-700", dikelola: "bg-blue-100 text-blue-700", dialihkan: "bg-amber-100 text-amber-700", rusak: "bg-red-100 text-red-700", dijual: "bg-slate-100 text-slate-700" };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[s] ?? "bg-slate-100 text-slate-600"}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Aset Wakaf (AAOIFI SS-60)</h2>
          <p className="text-sm text-muted">{data.length} aset wakaf terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Aset Wakaf
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari aset/lokasi..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Aset Wakaf" : "Tambah Aset Wakaf Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink block mb-1">Nama Aset *</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} required
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Jenis Aset *</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Status *</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Deskripsi</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Lokasi</label>
                <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Wakif (pemberi wakaf)</label>
                  <input value={formWakif} onChange={(e) => setFormWakif(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Sertifikat</label>
                  <input value={formCertNumber} onChange={(e) => setFormCertNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Nazhir (Pengelola)</label>
                  <input value={formNazhir} onChange={(e) => setFormNazhir(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Tipe Nazhir</label>
                  <select value={formNazhirType} onChange={(e) => setFormNazhirType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {NAZHIR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Nilai Perolehan (Rp)</label>
                  <input type="text" inputMode="numeric" value={formatNominal(formAcqValue)} onChange={(e) => setFormAcqValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Nilai Kini (Rp)</label>
                  <input type="text" inputMode="numeric" value={formatNominal(formCurValue)} onChange={(e) => setFormCurValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Penerima Manfaat</label>
                  <select value={formBeneficiaryType} onChange={(e) => setFormBeneficiaryType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {BENEFICIARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={formIsProductive} onChange={(e) => setFormIsProductive(e.target.checked)}
                      className="rounded border-outline" />
                    Wakaf Produktif
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Catatan</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
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
          <p className="p-6 text-sm text-muted">
            {data.length === 0 ? "Belum ada aset wakaf terdaftar." : "Tidak ada hasil pencarian."}
          </p>
        ) : (
          <div className="divide-y divide-outline">
            {filtered.map((a) => (
              <div key={a.id}>
                <div className="flex items-center justify-between p-4 hover:bg-bg/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-ink truncate">{a.asset_name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{a.asset_type}</span>
                        {statusBadge(a.status ?? "aktif")}
                        {a.is_productive && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Produktif</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-semibold text-ink">Rp {(a.current_value ?? 0).toLocaleString("id-ID")}</div>
                    <div className="text-xs text-muted">{a.location || "—"}</div>
                  </div>
                </div>
                {expandedId === a.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-outline/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                      <div><span className="text-muted">Wakif:</span> <span className="text-ink">{a.wakif_name || "—"}</span></div>
                      <div><span className="text-muted">Nazhir:</span> <span className="text-ink">{a.nazhir_name || "—"} ({a.nazhir_type})</span></div>
                      <div><span className="text-muted">Sertifikat:</span> <span className="text-ink">{a.certificate_number || "—"}</span></div>
                      <div><span className="text-muted">Nilai Perolehan:</span> <span className="text-ink">Rp {(a.acquisition_value ?? 0).toLocaleString("id-ID")}</span></div>
                      <div><span className="text-muted">Penerima:</span> <span className="text-ink">{a.beneficiary_type}</span></div>
                      <div><span className="text-muted">Realisasi:</span> <span className="text-ink">Rp {(a.revenue_generated ?? 0).toLocaleString("id-ID")}</span></div>
                      {a.description && <div className="col-span-full"><span className="text-muted">Deskripsi:</span> <span className="text-ink">{a.description}</span></div>}
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-outline/50">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={async (e) => { e.stopPropagation(); if (confirm(`Hapus aset ${a.asset_name}? Data tidak bisa dikembalikan.`)) { await deleteWakafAsset(a.id); load(); } }}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
