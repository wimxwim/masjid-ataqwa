"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useAppContext } from "@/stores/app-context";
import {
  Plus, Minus, Coffee, Cookie, Store, CheckCircle,
  ArrowRight, ShieldCheck, Sparkles, ShoppingBag
} from "lucide-react";
import {
  GlassCard,
  IslamicDivider,
  SectionHeader,
  SectionShell,
} from "@/components/design-system";
import { useDefaultMosque, useBummProducts, useBummStats } from "@/lib/queries/public";

export default function BummPage() {
  const { cartItems, handleAddToCart, handleRemoveFromCart, handleUpdateCartQuantity, handleCartCheckout, appToast } = useAppContext();
  const { data: mosque } = useDefaultMosque();
  const { data: dbProducts = [] } = useBummProducts(mosque?.id ?? "");
  const { data: bummStats } = useBummStats(mosque?.id ?? "");
  const bummProducts: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.product_name,
    category: (p.category as Product["category"]) ?? "retail",
    price: p.price,
    image: p.image_url ?? "",
    description: p.description ?? "",
    isPopular: (p as { is_popular?: boolean | null }).is_popular ?? false,
  }));
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Reseller Form State
  const [resellerName, setResellerName] = useState("");
  const [resellerPhone, setResellerPhone] = useState("");
  const [resellerEmail, setResellerEmail] = useState("");
  const [resellerUnit, setResellerUnit] = useState("coffee");
  const [resellerAddress, setResellerAddress] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = selectedCategory === "all"
    ? bummProducts
    : bummProducts.filter(p => p.category === selectedCategory);

  const handleResellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setResellerName("");
      setResellerPhone("");
      setResellerEmail("");
      setResellerAddress("");
    }, 1500);
  };

  const getCartQuantity = (product: Product) => {
    const item = cartItems.find(c => c.product.id === product.id);
    return item ? item.quantity : 0;
  };

  const inputClass =
    "w-full bg-surface/70 border border-white/50 dark:border-white/10 focus:bg-surface focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 py-2.5 px-3.5 rounded-xl text-sm transition-all shadow-1";

  return (
    <div className="space-y-16 pb-16" id="bumm-page-container">

      {/* 1. Hero Section */}
      <section className="relative glass-dark text-white rounded-[var(--radius-card)] overflow-hidden mx-4 sm:mx-6 lg:mx-8 px-6 py-16 sm:px-12 sm:py-20 shadow-4 reveal">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b_1px,transparent_1px),linear-gradient(to_bottom,#064e3b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Pemberdayaan Ekonomi Syariah
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tighter text-white leading-tight">
            BUMM: Memberdayakan Masjid, <span className="text-accent">Memakmurkan Ummat</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl font-sans leading-relaxed">
            Badan Usaha Milik Masjid (BUMM) At-Taqwa mengelola usaha ritel, kopi, dan kuliner premium secara profesional. 100% dari keuntungan usaha didedikasikan untuk mendanai dakwah, beasiswa anak asuh, dan modal usaha mikro qardhul hasan.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                const catalog = document.getElementById("catalog-section");
                catalog?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-accent hover:bg-accent/90 text-ink font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 hover:shadow-glow-accent active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Belanja Produk BUMM
            </button>
            <button
              onClick={() => {
                const aff = document.getElementById("reseller-section");
                aff?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-sm border border-white/20 transition-all hover:border-white/30 hover:shadow-glow active:scale-95 flex items-center gap-2"
            >
              Mengenal Program Reseller
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Impact Stats */}
      <SectionShell className="!py-0">
        <GlassCard
          variant="default"
          rounded="2xl"
          className="p-6 sm:p-8 reveal"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-primary">
                {bummStats && bummStats.resellerAktif > 0 ? `${bummStats.resellerAktif}+` : "—"}
              </p>
              <p className="text-xs text-muted font-semibold mt-1">Afiliasi & Reseller Aktif</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-primary">
                {bummStats && bummStats.produkTerjual > 0 ? `${bummStats.produkTerjual.toLocaleString("id-ID")}+` : "—"}
              </p>
              <p className="text-xs text-muted font-semibold mt-1">Produk Terjual Tahun Ini</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-primary">
                {bummStats && bummStats.unitUsaha > 0 ? `${bummStats.unitUsaha}+` : "—"}
              </p>
              <p className="text-xs text-muted font-semibold mt-1">Unit Usaha Produktif</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-mono font-bold text-accent">{bummStats?.profitKembali ?? 100}%</p>
              <p className="text-xs text-muted font-semibold mt-1">Profit Kembali ke Umat</p>
            </div>
          </div>
        </GlassCard>
      </SectionShell>

      {/* 3. Products Catalog */}
      <SectionShell id="catalog-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 reveal">
          <SectionHeader
            eyebrow="Produk Unggulan"
            title="Katalog Produk BUMM At-Taqwa"
            description="Belanja produk premium buatan pemuda dan binaan Masjid At-Taqwa Ulujami. Enak, murni, dan penuh berkah."
          />

          <div className="flex flex-wrap gap-1.5 glass p-1 rounded-xl">
            {[
              { id: "all", label: "Semua", icon: Store },
              { id: "coffee", label: "Kopi", icon: Coffee },
              { id: "bakery", label: "Bakery", icon: Cookie },
              { id: "retail", label: "Madu & Souvenir", icon: Sparkles }
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-surface text-primary shadow-glow font-bold"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product, i) => {
            const quantity = getCartQuantity(product);
            return (
              <GlassCard
                key={product.id}
                variant="strong"
                hover
                rounded="2xl"
                className="overflow-hidden flex flex-col justify-between group shadow-2"
                style={{ transitionDelay: `${i * 60}ms` }}
                id={`product-${product.id}`}
              >
                <div>
                  <div className="h-60 bg-bg relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.isPopular && (
                      <div className="absolute top-4 left-4 bg-accent text-ink text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        Terlaris
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                        {product.category === "coffee" ? "KOPI SEPANJANG WAKTU" : product.category === "bakery" ? "TAQWA BAKERY" : "KEMITRAAN RITEL"}
                      </span>
                      <span className="text-primary font-mono font-bold text-sm">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-ink group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-success-subtle rounded-xl p-1 border border-emerald-200 mt-4">
                      <button
                        onClick={() => handleRemoveFromCart(product)}
                        className="p-2 text-primary hover:bg-surface rounded-lg transition-colors"
                        id={`btn-minus-${product.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-bold text-primary-deep text-sm">{quantity}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 text-primary hover:bg-surface rounded-lg transition-colors"
                        id={`btn-plus-${product.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-ink hover:bg-primary-deep text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all mt-4 flex items-center justify-center gap-1.5 shadow-md hover:shadow-glow active:scale-95"
                      id={`btn-add-${product.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah ke Keranjang
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </SectionShell>

      {/* 4. Reseller Section */}
      <SectionShell id="reseller-section" className="bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent dark:via-emerald-950/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center reveal">
          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-glow-accent">
              <Store className="w-6 h-6" />
            </div>

            <SectionHeader
              eyebrow="Program Kemitraan"
              title="Ayo Jadi Reseller Pemuda At-Taqwa!"
              description="Bergabunglah sebagai agen reseller resmi BUMM At-Taqwa Ulujami. Dapatkan harga khusus grosir untuk produk Kopi Sepanjang Waktu dan Taqwa Bakery, sembari ikut menggerakkan ekonomi umat dan menciptakan lapangan pekerjaan mandiri."
              size="large"
            />

            <IslamicDivider className="max-w-xs" />

            <div className="space-y-3">
              {[
                { title: "Bimbingan Bisnis Intensif", desc: "Pelatihan jualan online & offline berkala gratis dari pengurus masjid." },
                { title: "Keuntungan Menarik 15-25%", desc: "Harga kulakan super miring untuk menjamin margin profit reseller tinggi." },
                { title: "Berbelanja Bernilai Ibadah", desc: "Setiap rupiah yang ditransaksikan turut memakmurkan pilar beasiswa dhuafa." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-ink">{item.title}</h4>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <GlassCard variant="strong" rounded="3xl" className="p-6 sm:p-8 relative">
              {formSubmitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-success-subtle text-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary-deep">Pendaftaran Terkirim!</h3>
                  <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                    Terima kasih sudah mendaftar sebagai mitra reseller BUMM At-Taqwa. Admin Sekretariat Ekonomi akan menghubungi nomor WhatsApp Anda dalam waktu 1x24 jam untuk verifikasi & pengiriman brosur panduan.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="bg-primary hover:bg-primary-deep text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md hover:shadow-glow active:scale-95"
                  >
                    Daftarkan Mitra Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResellerSubmit} className="space-y-4">
                  <h3 className="font-display font-bold text-xl text-ink">Formulir Kemitraan Reseller</h3>
                  <p className="text-xs text-muted">Silakan lengkapi data diri Anda di bawah ini secara akurat.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={resellerName}
                        onChange={(e) => setResellerName(e.target.value)}
                        placeholder="Contoh: Ahmad Subarkah"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Nomor WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={resellerPhone}
                        onChange={(e) => setResellerPhone(e.target.value)}
                        placeholder="Contoh: 0812XXXXXXXX"
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={resellerEmail}
                        onChange={(e) => setResellerEmail(e.target.value)}
                        placeholder="Contoh: ahmad@gmail.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">Fokus Produk Minat</label>
                      <select
                        value={resellerUnit}
                        onChange={(e) => setResellerUnit(e.target.value)}
                        className={inputClass}
                      >
                        <option value="coffee">Kopi Sepanjang Waktu (Biji/Susu)</option>
                        <option value="bakery">Taqwa Bakery (Roti/Pastry)</option>
                        <option value="retail">Madu Hutan & Retail Serbaguna</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Alamat Domisili Lengkap (Pesanggrahan / Sekitarnya)</label>
                    <textarea
                      required
                      rows={3}
                      value={resellerAddress}
                      onChange={(e) => setResellerAddress(e.target.value)}
                      placeholder="Tuliskan alamat tinggal lengkap beserta kelurahan & kecamatan..."
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-deep text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-primary/10 hover:shadow-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses Pendaftaran...
                      </>
                    ) : (
                      <>
                        Kirim Formulir Pendaftaran
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
