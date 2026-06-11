"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS as STATIC_PRODUCTS } from "./products";
import type { Product } from "@/components/site/ProductCard";
import type { Order } from "./store";

// ─── Storage keys ──────────────────────────────────────────────────────────────
export const ADMIN_KEYS = {
  products:    "shopbd:admin:products",
  auth:        "shopbd:admin:auth",
  orders:      "shopbd:orders",
  categories:  "shopbd:admin:categories",
  brands:      "shopbd:admin:brands",
  sizes:       "shopbd:admin:sizes",
  colors:      "shopbd:admin:colors",
  badges:      "shopbd:admin:badges",
  offers:      "shopbd:admin:offers",
  heroSlides:  "shopbd:admin:heroSlides",
  promoBanners:"shopbd:admin:promoBanners",
  featuredIds: "shopbd:admin:featuredIds",
  trendingIds: "shopbd:admin:trendingIds",
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string;
  status: "active" | "inactive";
  createdAt: number;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  status: "active" | "inactive";
  createdAt: number;
};

export type AdminSize = {
  id: string;
  name: string;
  type: "clothing" | "footwear" | "general";
  status: "active" | "inactive";
};

export type AdminColor = {
  id: string;
  name: string;
  hex: string;
  status: "active" | "inactive";
};

export type AdminBadge = {
  id: string;
  label: string;
  tone: "new" | "sale" | "trending";
  status: "active" | "inactive";
};

export type Offer = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  status: "active" | "inactive";
  createdAt: number;
};

export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  slug: string;
  image: string;
  gradient: string;
  active: boolean;
  order: number;
};

export type PromoBanner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  bg: string;
  active: boolean;
  order: number;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
};

export type AdminProduct = Product & {
  description?: string;
  variants?: ProductVariant[];
  gallery?: string[];
  colorImages?: string[];
  subcategory?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  stock?: number;
  status?: "active" | "draft";
  categoryId?: string;
  brandId?: string;
  tags?: string[];
};

/**
 * Total purchasable quantity for a product: sum of variant stock when
 * variants exist, else the product-level stock. `null` = not tracked.
 */
export function availableStock(p: AdminProduct): number | null {
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  }
  if (typeof p.stock === "number") return p.stock;
  return null;
}

