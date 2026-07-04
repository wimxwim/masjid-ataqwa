"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useAppContext } from "@/stores/app-context";
import { useDefaultMosque, useBummProducts, usePublicData } from "@/lib/queries/public";
import { 
  Plus, Minus, Coffee, Cookie, Store, CheckCircle, 
  ArrowRight, ShieldCheck, Sparkles, ShoppingBag
} from "lucide-react";

export default function BummPage() {
  const { cartItems, handleAddToCart, handleRemoveFromCart, handleUpdateCartQuantity, handleCartCheckout, appToast } = useAppContext();
  const { data: mosque } = useDefaultMosque();
  const { data: dbProducts = [] } = useBummProducts(mosque?.id ?? "");
  const { data: publicData } = usePublicData();
  const bummStats = publicData?.bummStats;
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

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all" 
    ? bummProducts 
    : bummProducts.filter(p => p.category === selectedCategory);

  const handleResellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      // Clear fields
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

  return (
    <div className="space-y-16 pb-16" id="bumm-page-container">
      
      {/* 1. Hero Section */}
      <section className="relative bg-primary-deep text-white rounded-3xl overflow-hidden mx-4 sm:mx-6 lg:mx-8 px-6 py-16 sm:px-12 sm:py-20 shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b_1px,transparent_1px),linear-gradient(to_bottom,#064e3b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Pemberdayaan Ekonomi Syariah
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
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
              className="bg-accent hover:bg-accent text-ink font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Belanja Produk BUMM
            </button>
            <button
              onClick={() => {
                const aff = document.getElementById("reseller-section");
                aff?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-primary-deep/80 hover:bg-primary-deep text-white font-semibold px-6 py-3 rounded-xl text-sm border border-primary transition-all flex items-center gap-2"
            >
              Mengenal Program Reseller
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Impact Stats — data from database */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-bg p-8 rounded-2xl border border-outline text-center">
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
      </section>

      {/* 3. Products Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="catalog-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-extrabold text-ink tracking-tight">
              Katalog Produk Unggulan
            </h2>
            <p className="text-sm text-muted">
              Belanja produk premium buatan pemuda dan binaan Masjid At-Taqwa Ulujami. Enak, murni, dan penuh berkah.
            </p>
          </div>
          
          {/* Categories Tab Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-bg p-1 rounded-xl">
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
                      ? "bg-surface text-primary shadow-xs font-bold" 
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const quantity = getCartQuantity(product);
            return (
              <div 
                key={product.id}
                className="bg-surface rounded-2xl border border-outline shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden flex flex-col justify-between group"
                id={`product-${product.id}`}
              >
                <div>
                  {/* Product Image */}
                  <div className="h-60 bg-bg relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.isPopular && (
                      <div className="absolute top-4 left-4 bg-accent text-ink text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        Terlaris
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
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

                {/* Add To Cart Button Area */}
                <div className="p-6 pt-0 border-t border-gray-50">
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
                      className="w-full bg-ink hover:bg-primary-deep text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all mt-4 flex items-center justify-center gap-1.5"
                      id={`btn-add-${product.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah ke Keranjang
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Reseller Affiliate Section */}
      <section className="bg-bg border-y border-outline py-16" id="reseller-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-ink tracking-tight leading-tight">
              Ayo Jadi Reseller Pemuda At-Taqwa!
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Bergabunglah sebagai agen reseller resmi BUMM At-Taqwa Ulujami. Dapatkan harga khusus grosir untuk produk Kopi Sepanjang Waktu dan Taqwa Bakery, sembari ikut menggerakkan ekonomi umat dan menciptakan lapangan pekerjaan mandiri.
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-ink">Bimbingan Bisnis Intensif</h4>
                  <p className="text-xs text-muted">Pelatihan jualan online & offline berkala gratis dari pengurus masjid.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-ink">Keuntungan Menarik 15-25%</h4>
                  <p className="text-xs text-muted">Harga kulakan super miring untuk menjamin margin profit reseller tinggi.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-ink">Berbelanja Bernilai Ibadah</h4>
                  <p className="text-xs text-muted">Setiap rupiah yang ditransaksikan turut memakmurkan pilar beasiswa dhuafa.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline shadow-lg p-6 sm:p-8 relative">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-success-subtle text-primary rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-primary-deep">Pendaftaran Terkirim!</h3>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Terima kasih sudah mendaftar sebagai mitra reseller BUMM At-Taqwa. Admin Sekretariat Ekonomi akan menghubungi nomor WhatsApp Anda dalam waktu 1x24 jam untuk verifikasi & pengiriman brosur panduan.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="bg-primary hover:bg-primary-deep text-white font-semibold py-2 px-6 rounded-lg text-xs transition-all"
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
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-sm transition-colors"
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
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-sm font-mono transition-colors"
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
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Fokus Produk Minat</label>
                    <select
                      value={resellerUnit}
                      onChange={(e) => setResellerUnit(e.target.value)}
                      className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-sm transition-colors"
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
                    className="w-full bg-bg border border-outline focus:bg-surface focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-deep text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5"
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
          </div>

        </div>
      </section>

    </div>
  );
}
