import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";

export function FeaturedGrid() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      {/* Section header */}
      <div className={`flex items-end justify-between mb-6 ${lang === "bn" ? "font-bn" : ""}`}>
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-accent font-semibold">{t("sec.featured.eyebrow")}</p>
          <h2 className="mt-1.5 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">{t("sec.featured.title")}</h2>
        </div>
        <Link
          to="/category/$slug"
          params={{ slug: "deals" }}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          {t("sec.viewall")} <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 snap-x snap-mandatory pb-1">
          {PRODUCTS.slice(0, 5).map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[52vw]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
        {PRODUCTS.slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
