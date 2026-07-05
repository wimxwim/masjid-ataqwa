import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface ProgramItem {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string | null;
  config: Record<string, unknown> | null;
}

interface ProgramGridProps {
  programs: ProgramItem[];
}

export function ProgramGrid({ programs }: ProgramGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" id="core-programs">
      <div className="text-center space-y-3 mb-12">
        <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Pilar Kemandirian Umat
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
          Inisiatif strategis terstruktur untuk menyalurkan dana amanat secara tepat sasaran
          demi mencerdaskan, menyejahterakan, dan memberdayakan ekonomi warga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {programs.map((prog) => {
          const cfg = prog.config as {
            target_budget?: number;
            target_beneficiaries?: number;
            image_url?: string;
            badge?: string;
            icon?: string;
            color?: string;
          } | null;

          const imgSrc =
            cfg?.image_url ||
            "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=600&q=80";
          const badgeText = cfg?.badge || prog.category || "";

          const ctaMap: Record<string, { href: string; label: string }> = {
            "bank-infaq": { href: "/bank-infaq", label: "Pelajari Program & Ajukan" },
            "wakaf-domba": { href: "/donasi", label: "Ikut Wakaf Sekarang" },
            beasiswa: { href: "/donasi", label: "Tanggung Anak Asuh" },
            "kampung-quran": { href: "/donasi", label: "Dukung Program" },
          };
          const cta = ctaMap[prog.slug] ?? { href: "#donasi", label: "Dukung Program" };

          return (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-emerald-100 transition-all overflow-hidden flex flex-col group"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <Image
                  src={imgSrc}
                  alt={prog.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {badgeText && (
                  <div className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {badgeText}
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-emerald-950 group-hover:text-emerald-700 transition-colors">
                    {prog.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{prog.description}</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-gray-500">
                      Target:{" "}
                      <b className="text-slate-950 font-mono">
                        {cfg?.target_budget
                          ? `Rp ${cfg.target_budget.toLocaleString("id-ID")}`
                          : "—"}
                      </b>
                    </span>
                  </div>
                  <a
                    href={cta.href}
                    className="block w-full text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold py-3 rounded-xl text-sm transition-all"
                  >
                    {cta.label}
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
