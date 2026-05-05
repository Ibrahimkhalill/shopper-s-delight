import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Wishlist</h1>
        <p className="text-sm text-muted-foreground mt-1">Your saved items</p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.id} p={{ ...p, liked: true }} />)}
        </div>
      </div>
    </Layout>
  );
}