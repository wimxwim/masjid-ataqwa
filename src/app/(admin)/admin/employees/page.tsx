"use client";

import { useState, useEffect, useCallback } from "react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/actions/employees";
import type { InsertEmployee } from "@/lib/actions/employees";
import { Search, Plus, X, Pencil, Trash2 } from "lucide-react";

const POSITIONS = ["Marbot", "Muazin", "Imam Tetap", "Guru Kajian", "Security", "Kebersihan"];
const SALARY_PERIODS = ["Bulanan", "Mingguan", "Per-Kajian", "Per-Jadwal"];
const STATUSES = ["Aktif", "Nonaktif", "Resign"];
const POSITION_ICONS: Record<string, string> = {
  Marbot: "🧹", Muazin: "🔊", "Imam Tetap": "🕌", "Guru Kajian": "📖", Security: "🔒", Kebersihan: "🧽",
};

export default function AdminEmployeesPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getEmployees>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(typeof data)[number] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getEmployees()); }
    catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((e) => {
    if (filterPos !== "all" && e.position !== filterPos) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.name ?? "").toLowerCase().includes(q) || (e.phone?.includes(q));
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const payload: InsertEmployee = {
      name: form.get("name") as string,
      phone: (form.get("phone") as string) || null,
      position: form.get("position") as string,
      salary: parseInt(form.get("salary") as string) || 0,
      salary_period: form.get("salary_period") as string || "Bulanan",
      subject: (form.get("subject") as string) || null,
      schedule: (form.get("schedule") as string) || null,
      join_date: (form.get("join_date") as string) || null,
      status: form.get("status") as string || "Aktif",
      notes: (form.get("notes") as string) || null,
    };
    try {
      if (editing) { await updateEmployee(editing.id, payload); }
      else { await createEmployee(payload); }
      setShowForm(false); setEditing(null); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Pegawai Masjid</h2>
          <p className="text-sm text-muted">{data.length} pegawai terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Pegawai
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">Semua Posisi</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Pegawai" : "Tambah Pegawai Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-xs font-medium text-ink block mb-1">Nama Lengkap *</label>
                <input name="name" defaultValue={editing?.name ?? ""} required className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Telepon</label>
                  <input name="phone" type="tel" defaultValue={editing?.phone ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Posisi *</label>
                  <select name="position" defaultValue={editing?.position ?? "Marbot"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Gaji (Rp)</label>
                  <input name="salary" type="number" defaultValue={editing?.salary ?? 0} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Periode Gaji</label>
                  <select name="salary_period" defaultValue={editing?.salary_period ?? "Bulanan"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {SALARY_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Subjek (Guru Kajian)</label>
                  <input name="subject" defaultValue={editing?.subject ?? ""} placeholder="Tafsir, Hadits, Fiqih..." className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Jadwal</label>
                  <input name="schedule" defaultValue={editing?.schedule ?? ""} placeholder="Senin 19:00 WIB" className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Tanggal Bergabung</label>
                  <input name="join_date" type="date" defaultValue={editing?.join_date ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Status</label>
                  <select name="status" defaultValue={editing?.status ?? "Aktif"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">Catatan</label>
                <textarea name="notes" defaultValue={editing?.notes ?? ""} rows={2} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {editing ? "Simpan" : "Tambah Pegawai"}
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
          <p className="p-6 text-sm text-muted">Belum ada pegawai.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-bg/30 border-b border-outline">
              {POSITIONS.map((pos) => {
                const count = data.filter((e) => e.position === pos && e.status === "Aktif").length;
                return (
                  <div key={pos} className="bg-surface rounded-xl border border-outline p-3 text-center">
                    <div className="text-lg">{POSITION_ICONS[pos]}</div>
                    <div className="text-xs text-muted">{pos}</div>
                    <div className="font-bold text-ink">{count}</div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-outline bg-bg/50">
                  <th className="text-left p-3 font-medium text-muted">Pegawai</th>
                  <th className="text-left p-3 font-medium text-muted">Posisi</th>
                  <th className="text-right p-3 font-medium text-muted">Gaji</th>
                  <th className="text-left p-3 font-medium text-muted">Status</th>
                  <th className="text-right p-3 font-medium text-muted">Aksi</th>
                </tr></thead>
                <tbody>{filtered.map((e) => (
                  <tr key={e.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                    <td className="p-3"><div className="font-medium text-ink">{e.name}</div>
                      {e.phone && <div className="text-xs text-muted">{e.phone}</div>}</td>
                    <td className="p-3">
                      <span className="text-lg mr-1">{POSITION_ICONS[e.position]}</span>
                      <span className="capitalize">{e.position}</span>
                      {e.subject && <div className="text-xs text-muted">{e.subject}</div>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-mono text-sm">{e.salary != null && e.salary > 0 ? `Rp ${e.salary.toLocaleString("id-ID")}` : "—"}</div>
                      <div className="text-xs text-muted">{e.salary_period}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${e.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : e.status === "Nonaktif" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{e.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(e); setShowForm(true); setError(""); }}
                          className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={async () => { if (confirm("Hapus data pegawai ini?")) { await deleteEmployee(e.id); load(); } }}
                          className="p-2 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