// ─── Default seed data ─────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: AdminCategory[] = [
  { id: "cat-1", name: "Fashion",    slug: "fashion",    parentId: null, image: "", status: "active", createdAt: Date.now() - 86400000 * 30 },
  { id: "cat-2", name: "Gadgets",    slug: "gadgets",    parentId: null, image: "", status: "active", createdAt: Date.now() - 86400000 * 29 },
  { id: "cat-3", name: "Home & Living", slug: "home",   parentId: null, image: "", status: "active", createdAt: Date.now() - 86400000 * 28 },
  { id: "cat-4", name: "Beauty",     slug: "beauty",     parentId: null, image: "", status: "active", createdAt: Date.now() - 86400000 * 27 },
  { id: "cat-5", name: "Grocery",    slug: "grocery",    parentId: null, image: "", status: "active", createdAt: Date.now() - 86400000 * 26 },
  { id: "cat-6", name: "Deals",      slug: "deals",      parentId: null, image: "", status: "active", createdAt: Date.now() - 86400000 * 25 },
  { id: "cat-7", name: "T-Shirts",   slug: "t-shirts",   parentId: "cat-1", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 20 },
  { id: "cat-8", name: "Shirts",     slug: "shirts",     parentId: "cat-1", image: "https://images.unsplash.com/photo-1602810316693-3667c854239a?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 19 },
  { id: "cat-9", name: "Outerwear",  slug: "outerwear",  parentId: "cat-1", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 18 },
  { id: "cat-10", name: "Shoes",     slug: "shoes",      parentId: "cat-1", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 17 },
  { id: "cat-11", name: "Smartphones", slug: "smartphones", parentId: "cat-2", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 16 },
  { id: "cat-12", name: "Laptops",   slug: "laptops",    parentId: "cat-2", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 15 },
  { id: "cat-13", name: "Audio",     slug: "audio",      parentId: "cat-2", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 14 },
  { id: "cat-14", name: "Skincare",  slug: "skincare",   parentId: "cat-4", image: "https://images.unsplash.com/photo-1591130901921-3f0652bb3915?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 13 },
  { id: "cat-15", name: "Makeup",    slug: "makeup",     parentId: "cat-4", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&h=300&q=80", status: "active", createdAt: Date.now() - 86400000 * 12 },
];

const DEFAULT_BRANDS: AdminBrand[] = [
  { id: "brand-1", name: "UrbanFit",     slug: "urbanfit",    image: "", description: "Urban fashion brand", status: "active", createdAt: Date.now() - 86400000 * 30 },
  { id: "brand-2", name: "TechZone",     slug: "techzone",    image: "", description: "Tech accessories",    status: "active", createdAt: Date.now() - 86400000 * 29 },
  { id: "brand-3", name: "HomeComfort",  slug: "homecomfort", image: "", description: "Home products",       status: "active", createdAt: Date.now() - 86400000 * 28 },
  { id: "brand-4", name: "GlowUp",       slug: "glowup",      image: "", description: "Beauty & skincare",   status: "active", createdAt: Date.now() - 86400000 * 27 },
];

const DEFAULT_SIZES: AdminSize[] = [
  { id: "sz-1",  name: "XS",     type: "clothing", status: "active" },
  { id: "sz-2",  name: "S",      type: "clothing", status: "active" },
  { id: "sz-3",  name: "M",      type: "clothing", status: "active" },
  { id: "sz-4",  name: "L",      type: "clothing", status: "active" },
  { id: "sz-5",  name: "XL",     type: "clothing", status: "active" },
  { id: "sz-6",  name: "XXL",    type: "clothing", status: "active" },
  { id: "sz-7",  name: "39",     type: "footwear", status: "active" },
  { id: "sz-8",  name: "40",     type: "footwear", status: "active" },
  { id: "sz-9",  name: "41",     type: "footwear", status: "active" },
  { id: "sz-10", name: "42",     type: "footwear", status: "active" },
  { id: "sz-11", name: "43",     type: "footwear", status: "active" },
  { id: "sz-12", name: "1 size", type: "general",  status: "active" },
];

const DEFAULT_COLORS: AdminColor[] = [
  { id: "col-1", name: "Black",  hex: "#000000", status: "active" },
  { id: "col-2", name: "White",  hex: "#ffffff", status: "active" },
  { id: "col-3", name: "Red",    hex: "#ef4444", status: "active" },
  { id: "col-4", name: "Blue",   hex: "#3b82f6", status: "active" },
  { id: "col-5", name: "Green",  hex: "#22c55e", status: "active" },
  { id: "col-6", name: "Yellow", hex: "#eab308", status: "active" },
  { id: "col-7", name: "Navy",   hex: "#1e3a5f", status: "active" },
  { id: "col-8", name: "Pink",   hex: "#ec4899", status: "active" },
];

const DEFAULT_BADGES: AdminBadge[] = [
  { id: "badge-1", label: "NEW",      tone: "new",      status: "active" },
  { id: "badge-2", label: "SALE",     tone: "sale",     status: "active" },
  { id: "badge-3", label: "TRENDING", tone: "trending", status: "active" },
];

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1", badge: "22% OFF",
    title: "Latest Fashion Trends",
    subtitle: "Discover the newest arrivals in fashion — exclusive styles for every season.",
    cta: "Shop Fashion", slug: "fashion",
    image: "", gradient: "from-zinc-900 via-black to-black",
    active: true, order: 0,
  },
  {
    id: "slide-2", badge: "Free Delivery",
    title: "Top Gadgets & Electronics",
    subtitle: "Upgrade your tech — smartphones, earbuds, smartwatches and more at great prices.",
    cta: "Shop Gadgets", slug: "gadgets",
    image: "", gradient: "from-neutral-900 via-black to-black",
    active: true, order: 1,
  },
  {
    id: "slide-3", badge: "Premium",
    title: "Beauty & Personal Care",
    subtitle: "Skincare, makeup, and fragrances curated just for you.",
    cta: "Shop Beauty", slug: "beauty",
    image: "", gradient: "from-stone-900 via-black to-black",
    active: true, order: 2,
  },
];

