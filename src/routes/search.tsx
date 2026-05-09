import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { Search as SearchIcon, X } from "lucide-react";
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
      <PageHeader
        title="Search"
        subtitle={`${results.length} ${results.length === 1 ? "result" : "results"}${q ? ` for "${q}"` : ""}`}
        crumbs={[{ label: "Home", to: "/" }, { label: "Search" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-up">
        {/* Search input */}
        <div className="relative max-w-xl">
          <SearchIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            autoFocus
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories..."
            className="w-full h-12 pl-11 pr-10 rounded-full border bg-secondary text-sm outline-none focus:border-foreground transition"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="mt-16 text-center">
            <SearchIcon className="size-12 mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
            <p className="font-semibold">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different keyword</p>
            <Link to="/" className="inline-block mt-4 text-accent text-sm font-medium hover:underline">Browse all products</Link>
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
