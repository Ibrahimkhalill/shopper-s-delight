import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";

export function FeaturedGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Best of the week</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">Featured products</h2>
        </div>
        <a href="#" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground">View all →</a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {PRODUCTS.slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}