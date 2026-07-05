"use client";

import { useRouter } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { Heart, ArrowRight } from "lucide-react";

export function CTAButtons() {
  const router = useRouter();
  const { setSelectedZakatTypePreset } = useAppContext();

  const handleDonateClick = () => {
    setSelectedZakatTypePreset("Sedekah");
    router.push("/donasi");
  };

  return (
    <div className="flex flex-col sm:flex-row lg:justify-start justify-center items-center gap-4 pt-2">
      <button
        onClick={handleDonateClick}
        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
      >
        <Heart className="w-5 h-5 fill-slate-950" />
        Donasi Sekarang
      </button>
      <a
        href="#core-programs"
        className="w-full sm:w-auto bg-emerald-800/60 hover:bg-emerald-800/90 active:scale-95 border border-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
      >
        Lihat Program Unggulan
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
