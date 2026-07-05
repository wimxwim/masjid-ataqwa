import { Coins, Users, CheckCircle, TrendingUp } from "lucide-react";
import Image from "next/image";
import type { HeroStats } from "@/types";
import { FundBreakdownGrid } from "./FundBreakdownGrid";
import { CTAButtons } from "./CTAButtons";

interface HeroSectionProps {
  stats: HeroStats;
  fundBreakdown: { fund_type: string; total: number }[];
  mosqueName: string;
  mosqueConfig: Record<string, unknown> | null;
}

export function HeroSection({ stats, fundBreakdown, mosqueName, mosqueConfig }: HeroSectionProps) {
  const zakatFitrahAmount = (mosqueConfig as { zakat_fitrah_amount?: number } | null)?.zakat_fitrah_amount ?? 45000;

  return (
    <>
      <section className="relative overflow-hidden bg-radial from-emerald-950 via-emerald-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 lg:text-left text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              Platform Masjid Modern Terintegrasi v2.0
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Membangun Peradaban Mulai dari{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                Masjid Jami&apos; At-Taqwa
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/80 max-w-2xl mx-auto lg:mx-0 font-sans leading-relaxed">
              Menghubungkan kebaikan muzakki, mengelola amanah dengan transparansi mutlak, dan memberdayakan mustahik menuju kemandirian ekonomi yang berkelanjutan di lingkungan Ulujami.
            </p>

            <CTAButtons />
          </div>

          <div className="lg:col-span-5 relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-500/20 shadow-emerald-950/50">
            <Image
              src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80"
              alt="At-Taqwa Mosque Dome"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/60 backdrop-blur-xs p-3 rounded-xl border border-slate-700/50">
              <p className="text-white font-semibold text-xs sm:text-sm">{mosqueName}</p>
              <p className="text-slate-300 text-[10px] mt-0.5">Membangun tatanan ekonomi masyarakat madani yang sejahtera.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y-2 lg:divide-y-0 lg:divide-x divide-gray-100">
          <StatCard
            icon={<Coins className="w-6 h-6" />}
            value={stats.totalTerkumpul > 0 ? `Rp ${stats.totalTerkumpul.toLocaleString("id-ID")}` : "—"}
            label="Terkumpul Tahun Ini"
            bgColor="bg-emerald-50"
            iconColor="text-emerald-700"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={stats.totalMustahikKK > 0 ? stats.totalMustahikKK.toLocaleString("id-ID") : "—"}
            label="KK Mustahik Terlayani"
            bgColor="bg-amber-50"
            iconColor="text-amber-700"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            value={stats.terbantuBulanIni > 0 ? stats.terbantuBulanIni.toLocaleString("id-ID") : "—"}
            label="Terbantu Bulan Ini"
            bgColor="bg-emerald-50"
            iconColor="text-emerald-700"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            value={stats.danaTersalurkan > 0 ? `Rp ${stats.danaTersalurkan.toLocaleString("id-ID")}` : "—"}
            label="Dana ZISWAF Tersalurkan"
            bgColor="bg-teal-50"
            iconColor="text-teal-700"
          />
        </div>
      </section>

      <FundBreakdownGrid fundBreakdown={fundBreakdown} />
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
  bgColor,
  iconColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 p-2">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${iconColor} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
