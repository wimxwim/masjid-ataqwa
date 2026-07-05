"use client";

import React, { useState, useEffect } from "react";
import { LedgerEntry } from "@/types";
import {
  Landmark, CheckCircle, ChevronRight, Info
} from "lucide-react";
import { useAppContext } from "@/stores/app-context";
import { useRouter } from "next/navigation";
import { GlassCard, SectionHeader, SectionShell, IslamicDivider } from "@/components/design-system";

interface BankInfaqClientProps {
  mosqueName: string;
  testimonials: Array<{
    id: string;
    nama: string;
    usia: number | null;
    title: string | null;
    story: string;
    image_url: string | null;
    ring: string | null;
    durasi_bulan: number | null;
  }>;
}

export default function BankInfaqClient({ mosqueName, testimonials }: BankInfaqClientProps) {
  const { appToast, triggerToast } = useAppContext();
  const router = useRouter();

  // Simulator State
  const [loanAmount, setLoanAmount] = useState<number>(2000000);
  const [loanPeriod, setLoanPeriod] = useState<number>(6);
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);

  // Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyStep, setApplyStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  // Modal Form Inputs
  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("Warung Makan / Kelontong");
  const [bizAddress, setBizAddress] = useState("");
  const [bizAge, setBizAge] = useState("1-2 Tahun");

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userNik, setUserNik] = useState("");
  const [homeStatus, setHomeStatus] = useState("Milik Sendiri");

  const [loanReason, setLoanReason] = useState("");
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  const handleAddLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries((prev) => [entry, ...prev]);
    triggerToast("Transaksi Berhasil", "Mutasi berhasil diverifikasi dan dicatat pada sistem.");
  };

  // Calculate installment
  useEffect(() => {
    setMonthlyInstallment(Math.round(loanAmount / loanPeriod));
  }, [loanAmount, loanPeriod]);

  const handleOpenApply = () => {
    setApplyStep(1);
    setApplyModalOpen(true);
  };

  const handleNextStep = () => {
    setApplyStep((prev) => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
  };

  const handlePrevStep = () => {
    setApplyStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplyStep(4);
      const newEntry: LedgerEntry = {
        id: "loan-" + Date.now(),
        tanggal: new Date().toISOString().split('T')[0] || "",
        keterangan: `Pencairan Qardhul Hasan - ${userName} (${bizName})`,
        tipe: "Pengeluaran",
        kategori: "Bank Infaq Qardhul Hasan",
        jumlah: loanAmount
      };
      handleAddLedgerEntry(newEntry);
    }, 1500);
  };

  const inputBaseClass =
    "w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2 px-3 rounded-xl text-sm transition-all shadow-1";

  const primaryBtnClass =
    "bg-primary hover:bg-primary-deep text-white font-bold rounded-xl hover:shadow-glow active:scale-95 transition-all flex items-center gap-1.5";

  const secondaryBtnClass =
    "glass border-white/40 text-muted font-bold rounded-xl hover:bg-surface/80 active:scale-95 transition-all";

  return (
    <div className="animate-fade-in" id="bank-infaq-page">

      {/* 1. Hero Section */}
      <SectionShell className="pb-0">
        <section className="reveal relative overflow-hidden glass-dark text-white rounded-[var(--radius-card)] shadow-4 py-16 sm:py-20 px-6 sm:px-12">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 glass border-primary/30 text-primary px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" />
              Program Infaq Qardhul Hasan
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
              Bank Infaq: Melawan Riba, <span className="text-primary">Memandirikan Dhuafa</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 max-w-2xl font-sans leading-relaxed">
              Bank Infaq Qardhul Hasan At-Taqwa Ulujami hadir sebagai solusi pinjaman modal bergulir 100% bebas bunga dan biaya administrasi. Kami menyelamatkan pedagang kecil dari jeratan rentenir keliling, sekaligus mendampingi usaha mereka dengan bimbingan rohani & manajemen bisnis syariah.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleOpenApply}
                className={`${primaryBtnClass} px-7 py-3.5 text-sm`}
              >
                Ajukan Bantuan Modal Usaha
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/donasi?type=Infaq Bank Infaq Qardhul Hasan')}
                className="glass border-white/20 hover:shadow-glow text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all flex items-center gap-1.5"
              >
                Top Up Dana Bank Infaq
              </button>
            </div>
          </div>
        </section>
      </SectionShell>

      {/* 2. Repayment Simulator */}
      <SectionShell className="reveal" id="simulator-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Side: Sliders */}
          <GlassCard variant="strong" rounded="2xl" className="lg:col-span-7 p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-ink tracking-tight">
                Simulasi Pembiayaan Kebajikan (Qardhul Hasan)
              </h2>
              <p className="text-xs text-muted mt-1">
                Gunakan slider di bawah untuk mengatur jumlah pinjaman modal bergulir dan periode angsuran bulanan.
              </p>
            </div>

            <div className="space-y-6">
              {/* Amount Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted">
                  <span>Nominal Pengajuan Modal</span>
                  <span className="text-lg font-mono font-black text-primary">Rp {loanAmount.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={5000000}
                  step={250000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface/50 rounded-lg appearance-none cursor-pointer accent-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>Min: Rp 500 Ribu</span>
                  <span>Max: Rp 5 Juta</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted">
                  <span>Jangka Waktu Angsuran</span>
                  <span className="text-lg font-mono font-black text-primary">{loanPeriod} Bulan</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={loanPeriod}
                  onChange={(e) => setLoanPeriod(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface/50 rounded-lg appearance-none cursor-pointer accent-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>Min: 2 Bulan</span>
                  <span>Max: 12 Bulan</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Right Side: Simulation Breakdown Card */}
          <GlassCard variant="strong" rounded="2xl" className="lg:col-span-5 p-6 sm:p-8 space-y-6 text-center">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Estimasi Cicilan Bulanan</p>
              <p className="text-3xl sm:text-4xl font-mono font-black text-ink tracking-tight">
                Rp {monthlyInstallment.toLocaleString("id-ID")}<span className="text-sm font-sans font-medium text-muted">/bln</span>
              </p>
            </div>

            <div className="border-t border-b border-outline py-4 text-xs text-left space-y-3 font-semibold text-ink">
              <div className="flex justify-between">
                <span className="text-muted font-normal">Tingkat Bunga / Jasa Pinjam:</span>
                <span className="text-primary flex items-center gap-1">0% (Bebas Riba)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-normal">Biaya Administrasi & Materai:</span>
                <span className="text-primary">Rp 0 (Subsidi Infaq)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-normal">Total Pengembalian Dana:</span>
                <span className="font-mono font-black text-ink">Rp {loanAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-normal">Syarat Pendampingan:</span>
                <span className="text-accent">Hadir Majelis Pekanan</span>
              </div>
            </div>

            <button
              onClick={handleOpenApply}
              className={`${primaryBtnClass} w-full py-3.5 text-sm justify-center`}
            >
              Ajukan Modal Usaha Sekarang
              <ChevronRight className="w-4 h-4" />
            </button>
          </GlassCard>

        </div>
      </SectionShell>

      {/* 3. Steps of Benevolent Micro-finance */}
      <SectionShell className="reveal">
        <div className="space-y-10">
          <SectionHeader
            align="center"
            title="Alur Pengajuan Dana Bergulir"
            description="Sederhana, beradab, berprinsip gotong royong, dan memprioritaskan warga kurang mampu."
          />
          <IslamicDivider className="max-w-xs mx-auto -mt-4" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { num: 1, title: "Isi Form Online", desc: "Lengkapi rincian jenis usaha mikro Anda dan nominal kebutuhan modal." },
              { num: 2, title: "Survey Kelayakan", desc: "Tim amil masjid berkunjung silaturahmi untuk survey dan verifikasi lapangan." },
              { num: 3, title: "Persetujuan & Akad", desc: "Akad qardhul hasan ditandatangani tanpa jaminan, pencairan dana instan." },
              { num: 4, title: "Binaan Majelis", desc: "Cicilan diangsur per pekan sembari mengikuti kajian fikih & pembukuan usaha." },
            ].map((step, i) => (
              <GlassCard
                key={step.num}
                hover
                rounded="2xl"
                className="relative text-center space-y-3 p-6 reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center mx-auto text-sm">
                  {step.num}
                </div>
                <h4 className="font-semibold text-sm text-ink">{step.title}</h4>
                <p className="text-xs text-muted font-medium">{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* 4. Stories of Beneficiaries (Kisah Sukses) — dari DB */}
      <SectionShell className="reveal">
        <div className="space-y-10">
          <SectionHeader
            align="center"
            title="Kisah Sukses Penerima Manfaat"
            description="Inspirasi perjuangan UMKM dhuafa binaan At-Taqwa yang bangkit dari lilitan rentenir."
          />
          <IslamicDivider className="max-w-xs mx-auto -mt-4" />

          {testimonials.length === 0 ? (
            <p className="text-center text-sm text-muted">Belum ada kisah yang tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <GlassCard
                  key={t.id}
                  hover
                  rounded="2xl"
                  className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start reveal"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt={t.nama}
                      className="w-24 h-24 rounded-full object-cover shrink-0 border-2 border-primary/20 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20 shadow-md text-primary font-bold text-xl">
                      {t.nama.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-base text-ink">
                        {t.nama}{t.usia ? ` (${t.usia} Thn)` : ""}
                      </h4>
                      {t.title && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">{t.title}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">"{t.story}"</p>
                    <p className="text-[10px] text-muted font-mono font-bold">
                      {t.ring ? `★ ${t.ring}` : ""}{t.durasi_bulan ? ` • Terbantu ${t.durasi_bulan} Bulan` : ""}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </SectionShell>

      {/* MULTI-STEP LOAN APPLICATION MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong rounded-[var(--radius-card)] shadow-4 border border-outline max-w-lg w-full overflow-hidden animate-scale-up">

            {/* Header */}
            <div className="glass-dark text-white px-6 py-4 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-primary" />
                <span className="font-display font-bold text-sm">Permohonan Modal Qardhul Hasan</span>
              </div>
              {applyStep !== 4 && (
                <button
                  onClick={() => setApplyModalOpen(false)}
                  className="text-white/70 hover:text-white text-xs font-bold transition-colors"
                >
                  Batal
                </button>
              )}
            </div>

            {/* Stepper Progress bar */}
            {applyStep < 4 && (
              <div className="glass h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(applyStep / 3) * 100}%` }}
                />
              </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleFormSubmit}>

              {/* STEP 1: Profil Usaha */}
              {applyStep === 1 && (
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-base text-ink">Langkah 1: Deskripsi Usaha Mikro</h3>
                  <p className="text-xs text-muted">Harap infokan kondisi unit bisnis mikro yang membutuhkan suntikan dana.</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Nama Dagang / Usaha</label>
                      <input
                        type="text"
                        required
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        placeholder="Contoh: Gorengan Maknyus Ibu Sumarni"
                        className={inputBaseClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Jenis Sektor Usaha</label>
                        <select
                          value={bizType}
                          onChange={(e) => setBizType(e.target.value)}
                          className={inputBaseClass}
                        >
                          <option>Warung Makan / Kelontong</option>
                          <option>Kuliner / Jajanan Keliling</option>
                          <option>Jasa Cuci / Laundry / Setrika</option>
                          <option>Kerajinan Tangan / Jahit</option>
                          <option>Lainnya</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Lama Operasional</label>
                        <select
                          value={bizAge}
                          onChange={(e) => setBizAge(e.target.value)}
                          className={inputBaseClass}
                        >
                          <option>Baru Memulai (&lt; 6 Bulan)</option>
                          <option>6 - 12 Bulan</option>
                          <option>1-2 Tahun</option>
                          <option>Lebih dari 2 Tahun</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Alamat Lokasi Usaha (Ulujami / Sekitarnya)</label>
                      <textarea
                        required
                        rows={2}
                        value={bizAddress}
                        onChange={(e) => setBizAddress(e.target.value)}
                        placeholder="Contoh: Depan SD Negeri Ulujami 01"
                        className={inputBaseClass}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={`${primaryBtnClass} py-2.5 px-5 text-xs tracking-wider`}
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Profil Pemohon */}
              {applyStep === 2 && (
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-base text-ink">Langkah 2: Data Diri Pemohon</h3>
                  <p className="text-xs text-muted">Data Anda dilindungi enkripsi SSL amanah pengurus masjid.</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Nama Lengkap Pemohon</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Contoh: Ahmad Subarkah"
                        className={inputBaseClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Nomor WhatsApp Aktif</label>
                        <input
                          type="tel"
                          required
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="Contoh: 0812XXXXXXXX"
                          className={`${inputBaseClass} font-mono`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Nomor Induk Kependudukan (NIK)</label>
                        <input
                          type="text"
                          required
                          value={userNik}
                          onChange={(e) => setUserNik(e.target.value)}
                          placeholder="NIK KTP 16 Digit..."
                          className={`${inputBaseClass} font-mono`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Status Kepemilikan Tempat Tinggal</label>
                      <select
                        value={homeStatus}
                        onChange={(e) => setHomeStatus(e.target.value)}
                        className={inputBaseClass}
                      >
                        <option>Milik Sendiri</option>
                        <option>Sewa / Kontrak Bulanan</option>
                        <option>Menumpang Orang Tua / Saudara</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={`${secondaryBtnClass} py-2.5 px-4 text-xs`}
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={`${primaryBtnClass} py-2.5 px-5 text-xs tracking-wider`}
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Rencana Pembiayaan */}
              {applyStep === 3 && (
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-base text-ink">Langkah 3: Rincian Penggunaan Dana</h3>
                  <p className="text-xs text-muted">Harap sebutkan secara spesifik penggunaan dana demi asaz kemaslahatan.</p>

                  <div className="space-y-4 text-sm">
                    <div className="glass border border-primary/20 rounded-xl p-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-muted block">Dana Diajukan:</span>
                        <span className="font-mono font-black text-primary-deep text-sm">Rp {loanAmount.toLocaleString("id-ID")}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Tenor:</span>
                        <span className="font-black text-primary-deep text-sm">{loanPeriod} Bulan</span>
                      </div>
                      <div>
                        <span className="text-muted block">Angsuran / Bln:</span>
                        <span className="font-mono font-black text-ink text-sm">Rp {monthlyInstallment.toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Rencana Penggunaan Modal Usaha</label>
                      <textarea
                        required
                        rows={3}
                        value={loanReason}
                        onChange={(e) => setLoanReason(e.target.value)}
                        placeholder="Contoh: Membeli etalase kaca baru, belanja minyak goreng, terigu, dan tabung gas 3kg..."
                        className={inputBaseClass}
                      />
                    </div>

                    <div className="glass border border-accent/20 rounded-xl p-3 flex gap-2.5 text-[11px] text-amber-900/80 font-sans">
                      <Info className="w-4.5 h-4.5 text-accent shrink-0" />
                      <span>Dengan mengklik "Kirim Pengajuan", Anda setuju untuk disurvey oleh tim pengurus Bank Infaq At-Taqwa Ulujami secara sukarela & adil.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={`${secondaryBtnClass} py-2.5 px-4 text-xs`}
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`${primaryBtnClass} py-2.5 px-6 text-xs tracking-wider disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          Kirim Pengajuan Modal
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success Screen */}
              {applyStep === 4 && (
                <div className="p-8 text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-success-subtle text-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl text-primary-deep">Permohonan Terkirim!</h3>
                    <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                      Alhamdulillah, berkas pendaftaran modal usaha mikro atas nama <b className="text-ink">{userName}</b> telah kami simpan di sistem pendaftaran admin.
                    </p>
                    <p className="text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg p-3 max-w-sm mx-auto font-sans leading-relaxed">
                      ★ Tim Amil & Survey Lapangan akan menghubungi Anda via WhatsApp di <b className="font-mono">{userPhone}</b> dalam kurun waktu 2x24 jam untuk menjadwalkan kunjungan silaturahmi survey warung.
                    </p>
                  </div>

                  <div className="bg-bg border border-outline rounded-xl p-3 text-xs font-mono text-muted text-left max-w-sm mx-auto">
                    <div>No Tiket: REQ-QH-{Math.floor(Math.random() * 90000 + 10000)}</div>
                    <div>Usaha: {bizName}</div>
                    <div>Nominal: Rp {loanAmount.toLocaleString("id-ID")}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="w-full bg-ink hover:bg-primary-deep hover:shadow-glow text-white font-bold py-3 rounded-xl text-xs transition-all"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
