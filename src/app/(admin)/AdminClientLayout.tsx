"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { logout } from "@/lib/actions/auth";
import { AdminErrorBoundary } from "@/components/error-boundary/AdminErrorBoundary";
import {
  LayoutDashboard, Map, LogOut, Landmark, Users, ArrowLeftFromLine,
  ShieldAlert, UsersRound, ClipboardList, HandHelping, Briefcase,
  Settings, BookOpen, HandCoins, Heart, Handshake, Calendar,
  Sparkles,
} from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: string[];
}

interface SidebarGroup {
  title: string;
  description: string;
  items: SidebarItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "Dashboard",
    description: "Ringkasan tata kelola",
    items: [
      { href: "/admin", label: "Overview Masjid", icon: LayoutDashboard, roles: ["*"] },
    ],
  },
  {
    title: "Kesekretariatan",
    description: "Idarah — administrasi & dokumen",
    items: [
      { href: "/admin/employees", label: "Data Pengurus", icon: UsersRound, roles: ["ketua", "sekretaris", "*"] },
      { href: "/admin/activity", label: "Aktivitas & Arsip", icon: ClipboardList, roles: ["ketua", "sekretaris", "*"] },
    ],
  },
  {
    title: "Keuangan",
    description: "Buku kas & laporan dana",
    items: [
      { href: "/admin?tab=inflow", label: "Catat Pemasukan", icon: HandCoins, roles: ["ketua", "bendahara", "*"] },
      { href: "/admin?tab=outflow", label: "Catat Pengeluaran", icon: HandCoins, roles: ["ketua", "bendahara", "*"] },
      { href: "/admin?tab=masterplan", label: "RAPBM & Perencanaan", icon: Sparkles, roles: ["ketua", "bendahara", "*"] },
      { href: "/admin/muzzaki", label: "Data Muzzaki", icon: Users, roles: ["bendahara", "sosial", "*"] },
      { href: "/admin/donatur", label: "Donatur Tetap", icon: Heart, roles: ["bendahara", "sosial", "*"] },
      { href: "/admin/sahabat-infaq", label: "Sahabat Infaq", icon: Handshake, roles: ["bendahara", "*"] },
      { href: "/admin/zakat-payments", label: "Pembayaran Zakat", icon: HandCoins, roles: ["bendahara", "*"] },
    ],
  },
  {
    title: "Dakwah & Pendidikan",
    description: "Imarah — ibadah, kajian & TPQ",
    items: [
      { href: "/admin?tab=schedules", label: "Jadwal Imam & Khatib", icon: Calendar, roles: ["dakwah", "*"] },
      { href: "/admin/kajian", label: "Program Kajian", icon: BookOpen, roles: ["dakwah", "*"] },
      { href: "/admin/santri", label: "Santri KQ", icon: UsersRound, roles: ["dakwah", "*"] },
      { href: "/admin/programs", label: "Program & Kegiatan", icon: ClipboardList, roles: ["dakwah", "*"] },
    ],
  },
  {
    title: "Sosial & Data Umat",
    description: "Mustahik, GIS & penyaluran bantuan",
    items: [
      { href: "/admin/mustahik", label: "Data Mustahik", icon: UsersRound, roles: ["sosial", "*"] },
      { href: "/admin/gis", label: "Peta Mustahik (GIS)", icon: Map, roles: ["sosial", "*"] },
      { href: "/admin/ziswaf", label: "Permohonan Bantuan", icon: HandHelping, roles: ["sosial", "ketua", "*"] },
      { href: "/admin/mushafir", label: "Bantuan Musafir", icon: HandHelping, roles: ["sosial", "*"] },
    ],
  },
  {
    title: "Aset & Infrastruktur",
    description: "Ri'ayah — inventaris & perawatan",
    items: [
      { href: "/admin/inventaris", label: "Inventaris Barang", icon: Briefcase, roles: ["sarpras", "*"] },
      { href: "/admin/wakaf", label: "Aset Wakaf", icon: Landmark, roles: ["sarpras", "*"] },
    ],
  },
  {
    title: "Pengaturan",
    description: "Profil masjid & pengguna",
    items: [
      { href: "/admin/settings", label: "Pengaturan", icon: Settings, roles: ["ketua", "sekretaris"] },
    ],
  },
];

const HEADER_TITLES: Record<string, string> = {
  "/admin": "Dashboard Masjid",
  "/admin/mustahik": "Data Mustahik",
  "/admin/gis": "Peta Mustahik (GIS)",
  "/admin/muzzaki": "Data Muzzaki",
  "/admin/donatur": "Donatur Tetap",
  "/admin/ziswaf": "Permohonan Bantuan",
  "/admin/wakaf": "Aset Wakaf",
  "/admin/santri": "Santri KQ",
  "/admin/programs": "Program & Kegiatan",
  "/admin/activity": "Aktivitas & Arsip",
  "/admin/mushafir": "Bantuan Musafir",
  "/admin/employees": "Data Pengurus",
  "/admin/sahabat-infaq": "Sahabat Infaq",
  "/admin/settings": "Pengaturan Masjid",
  "/admin/kajian": "Program Kajian",
  "/admin/inventaris": "Inventaris Barang",
  "/admin/zakat-payments": "Pembayaran Zakat",
};

export default function AdminClientLayout({
  children,
  userRole,
}: { children: React.ReactNode; userRole: string }) {
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

  const canSee = (roles: string[]) => roles.includes("*") || roles.includes(userRole);

  const filteredGroups = SIDEBAR_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canSee(item.roles)),
    }))
    .filter((group) => group.items.length > 0);

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
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider">Panel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin">
          {filteredGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 pb-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  {group.title}
                </p>
                <p className="text-[9px] text-slate-700 mt-0.5">{group.description}</p>
              </div>
              <div className="space-y-0.5 mt-1">
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "?");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-900 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          >
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
              {HEADER_TITLES[pathname] ?? "Dashboard Masjid"}
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
