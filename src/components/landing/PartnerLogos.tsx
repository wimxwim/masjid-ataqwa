import { Handshake, Sprout, Landmark, Heart } from "lucide-react";
import { GlassCard } from "@/components/design-system";

export function PartnerLogos() {
  const partners = [
    { icon: Handshake, label: "BAZNAS" },
    { icon: Sprout, label: "ParagonCorp" },
    { icon: Landmark, label: "Global Wakaf" },
    { icon: Heart, label: "Rumah Zakat" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center space-y-6 reveal">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
        Mitra Strategis & Lembaga Audit
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center justify-items-center">
        {partners.map((partner, i) => (
          <GlassCard
            key={partner.label}
            variant="default"
            hover
            rounded="2xl"
            className="w-full max-w-[200px] justify-center flex items-center gap-2 px-5 py-4 text-slate-800 grayscale hover:grayscale-0 transition-all duration-300"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <partner.icon className="w-5 h-5 text-emerald-700" />
            <span className="font-display font-extrabold tracking-tight text-sm">
              {partner.label}
            </span>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
