import { ArrowDownToLine, ArrowRight } from "lucide-react";

interface TransactionRow {
  id: string;
  transaction_date: string;
  donor_name: string | null;
  category: string | null;
  amount: number;
}

interface TransparencyTableProps {
  transactions: TransactionRow[];
}

export function TransparencyTable({ transactions }: TransparencyTableProps) {
  const bulanIni = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // top 5 inflow
  const recentDonations = transactions
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      tanggal: t.transaction_date,
      donatur: t.donor_name ?? "Anonim",
      program: t.category ?? "—",
      jumlah: Number(t.amount),
    }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div className="space-y-2">
          <h2 className="reveal text-3xl font-display font-extrabold text-slate-900 tracking-tighter">
            Laporan Real-time & Akuntabel
          </h2>
          <p className="reveal text-gray-500 max-w-xl text-sm" style={{ transitionDelay: '100ms' }}>
            Kami memegang prinsip keterbukaan menyeluruh. Setiap sen rupiah donasi yang masuk
            tercatat langsung di sistem dan didistribusikan secara transparan.
          </p>
        </div>
        <div className="reveal flex flex-wrap gap-2 shrink-0" style={{ transitionDelay: '200ms' }}>
          <a
            href="/laporan"
            className="glass hover:bg-white/80 text-gray-700 border border-white/30 dark:border-white/10 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:shadow-sm"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-gray-500" />
            Lihat Laporan {bulanIni}
          </a>
          <a
            href="/laporan"
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition-all flex items-center gap-1"
          >
            Lihat Seluruh Mutasi Donasi
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="reveal glass-strong rounded-3xl border border-white/30 dark:border-white/10 shadow-3 overflow-hidden" style={{ transitionDelay: '150ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="glass text-gray-600 text-[10px] font-bold uppercase tracking-wider border-b border-white/20 dark:border-white/10">
                <th className="py-4 px-6 font-semibold tracking-tight">Tanggal</th>
                <th className="py-4 px-6 font-semibold tracking-tight">Donatur</th>
                <th className="py-4 px-6 font-semibold tracking-tight">Program</th>
                <th className="py-4 px-6 font-semibold tracking-tight text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-white/10 text-sm">
              {recentDonations.map((d) => (
                <tr key={d.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                  <td className="py-4 px-6 text-gray-600 font-mono text-xs">{d.tanggal}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{d.donatur}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {d.program}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-emerald-950">
                    Rp {d.jumlah.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
