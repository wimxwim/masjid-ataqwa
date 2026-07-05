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
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Laporan Real-time & Akuntabel
          </h2>
          <p className="text-gray-500 max-w-xl text-sm">
            Kami memegang prinsip keterbukaan menyeluruh. Setiap sen rupiah donasi yang masuk
            tercatat langsung di sistem dan didistribusikan secara transparan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="/laporan"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-gray-500" />
            Lihat Laporan {bulanIni}
          </a>
          <a
            href="/laporan"
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1"
          >
            Lihat Seluruh Mutasi Donasi
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6 font-semibold">Tanggal</th>
                <th className="py-4 px-6 font-semibold">Donatur</th>
                <th className="py-4 px-6 font-semibold">Program</th>
                <th className="py-4 px-6 font-semibold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentDonations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
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
