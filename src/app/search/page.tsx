"use client";

import Link from "next/link";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DataPagination } from "@/components/site/DataPagination";

const PAGE_SIZE = 4;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initial);
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);
  const results = useMemo(
    () =>
      q.trim()
        ? PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes(q.toLowerCase()) ||
              p.category.toLowerCase().includes(q.toLowerCase()) ||
              p.brand.toLowerCase().includes(q.toLowerCase()),
          )
        : PRODUCTS,
    [q],
  );

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, currentPage]);

  const rangeStart = results.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = results.length === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, results.length);

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
            placeholder="Search products, brands, categories..."
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
            <Link href="/" className="inline-block mt-4 text-accent text-sm font-medium hover:underline">Browse all products</Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {pageItems.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
            <DataPagination
              hideWhenSinglePage
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalItems={results.length}
              className="mt-10"
            />
          </>
        )}
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <PageHeader title="Search" subtitle="Loading…" crumbs={[{ label: "Home", to: "/" }, { label: "Search" }]} />
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="h-12 max-w-xl animate-pulse rounded-full bg-secondary" />
          </div>
        </Layout>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
