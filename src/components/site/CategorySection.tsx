import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { Link } from "@tanstack/react-router";

export function CategorySection({
  title,
  eyebrow,
  slug,
  ids,
}: {
  title: string;
  eyebrow: string;
  slug: string;
  ids: string[];
}) {
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof PRODUCTS;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-medium">{eyebrow}</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Link to="/category/$slug" params={{ slug }} className="text-sm text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </div>

      {/* Mobile: horizontal scroll. Desktop: grid */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-4 snap-x snap-mandatory pb-2">
          {items.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[70%] xs:w-[55%]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}