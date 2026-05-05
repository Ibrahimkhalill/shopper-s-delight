import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">Home</a>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{title}</span>
        </nav>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{PRODUCTS.length} products</p>
          </div>
          <button className="flex items-center gap-2 h-10 px-4 rounded-full border text-sm">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block col-span-3 space-y-6">
          {[
            { t: "Price", o: ["Under ৳1,000", "৳1,000 – ৳5,000", "৳5,000 – ৳10,000", "Over ৳10,000"] },
            { t: "Brand", o: ["Apple", "Samsung", "Xiaomi", "Local"] },
            { t: "Rating", o: ["4★ & above", "3★ & above"] },
          ].map((g) => (
            <div key={g.t} className="rounded-2xl border p-5">
              <p className="text-sm font-medium mb-3">{g.t}</p>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {g.o.map((o) => (
                  <li key={o} className="flex items-center gap-2">
                    <input type="checkbox" className="size-4 accent-[oklch(0.62_0.24_25)]" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        {/* Grid */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...PRODUCTS, ...PRODUCTS].map((p, i) => <ProductCard key={p.id + i} p={p} />)}
        </div>
      </div>
    </Layout>
  );
}