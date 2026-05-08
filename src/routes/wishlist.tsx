import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import { Heart, ShoppingCart, X, Sparkles, ArrowRight, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const { wishlist, resolveProduct, toggleWishlist, addToCart } = useStore();
  const items = wishlist.map((id) => resolveProduct(id)).filter(Boolean) as NonNullable<ReturnType<typeof resolveProduct>>[];
  const total = items.reduce((s, p) => s + (p?.price ?? 0), 0);

  const moveAllToCart = () => {
    items.forEach((p) => p && addToCart(p.id, { size: p.sizes[0] }));
    toast.success(`${items.length} items added to cart`);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center animate-fade-up">
          <div className="relative mx-auto size-28 mb-6">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-2xl" />
            <div className="relative size-28 rounded-full bg-gradient-to-br from-secondary to-background border flex items-center justify-center">
              <Heart className="size-12 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your wishlist is empty</h1>
          <p className="mt-3 text-muted-foreground">Save products you love. We'll keep them safe here, and let you know when prices drop.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-8 h-12 px-7 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition group">
            Discover products
            <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero header */}
      <section className="border-b bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-accent uppercase tracking-wider mb-3">
                <Sparkles className="size-3.5" /> Curated by you
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Wishlist</h1>
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">{items.length}</span> {items.length === 1 ? "item" : "items"} · est. value <span className="font-medium text-foreground tabular-nums">৳{total.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast("Link copied"); }} className="h-11 px-5 rounded-full border border-border hover:border-foreground text-sm font-medium inline-flex items-center gap-2 transition">
                <Share2 className="size-4" /> Share
              </button>
              <button onClick={moveAllToCart} className="h-11 px-5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 inline-flex items-center gap-2 transition">
                <ShoppingCart className="size-4" /> Move all to cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((p, i) => (
            <article
              key={p.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="group relative rounded-2xl border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up"
            >
              <button
                onClick={() => { toggleWishlist(p.id); toast("Removed from wishlist"); }}
                aria-label="Remove"
                className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/90 backdrop-blur border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition"
              >
                <X className="size-4" />
              </button>
              <Link to="/product/$id" params={{ id: p.id }} className="block aspect-[4/5] overflow-hidden bg-secondary">
                <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover group-hover:scale-105 transition duration-700" />
              </Link>
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.category}</p>
                <Link to="/product/$id" params={{ id: p.id }} className="block mt-1 font-medium leading-snug hover:text-accent transition line-clamp-1">{p.name}</Link>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold tabular-nums">৳{p.price.toLocaleString()}</span>
                    {p.oldPrice && <span className="text-xs text-muted-foreground line-through tabular-nums">৳{p.oldPrice.toLocaleString()}</span>}
                  </div>
                  <button
                    onClick={() => { addToCart(p.id, { size: p.sizes[0] }); toast.success("Added to cart", { description: p.name }); }}
                    className="size-9 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-accent transition group/btn"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="size-4 group-hover/btn:scale-110 transition" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
