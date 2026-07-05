"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/stores/app-context";
import { logout } from "@/lib/actions/auth";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Menu, X, ShoppingCart, User, LogOut, ShieldAlert, Heart, Landmark,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const {
    isLoggedIn, cartCount, setCartOpen, setSelectedZakatTypePreset,
  } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Beranda" },
    { href: "/bumm", label: "BUMM (Ekonomi)" },
    { href: "/donasi", label: "Donasi" },
    { href: "/laporan", label: "Laporan Transparansi" },
    { href: "/bank-infaq", label: "Bank Infaq" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/20 shadow-sm dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          <Link href="/" className="flex items-center gap-3 group" id="header-logo">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:bg-primary-dark transition-colors">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg text-emerald-950 tracking-tight">At-Taqwa</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-semibold">Ulujami</span>
              </div>
              <p className="text-[10px] font-sans text-muted tracking-wider uppercase font-medium">Membangun Peradaban</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20"
                      : "text-muted hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-bg p-1.5 rounded-lg border border-outline">
                <Link
                  href="/admin"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-primary text-white shadow-sm"
                      : "text-ink hover:bg-surface"
                  }`}
                  id="admin-dashboard-btn"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Dashboard Admin
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                  aria-label="Logout dari akun admin"
                  id="admin-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary hover:bg-bg px-3 py-2 rounded-lg transition-all"
                id="header-login-btn"
              >
                <User className="w-4 h-4" />
                Masuk
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-all"
              aria-label={`Buka keranjang belanja${cartCount > 0 ? ` (${cartCount} item)` : ""}`}
              id="header-cart-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-mono font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              href="/donasi?type=Sedekah"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
              id="header-donate-btn"
            >
              <Heart className="w-4 h-4 fill-white/20" />
              Donasi Sekarang
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 text-muted hover:text-primary rounded-full"
              aria-label={`Buka keranjang belanja${cartCount > 0 ? ` (${cartCount} item)` : ""}`}
              id="header-cart-mobile-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-muted hover:bg-bg rounded-lg"
              id="header-mobile-toggle"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu-drawer"
              aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 dark:border-white/10 glass px-4 py-4 space-y-2 animate-slide-down" id="mobile-menu-drawer">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted hover:bg-bg hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-outline flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-muted">Tampilan</span>
            <ThemeToggle />
          </div>

          <div className="border-t border-outline space-y-3 pt-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-lg text-ink bg-bg font-semibold text-base"
                >
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Dashboard Admin
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-base"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar Admin
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-lg text-muted hover:bg-bg text-base"
              >
                <User className="w-5 h-5" />
                Login Pengelola
              </Link>
            )}

            <Link
              href="/donasi?type=Sedekah"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium shadow-md shadow-primary/10"
            >
              <Heart className="w-4 h-4" />
              Donasi Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
