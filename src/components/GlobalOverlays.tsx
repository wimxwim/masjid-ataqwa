"use client";

import Link from "next/link";
import { useAppContext } from "@/stores/app-context";
import {
  ShoppingCart, X, Plus, Minus, Trash2, CheckCircle,
  ShoppingBag, ArrowRight,
} from "lucide-react";

export default function GlobalOverlays() {
  const {
    cartItems, cartCount, cartSubtotal,
    handleAddToCart, handleRemoveFromCart, handleUpdateCartQuantity,
    cartOpen, setCartOpen, checkoutStep, setCheckoutStep,
    handleCartCheckout, appToast,
  } = useAppContext();

  return (
    <>
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="shopping-cart-drawer">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setCartOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">

              <div className="px-6 py-5 bg-ink text-white flex justify-between items-center border-b border-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-sm tracking-wide">Keranjang Belanja BUMM</span>
                </div>
                <button onClick={() => setCartOpen(false)} className="text-gray-600 hover:text-white p-1 rounded-md" aria-label="Tutup keranjang">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {checkoutStep === "cart" && (
                  <div className="h-full flex flex-col justify-between">
                    {cartItems.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-xs text-muted font-semibold uppercase tracking-wider">Item dalam keranjang ({cartCount})</p>
                        <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto pr-1">
                          {cartItems.map((item) => (
                            <div key={item.product.id} className="py-4 flex gap-4 items-center">
                              <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-outline" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs sm:text-sm text-ink truncate">{item.product.name}</h4>
                                <p className="text-xs text-muted font-mono mt-0.5">Rp {item.product.price.toLocaleString("id-ID")}</p>
                                <div className="flex items-center justify-between mt-2.5">
                                  <div className="flex items-center gap-2 border border-outline rounded-lg p-0.5 bg-bg">
                                    <button onClick={() => handleRemoveFromCart(item.product)} className="p-1 text-muted hover:bg-white rounded-md"><Minus className="w-3.5 h-3.5" /></button>
                                    <span className="text-xs font-mono font-bold text-ink px-1">{item.quantity}</span>
                                    <button onClick={() => handleAddToCart(item.product)} className="p-1 text-muted hover:bg-white rounded-md"><Plus className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <button onClick={() => handleUpdateCartQuantity(item.product, 0)} className="text-muted hover:text-red-600 p-1 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                        <div className="w-16 h-16 bg-bg text-gray-300 rounded-full flex items-center justify-center border border-dashed border-outline">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display font-bold text-ink">Keranjang Belanja Kosong</h4>
                          <p className="text-xs text-muted max-w-xs mx-auto leading-normal">Silakan pilih produk premium (Kopi, Roti, Madu) di menu BUMM untuk menambahkan ke keranjang.</p>
                        </div>
                        <Link href="/bumm" onClick={() => setCartOpen(false)} className="bg-ink hover:bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors flex items-center gap-1.5">
                          Mulai Berbelanja Produk BUMM <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {checkoutStep === "submitting" && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-ink">Menghubungkan Kasir</h4>
                      <p className="text-xs text-muted">Pesanan Anda sedang dikonfirmasi dan dicatat di pembukuan kas masjid...</p>
                    </div>
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                    <div className="w-16 h-16 bg-success-subtle text-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-2xl text-emerald-950">Transaksi Sukses!</h3>
                      <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">Terima kasih sudah berbelanja produk BUMM At-Taqwa. Transaksi telah dibayar penuh dan disinkronkan ke buku kas transparansi real-time.</p>
                      <div className="bg-success-subtle border border-primary/20 rounded-xl p-3 text-[11px] text-emerald-900 font-semibold leading-relaxed max-w-xs mx-auto">
                        ★ Keuntungan hasil belanja Anda 100% dialokasikan langsung untuk pembiayaan modal UMKM dhuafa Bank Infaq.
                      </div>
                    </div>
                    <button onClick={() => { setCartOpen(false); setCheckoutStep("cart"); }} className="w-full bg-ink hover:bg-primary text-white font-bold py-3 rounded-xl text-xs transition-colors">Selesai & Lanjutkan Belanja</button>
                  </div>
                )}
              </div>

              {checkoutStep === "cart" && cartItems.length > 0 && (
                <div className="px-6 py-6 border-t border-outline bg-bg shrink-0 space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold text-ink">
                    <span>Subtotal Produk:</span>
                    <span className="font-mono font-bold text-lg text-primary">Rp {cartSubtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="p-3 bg-success-subtle rounded-lg border border-primary/20 flex gap-2 text-[10px] text-emerald-900 leading-relaxed font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    <span><b>Penting:</b> Belanja ini bernilai amal ibadah. 100% margin profit dialirkan ke kas beasiswa & dana kebajikan sosial.</span>
                  </div>
                  <button
                    onClick={handleCartCheckout}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Lanjutkan & Bayar Sekarang <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {appToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-ink text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800 max-w-sm">
          <CheckCircle className={`w-5 h-5 shrink-0 ${appToast.type === "success" ? "text-emerald-400" : "text-accent"}`} />
          <div>
            <h4 className="font-bold text-xs">{appToast.title}</h4>
            <p className="text-[11px] text-gray-600 mt-0.5">{appToast.desc}</p>
          </div>
        </div>
      )}
    </>
  );
}
