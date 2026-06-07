import type { HeroSlide, PromoBanner, AdminCategory, AdminColor, AdminBrand, AdminSize } from "./admin-store";
import { DEFAULT_HERO_SLIDES, DEFAULT_PROMO_BANNERS } from "./admin-store";

const KEYS = {
  categories:  "shopbd:admin:categories",
  brands:      "shopbd:admin:brands",
  sizes:       "shopbd:admin:sizes",
  colors:      "shopbd:admin:colors",
  heroSlides:  "shopbd:admin:heroSlides",
  promoBanners:"shopbd:admin:promoBanners",
  featuredIds: "shopbd:admin:featuredIds",
  trendingIds: "shopbd:admin:trendingIds",
};

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getAdminHeroSlides(): HeroSlide[] {
  return readLS<HeroSlide[]>(KEYS.heroSlides, DEFAULT_HERO_SLIDES).filter((s) => s.active).sort((a, b) => a.order - b.order);
}

export function getAdminPromoBanners(): PromoBanner[] {
  return readLS<PromoBanner[]>(KEYS.promoBanners, DEFAULT_PROMO_BANNERS).filter((b) => b.active).sort((a, b) => a.order - b.order);
}

export function getAdminCategories(): AdminCategory[] {
  return readLS<AdminCategory[]>(KEYS.categories, []).filter((c) => c.status === "active");
}

export function getAdminParentCategories(): AdminCategory[] {
  return getAdminCategories().filter((c) => c.parentId === null);
}

export function getAdminSubcategories(parentSlug: string): AdminCategory[] {
  const cats = getAdminCategories();
  const parent = cats.find((c) => c.slug === parentSlug);
  if (!parent) return [];
  return cats.filter((c) => c.parentId === parent.id);
}

export function getAdminFeaturedIds(): string[] {
  return readLS<string[]>(KEYS.featuredIds, []);
}

export function getAdminTrendingIds(): string[] {
  return readLS<string[]>(KEYS.trendingIds, []);
}

export function getAdminSizes(): AdminSize[] {
  return readLS<AdminSize[]>(KEYS.sizes, []).filter((s) => s.status === "active");
}

export function getAdminColors(): AdminColor[] {
  return readLS<AdminColor[]>(KEYS.colors, []).filter((c) => c.status === "active");
}

export function getAdminBrands(): AdminBrand[] {
  return readLS<AdminBrand[]>(KEYS.brands, []).filter((b) => b.status === "active");
}
