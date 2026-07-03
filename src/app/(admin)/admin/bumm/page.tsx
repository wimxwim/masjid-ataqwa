"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getBummProducts, createBummProduct, updateBummProduct, deleteBummProduct,
  type InsertBummProduct,
} from "@/lib/actions/bumm";
import { Search, Plus, X, Pencil, Trash2, Package } from "lucide-react";

type Product = Awaited<ReturnType<typeof getBummProducts>>[number];

export default function AdminBummPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCommission, setFormCommission] = useState("15");
  const [formStock, setFormStock] = useState("0");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(true);

  const load = useCallback(async () => {
    try { setLoading(true); setData(await getBummProducts()); }
    catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.product_name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q);
  });

  const resetForm = () => {
    setFormName(""); setFormCategory(""); setFormPrice(""); setFormCommission("15");
    setFormStock("0"); setFormImage(""); setFormDescription(""); setFormActive(true);
  };

  const openNew = () => {
    resetForm(); setEditing(null); setShowForm(true); setError("");
  };

  const openEdit = (p: Product) => {
    setFormName(p.product_name);
    setFormCategory(p.category ?? "");
    setFormPrice(p.price.toString());
    setFormCommission((p.commission_pct ?? 15).toString());
    setFormStock((p.stock ?? 0).toString());
    setFormImage(p.image_url ?? "");
    setFormDescription(p.description ?? "");
    setFormActive(p.is_active ?? true);
    setEditing(p); setShowForm(true); setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const payload: InsertBummProduct = {
      product_name: formName,
      category: formCategory || null,
      description: formDescription || null,
      price: parseInt(formPrice) || 0,
      commission_pct: parseFloat(formCommission) || 15,
      stock: parseInt(formStock) || 0,
      image_url: formImage || null,
      is_active: formActive,
    };
    try {
      if (editing) {
        await updateBummProduct(editing.id, payload);
      } else {
        await createBummProduct(payload);
      }
      setShowForm(false); load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try { await deleteBummProduct(id); load(); }
    catch { setError("Gagal menghapus"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">Produk BUMM</h2>
          <p className="text-sm text-muted">{data.length} produk</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">{editing ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="text-xs font-medium text-ink block mb-1">Nama Produk *</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} required
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Kategori</label>
                  <input value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Harga (Rp) *</label>
                  <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-ink block mb-1">Komisi (%)</label>
                  <input type="number" value={formCommission} onChange={(e) => setFormCommission(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
                <div><label className="text-xs font-medium text-ink block mb-1">Stok</label>
                  <input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-ink block mb-1">URL Gambar</label>
                <input value={formImage} onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <div><label className="text-xs font-medium text-ink block mb-1">Deskripsi</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm" /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                Produk aktif
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {editing ? "Simpan" : "Tambah"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-outline rounded-xl text-sm text-muted hover:bg-bg">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-outline overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted">Memuat...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">Belum ada produk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline bg-bg/50">
                <th className="text-left p-3 font-medium text-muted">Produk</th>
                <th className="text-left p-3 font-medium text-muted">Kategori</th>
                <th className="text-right p-3 font-medium text-muted">Harga</th>
                <th className="text-center p-3 font-medium text-muted">Komisi</th>
                <th className="text-center p-3 font-medium text-muted">Stok</th>
                <th className="text-center p-3 font-medium text-muted">Aktif</th>
                <th className="text-right p-3 font-medium text-muted">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((p) => (
                <tr key={p.id} className="border-b border-outline hover:bg-bg/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted shrink-0" />
                      <span className="font-medium text-ink">{p.product_name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{p.category ?? "—"}</td>
                  <td className="p-3 text-right font-mono">Rp {p.price.toLocaleString("id-ID")}</td>
                  <td className="p-3 text-center">{p.commission_pct ?? 15}%</td>
                  <td className="p-3 text-center">{p.stock ?? 0}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)}
                        className="p-2 hover:bg-bg rounded-lg text-muted hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)}
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
