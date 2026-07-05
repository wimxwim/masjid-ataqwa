"use client";

import { useState, useEffect, useCallback } from "react";
import { getPrograms, createProgram, updateProgram, deleteProgram } from "@/lib/actions/programs";
import type { InsertProgram } from "@/lib/actions/programs";
import { Search, Plus, X, Pencil, Trash2, Megaphone, FolderOpen, CheckCircle2, Star } from "lucide-react";
import SmartEmptyState from "@/components/SmartEmptyState";
import { StatCard } from "@/components/LargeUI";

export default function AdminProgramsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getPrograms>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(typeof data)[number] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getPrograms()); }
    catch (e) { console.error(e); setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.name ?? "").toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const payload: InsertProgram = {
      name: form.get("name") as string,
      slug: form.get("slug") as string,
      description: (form.get("description") as string) || null,
      category: form.get("category") as string || "sosial",
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
      sort_order: parseInt(form.get("sort_order") as string) || 0,
    };
    try {
      if (editing) {
        await updateProgram(editing.id, payload);
      } else {
        await createProgram(payload);
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
          <h2 className="font-display font-bold text-xl text-ink">Program / Kegiatan</h2>
          <p className="text-sm text-muted">{data.length} program terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Program
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari program..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FolderOpen} label="Total Program" value={data.length.toString()} />
        <StatCard icon={CheckCircle2} label="Aktif" value={data.filter(p => p.is_active).length.toString()} sublabel="Sedang berjalan" />
        <StatCard icon={Star} label="Unggulan" value={data.filter(p => p.is_featured).length.toString()} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Program" : "Tambah Program Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Nama Program *</label>
                  <input name="name" defaultValue={editing?.name ?? ""} required className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Slug *</label>
                  <input name="slug" defaultValue={editing?.slug ?? ""} required className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">Deskripsi</label>
                <textarea name="description" defaultValue={editing?.description ?? ""} rows={3} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Kategori</label>
                  <select name="category" defaultValue={editing?.category ?? "sosial"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    <option value="sosial">Sosial</option><option value="dakwah">Dakwah</option>
                    <option value="pendidikan">Pendidikan</option><option value="ekonomi">Ekonomi</option>
                    <option value="ibadah">Ibadah</option><option value="kepemudaan">Kepemudaan</option>
                  </select></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Urutan</label>
                  <input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={editing?.is_active ?? false} className="rounded" /> Aktif</label>
                <label className="flex items-center gap-2 text-sm"><input name="is_featured" type="checkbox" defaultChecked={editing?.is_featured ?? false} className="rounded" /> Unggulan</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {editing ? "Simpan Perubahan" : "Tambah Program"}
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
        ) : filtered.length === 0 && data.length === 0 ? (
          <SmartEmptyState
            icon={Megaphone}
            title="Belum Ada Program"
            description="Program kegiatan masjid mencakup dakwah, sosial, pendidikan, ekonomi, dan kepemudaan. Tambahkan program pertama untuk mulai pencatatan."
            actionLabel="Tambah Program"
            onAction={() => { setEditing(null); setShowForm(true); setError(""); }}
          />
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">Tidak ada hasil pencarian.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Program</th>
                <th className="text-left p-3 font-medium text-muted">Kategori</th>
                <th className="text-center p-3 font-medium text-muted">Aktif</th>
                <th className="text-center p-3 font-medium text-muted">Unggulan</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((p) => (
                <tr key={p.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3"><div className="font-medium text-ink">{p.name}</div>
                    {p.description && <div className="text-xs text-muted line-clamp-1">{p.description}</div>}</td>
                  <td className="p-3"><span className="inline-block px-2 py-0.5 bg-bg border border-outline rounded text-xs text-muted capitalize">{p.category}</span></td>
                  <td className="p-3 text-center">{p.is_active ? <span className="text-emerald-500 text-lg">✓</span> : <span className="text-red-300">—</span>}</td>
                  <td className="p-3 text-center">{p.is_featured ? <span className="text-amber-500 text-lg">★</span> : <span className="text-red-300">—</span>}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(p); setShowForm(true); setError(""); }}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      <form onSubmit={async (e) => { e.preventDefault(); if (confirm("Hapus program ini?")) { try { await deleteProgram(p.id); load(); } catch (err) { console.error(err); setError("Gagal menghapus data."); } } }}>
                        <button type="submit" className="p-2 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </form>
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
