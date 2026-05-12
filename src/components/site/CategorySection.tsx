import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { Link } from "@tanstack/react-router";
import { useT, dict } from "@/lib/i18n";

export function CategorySection({
  titleKey, eyebrowKey, slug, ids,
}: { titleKey: keyof typeof dict; eyebrowKey: keyof typeof dict; slug: string; ids: string[]; }) {
  const { t, lang } = useT();
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof PRODUCTS;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-12 lg:px-6 lg:py-16">
      <div className={`mb-7 flex items-end justify-between gap-4 sm:mb-8 lg:mb-12 ${lang === "bn" ? "font-bn" : ""}`}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent lg:text-[13px]">{t(eyebrowKey)}</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-balance sm:text-2xl md:text-2xl lg:mt-3 lg:text-[2.125rem] lg:tracking-[-0.02em]">{t(titleKey)}</h2>
        </div>
        <Link
          to="/category/$slug"
          params={{ slug }}
          className="shrink-0 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm lg:text-base"
        >
          {t("sec.viewall")}
        </Link>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:hidden">
        <div className="flex snap-x snap-mandatory gap-3 pb-1">
          {items.map((p) => (
            <div key={p.id} className="w-[52vw] shrink-0 snap-start"><ProductCard p={p} /></div>
          ))}
        </div>
      </div>
      <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-5 lg:gap-6">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
