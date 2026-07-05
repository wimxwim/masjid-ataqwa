import { Handshake, Sprout, Landmark, Heart } from "lucide-react";

export function PartnerLogos() {
  const partners = [
    { icon: Handshake, label: "BAZNAS", color: "text-emerald-700" },
    { icon: Sprout, label: "ParagonCorp", color: "text-emerald-700" },
    { icon: Landmark, label: "Global Wakaf", color: "text-emerald-700" },
    { icon: Heart, label: "Rumah Zakat", color: "text-emerald-700" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center space-y-6" id="partner">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Mitra Strategis & Lembaga Audit
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
        {partners.map((partner) => (
          <div
            key={partner.label}
            className="flex items-center gap-2 border border-dashed border-gray-200 px-6 py-4 rounded-xl w-full max-w-[200px] justify-center bg-white hover:border-emerald-300 hover:shadow-xs transition-all"
          >
            <partner.icon className={`w-5 h-5 ${partner.color}`} />
            <span className="font-display font-extrabold text-slate-800 tracking-tight">
              {partner.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
