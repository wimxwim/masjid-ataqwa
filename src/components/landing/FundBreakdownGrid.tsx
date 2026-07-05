import { ArrowRight } from "lucide-react";

const FUND_LABEL: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_maal: "Zakat Maal",
  infaq_terikat: "Infaq Terikat",
  infaq_tidak_terikat: "Infaq Tidak Terikat",
  wakaf_pokok: "Wakaf Pokok",
  wakaf_hasil: "Wakaf Hasil",
  qardhul_hasan: "Qardhul Hasan",
  non_halal: "Non Halal",
};

const FUND_COLOR: Record<string, string> = {
  zakat_fitrah: "bg-emerald-700",
  zakat_maal: "bg-emerald-500",
  infaq_terikat: "bg-amber-600",
  infaq_tidak_terikat: "bg-amber-400",
  wakaf_pokok: "bg-blue-600",
  wakaf_hasil: "bg-blue-400",
  qardhul_hasan: "bg-indigo-500",
  non_halal: "bg-red-500",
};

interface FundBreakdownGridProps {
  fundBreakdown: { fund_type: string; total: number }[];
}

export function FundBreakdownGrid({ fundBreakdown }: FundBreakdownGridProps) {
  if (fundBreakdown.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Struktur Dana Masjid per Jenis</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Pemisahan ketat sesuai fiqih muamalah — setiap akad tercatat terpisah.
            </p>
          </div>
          <a
            href="/laporan"
            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            Lihat Rincian Lengkap
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fundBreakdown.map((item) => {
            const ft = item.fund_type;
            const label = FUND_LABEL[ft] ?? ft;
            const color = FUND_COLOR[ft] ?? "bg-gray-400";
            return (
              <div
                key={ft}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <span className="text-lg font-mono font-bold text-slate-900">
                  Rp {item.total.toLocaleString("id-ID")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
