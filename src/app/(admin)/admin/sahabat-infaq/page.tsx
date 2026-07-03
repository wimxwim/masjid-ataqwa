"use client";

import { useState, useEffect, useCallback } from "react";
import { getLoanApplications, reviewLoanApplication, deleteLoanApplication } from "@/lib/actions/loan-applications";
import { Search, X, CheckCircle2, XCircle, Clock, Trash2, Eye } from "lucide-react";

type App = Awaited<ReturnType<typeof getLoanApplications>>[number];

export default function AdminSahabatInfaqPage() {
  const [data, setData] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<App | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getLoanApplications()); }
    catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.business_name.toLowerCase().includes(q) ||
      (a.status ?? "").toLowerCase().includes(q)
    );
  });

  const statusIcon: Record<string, { icon: React.ReactNode; color: string }> = {
    pending: { icon: <Clock className="w-4 h-4" />, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    contacted: { icon: <Eye className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
    approved: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600 bg-green-50 border-green-200" },
    rejected: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 border-red-200" },
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await reviewLoanApplication(id, status);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengajuan ini?")) return;
    try { await deleteLoanApplication(id); load(); }
    catch { setError("Gagal menghapus"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Pengajuan Bank Infaq</h2>
          <p className="text-sm text-muted">{data.length} pengajuan</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari nama/usaha/status..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">Detail Pengajuan</h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-medium text-muted">Nama</span><p className="text-ink">{detail.name}</p></div>
                <div><span className="font-medium text-muted">Telepon</span><p className="text-ink">{detail.phone}</p></div>
                <div><span className="font-medium text-muted">NIK</span><p className="text-ink font-mono">{detail.nik}</p></div>
                <div><span className="font-medium text-muted">Status Tempat Tinggal</span><p className="text-ink">{detail.home_status}</p></div>
              </div>
              <hr className="border-outline" />
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-medium text-muted">Nama Usaha</span><p className="text-ink">{detail.business_name}</p></div>
                <div><span className="font-medium text-muted">Jenis Usaha</span><p className="text-ink">{detail.business_type}</p></div>
                <div><span className="font-medium text-muted">Lama Operasional</span><p className="text-ink">{detail.business_age}</p></div>
                <div><span className="font-medium text-muted">Alamat Usaha</span><p className="text-ink">{detail.business_address}</p></div>
              </div>
              <hr className="border-outline" />
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-medium text-muted">Dana Diajukan</span><p className="font-mono font-bold text-ink">Rp {detail.amount.toLocaleString("id-ID")}</p></div>
                <div><span className="font-medium text-muted">Tenor</span><p className="text-ink">{detail.week_duration} bulan</p></div>
              </div>
              {detail.purpose && <div><span className="font-medium text-muted">Rencana Penggunaan</span><p className="text-ink">{detail.purpose}</p></div>}
              <hr className="border-outline" />
              <div><span className="font-medium text-muted">Status</span>
                <span className={`inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-xs rounded-full border ${statusIcon[detail.status ?? ""]?.color ?? ""}`}>
                  {statusIcon[detail.status ?? ""]?.icon} {detail.status}
                </span>
              </div>
              {detail.notes && <div><span className="font-medium text-muted">Catatan</span><p className="text-ink">{detail.notes}</p></div>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-outline overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted">Memuat...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">Belum ada pengajuan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Pemohon</th>
                <th className="text-left p-3 font-medium text-muted">Usaha</th>
                <th className="text-right p-3 font-medium text-muted">Dana</th>
                <th className="text-center p-3 font-medium text-muted">Status</th>
                <th className="text-left p-3 font-medium text-muted">Tanggal</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((a) => (
                <tr key={a.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-ink">{a.name}</div>
                    <div className="text-xs text-muted">{a.phone}</div>
                  </td>
                  <td className="p-3 text-muted">{a.business_name}</td>
                  <td className="p-3 text-right font-mono">Rp {a.amount.toLocaleString("id-ID")}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${statusIcon[a.status ?? ""]?.color ?? ""}`}>
                      {statusIcon[a.status ?? ""]?.icon} {a.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted">{a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "—"}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetail(a)}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                      {(a.status ?? "pending") === "pending" && (
                        <>
                          <button onClick={() => handleStatus(a.id, "contacted")}
                            className="p-2 hover:bg-bg rounded-lg text-blue-600 hover:text-blue-800 transition-colors" title="Tandai sudah dikontak"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleStatus(a.id, "approved")}
                            className="p-2 hover:bg-bg rounded-lg text-green-600 hover:text-green-800 transition-colors" title="Setujui"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleStatus(a.id, "rejected")}
                            className="p-2 hover:bg-bg rounded-lg text-red-600 hover:text-red-800 transition-colors" title="Tolak"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(a.id)}
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
