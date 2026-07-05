"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Plus, CheckCircle2, Send, Loader2 } from "lucide-react";
import type { LedgerEntry } from "@/types";
import { createDonaturTetap, getDonaturTetap } from "@/lib/actions/donatur-tetap";
import { formatNominal } from "@/lib/format";

const FREKUENSI_OPTIONS = ["Bulanan", "Pekan harian", "Setiap Jumat"] as const;

interface DonaturTabProps {
  mosqueId: string;
  onAddLedgerEntry: (entry: LedgerEntry) => void;
}

interface DonaturRow {
  id: string;
  nama: string;
  phone: string | null;
  alamat: string | null;
  komitmen_bulanan: number;
  aliran_dana: string;
  program_spesifik: string | null;
  frekuensi: string;
  status: string;
  riwayat_penerimaan: unknown[];
}

export default function DonaturTab({ mosqueId, onAddLedgerEntry }: DonaturTabProps) {
  const [donNama, setDonNama] = useState("");
  const [donTelp, setDonTelp] = useState("");
  const [donAlamat, setDonAlamat] = useState("");
  const [donKomitmen, setDonKomitmen] = useState("");
  const [donAliran, setDonAliran] = useState<string>("Dana Operasional Masjid");
  const [donProgramSpesifik, setDonProgramSpesifik] = useState("");
  const [donFrekuensi, setDonFrekuensi] = useState<string>("Bulanan");
  const [donaturTetapList, setDonaturTetapList] = useState<DonaturRow[]>([]);
  const [simulatedWA, setSimulatedWA] = useState<{ open: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDonatur = useCallback(async () => {
    try {
      const data = await getDonaturTetap(mosqueId);
      setDonaturTetapList(data as unknown as DonaturRow[]);
    } catch { /* auth may fail */ }
  }, [mosqueId]);

  useEffect(() => { loadDonatur(); }, [loadDonatur]);

  const handleAddDonatur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!donNama.trim() || !donTelp.trim()) return;

    setIsSubmitting(true);
    try {
      await createDonaturTetap({
        nama: donNama,
        phone: donTelp,
        alamat: donAlamat || null,
        komitmen_bulanan: Number(donKomitmen) || 0,
        aliran_dana: donAliran,
        program_spesifik: donProgramSpesifik || null,
        frekuensi: donFrekuensi,
        status: "Aktif",
      });
      await loadDonatur();
      setDonNama("");
      setDonTelp("");
      setDonAlamat("");
      setDonKomitmen("");
      setDonAliran("Dana Operasional Masjid");
      setDonProgramSpesifik("");
      setDonFrekuensi("Bulanan");
    } catch { /* handled by caller */ }
    finally { setIsSubmitting(false); }
  };

  function handleVerifyDonaturPayment(donatur: DonaturRow) {
    const today = new Date().toISOString().split("T")[0] ?? "";

    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      tanggal: today,
      keterangan: `Donasi rutin — ${donatur.nama}`,
      tipe: "Pemasukan",
      kategori: donatur.aliran_dana,
      jumlah: donatur.komitmen_bulanan,
    };
    onAddLedgerEntry(entry);

    const waText =
      `*Konfirmasi Penerimaan Donasi Tetap*\n\n` +
      `Yth. ${donatur.nama}\n\n` +
      `Terima kasih atas donasi rutin Anda sebesar *Rp ${donatur.komitmen_bulanan.toLocaleString("id-ID")}*.\n\n` +
      `📋 *Detail Donasi*\n` +
      `Aliran Dana : ${donatur.aliran_dana}\n` +
      `Frekuensi   : ${donatur.frekuensi}\n` +
      `Tanggal     : ${today}\n` +
      `Status      : ✅ Sukses\n\n` +
      `Semoga Allah SWT menerima amal ibadah Bapak/Ibu dan membalas dengan kebaikan berlipat.\n\n` +
      `— Masjid Jami' At-Taqwa Ulujami`;

    setSimulatedWA({ open: true, text: waText });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      Tertunda: "bg-amber-100 text-amber-800 border border-amber-200",
      Baru: "bg-primary/10 text-primary border border-primary/20",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-bg text-muted border border-outline"}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-8 reveal">
      <form onSubmit={handleAddDonatur} className="glass-strong rounded-2xl shadow-2 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Tambah Donatur Tetap Baru</h3>
            <p className="text-sm text-muted">Input data donatur yang berkomitmen rutin berdonasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Nama Lengkap</label>
            <input type="text" placeholder="Nama donatur" value={donNama} onChange={(e) => setDonNama(e.target.value)}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Telepon / WA</label>
            <input type="text" placeholder="08xxxxxxxxxx" value={donTelp} onChange={(e) => setDonTelp(e.target.value)}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Alamat</label>
            <input type="text" placeholder="Alamat donatur" value={donAlamat} onChange={(e) => setDonAlamat(e.target.value)}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Komitmen Bulanan (Rp)</label>
            <input type="text" inputMode="numeric" placeholder="0" value={formatNominal(donKomitmen)} onChange={(e) => setDonKomitmen(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Aliran Dana</label>
            <select value={donAliran} onChange={(e) => setDonAliran(e.target.value)}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1">
              <option value="Dana Operasional Masjid">Dana Operasional Masjid</option>
              <option value="Dana Program">Dana Program</option>
              <option value="Dana Unit Pemuda">Dana Unit Pemuda</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Program Spesifik</label>
            <input type="text" placeholder="Contoh: Beasiswa, Renovasi" value={donProgramSpesifik} onChange={(e) => setDonProgramSpesifik(e.target.value)}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Frekuensi</label>
            <select value={donFrekuensi} onChange={(e) => setDonFrekuensi(e.target.value)}
              className="w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-1">
              {FREKUENSI_OPTIONS.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
          <div className="flex items-end sm:col-span-3">
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-deep text-white font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-glow active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-xs sm:text-sm">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Donatur Baru"}
            </button>
          </div>
        </div>
      </form>

      <div className="glass overflow-hidden rounded-[var(--radius-card)] shadow-2 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Daftar Donatur Tetap</h3>
            <p className="text-sm text-muted">{donaturTetapList.length} donatur terdaftar</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="py-3 pr-4">Nama</th>
                <th className="py-3 pr-4">Telepon</th>
                <th className="py-3 pr-4 text-right">Komitmen</th>
                <th className="py-3 pr-4">Aliran Dana</th>
                <th className="py-3 pr-4">Frekuensi</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {donaturTetapList.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-primary/5">
                  <td className="py-3 pr-4 font-medium text-ink">{d.nama}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted">{d.phone}</td>
                  <td className="py-3 pr-4 text-right font-mono font-semibold text-ink">
                    Rp {d.komitmen_bulanan.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 pr-4 text-ink/80">
                    {d.aliran_dana}
                    {d.program_spesifik && (
                      <span className="ml-1 text-xs text-muted">({d.program_spesifik})</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-ink/80">{d.frekuensi}</td>
                  <td className="py-3 pr-4">{statusBadge(d.status)}</td>
                  <td className="py-3 pr-4 text-center">
                    <button
                      onClick={() => handleVerifyDonaturPayment(d)}
                      className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-deep text-white font-bold rounded-lg shadow-md shadow-primary/10 hover:shadow-glow active:scale-95 transition-all px-3 py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verifikasi Pembayaran
                    </button>
                  </td>
                </tr>
              ))}
              {donaturTetapList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted">
                    Belum ada donatur tetap terdaftar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {simulatedWA?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="mx-4 w-full max-w-sm overflow-hidden glass-strong rounded-[var(--radius-card)] shadow-4">
            <div className="flex items-center justify-between bg-[#075e54] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Send className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">WhatsApp Receipt</p>
                  <p className="text-[10px] text-white/70">Pesan terkirim secara simulasi</p>
                </div>
              </div>
              <button onClick={() => setSimulatedWA(null)}
                className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-[#e5ddd5] bg-opacity-50 px-4 py-6">
              <div className="mx-auto max-w-[85%] rounded-lg bg-[#dcf8c6] px-4 py-3 shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{simulatedWA.text}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 px-4 py-3 text-center">
              <button onClick={() => setSimulatedWA(null)}
                className="rounded-lg bg-[#075e54] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#054d44]">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
