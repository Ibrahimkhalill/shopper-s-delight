import { Flame } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";

export function TrendingSection() {
  const { t, lang } = useT();
  const items = PRODUCTS.slice(0, 5).map((p) => ({
    ...p,
    badge: { label: t("badge.trending"), tone: "trending" as const },
  }));
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className={`flex items-end justify-between mb-6 ${lang === "bn" ? "font-bn" : ""}`}>
        <div className="flex items-center gap-3">
          <span className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Flame className="size-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-medium">{t("sec.trending.eyebrow")}</p>
            <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">{t("sec.trending.title")}</h2>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}