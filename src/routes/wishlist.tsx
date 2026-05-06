import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/lib/store";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { wishlist, resolveProduct } = useStore();
  const items = wishlist.map(resolveProduct).filter(Boolean) as ReturnType<typeof resolveProduct>[];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-up">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Wishlist</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
        {items.length === 0 ? (
          <div className="mt-12 text-center rounded-2xl border p-16">
            <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center"><Heart className="size-7 text-muted-foreground" /></div>
            <p className="mt-4 font-semibold">No favourites yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap the heart on products you love.</p>
            <Link to="/" className="inline-block mt-5 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium leading-[2.75rem]">Discover products</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((p) => p && <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
