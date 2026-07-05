"use client";

import Link from "next/link";
import { useAppContext } from "@/stores/app-context";
import { useDefaultMosque } from "@/lib/queries/public";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Landmark } from "lucide-react";

export default function Footer() {
  const { isLoggedIn } = useAppContext();
  const { data: mosque } = useDefaultMosque();
  const mosqueConfig = (mosque?.config ?? {}) as Record<string, unknown>;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-deep text-slate-300 pt-16 pb-8 border-t-4 border-primary" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white tracking-tight">{mosque?.name ?? "At-Taqwa Ulujami"}</h3>
                <p className="text-[10px] text-emerald-400 font-sans tracking-wider uppercase">Membangun Peradaban</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Platfom digital modern terintegrasi untuk mewujudkan transparansi penuh, pengelolaan ZISWAF yang akuntabel, dan pemberdayaan ekonomi ummat di kelurahan Ulujami.
            </p>
            <div className="flex items-center gap-2 text-xs bg-primary-deep/50 border border-slate-800 p-2.5 rounded-lg text-slate-400">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Jam Operasional Kantor Sekretariat: 08:00 - 17:00 WIB</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white tracking-wide mb-5 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-0.5 after:bg-emerald-500">
              Program Unggulan
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/bank-infaq" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Bank Infaq Qardhul Hasan</Link></li>
              <li><Link href="/bumm" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">BUMM (Kopi & Bakery)</Link></li>
              <li><Link href="/donasi" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Donasi</Link></li>
              <li><Link href="/" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Wakaf Domba Produktif</Link></li>
              <li><Link href="/" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Beasiswa Pendidikan Anak Asuh</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white tracking-wide mb-5 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-0.5 after:bg-emerald-500">
              Akses Cepat
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Halaman Utama</Link></li>
              <li><Link href="/laporan" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Laporan Real-time & Kas</Link></li>
              <li>
                <Link href={isLoggedIn ? "/admin" : "/login"} className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isLoggedIn ? "Dashboard Pengelola" : "Login Pengelola (Admin)"}
                </Link>
              </li>
              <li><a href="#partner" className="hover:text-emerald-400 transition-colors text-slate-400 hover:underline">Kemitraan Masjid</a></li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] bg-primary-deep/50 border border-slate-800 text-emerald-400 px-2.5 py-1 rounded-full">
                  <Heart className="w-3 h-3 fill-emerald-400" /> Powered by Remaja Masjid
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white tracking-wide mb-5 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-0.5 after:bg-emerald-500">
              Hubungi Kami
            </h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                <span>{mosque?.address ?? "Jl. Masjid At-Taqwa No. 1, RT 01/RW 05, Ulujami, Pesanggrahan, Jakarta Selatan, DKI Jakarta 12250"}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono">{(mosqueConfig.phone as string) ?? "021-7359876 / 0812-9988-7766"}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{(mosqueConfig.email as string) ?? "info@masjidattaqwa-ulujami.or.id"}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            <p>© {currentYear} Masjid Jami' At-Taqwa Ulujami. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="mt-1 text-[10px] text-slate-600">Sistem Informasi Pengelolaan Masjid Modern Terintegrasi v2.1.0-prod</p>
          </div>
          <div className="flex gap-4">
            <Link href="/syarat-ketentuan" className="hover:text-slate-400 transition-colors">Syarat Ketentuan</Link>
            <span>•</span>
            <Link href="/kebijakan-privasi" className="hover:text-slate-400 transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
