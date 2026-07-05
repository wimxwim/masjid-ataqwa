"use client";

import { useState, useEffect, useCallback } from "react";
import { getDonaturTetap, createDonaturTetap, updateDonaturTetap, deleteDonaturTetap } from "@/lib/actions/donatur-tetap";
import { Search, Plus, X, Pencil, Trash2, Loader2, HeartHandshake, UserCheck, Wallet } from "lucide-react";
import { formatNominal } from "@/lib/format";
import { StatCard } from "@/components/LargeUI";
import SmartEmptyState from "@/components/SmartEmptyState";

type Donatur = Awaited<ReturnType<typeof getDonaturTetap>>[number];

const aliranDanaOptions = [
  "Dana Operasional Masjid",
  "Zakat Maal",
  "Zakat Fitrah",
  "Infaq",
  "Sedekah",
  "Wakaf",
];

const frekuensiOptions = ["Harian", "Mingguan", "Bulanan", "Tahunan", "Insidental"];

const statusOptions = ["Aktif", "Tidak Aktif", "Almarhum"];

export default function AdminDonaturPage() {
  const [data, setData] = useState<Donatur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Donatur | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKomitmen, setFormKomitmen] = useState("");

  useEffect(() => {
    setFormKomitmen(editing?.komitmen_bulanan?.toString() ?? "");
  }, [editing]);

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getDonaturTetap()); }
    catch (e) { console.error(e); setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.nama.toLowerCase().includes(q) || (d.phone?.includes(q)) || (d.alamat?.toLowerCase().includes(q));
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      nama: form.get("nama") as string,
      phone: (form.get("phone") as string) || null,
      alamat: (form.get("alamat") as string) || null,
      komitmen_bulanan: parseInt(formKomitmen) || 0,
      aliran_dana: (form.get("aliran_dana") as string) || "Dana Operasional Masjid",
      program_spesifik: (form.get("program_spesifik") as string) || null,
      frekuensi: (form.get("frekuensi") as string) || "Bulanan",
      status: (form.get("status") as string) || "Aktif",
    };
    try {
      if (editing) {
        await updateDonaturTetap(editing.id, payload);
      } else {
        await createDonaturTetap(payload);
      }
      setShowForm(false); setEditing(null); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={HeartHandshake} label="Total Donatur" value={data.length.toString()} />
        <StatCard icon={UserCheck} label="Donatur Aktif" value={data.filter(d => d.status === "Aktif").length.toString()} sublabel="Berdonasi rutin" />
        <StatCard icon={Wallet} label="Total Komitmen" value={`Rp ${data.reduce((sum, d) => sum + (d.komitmen_bulanan ?? 0), 0).toLocaleString("id-ID")}/bulan`} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Muzaki & Donatur Tetap</h2>
          <p className="text-sm text-muted">{data.length} donatur terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Donatur
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari nama/telepon/alamat..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Donatur" : "Tambah Donatur Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink block mb-1">Nama *</label>
                  <input name="nama" defaultValue={editing?.nama ?? ""} required
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Telepon</label>
                  <input name="phone" defaultValue={editing?.phone ?? ""}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Frekuensi</label>
                  <select name="frekuensi" defaultValue={editing?.frekuensi ?? "Bulanan"}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {frekuensiOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink block mb-1">Alamat</label>
                <input name="alamat" defaultValue={editing?.alamat ?? ""}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Aliran Dana</label>
                  <select name="aliran_dana" defaultValue={editing?.aliran_dana ?? "Dana Operasional Masjid"}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {aliranDanaOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Komitmen (Rp/bulan)</label>
                  <input name="komitmen_bulanan" type="text" inputMode="numeric" value={formatNominal(formKomitmen)} onChange={(e) => setFormKomitmen(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Program Spesifik</label>
                  <input name="program_spesifik" defaultValue={editing?.program_spesifik ?? ""}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">Status</label>
                  <select name="status" defaultValue={editing?.status ?? "Aktif"}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm">
                    {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors inline-flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}
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
            icon={HeartHandshake}
            title="Belum Ada Donatur"
            description="Donatur tetap adalah penyumbang rutin yang berkomitmen mendukung operasional dan program masjid. Tambahkan data donatur pertama untuk mulai pencatatan."
            actionLabel="Tambah Donatur"
            onAction={() => { setEditing(null); setShowForm(true); setError(""); }}
          />
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">Tidak ada hasil pencarian.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Nama</th>
                <th className="text-left p-3 font-medium text-muted">Telepon</th>
                <th className="text-left p-3 font-medium text-muted">Aliran Dana</th>
                <th className="text-right p-3 font-medium text-muted">Komitmen</th>
                <th className="text-left p-3 font-medium text-muted">Frekuensi</th>
                <th className="text-left p-3 font-medium text-muted">Status</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((d) => (
                <tr key={d.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3"><div className="font-medium text-ink">{d.nama}</div></td>
                  <td className="p-3 text-muted">{d.phone || "—"}</td>
                  <td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{d.aliran_dana}</span></td>
                  <td className="p-3 text-right font-mono text-sm">Rp {d.komitmen_bulanan?.toLocaleString("id-ID") ?? "0"}</td>
                  <td className="p-3 text-muted">{d.frekuensi}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      d.status === "Aktif" ? "bg-emerald-100 text-emerald-700" :
                      d.status === "Tidak Aktif" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{d.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(d); setShowForm(true); setError(""); }}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={async () => { if (confirm(`Hapus donatur ${d.nama}?`)) { try { await deleteDonaturTetap(d.id); load(); } catch (err) { console.error(err); setError("Gagal menghapus data."); } } }}
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
