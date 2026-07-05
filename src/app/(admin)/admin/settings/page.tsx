"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Info, Loader2 } from "lucide-react";
import { getMosqueSettings, updateMosqueSettings } from "@/lib/actions/settings";
import type { MosqueSettings } from "@/lib/actions/settings";
import { formatNominal } from "@/lib/format";

type TextField = { label: string; key: keyof MosqueSettings; placeholder: string; type?: "text" | "email" | "number" };
type SelectField = { label: string; key: keyof MosqueSettings; type: "select"; options: string[]; placeholder?: string };
type Field = TextField | SelectField;

const sections: { title: string; desc?: string; fields: Field[] }[] = [
  {
    title: "Identitas Masjid",
    fields: [
      { label: "Nama Masjid", key: "name", placeholder: "Masjid Jami' At-Taqwa" } as TextField,
      { label: "Alamat", key: "address", placeholder: "Jl. Ulujami Raya No.1" } as TextField,
      { label: "Telepon", key: "phone", placeholder: "021-xxxxxxx" } as TextField,
      { label: "Email", key: "email", type: "email", placeholder: "ataqwa@example.com" } as TextField,
    ],
  },
  {
    title: "Bank & Rekening",
    desc: "Rekening resmi untuk ZIS dan donasi. Info ini muncul di halaman donasi.",
    fields: [
      { label: "Nama Bank", key: "bank_name", placeholder: "Bank Syariah Indonesia" } as TextField,
      { label: "Nomor Rekening", key: "bank_account", placeholder: "1234567890" } as TextField,
      { label: "Atas Nama", key: "bank_holder", placeholder: "Masjid Jami' At-Taqwa" } as TextField,
    ],
  },
  {
    title: "Konfigurasi Donasi",
    desc: "Pengaturan default untuk transaksi kas masjid.",
    fields: [
      { label: "Default Infak (Rp)", key: "default_infaq", type: "number", placeholder: "10000" } as TextField,
      { label: "Keterbukaan Data", key: "data_public", type: "select", options: ["Publik", "Internal", "Privat"] } as SelectField,
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMosqueSettings()
      .then((s) => {
        const v: Record<string, string> = {};
        for (const key of Object.keys(s) as (keyof MosqueSettings)[]) {
          v[key] = String(s[key] ?? "");
        }
        setValues(v);
      })
      .catch(() => setError("Gagal memuat pengaturan."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const fd = new FormData();
    for (const [k, v] of Object.entries(values)) {
      fd.append(k, v);
    }
    const res = await updateMosqueSettings(fd);
    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display font-bold text-xl text-ink">Pengaturan Masjid</h2>
        <p className="text-sm text-muted">Konfigurasi tampilan portal dan transaksi.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-amber-800">
          Data ini akan muncul di halaman publik portal masjid. Pastikan informasi bank dan kontak selalu terbaru.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="bg-surface rounded-2xl border border-outline p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-ink">{section.title}</h3>
            {section.desc && <p className="text-xs text-muted mt-0.5">{section.desc}</p>}
          </div>
          <div className="space-y-3">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-ink block mb-1">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {(field as SelectField).options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={(field as TextField).type === "number" ? "text" : (field as TextField).type ?? "text"}
                    inputMode={(field as TextField).type === "number" ? "numeric" : undefined}
                    value={(field as TextField).type === "number" ? formatNominal(values[field.key] ?? "") : (values[field.key] ?? "")}
                    onChange={(e) => handleChange(field.key, (field as TextField).type === "number" ? e.target.value.replace(/\D/g, "") : e.target.value)}
                    placeholder={(field as TextField).placeholder}
                    className="w-full px-3 py-2.5 bg-bg border border-outline rounded-xl text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Tersimpan</> : "Simpan Pengaturan"}
      </button>
    </div>
  );
}
