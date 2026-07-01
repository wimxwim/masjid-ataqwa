"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Product, CartItem } from "@/types";

interface AppToast {
  title: string;
  desc: string;
  type: "success" | "info";
}

interface AppContextType {
  isLoggedIn: boolean;
  user: User | null;

  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartOpen: boolean;
  checkoutStep: "cart" | "submitting" | "success";
  setCartOpen: (open: boolean) => void;
  setCheckoutStep: (step: "cart" | "submitting" | "success") => void;
  handleAddToCart: (product: Product) => void;
  handleRemoveFromCart: (product: Product) => void;
  handleUpdateCartQuantity: (product: Product, quantity: number) => void;
  handleClearCart: () => void;
  handleCartCheckout: () => void;

  appToast: AppToast | null;
  triggerToast: (title: string, desc: string, type?: "success" | "info") => void;
  selectedZakatTypePreset: string;
  setSelectedZakatTypePreset: (preset: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedZakatTypePreset, setSelectedZakatTypePreset] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "submitting" | "success">("cart");
  const [appToast, setAppToast] = useState<AppToast | null>(null);

  const triggerToast = useCallback(
    (title: string, desc: string, type: "success" | "info" = "success") => {
      setAppToast({ title, desc, type });
      setTimeout(() => setAppToast(null), 4000);
    },
    [],
  );

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerToast("Item Ditambahkan", `${product.name} telah masuk ke keranjang belanja BUMM.`);
  }, [triggerToast]);

  const handleRemoveFromCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
      }
      return prev.filter((item) => item.product.id !== product.id);
    });
  }, []);

  const handleUpdateCartQuantity = useCallback(
    (product: Product, quantity: number) => {
      if (quantity <= 0) {
        setCartItems((prev) => prev.filter((item) => item.product.id !== product.id));
      } else {
        setCartItems((prev) =>
          prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity } : item,
          ),
        );
      }
    },
    [],
  );

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleCartCheckout = useCallback(() => {
    setCheckoutStep("submitting");
    setTimeout(() => {
      setCheckoutStep("success");
      handleClearCart();
    }, 1500);
  }, [handleClearCart]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      isLoggedIn, user,
      cartItems, cartCount, cartSubtotal, cartOpen, checkoutStep,
      setCartOpen, setCheckoutStep,
      handleAddToCart, handleRemoveFromCart, handleUpdateCartQuantity,
      handleClearCart, handleCartCheckout,
      appToast, triggerToast,
      selectedZakatTypePreset, setSelectedZakatTypePreset,
    }),
    [
      isLoggedIn, user,
      cartItems, cartCount, cartSubtotal, cartOpen, checkoutStep,
      handleAddToCart, handleRemoveFromCart, handleUpdateCartQuantity,
      handleClearCart, handleCartCheckout,
      appToast, triggerToast,
      selectedZakatTypePreset,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
