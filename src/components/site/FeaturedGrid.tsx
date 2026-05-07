import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";

export function FeaturedGrid() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className={`flex items-end justify-between mb-8 ${lang === "bn" ? "font-bn" : ""}`}>
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-medium">{t("sec.featured.eyebrow")}</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">{t("sec.featured.title")}</h2>
        </div>
        <a href="#" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")}</a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {PRODUCTS.slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}