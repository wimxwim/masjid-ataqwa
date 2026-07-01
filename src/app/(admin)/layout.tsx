"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { logout } from "@/lib/actions/auth";
import { AdminErrorBoundary } from "@/components/error-boundary/AdminErrorBoundary";
import { LayoutDashboard, Map, LogOut, Landmark, Users, ArrowLeftFromLine, ShieldAlert, UsersRound, ClipboardList, HandHelping, Briefcase, Rss, Settings, BookOpen, HandCoins, Heart, Library, Package, Receipt, Handshake } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAppContext();
  const pathname = usePathname();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="bg-surface rounded-2xl border border-outline shadow-xl max-w-md w-full p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-display font-bold text-xl text-ink">Akses Terbatas</h2>
          <p className="text-sm text-muted">Silakan login terlebih dahulu untuk mengakses halaman admin.</p>
          <Link href="/login" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors">
            Login Pengelola
          </Link>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/mustahik", label: "Manajemen Mustahik", icon: UsersRound },
    { href: "/admin/gis", label: "GIS Mustahik", icon: Map },
    { href: "/admin/muzzaki", label: "Muzzaki (Wajib Zakat)", icon: HandCoins },
    { href: "/admin/donatur", label: "Donatur Tetap", icon: Heart },
    { href: "/admin/ziswaf", label: "Permohonan Bantuan", icon: HandHelping },
    { href: "/admin/wakaf", label: "Aset Wakaf", icon: Landmark },
    { href: "/admin/santri", label: "Santri KQ", icon: BookOpen },
    { href: "/admin/programs", label: "Program", icon: ClipboardList },
    { href: "/admin/activity", label: "Activity Feed", icon: Rss },
    { href: "/admin/mushafir", label: "Bantuan Mukim/Musafir", icon: HandHelping },
    { href: "/admin/employees", label: "Pegawai", icon: Briefcase },
    { href: "/admin/kajian", label: "Kajian & Silabus", icon: Library },
    { href: "/admin/inventaris", label: "Inventaris", icon: Package },
    { href: "/admin/zakat-payments", label: "Pembayaran Zakat", icon: Receipt },
    { href: "/admin/sahabat-infaq", label: "Sahabat Infaq", icon: Handshake },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-64 bg-ink text-slate-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-900">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white">At-Taqwa</div>
              <p className="text-[9px] text-emerald-400 uppercase tracking-wider">Panel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-900 space-y-1">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-900 transition-all">
            <ArrowLeftFromLine className="w-4 h-4" />
            Kembali ke Portal
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-surface border-b border-outline px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-lg text-ink">
              {pathname === "/admin" ? "Dashboard Pengelola" : pathname === "/admin/mustahik" ? "Manajemen Mustahik" : pathname === "/admin/gis" ? "GIS Mustahik" : pathname === "/admin/muzzaki" ? "Muzzaki (Wajib Zakat)" : pathname === "/admin/donatur" ? "Muzaki & Donatur Tetap" : pathname === "/admin/ziswaf" ? "Permohonan Bantuan ZISWAF" : pathname === "/admin/wakaf" ? "Aset Wakaf (AAOIFI SS-60)" : pathname === "/admin/santri" ? "Santri Kampung Quran" : pathname === "/admin/programs" ? "Program / Kegiatan" : pathname === "/admin/activity" ? "Activity Feed" : pathname === "/admin/mushafir" ? "Bantuan Mukim / Musafir" : pathname === "/admin/employees" ? "Pegawai Masjid" : pathname === "/admin/kajian" ? "Kajian & Silabus" : pathname === "/admin/inventaris" ? "Inventaris" : pathname === "/admin/zakat-payments" ? "Pembayaran Zakat" : pathname === "/admin/sahabat-infaq" ? "Sahabat Infaq" : pathname === "/admin/settings" ? "Pengaturan" : "Dashboard Pengelola"}
            </h1>
            <p className="text-xs text-muted">Masjid Jami&apos; At-Taqwa Ulujami</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted bg-bg px-3 py-1.5 rounded-lg border border-outline">
            <Users className="w-3.5 h-3.5" />
            Admin Aktif
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
