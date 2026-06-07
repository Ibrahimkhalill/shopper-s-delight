"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS as STATIC_PRODUCTS } from "./products";
import type { Product } from "@/components/site/ProductCard";
import type { Order } from "./store";

const ADMIN_PRODUCTS_KEY = "shopbd:admin:products";
const ADMIN_AUTH_KEY = "shopbd:admin:auth";

type AdminCtx = {
  /* auth */
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  /* products */
  products: Product[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  /* orders */
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"]) => void;
};

const AdminCtx = createContext<AdminCtx | null>(null);

function usePersist<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV] as const;
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });

  const [adminProducts, setAdminProducts] = usePersist<Product[] | null>(ADMIN_PRODUCTS_KEY, null);
  const [orders, setOrders] = usePersist<Order[]>("shopbd:orders", []);

  const products: Product[] = adminProducts ?? STATIC_PRODUCTS;

  const adminLogin = useCallback((email: string, password: string): boolean => {
    if (email === "admin@shopbd.com" && password === "admin123") {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      document.cookie = "shopbd-admin-token=true; path=/; max-age=86400";
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    document.cookie = "shopbd-admin-token=; path=/; max-age=0";
    setIsAdminAuthenticated(false);
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}`,
    };
    setAdminProducts((prev) => [...(prev ?? STATIC_PRODUCTS), newProduct]);
  }, [setAdminProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setAdminProducts((prev) => {
      const base = prev ?? STATIC_PRODUCTS;
      return base.map((p) => (p.id === id ? { ...p, ...updates } : p));
    });
  }, [setAdminProducts]);

  const deleteProduct = useCallback((id: string) => {
    setAdminProducts((prev) => {
      const base = prev ?? STATIC_PRODUCTS;
      return base.filter((p) => p.id !== id);
    });
  }, [setAdminProducts]);

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, [setOrders]);

  return (
    <AdminCtx.Provider value={{
      isAdminAuthenticated, adminLogin, adminLogout,
      products, addProduct, updateProduct, deleteProduct,
      orders, updateOrderStatus,
    }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
