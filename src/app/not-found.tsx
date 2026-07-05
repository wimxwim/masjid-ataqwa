import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <p className="text-8xl font-black font-mono text-primary/20">404</p>
          <h1 className="font-display font-bold text-2xl text-ink">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-muted">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada. Silakan periksa kembali URL Anda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/donasi"
            className="flex items-center justify-center gap-2 bg-surface hover:bg-gray-50 text-ink font-bold py-3 px-6 rounded-xl text-sm border border-outline transition-all"
          >
            <Search className="w-4 h-4" />
            Cari Program Donasi
          </Link>
        </div>

        <p className="text-xs text-muted">
          Butuh bantuan?{" "}
          <Link href="/" className="text-primary hover:underline font-semibold">
            Hubungi pengurus masjid
          </Link>
        </p>
      </div>
    </div>
  );
}
