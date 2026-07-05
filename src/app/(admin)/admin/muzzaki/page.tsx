"use client";

import { useState, useEffect, useCallback } from "react";
import { getMuzzakiList, createMuzzaki, updateMuzzaki, deleteMuzzaki, type InsertMuzzaki } from "@/lib/actions/muzzaki";
import { createZakatPayment } from "@/lib/actions/zakat-payments";
import { Search, Plus, X, Pencil, Trash2, HandCoins, CheckCircle2 } from "lucide-react";
import { formatNominal } from "@/lib/format";

type Muzzaki = Awaited<ReturnType<typeof getMuzzakiList>>[number];

const MUZZAKI_TYPE = ["perseorangan", "perusahaan", "lembaga", "other"];
const ZAKAT_TYPES = ["zakat_fitrah", "zakat_maal"];

export default function AdminMuzzakiPage() {
  const [data, setData] = useState<Muzzaki[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Muzzaki | null>(null);
  const [error, setError] = useState("");
  const [showZakatForm, setShowZakatForm] = useState<Muzzaki | null>(null);
  const [zakatType, setZakatType] = useState("zakat_maal");
  const [zakatAmount, setZakatAmount] = useState("");
  const [zakatYear, setZakatYear] = useState(new Date().getFullYear().toString());
  const [zakatSubmitting, setZakatSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formMuzzakiType, setFormMuzzakiType] = useState("perseorangan");
  const [formAssetValue, setFormAssetValue] = useState("");
  const [formZakatAmount, setFormZakatAmount] = useState("");
  const [formRegular, setFormRegular] = useState(false);
  const [formNotes, setFormNotes] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getMuzzakiList()); }
    catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.phone?.includes(q));
  });

  const resetForm = () => {
    setFormName(""); setFormPhone(""); setFormAddress("");
    setFormMuzzakiType("perseorangan"); setFormAssetValue(""); setFormZakatAmount("");
    setFormRegular(false); setFormNotes("");
  };

  const openEdit = (m: Muzzaki) => {
    setEditing(m);
    setFormName(m.name); setFormPhone(m.phone ?? ""); setFormAddress(m.address ?? "");
    setFormMuzzakiType(m.muzzaki_type ?? "perseorangan");
    setFormAssetValue(m.last_asset_value?.toString() ?? "");
    setFormZakatAmount(m.last_zakat_amount?.toString() ?? "");
    setFormRegular(m.is_regular ?? false); setFormNotes(m.notes ?? "");
    setShowForm(true); setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const payload: InsertMuzzaki = {
      name: formName,
      phone: formPhone || null,
      address: formAddress || null,
      muzzaki_type: formMuzzakiType,
      is_regular: formRegular,
      last_asset_value: parseFloat(formAssetValue) || 0,
      last_zakat_amount: parseFloat(formZakatAmount) || 0,
      notes: formNotes || null,
    };
    try {
      if (editing) {
        await updateMuzzaki(editing.id, payload);
      } else {
        await createMuzzaki(payload);
      }
      setShowForm(false); setEditing(null); resetForm(); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const submitZakatPayment = async (m: Muzzaki) => {
    if (!zakatAmount || !zakatYear) { setError("Jumlah dan tahun zakat wajib diisi"); return; }
    setZakatSubmitting(true); setError("");
    try {
      await createZakatPayment({
        muzzaki_id: m.id,
        zakat_type: zakatType,
        amount: parseFloat(zakatAmount),
        zakat_year: parseInt(zakatYear),
        payment_status: "paid",
      });
      setShowZakatForm(null); setZakatAmount(""); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mencatat pembayaran");
    } finally { setZakatSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Muzzaki (Wajib Zakat)</h2>
          <p className="text-sm text-muted">{data.length} muzzaki terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Muzzaki
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari nama/telepon..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Muzzaki" : "Tambah Muzzaki Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink block mb-1">Nama *</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} required
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Telepon</label>
                  <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Tipe</label>
                  <select value={formMuzzakiType} onChange={(e) => setFormMuzzakiType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {MUZZAKI_TYPE.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Alamat</label>
                <input value={formAddress} onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Nilai Aset (Rp)</label>
                  <input type="text" inputMode="numeric" value={formatNominal(formAssetValue)} onChange={(e) => setFormAssetValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Zakat Terakhir (Rp)</label>
                  <input type="text" inputMode="numeric" value={formatNominal(formZakatAmount)} onChange={(e) => setFormZakatAmount(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={formRegular} onChange={(e) => setFormRegular(e.target.checked)}
                  className="rounded border-outline" />
                Muzzaki reguler (berzakat setiap tahun)
              </label>
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

      {showZakatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowZakatForm(null)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">Catat Pembayaran Zakat</h3>
              <button onClick={() => setShowZakatForm(null)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <p className="text-sm text-muted">Muzzaki: <span className="font-semibold text-ink">{showZakatForm.name}</span></p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Jenis Zakat</label>
                <select value={zakatType} onChange={(e) => setZakatType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                  {ZAKAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Jumlah (Rp)</label>
                <input type="text" inputMode="numeric" value={formatNominal(zakatAmount)} onChange={(e) => setZakatAmount(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Tahun</label>
                <input type="number" value={zakatYear} onChange={(e) => setZakatYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <button onClick={() => submitZakatPayment(showZakatForm)} disabled={zakatSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {zakatSubmitting ? "Menyimpan..." : <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Catat Pembayaran</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-outline overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted">Memuat...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            {data.length === 0 ? "Belum ada muzzaki terdaftar. Klik 'Tambah Muzzaki' untuk memulai." : "Tidak ada hasil pencarian."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Nama</th>
                <th className="text-left p-3 font-medium text-muted">Tipe</th>
                <th className="text-left p-3 font-medium text-muted">Kontak</th>
                <th className="text-right p-3 font-medium text-muted">Aset</th>
                <th className="text-right p-3 font-medium text-muted">Zakat</th>
                <th className="text-left p-3 font-medium text-muted">Status</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((m) => (
                <tr key={m.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3"><div className="font-medium text-ink">{m.name}</div></td>
                  <td className="p-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m.muzzaki_type}</span>
                  </td>
                  <td className="p-3 text-muted font-mono text-xs">{m.phone || "—"}</td>
                  <td className="p-3 text-right font-mono text-sm">Rp {(m.last_asset_value ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-3 text-right font-mono text-sm">Rp {(m.last_zakat_amount ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      m.is_regular ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>{m.is_regular ? "Reguler" : "Insidental"}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setShowZakatForm(m)}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-emerald-600 transition-colors"
                        title="Catat pembayaran zakat"><CheckCircle2 className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(m)}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={async () => { if (confirm(`Hapus muzzaki ${m.name}?`)) { await deleteMuzzaki(m.id); load(); } }}
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
