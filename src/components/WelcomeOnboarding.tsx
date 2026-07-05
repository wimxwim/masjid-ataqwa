"use client";

import { useState, useEffect } from "react";
import { Landmark, Check, ArrowRight } from "lucide-react";

const ROLE_CHECKLISTS: Record<string, { label: string; action: string }[]> = {
  ketua: [
    { label: "Tinjau dashboard ringkasan masjid", action: "Lihat Overview" },
    { label: "Kenali menu-menu pengelolaan", action: "Jelajahi Sidebar" },
    { label: "Atur profil masjid dan pengurus", action: "Buka Pengaturan" },
  ],
  wakil_ketua: [
    { label: "Lihat ringkasan semua bidang", action: "Lihat Overview" },
    { label: "Pantau aktivitas terkini", action: "Buka Aktivitas" },
    { label: "Koordinasi dengan ketua", action: "Hubungi Ketua" },
  ],
  sekretaris: [
    { label: "Catat data pengurus DKM", action: "Buka Data Pengurus" },
    { label: "Dokumentasikan kegiatan masjid", action: "Buka Aktivitas" },
    { label: "Siapkan arsip dan notulensi", action: "Atur Dokumen" },
  ],
  bendahara: [
    { label: "Catat saldo awal kas masjid", action: "Buka Buku Kas" },
    { label: "Atur jenis dana (Zakat, Infaq, Wakaf)", action: "Buka Pemasukan" },
    { label: "Laporkan posisi keuangan ke Ketua", action: "Buat Laporan" },
  ],
  dakwah: [
    { label: "Atur jadwal imam dan khatib", action: "Buka Jadwal" },
    { label: "Rencanakan program kajian rutin", action: "Buka Program" },
    { label: "Catat kegiatan TPQ/TPA", action: "Buka Santri" },
  ],
  sosial: [
    { label: "Input data mustahik baru", action: "Buka Data Mustahik" },
    { label: "Petakan lokasi mustahik di GIS", action: "Buka Peta Mustahik" },
    { label: "Salurkan bantuan tepat sasaran", action: "Buka Distribusi" },
  ],
  sarpras: [
    { label: "Catat inventaris barang masjid", action: "Buka Inventaris" },
    { label: "Rencanakan jadwal perawatan", action: "Buka Perawatan" },
    { label: "Kelola aset wakaf", action: "Buka Aset Wakaf" },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ketua: "Ketua DKM",
  wakil_ketua: "Wakil Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  dakwah: "Bidang Dakwah & Pendidikan",
  sosial: "Bidang Sosial",
  sarpras: "Bidang Sarpras",
};

interface WelcomeOnboardingProps {
  userName?: string;
  userRole?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeOnboarding({ userName, userRole = "ketua", isOpen, onClose }: WelcomeOnboardingProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  const fallback: { label: string; action: string }[] = [];
  const checklist = (ROLE_CHECKLISTS[userRole] ?? ROLE_CHECKLISTS.ketua) ?? fallback;
  const roleLabel = ROLE_LABELS[userRole] ?? "Pengurus";
  const allChecked = checked.size === checklist.length;

  useEffect(() => {
    if (isOpen) setDismissed(false);
  }, [isOpen]);

  if (!isOpen || dismissed) return null;

  const toggleCheck = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl border border-outline shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Landmark className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-xl">Selamat Datang</h2>
          <p className="text-emerald-100 text-sm mt-1">
            {userName ? `${userName} — ` : ""}Anda login sebagai <strong>{roleLabel}</strong>
          </p>
          <p className="text-emerald-200/80 text-xs mt-2">
            Masjid Jami&apos; At-Taqwa Ulujami
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="font-bold text-lg text-ink">Langkah Awal untuk {roleLabel}</h3>
            <p className="text-sm text-muted mt-1">
              Selesaikan langkah-langkah berikut untuk memulai pengelolaan masjid secara digital.
            </p>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => {
              const done = checked.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`flex items-center gap-3 w-full text-left p-3.5 rounded-xl border transition-all ${
                    done
                      ? "bg-success-subtle border-emerald-200"
                      : "bg-bg border-outline hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {done && <Check className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-sm ${done ? "text-emerald-800" : "text-ink"}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${done ? "text-emerald-600" : "text-muted"}`}>
                      {done ? "Selesai" : `💡 ${item.action}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {allChecked && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="font-semibold text-emerald-800 text-sm">
                ✅ Semua langkah awal selesai!
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Anda siap mengelola Masjid At-Taqwa secara digital.
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors"
          >
            {allChecked ? "Mulai Kelola Masjid" : "Mulai Saja"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {!allChecked && (
            <button
              onClick={() => { setDismissed(true); onClose(); }}
              className="block mx-auto text-xs text-muted hover:text-ink underline"
            >
              Lewati — nanti saja
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
