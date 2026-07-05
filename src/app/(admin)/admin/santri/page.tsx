"use client";

import { useState, useEffect, useCallback } from "react";
import { getSantri, createSantri, updateSantri, deleteSantri, getAttendance, getHafalan, recordAttendance, createHafalan, deleteHafalan } from "@/lib/actions/santri";
import type { InsertSantri, InsertAttendance, InsertHafalan } from "@/lib/actions/santri";
import { BookOpen, Search, Plus, X, Pencil, Trash2, CheckCircle, Clock } from "lucide-react";

const LEVELS = ["tahsin", "tahfidz", "tafsir"];
const ATTENDANCE_STATUSES = ["hadir", "izin", "sakit", "alpha"];
const HAFALAN_STATUSES = ["baru", "murojaah", "lancar"];

type SantriRow = Awaited<ReturnType<typeof getSantri>>[number];
type AttendanceRow = Awaited<ReturnType<typeof getAttendance>>[number];
type HafalanRow = Awaited<ReturnType<typeof getHafalan>>[number];

function today() {
  return new Date().toISOString().split("T")[0] ?? "";
}

export default function AdminSantriPage() {
  const [data, setData] = useState<SantriRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SantriRow | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"attendance" | "hafalan">("attendance");

  // Detail panel state
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [hafalan, setHafalan] = useState<HafalanRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Inline forms
  const [attForm, setAttForm] = useState({ date: "", status: "hadir", notes: "" });
  const [hafForm, setHafForm] = useState({ date: "", surah: "", ayat_start: "", ayat_end: "", juz: "", status: "baru", notes: "" });

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getSantri()); }
    catch (e) { console.error(e); setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const classGroups = [...new Set(data.map((s) => s.class_group).filter(Boolean))] as string[];

  const filtered = data.filter((s) => {
    if (filterLevel !== "all" && s.level !== filterLevel) return false;
    if (filterClass !== "all" && s.class_group !== filterClass) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.name ?? "").toLowerCase().includes(q) || (s.phone?.includes(q));
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const payload: InsertSantri = {
      mosque_id: "",
      name: form.get("name") as string,
      phone: (form.get("phone") as string) || null,
      age: parseInt(form.get("age") as string) || null,
      parent_name: (form.get("parent_name") as string) || null,
      parent_phone: (form.get("parent_phone") as string) || null,
      address: (form.get("address") as string) || null,
      level: (form.get("level") as string) || "tahsin",
      class_group: (form.get("class_group") as string) || null,
      join_date: (form.get("join_date") as string) || null,
      juz_terakhir: parseInt(form.get("juz_terakhir") as string) || 0,
      surat_terakhir: (form.get("surat_terakhir") as string) || null,
    };
    try {
      if (editing) { await updateSantri(editing.id, payload); }
      else { await createSantri(payload); }
      setShowForm(false); setEditing(null); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const handleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setTab("attendance");
    setDetailLoading(true);
    try {
      const [att, haf] = await Promise.all([getAttendance(id), getHafalan(id)]);
      setAttendance(att);
      setHafalan(haf);
    } finally {
      setDetailLoading(false);
    }
    setAttForm({ date: today(), status: "hadir", notes: "" });
    setHafForm({ date: today(), surah: "", ayat_start: "", ayat_end: "", juz: "", status: "baru", notes: "" });
  };

  const handleAttendanceSubmit = async (santriId: string) => {
    try {
      const payload: InsertAttendance = { santri_id: santriId, date: attForm.date, status: attForm.status, notes: attForm.notes || null };
      await recordAttendance(payload);
      setAttendance(await getAttendance(santriId));
      setAttForm({ date: today(), status: "hadir", notes: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mencatat presensi");
    }
  };

  const handleHafalanSubmit = async (santriId: string) => {
    try {
      const payload: InsertHafalan = {
        santri_id: santriId,
        date: hafForm.date,
        surah: hafForm.surah,
        ayat_start: hafForm.ayat_start ? parseInt(hafForm.ayat_start) : null,
        ayat_end: hafForm.ayat_end ? parseInt(hafForm.ayat_end) : null,
        juz: hafForm.juz ? parseInt(hafForm.juz) : null,
        status: hafForm.status,
        notes: hafForm.notes || null,
      };
      await createHafalan(payload);
      setHafalan(await getHafalan(santriId));
      setHafForm({ date: today(), surah: "", ayat_start: "", ayat_end: "", juz: "", status: "baru", notes: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mencatat hafalan");
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { hadir: "bg-emerald-100 text-emerald-700", izin: "bg-amber-100 text-amber-700", sakit: "bg-orange-100 text-orange-700", alpha: "bg-red-100 text-red-700" };
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[s] ?? "bg-slate-100 text-slate-700"}`}>{s}</span>;
  };

  const hafalanStatusBadge = (s: string | null) => {
    const st = s ?? "baru";
    const map: Record<string, string> = { baru: "bg-blue-100 text-blue-700", murojaah: "bg-purple-100 text-purple-700", lancar: "bg-emerald-100 text-emerald-700" };
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[st] ?? "bg-slate-100 text-slate-700"}`}>{st}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Santri Kampung Quran</h2>
          <p className="text-sm text-muted">{data.length} santri terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Santri
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">Semua Level</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        {classGroups.length > 0 && (
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">Semua Kelas</option>
            {classGroups.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Santri" : "Tambah Santri Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-xs font-medium text-ink block mb-1">Nama Lengkap *</label>
                <input name="name" defaultValue={editing?.name ?? ""} required className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Telepon</label>
                  <input name="phone" type="tel" defaultValue={editing?.phone ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Usia</label>
                  <input name="age" type="number" defaultValue={editing?.age ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Nama Orang Tua</label>
                  <input name="parent_name" defaultValue={editing?.parent_name ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Telp Orang Tua</label>
                  <input name="parent_phone" type="tel" defaultValue={editing?.parent_phone ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">Alamat</label>
                <input name="address" defaultValue={editing?.address ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Level *</label>
                  <select name="level" defaultValue={editing?.level ?? "tahsin"} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Kelas</label>
                  <input name="class_group" defaultValue={editing?.class_group ?? ""} placeholder="A, B, C..." className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Tanggal Bergabung</label>
                  <input name="join_date" type="date" defaultValue={editing?.join_date ?? ""} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink flex items-center gap-1 mb-1"><CheckCircle className="w-3 h-3" /> Aktif</label>
                  <input name="is_active" type="checkbox" defaultChecked={editing?.is_active ?? true} className="w-4 h-4 mt-1.5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Juz Terakhir</label>
                  <input name="juz_terakhir" type="number" defaultValue={editing?.juz_terakhir ?? 0} min={0} max={30} className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Surat Terakhir</label>
                  <input name="surat_terakhir" defaultValue={editing?.surat_terakhir ?? ""} placeholder="Al-Baqarah" className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {editing ? "Simpan" : "Tambah Santri"}
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
          <p className="p-6 text-sm text-muted">Belum ada santri.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Nama</th>
                <th className="text-left p-3 font-medium text-muted">Telepon</th>
                <th className="text-left p-3 font-medium text-muted">Level</th>
                <th className="text-left p-3 font-medium text-muted">Kelas</th>
                <th className="text-center p-3 font-medium text-muted">Juz</th>
                <th className="text-center p-3 font-medium text-muted">Status</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((s) => (
                <>
                  <tr key={s.id} className="border-b border-outline hover:bg-bg/30 transition-colors cursor-pointer" onClick={() => handleExpand(s.id)}>
                    <td className="p-3">
                      <div className="font-medium text-ink">{s.name}</div>
                      {s.join_date && <div className="text-xs text-muted">Gabung {s.join_date}</div>}
                    </td>
                    <td className="p-3 text-muted">{s.phone || "—"}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">{s.level}</span>
                    </td>
                    <td className="p-3 text-muted">{s.class_group || "—"}</td>
                    <td className="p-3 text-center font-mono">{s.juz_terakhir ?? 0}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-red-400"}`} title={s.is_active ? "Aktif" : "Nonaktif"} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setEditing(s); setShowForm(true); setError(""); }}
                          className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={async () => { if (confirm("Hapus santri ini?")) { try { await deleteSantri(s.id); load(); } catch (err) { console.error(err); setError("Gagal menghapus data."); } } }}
                          className="p-2 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={7} className="p-0">
                        <div className="bg-bg/30 border-b border-outline px-6 py-4 space-y-4">
                          <div className="flex items-center gap-4 border-b border-outline pb-2">
                            <button onClick={() => setTab("attendance")} className={`flex items-center gap-1.5 text-sm font-medium pb-2 border-b-2 transition-colors ${tab === "attendance" ? "text-primary border-primary" : "text-muted border-transparent hover:text-ink"}`}>
                              <Clock className="w-4 h-4" /> Presensi ({attendance.length})
                            </button>
                            <button onClick={() => setTab("hafalan")} className={`flex items-center gap-1.5 text-sm font-medium pb-2 border-b-2 transition-colors ${tab === "hafalan" ? "text-primary border-primary" : "text-muted border-transparent hover:text-ink"}`}>
                              <BookOpen className="w-4 h-4" /> Hafalan ({hafalan.length})
                            </button>
                          </div>

                          {detailLoading ? (
                            <p className="text-sm text-muted py-2">Memuat...</p>
                          ) : tab === "attendance" ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <input type="date" value={attForm.date} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm" />
                                <select value={attForm.status} onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm">
                                  {ATTENDANCE_STATUSES.map((st) => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                                </select>
                                <input type="text" placeholder="Catatan..." value={attForm.notes} onChange={(e) => setAttForm({ ...attForm, notes: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm flex-1 min-w-[140px]" />
                                <button onClick={() => handleAttendanceSubmit(s.id)}
                                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors">Simpan</button>
                              </div>
                              {attendance.length === 0 ? (
                                <p className="text-sm text-muted">Belum ada presensi.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead><tr className="border-b border-outline">
                                      <th className="text-left p-2 font-medium text-muted">Tanggal</th>
                                      <th className="text-left p-2 font-medium text-muted">Status</th>
                                      <th className="text-left p-2 font-medium text-muted">Catatan</th>
                                    </tr></thead>
                                    <tbody>{attendance.map((a) => (
                                      <tr key={a.id} className="border-b border-outline/50">
                                        <td className="p-2 text-ink">{a.date}</td>
                                        <td className="p-2">{statusBadge(a.status)}</td>
                                        <td className="p-2 text-muted text-xs">{a.notes || "—"}</td>
                                      </tr>
                                    ))}</tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <input type="date" value={hafForm.date} onChange={(e) => setHafForm({ ...hafForm, date: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm" />
                                <input type="text" placeholder="Surah *" value={hafForm.surah} onChange={(e) => setHafForm({ ...hafForm, surah: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm w-28" />
                                <input type="number" placeholder="Ayat dr" value={hafForm.ayat_start} onChange={(e) => setHafForm({ ...hafForm, ayat_start: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm w-20" />
                                <input type="number" placeholder="Ayat ke" value={hafForm.ayat_end} onChange={(e) => setHafForm({ ...hafForm, ayat_end: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm w-20" />
                                <input type="number" placeholder="Juz" value={hafForm.juz} onChange={(e) => setHafForm({ ...hafForm, juz: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm w-16" />
                                <select value={hafForm.status} onChange={(e) => setHafForm({ ...hafForm, status: e.target.value })}
                                  className="px-3 py-2 bg-surface border border-outline rounded-xl text-sm">
                                  {HAFALAN_STATUSES.map((st) => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                                </select>
                                <button onClick={() => handleHafalanSubmit(s.id)}
                                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors">Simpan</button>
                              </div>
                              {hafalan.length === 0 ? (
                                <p className="text-sm text-muted">Belum ada hafalan.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead><tr className="border-b border-outline">
                                      <th className="text-left p-2 font-medium text-muted">Tanggal</th>
                                      <th className="text-left p-2 font-medium text-muted">Surah</th>
                                      <th className="text-center p-2 font-medium text-muted">Ayat</th>
                                      <th className="text-center p-2 font-medium text-muted">Juz</th>
                                      <th className="text-left p-2 font-medium text-muted">Status</th>
                                      <th className="text-left p-2 font-medium text-muted">Catatan</th>
                                      <th className="text-right p-2 font-medium text-muted"></th>
                                    </tr></thead>
                                    <tbody>{hafalan.map((h) => (
                                      <tr key={h.id} className="border-b border-outline/50">
                                        <td className="p-2 text-ink">{h.date}</td>
                                        <td className="p-2 font-medium text-ink">{h.surah}</td>
                                        <td className="p-2 text-center text-muted">{h.ayat_start ? `${h.ayat_start}${h.ayat_end ? `-${h.ayat_end}` : ""}` : "—"}</td>
                                        <td className="p-2 text-center text-muted">{h.juz ?? "—"}</td>
                                        <td className="p-2">{hafalanStatusBadge(h.status)}</td>
                                        <td className="p-2 text-muted text-xs">{h.notes || "—"}</td>
                                        <td className="p-2 text-right">
                                          <button onClick={async () => { if (confirm("Hapus catatan hafalan ini?")) { try { await deleteHafalan(h.id); setHafalan(await getHafalan(s.id)); } catch (err) { console.error(err); setError("Gagal menghapus data."); } } }}
                                            className="p-1 hover:bg-bg rounded-lg text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </td>
                                      </tr>
                                    ))}</tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
