import { Flame, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      {/* Header */}
      <div className={`flex items-end justify-between mb-6 ${lang === "bn" ? "font-bn" : ""}`}>
        <div className="flex items-center gap-3">
          <span className="size-9 sm:size-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
            <Flame className="size-4 sm:size-5" />
          </span>
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-accent font-semibold">{t("sec.trending.eyebrow")}</p>
            <h2 className="mt-0.5 text-2xl sm:text-3xl font-semibold tracking-tight">{t("sec.trending.title")}</h2>
          </div>
        </div>
        <Link
          to="/category/$slug"
          params={{ slug: "gadgets" }}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          {t("sec.viewall")} <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 snap-x snap-mandatory pb-1">
          {items.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[52vw]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
