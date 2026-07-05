"use client";

import { useState, useEffect, useCallback } from "react";
import { getActivityFeed, createActivity, updateActivity, deleteActivity } from "@/lib/actions/activity";
import type { InsertActivity } from "@/lib/actions/activity";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

export default function AdminActivityPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getActivityFeed>>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(typeof data)[number] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getActivityFeed()); }
    catch (e) { console.error(e); setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const typeIcon: Record<string, string> = {
    mustahik: "👤", donasi: "💰", kajian: "📖", kegiatan: "📸", sedekah: "🤝",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const payload: InsertActivity = {
      type: form.get("type") as string,
      nama: form.get("nama") as string,
      alamat: (form.get("alamat") as string) || null,
      detail: (form.get("detail") as string) || null,
      jumlah: parseInt(form.get("jumlah") as string) || null,
    };
    try {
      if (editing) { await updateActivity(editing.id, payload); }
      else { await createActivity(payload); }
      setShowForm(false); setEditing(null); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Activity Feed</h2>
          <p className="text-sm text-muted">{data.length} aktivitas tercatat</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Aktivitas
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Aktivitas" : "Tambah Aktivitas Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Nama *</label>
                  <input name="nama" defaultValue={editing?.nama ?? ""} required className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Tipe</label>
                  <select name="type" defaultValue={editing?.type ?? "mustahik"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    <option value="mustahik">Mustahik</option><option value="donasi">Donasi</option>
                    <option value="kajian">Kajian</option><option value="kegiatan">Kegiatan</option><option value="sedekah">Sedekah</option>
                  </select></div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">Detail</label>
                <textarea name="detail" defaultValue={editing?.detail ?? ""} rows={2} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Alamat</label>
                  <input name="alamat" defaultValue={editing?.alamat ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Jumlah</label>
                  <input name="jumlah" type="number" defaultValue={editing?.jumlah ?? 1} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
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

      <div className="grid gap-3">
        {loading ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted">Belum ada aktivitas.</p>
        ) : data.map((a) => (
          <div key={a.id} className="bg-surface rounded-xl border border-outline p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{typeIcon[a.type] ?? "📌"}</span>
              <div>
                <p className="text-sm font-medium text-ink">{a.nama}</p>
                {a.detail && <p className="text-xs text-muted mt-0.5">{a.detail}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted bg-bg px-1.5 py-0.5 rounded">{a.type}</span>
                  {a.jumlah && <span className="text-[10px] text-muted">{a.jumlah} orang</span>}
                  <span className="text-[10px] text-muted">{new Date(a.created_at).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { setEditing(a); setShowForm(true); setError(""); }}
                className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={async () => { if (confirm("Hapus?")) { try { await deleteActivity(a.id); load(); } catch (err) { console.error(err); setError("Gagal menghapus data."); } } }}
                className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
