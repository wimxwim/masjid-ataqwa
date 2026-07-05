"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, AlertCircle, ShieldCheck, Heart,
  Coins, Wallet, ArrowRight, CreditCard, Landmark,
  ChevronDown, ChevronUp, Info
} from "lucide-react";
import { useAppContext } from "@/stores/app-context";
import { useDefaultMosque } from "@/lib/queries/public";
import { createDonation } from "@/lib/actions/donations";
import { Turnstile } from "@marsidev/react-turnstile";
import { formatNominal } from "@/lib/format";
import { loadSnapScript, snapPay } from "@/lib/midtrans";

const NOMINAL_PRESETS = [25000, 50000, 100000, 250000, 500000];

export default function DonasiSekarang() {
  const router = useRouter();
  const { triggerToast } = useAppContext();
  const { data: mosque } = useDefaultMosque();
  const mosqueId = mosque?.id ?? "";
  const mosqueConfig = (mosque?.config ?? {}) as Record<string, unknown>;

  const [nominalDonasi, setNominalDonasi] = useState("50000");
  const [nama, setNama] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [metode, setMetode] = useState<"qris" | "transfer">("qris");
  const [showKalkulator, setShowKalkulator] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading">("idle");

  const finalAmount = parseInt(nominalDonasi) || 0;

  const handleBayar = async () => {
    if (!turnstileToken) {
      triggerToast("Verifikasi Gagal", "Mohon tunggu captcha selesai.");
      return;
    }
    if (!mosqueId || finalAmount < 5000) return;
    setSubmitState("loading");
    try {
      const row = await createDonation({
        mosque_id: mosqueId,
        donor_name: isAnonymous ? null : nama || null,
        amount: finalAmount,
        akad_type: "infaq",
        program_name: null,
        payment_method: metode,
        payment_status: "pending",
        cf_turnstile_response: turnstileToken,
      });

      const tokenRes = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: `donation-${row.id}`,
          gross_amount: finalAmount,
          donor_name: isAnonymous ? null : nama || null,
          akad_type: "infaq",
        }),
      });

      if (!tokenRes.ok) {
        throw new Error("Gagal mendapatkan token pembayaran");
      }

      const { token } = await tokenRes.json();

      await loadSnapScript();

      snapPay(token, {
        onSuccess: () => {
          router.push(`/payment/success?order_id=${row.id}`);
        },
        onPending: () => {
          router.push(`/payment/pending?order_id=${row.id}`);
        },
        onError: () => {
          triggerToast("Pembayaran Gagal", "Transaksi dibatalkan.");
          setSubmitState("idle");
        },
        onClose: () => {
          setSubmitState("idle");
        },
      });
    } catch (e: any) {
      triggerToast("Gagal", e.message || "Gagal memproses donasi");
      setSubmitState("idle");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6" id="donasi-sekarang">

      <div className="text-center space-y-2 pt-6">
        <h1 className="text-3xl font-display font-extrabold text-ink tracking-tight">
          Donasi Sekarang
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto">
          Zakat, infaq, atau sedekah — satu langkah mudah untuk kebaikan yang luas.
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-outline shadow-lg p-6 sm:p-8 space-y-6">

        <div>
          <label className="block text-xs font-semibold text-muted mb-3">Nominal Donasi</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {NOMINAL_PRESETS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setNominalDonasi(String(amt))}
                className={`py-3 border rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
                  nominalDonasi === String(amt)
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-surface hover:bg-gray-50 text-muted border-outline"
                }`}
              >
                Rp{amt.toLocaleString("id-ID")}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setNominalDonasi("0")}
              className={`py-3 border rounded-xl text-xs sm:text-sm font-bold transition-all ${
                nominalDonasi === "0"
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-surface hover:bg-gray-50 text-muted border-outline"
              }`}
            >
              Lainnya
            </button>
          </div>
          {nominalDonasi === "0" && (
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted font-mono">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNominal(nominalDonasi)}
                  onChange={(e) => setNominalDonasi(e.target.value.replace(/\D/g, ""))}
                  placeholder="Masukkan nominal"
                  className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-12 pr-4 rounded-xl text-sm font-mono transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <div className={isAnonymous ? "opacity-50 pointer-events-none" : ""}>
          <label className="block text-xs font-semibold text-muted mb-1.5">Nama Lengkap (opsional)</label>
          <input
            type="text"
            disabled={isAnonymous}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama Anda..."
            className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 px-4 rounded-xl text-sm transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4.5 h-4.5 accent-primary rounded border-gray-300"
          />
          <span className="text-xs font-semibold text-ink">Saya ingin donasi sebagai Hamba Allah</span>
        </label>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Metode Bayar</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMetode("qris")}
              className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                metode === "qris"
                  ? "border-primary bg-success-subtle/50 text-primary shadow-xs"
                  : "border-outline hover:bg-gray-50 text-muted"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              QRIS
            </button>
            <button
              onClick={() => setMetode("transfer")}
              className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                metode === "transfer"
                  ? "border-primary bg-success-subtle/50 text-primary shadow-xs"
                  : "border-outline hover:bg-gray-50 text-muted"
              }`}
            >
              <Landmark className="w-4 h-4" />
              Transfer BSI
            </button>
          </div>
        </div>

        <div className="border-t border-outline pt-4">
          <button
            onClick={() => setShowKalkulator(!showKalkulator)}
            className="flex items-center justify-between w-full text-xs font-bold text-muted hover:text-ink transition-colors group"
          >
            <span className="group-hover:text-ink">Hitung Zakat Dulu?</span>
            {showKalkulator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showKalkulator && <KalkulatorZakat mosqueConfig={mosqueConfig} />}
        </div>

      </div>

      <div className="bg-surface rounded-2xl border border-outline shadow-lg p-6 text-center space-y-4">
        <p className="text-[10px] uppercase font-bold text-muted tracking-wider">
          Total Donasi
        </p>
        <p className="text-4xl font-mono font-black text-primary-deep">
          Rp {finalAmount.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-muted">
          {isAnonymous ? "Hamba Allah" : (nama || "Donatur")} &middot; {metode === "qris" ? "QRIS" : "Transfer BSI"}
        </p>

        <div className="flex justify-center py-1">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
            onSuccess={(token) => setTurnstileToken(token)}
          />
        </div>

        <button
          onClick={handleBayar}
          disabled={finalAmount < 5000 || !turnstileToken || submitState === "loading"}
          title={
            finalAmount < 5000
              ? "Minimal donasi Rp 5.000"
              : !turnstileToken
                ? "Tunggu verifikasi captcha selesai"
                : undefined
          }
          className="w-full bg-primary hover:bg-primary-deep disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
        >
          {submitState === "loading" ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
          {submitState === "loading" ? "Memproses..." : `Donasi Sekarang — Rp ${finalAmount.toLocaleString("id-ID")}`}
        </button>
        {finalAmount > 0 && finalAmount < 5000 && (
          <p className="text-xs text-red-500 font-semibold mt-2">Minimal donasi Rp 5.000</p>
        )}
        {finalAmount >= 5000 && !turnstileToken && (
          <p className="text-xs text-amber-600 font-semibold mt-2">Menunggu verifikasi captcha...</p>
        )}
      </div>

    </div>
  );
}

function KalkulatorZakat({ mosqueConfig }: { mosqueConfig: Record<string, unknown> }) {
  const [tab, setTab] = useState<"mal" | "profesi" | "infaq">("mal");
  const { triggerToast } = useAppContext();

  const [gEmas, setGEmas] = useState("");
  const [gTabungan, setGTabungan] = useState("");
  const [gSaham, setGSaham] = useState("");
  const [gUtang, setGUtang] = useState("");
  const malNisab = (mosqueConfig.zakat_maal_nisab as number) ?? 85000000;
  const netMal = Math.max(0, (parseFloat(gEmas)||0) + (parseFloat(gTabungan)||0) + (parseFloat(gSaham)||0) - (parseFloat(gUtang)||0));
  const wajibMal = netMal >= malNisab;
  const zakatMal = wajibMal ? Math.round(netMal * 0.025) : 0;

  const [pGaji, setPGaji] = useState("");
  const [pBonus, setPBonus] = useState("");
  const profNisab = (mosqueConfig.zakat_profesi_nisab as number) ?? 6824000;
  const totalProf = (parseFloat(pGaji)||0) + (parseFloat(pBonus)||0);
  const wajibProf = totalProf >= profNisab;
  const zakatProf = wajibProf ? Math.round(totalProf * 0.025) : 0;

  const [iNominal, setINominal] = useState(100000);
  const [iCustom, setICustom] = useState("");

  return (
    <div className="mt-4 space-y-4 border border-outline rounded-xl p-4 bg-bg">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(["mal", "profesi", "infaq"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t ? "bg-surface text-primary shadow-sm" : "text-muted"
            }`}>
            {t === "mal" ? "Zakat Mal" : t === "profesi" ? "Zakat Profesi" : "Infaq"}
          </button>
        ))}
      </div>

      {tab === "mal" && (
        <div className="space-y-3">
          {[{l:"Emas/Perak",v:gEmas,s:setGEmas},{l:"Tabungan/Deposito",v:gTabungan,s:setGTabungan},{l:"Investasi/Saham",v:gSaham,s:setGSaham},{l:"Utang (pengurang)",v:gUtang,s:setGUtang}].map((f) => (
            <div key={f.l}>
              <label className="text-[10px] font-semibold text-muted mb-1 block">{f.l}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted font-mono">Rp</span>
                <input type="text" inputMode="numeric" value={formatNominal(f.v)} onChange={(e) => f.s(e.target.value.replace(/\D/g,""))}
                  className="w-full bg-surface border border-outline py-2 pl-10 pr-3 rounded-lg text-xs font-mono" />
              </div>
            </div>
          ))}
          <HasilZakat label="Zakat Mal" nominal={zakatMal} wajib={wajibMal} nisab={malNisab} total={netMal} />
        </div>
      )}

      {tab === "profesi" && (
        <div className="space-y-3">
          {[{l:"Gaji Pokok Bulanan",v:pGaji,s:setPGaji},{l:"Tunjangan/Bonus",v:pBonus,s:setPBonus}].map((f) => (
            <div key={f.l}>
              <label className="text-[10px] font-semibold text-muted mb-1 block">{f.l}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted font-mono">Rp</span>
                <input type="text" inputMode="numeric" value={formatNominal(f.v)} onChange={(e) => f.s(e.target.value.replace(/\D/g,""))}
                  className="w-full bg-surface border border-outline py-2 pl-10 pr-3 rounded-lg text-xs font-mono" />
              </div>
            </div>
          ))}
          <HasilZakat label="Zakat Profesi" nominal={zakatProf} wajib={wajibProf} nisab={profNisab} total={totalProf} />
        </div>
      )}

      {tab === "infaq" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[25000,50000,100000,250000,500000].map((a) => (
              <button key={a} onClick={() => {setINominal(a);setICustom("");}}
                className={`py-2 border rounded-lg text-xs font-bold font-mono transition-all ${
                  iNominal===a&&!iCustom ? "bg-primary text-white border-primary" : "bg-surface text-muted border-outline"
                }`}>Rp{a.toLocaleString("id-ID")}</button>
            ))}
            <button onClick={() => setINominal(0)}
              className={`py-2 border rounded-lg text-xs font-bold transition-all ${
                iNominal===0 ? "bg-primary text-white border-primary" : "bg-surface text-muted border-outline"
              }`}>Kustom</button>
          </div>
          {iNominal===0&&<div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted font-mono">Rp</span>
            <input type="text" inputMode="numeric" value={formatNominal(iCustom)} onChange={(e)=>setICustom(e.target.value.replace(/\D/g,""))}
              className="w-full bg-surface border border-outline py-2 pl-10 pr-3 rounded-lg text-xs font-mono" /></div>}
          <p className="text-center text-lg font-mono font-bold text-primary-deep">
            Rp {((iNominal===0?parseInt(iCustom):iNominal)||0).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </div>
  );
}

function HasilZakat({ label, nominal, wajib, nisab, total }: { label: string; nominal: number; wajib: boolean; nisab: number; total: number }) {
  return (
    <div className="space-y-2 pt-2 border-t border-outline">
      <div className="flex justify-between text-[10px]"><span className="text-muted">Total Harta</span><span className="font-bold font-mono">Rp{total.toLocaleString("id-ID")}</span></div>
      <div className="flex justify-between text-[10px]"><span className="text-muted">Nisab</span><span className="font-mono text-muted">Rp{nisab.toLocaleString("id-ID")}</span></div>
      <div className={`p-3 rounded-lg flex gap-2 border text-[10px] ${wajib ? "bg-success-subtle border-primary/20" : "bg-accent/10 border-accent/20"}`}>
        {wajib ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
        <span>{wajib ? `Wajib ${label} — 2.5%` : "Belum wajib zakat (di bawah nisab)"}</span>
      </div>
      <p className="text-center font-mono font-black text-xl text-primary-deep">Rp {nominal.toLocaleString("id-ID")}</p>
    </div>
  );
}
