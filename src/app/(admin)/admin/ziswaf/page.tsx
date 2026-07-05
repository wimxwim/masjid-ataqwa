"use client";

import { useState, useEffect, useCallback } from "react";
import { getZiswafRequests, createZiswafRequest, reviewZiswafRequest, type InsertZiswafRequest } from "@/lib/actions/ziswaf-requests";
import { Search, Plus, X, CheckCircle2, XCircle } from "lucide-react";
import { formatNominal } from "@/lib/format";
import { STATUS_LABEL, ZISWAF_TYPE_LABEL } from "@/lib/labels";

type ZiswafRequest = Awaited<ReturnType<typeof getZiswafRequests>>[number];

const REQUEST_TYPES = ["zakat", "infaq", "sedekah", "wakaf", "qardhul_hasan", "beasiswa", "bantuan_sembako", "bantuan_kesehatan", "other"];

export default function AdminZiswafPage() {
  const [data, setData] = useState<ZiswafRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState("zakat");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getZiswafRequests()); }
    catch (e) { console.error(e); setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.requestor_name.toLowerCase().includes(q) || (r.requestor_phone?.includes(q)) || r.type.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setFormName(""); setFormPhone(""); setFormType("zakat"); setFormAmount(""); setFormDescription("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const payload: InsertZiswafRequest = {
      requestor_name: formName,
      requestor_phone: formPhone || null,
      type: formType,
      amount: parseFloat(formAmount) || null,
      description: formDescription || null,
    };
    try {
      await createZiswafRequest(payload);
      setShowForm(false); resetForm(); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const approveRequest = async (id: string, notes?: string | null) => {
    try { await reviewZiswafRequest(id, "approved", notes); load(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Gagal"); }
  };

  const rejectRequest = async (id: string) => {
    const notes = prompt("Alasan ditolak:");
    if (notes === null) return;
    try { await reviewZiswafRequest(id, "rejected", notes); load(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Gagal"); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      disbursed: "bg-blue-100 text-blue-700",
    };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[s] ?? "bg-slate-100 text-slate-600"}`}>{STATUS_LABEL[s] ?? s}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Permohonan Bantuan ZISWAF</h2>
          <p className="text-sm text-muted">{data.length} permohonan</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Permohonan Baru
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari pemohon/jenis..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">Permohonan Baru</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink block mb-1">Nama Pemohon *</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} required
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Telepon</label>
                  <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Jenis Bantuan</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {REQUEST_TYPES.map((t) => <option key={t} value={t}>{ZISWAF_TYPE_LABEL[t] ?? t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Jumlah (Rp) — opsional</label>
                <input type="text" inputMode="numeric" value={formatNominal(formAmount)} onChange={(e) => setFormAmount(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Deskripsi / Alasan</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Simpan</button>
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
            {data.length === 0 ? "Belum ada permohonan." : "Tidak ada hasil pencarian."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Pemohon</th>
                <th className="text-left p-3 font-medium text-muted">Jenis</th>
                <th className="text-right p-3 font-medium text-muted">Jumlah</th>
                <th className="text-left p-3 font-medium text-muted">Status</th>
                <th className="text-left p-3 font-medium text-muted">Tanggal</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((r) => (
                <tr key={r.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-ink">{r.requestor_name}</div>
                    {r.requestor_phone && <div className="text-xs text-muted font-mono">{r.requestor_phone}</div>}
                  </td>
                  <td className="p-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{ZISWAF_TYPE_LABEL[r.type] ?? r.type}</span>
                  </td>
                  <td className="p-3 text-right font-mono text-sm">
                    {r.amount ? `Rp ${r.amount.toLocaleString("id-ID")}` : "—"}
                  </td>
                  <td className="p-3">{statusBadge(r.status ?? "pending")}</td>
                  <td className="p-3 text-muted text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID") : "—"}</td>
                  <td className="p-3 text-right">
                    {r.status === "pending" && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => approveRequest(r.id)}
                          className="p-2 hover:bg-bg rounded-lg text-muted hover:text-emerald-600 transition-colors"
                          title="Setujui"><CheckCircle2 className="w-4 h-4" /></button>
                        <button onClick={() => rejectRequest(r.id)}
                          className="p-2 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"
                          title="Tolak"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                    {r.status === "approved" && (
                      <span className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                      </span>
                    )}
                    {r.status === "rejected" && (
                      <span className="text-xs text-red-500 flex items-center justify-end gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Ditolak
                      </span>
                    )}
                    {r.description && r.status === "pending" && (
                      <div className="text-xs text-muted mt-1 max-w-[200px] truncate" title={r.description}>{r.description}</div>
                    )}
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