export const DEFAULT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: "promo-1", eyebrow: "Premium",
    title: "Skincare & Beauty\nEssentials",
    subtitle: "Get Extra 30% Off",
    image: "https://images.unsplash.com/photo-1591130901921-3f0652bb3915?auto=format&fit=crop&w=480&h=480&q=80",
    href: "/category/beauty", bg: "#e8f5f0", active: true, order: 0,
  },
  {
    id: "promo-2", eyebrow: "Premium",
    title: "Healthy Food Habits\nfor Everyday Life",
    subtitle: "Get Extra 50% Off",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=480&h=480&q=80",
    href: "/category/grocery", bg: "#fff9e6", active: true, order: 1,
  },
  {
    id: "promo-3", eyebrow: "New Arrival",
    title: "Smart Gadgets\nfor Modern Life",
    subtitle: "Up to 40% Off",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=480&h=480&q=80",
    href: "/category/gadgets", bg: "#eef2ff", active: true, order: 2,
  },
  {
    id: "promo-4", eyebrow: "Trending",
    title: "Fashion Made\nfor You",
    subtitle: "New styles every week",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=480&h=480&q=80",
    href: "/category/fashion", bg: "#fdf2f0", active: true, order: 3,
  },
];

// ─── Context type ─────────────────────────────────────────────────────────────
type AdminCtx = {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  products: AdminProduct[];
  addProduct: (p: Omit<AdminProduct, "id">) => void;
  updateProduct: (id: string, p: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  categories: AdminCategory[];
  addCategory: (c: Omit<AdminCategory, "id" | "createdAt">) => void;
  updateCategory: (id: string, c: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;
  brands: AdminBrand[];
  addBrand: (b: Omit<AdminBrand, "id" | "createdAt">) => void;
  updateBrand: (id: string, b: Partial<AdminBrand>) => void;
  deleteBrand: (id: string) => void;
  sizes: AdminSize[];
  addSize: (s: Omit<AdminSize, "id">) => void;
  updateSize: (id: string, s: Partial<AdminSize>) => void;
  deleteSize: (id: string) => void;
  colors: AdminColor[];
  addColor: (c: Omit<AdminColor, "id">) => void;
  updateColor: (id: string, c: Partial<AdminColor>) => void;
  deleteColor: (id: string) => void;
  badges: AdminBadge[];
  addBadge: (b: Omit<AdminBadge, "id">) => void;
  updateBadge: (id: string, b: Partial<AdminBadge>) => void;
  deleteBadge: (id: string) => void;
  offers: Offer[];
  addOffer: (o: Omit<Offer, "id" | "usedCount" | "createdAt">) => void;
  updateOffer: (id: string, o: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  heroSlides: HeroSlide[];
  addHeroSlide: (s: Omit<HeroSlide, "id">) => void;
  updateHeroSlide: (id: string, s: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  promoBanners: PromoBanner[];
  addPromoBanner: (b: Omit<PromoBanner, "id">) => void;
  updatePromoBanner: (id: string, b: Partial<PromoBanner>) => void;
  deletePromoBanner: (id: string) => void;
  featuredIds: string[];
  setFeaturedIds: (ids: string[]) => void;
  trendingIds: string[];
  setTrendingIds: (ids: string[]) => void;
};

const AdminCtx = createContext<AdminCtx | null>(null);

// ─── Persist hook ─────────────────────────────────────────────────────────────
function usePersist<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV] as const;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ADMIN_KEYS.auth) === "true";
  });

  const [adminProducts, setAdminProducts] = usePersist<AdminProduct[] | null>(ADMIN_KEYS.products, null);
  const [orders, setOrders]               = usePersist<Order[]>(ADMIN_KEYS.orders, []);
  const [categories, setCategories]       = usePersist<AdminCategory[]>(ADMIN_KEYS.categories, DEFAULT_CATEGORIES);
  const [brands, setBrands]               = usePersist<AdminBrand[]>(ADMIN_KEYS.brands, DEFAULT_BRANDS);
  const [sizes, setSizes]                 = usePersist<AdminSize[]>(ADMIN_KEYS.sizes, DEFAULT_SIZES);
  const [colors, setColors]               = usePersist<AdminColor[]>(ADMIN_KEYS.colors, DEFAULT_COLORS);
  const [badges, setBadges]               = usePersist<AdminBadge[]>(ADMIN_KEYS.badges, DEFAULT_BADGES);
  const [offers, setOffers]               = usePersist<Offer[]>(ADMIN_KEYS.offers, []);
  const [heroSlides, setHeroSlides]       = usePersist<HeroSlide[]>(ADMIN_KEYS.heroSlides, DEFAULT_HERO_SLIDES);
  const [promoBanners, setPromoBanners]   = usePersist<PromoBanner[]>(ADMIN_KEYS.promoBanners, DEFAULT_PROMO_BANNERS);
  const [featuredIds, setFeaturedIdsState] = usePersist<string[]>(ADMIN_KEYS.featuredIds, []);
  const [trendingIds, setTrendingIdsState] = usePersist<string[]>(ADMIN_KEYS.trendingIds, []);

  const products: AdminProduct[] = (adminProducts ?? STATIC_PRODUCTS) as AdminProduct[];

  const adminLogin = useCallback((email: string, password: string): boolean => {
    if (email === "admin@shopbd.com" && password === "admin123") {
      localStorage.setItem(ADMIN_KEYS.auth, "true");
      document.cookie = "shopbd-admin-token=true; path=/; max-age=86400";
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEYS.auth);
    document.cookie = "shopbd-admin-token=; path=/; max-age=0";
    setIsAdminAuthenticated(false);
  }, []);

  // Products
  const addProduct    = useCallback((p: Omit<AdminProduct, "id">) => setAdminProducts((prev) => [...(prev ?? STATIC_PRODUCTS as AdminProduct[]), { ...p, id: `prod-${Date.now()}` }]), [setAdminProducts]);
  const updateProduct = useCallback((id: string, u: Partial<AdminProduct>) => setAdminProducts((prev) => (prev ?? STATIC_PRODUCTS as AdminProduct[]).map((p) => p.id === id ? { ...p, ...u } : p)), [setAdminProducts]);
  const deleteProduct = useCallback((id: string) => setAdminProducts((prev) => (prev ?? STATIC_PRODUCTS as AdminProduct[]).filter((p) => p.id !== id)), [setAdminProducts]);

  // Orders
  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o)), [setOrders]);

  // Categories
  const addCategory    = useCallback((c: Omit<AdminCategory, "id" | "createdAt">) => setCategories((p) => [...p, { ...c, id: `cat-${Date.now()}`, createdAt: Date.now() }]), [setCategories]);
  const updateCategory = useCallback((id: string, c: Partial<AdminCategory>) => setCategories((p) => p.map((x) => x.id === id ? { ...x, ...c } : x)), [setCategories]);
  const deleteCategory = useCallback((id: string) => setCategories((p) => p.filter((x) => x.id !== id)), [setCategories]);

  // Brands
  const addBrand    = useCallback((b: Omit<AdminBrand, "id" | "createdAt">) => setBrands((p) => [...p, { ...b, id: `brand-${Date.now()}`, createdAt: Date.now() }]), [setBrands]);
  const updateBrand = useCallback((id: string, b: Partial<AdminBrand>) => setBrands((p) => p.map((x) => x.id === id ? { ...x, ...b } : x)), [setBrands]);
  const deleteBrand = useCallback((id: string) => setBrands((p) => p.filter((x) => x.id !== id)), [setBrands]);

  // Sizes
  const addSize    = useCallback((s: Omit<AdminSize, "id">) => setSizes((p) => [...p, { ...s, id: `sz-${Date.now()}` }]), [setSizes]);
  const updateSize = useCallback((id: string, s: Partial<AdminSize>) => setSizes((p) => p.map((x) => x.id === id ? { ...x, ...s } : x)), [setSizes]);
  const deleteSize = useCallback((id: string) => setSizes((p) => p.filter((x) => x.id !== id)), [setSizes]);

  // Colors
  const addColor    = useCallback((c: Omit<AdminColor, "id">) => setColors((p) => [...p, { ...c, id: `col-${Date.now()}` }]), [setColors]);
  const updateColor = useCallback((id: string, c: Partial<AdminColor>) => setColors((p) => p.map((x) => x.id === id ? { ...x, ...c } : x)), [setColors]);
  const deleteColor = useCallback((id: string) => setColors((p) => p.filter((x) => x.id !== id)), [setColors]);

  // Badges
  const addBadge    = useCallback((b: Omit<AdminBadge, "id">) => setBadges((p) => [...p, { ...b, id: `badge-${Date.now()}` }]), [setBadges]);
  const updateBadge = useCallback((id: string, b: Partial<AdminBadge>) => setBadges((p) => p.map((x) => x.id === id ? { ...x, ...b } : x)), [setBadges]);
  const deleteBadge = useCallback((id: string) => setBadges((p) => p.filter((x) => x.id !== id)), [setBadges]);

  // Offers
  const addOffer    = useCallback((o: Omit<Offer, "id" | "usedCount" | "createdAt">) => setOffers((p) => [...p, { ...o, id: `offer-${Date.now()}`, usedCount: 0, createdAt: Date.now() }]), [setOffers]);
  const updateOffer = useCallback((id: string, o: Partial<Offer>) => setOffers((p) => p.map((x) => x.id === id ? { ...x, ...o } : x)), [setOffers]);
  const deleteOffer = useCallback((id: string) => setOffers((p) => p.filter((x) => x.id !== id)), [setOffers]);

  // Hero slides
  const addHeroSlide    = useCallback((s: Omit<HeroSlide, "id">) => setHeroSlides((p) => [...p, { ...s, id: `slide-${Date.now()}` }]), [setHeroSlides]);
  const updateHeroSlide = useCallback((id: string, s: Partial<HeroSlide>) => setHeroSlides((p) => p.map((x) => x.id === id ? { ...x, ...s } : x)), [setHeroSlides]);
  const deleteHeroSlide = useCallback((id: string) => setHeroSlides((p) => p.filter((x) => x.id !== id)), [setHeroSlides]);

  // Promo banners
  const addPromoBanner    = useCallback((b: Omit<PromoBanner, "id">) => setPromoBanners((p) => [...p, { ...b, id: `promo-${Date.now()}` }]), [setPromoBanners]);
  const updatePromoBanner = useCallback((id: string, b: Partial<PromoBanner>) => setPromoBanners((p) => p.map((x) => x.id === id ? { ...x, ...b } : x)), [setPromoBanners]);
  const deletePromoBanner = useCallback((id: string) => setPromoBanners((p) => p.filter((x) => x.id !== id)), [setPromoBanners]);

  const setFeaturedIds = useCallback((ids: string[]) => setFeaturedIdsState(ids), [setFeaturedIdsState]);
  const setTrendingIds = useCallback((ids: string[]) => setTrendingIdsState(ids), [setTrendingIdsState]);

  return (
    <AdminCtx.Provider value={{
      isAdminAuthenticated, adminLogin, adminLogout,
      products, addProduct, updateProduct, deleteProduct,
      orders, updateOrderStatus,
      categories, addCategory, updateCategory, deleteCategory,
      brands, addBrand, updateBrand, deleteBrand,
      sizes, addSize, updateSize, deleteSize,
      colors, addColor, updateColor, deleteColor,
      badges, addBadge, updateBadge, deleteBadge,
      offers, addOffer, updateOffer, deleteOffer,
      heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide,
      promoBanners, addPromoBanner, updatePromoBanner, deletePromoBanner,
      featuredIds, setFeaturedIds,
      trendingIds, setTrendingIds,
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
