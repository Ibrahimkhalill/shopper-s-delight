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
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className={`flex items-end justify-between mb-6 ${lang === "bn" ? "font-bn" : ""}`}>
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-medium">{t(eyebrowKey)}</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{t(titleKey)}</h2>
        </div>
        <Link to="/category/$slug" params={{ slug }} className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")}</Link>
      </div>
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 snap-x snap-mandatory pb-1">
          {items.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[52vw]"><ProductCard p={p} /></div>
          ))}
        </div>
      </div>
      <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
