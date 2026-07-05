"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Lock, AlertCircle, Sparkles, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, IslamicDivider } from "@/components/design-system";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  const inputClass =
    "w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-3 pl-10 pr-4 rounded-xl text-xs sm:text-sm transition-all text-ink";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" id="login-page">
      <GlassCard variant="strong" rounded="3xl" className="max-w-md w-full shadow-4 overflow-hidden reveal" glow>
        <div className="glass-dark text-white px-6 py-8 sm:px-8 sm:py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#059669,transparent)] opacity-40" />
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-glow ring-2 ring-primary/20">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tighter text-white relative z-10">
            Sistem Administrasi At-Taqwa
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1 relative z-10">
            Gerbang Akses Dashboard &amp; GIS Mustahik
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 glass border border-red-200/50 text-red-800 dark:text-red-200 rounded-xl flex gap-3 text-xs font-semibold items-start">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Email Pengelola</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="email@contoh.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Masukkan password..."
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-deep text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-primary/10 hover:shadow-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengautentikasi...
                </>
              ) : (
                <>
                  Masuk Ke Dashboard Admin
                  <Lock className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>

          <IslamicDivider />

          <div className="glass border border-accent/20 rounded-xl p-4 space-y-2 text-xs">
            <p className="font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Info:
            </p>
            <p className="text-muted font-medium">
              Login menggunakan email dan password yang didaftarkan oleh pengurus masjid.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
