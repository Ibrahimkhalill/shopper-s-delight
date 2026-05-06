import { Flame } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";

export function TrendingSection() {
  const items = PRODUCTS.slice(0, 5).map((p) => ({
    ...p,
    badge: { label: "Trending", tone: "trending" as const },
  }));
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Flame className="size-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-medium">Hot right now</p>
            <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Trending products</h2>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}