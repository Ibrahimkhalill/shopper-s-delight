import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial);
  const results = q.trim()
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
    : PRODUCTS;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-up">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Search</h1>
        <div className="relative mt-5 max-w-xl">
          <SearchIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            autoFocus
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="w-full h-12 pl-11 pr-4 rounded-full border bg-secondary text-sm outline-none focus:border-foreground"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{results.length} {results.length === 1 ? "result" : "results"} {q && <>for "<span className="text-foreground font-medium">{q}</span>"</>}</p>
        {results.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No products match your search.</p>
            <Link to="/" className="inline-block mt-4 text-accent font-medium">Browse all →</Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {results.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}