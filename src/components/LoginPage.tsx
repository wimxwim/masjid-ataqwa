"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Lock, AlertCircle, Sparkles, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" id="login-page">
      <div className="bg-surface border border-outline shadow-xl max-w-md w-full overflow-hidden rounded-2xl">
        <div className="bg-ink text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#059669,transparent)] opacity-40" />
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-md shadow-primary/20">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-xl tracking-tight text-white">Sistem Administrasi At-Taqwa</h2>
          <p className="text-xs text-gray-400 mt-1">Gerbang Akses Dashboard &amp; GIS Mustahik</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl flex gap-3 text-xs font-semibold">
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
                  className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-10 pr-4 rounded-xl text-xs sm:text-sm transition-colors text-ink"
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
                  className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-3 pl-10 pr-4 rounded-xl text-xs sm:text-sm transition-colors text-ink"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-deep text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5"
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

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 space-y-2 text-xs">
            <p className="font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Info:
            </p>
            <p className="text-muted font-medium">
              Login menggunakan email dan password yang didaftarkan oleh pengurus masjid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
