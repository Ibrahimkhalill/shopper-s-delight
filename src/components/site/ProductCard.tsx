import { Heart, Eye, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  category: string;
  sizes: string[];
  price: number;
  oldPrice?: number;
  image: string;
  badge?: { label: string; tone: "new" | "sale" | "trending" };
  colors: string[];
  liked?: boolean;
};

const toneClass: Record<NonNullable<Product["badge"]>["tone"], string> = {
  new: "text-accent",
  sale: "text-emerald-600",
  trending: "text-blue-600",
};

export function ProductCard({ p }: { p: Product }) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const liked = wishlist.includes(p.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p.id, { size: p.sizes[0] });
    toast.success("Added to cart", { description: p.name });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p.id);
    toast(liked ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast("Quick view");
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-3 hover-lift">

      {/* Badge tab */}
      {p.badge && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 z-10">
          <div className="bg-card border border-border border-t-0 rounded-b-md px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
            <span className={toneClass[p.badge.tone]}>{p.badge.label}</span>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary">
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5">
            -{discount}%
          </span>
        )}

        <Link to="/product/$id" params={{ id: p.id }} className="block size-full">
          <img
            src={p.image}
            alt={p.name}
            width={800}
            height={800}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Hover options — tab-shaped pill with curved side notches */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-50">
          <div className="card-pill flex items-center -mb-1 gap-5 px-2.5 pt-4 pb-0">
            <Link
              to="/product/$id"
              params={{ id: p.id }}
              aria-label="View product"
              className="text-foreground/80 hover:text-foreground hover:scale-110 transition"
            >
              <Eye className="size-4.5" strokeWidth={1.75} />
            </Link>
            <button
              onClick={handleCompare}
              aria-label="Quick view"
              className="text-accent hover:scale-110 transition"
            >
              <ArrowLeftRight className="size-4.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={handleAdd}
              aria-label="Add to cart"
              className="text-accent hover:scale-110 transition"
            >
              <ShoppingCart className="size-4.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{p.category}</span>
        <span className="space-x-1.5">
          {p.sizes.map((s) => <span key={s}>{s}</span>)}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-1.5 text-[15px] font-medium text-foreground leading-snug line-clamp-1">{p.name}</h3>

      {/* Price */}
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[15px] font-semibold">৳{p.price.toLocaleString()}</span>
        {p.oldPrice && (
          <span className="text-xs text-muted-foreground line-through">৳{p.oldPrice.toLocaleString()}</span>
        )}
      </div>

      {/* Footer: colors (left) + heart (right) */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {p.colors.map((c, idx) => (
            <span
              key={idx}
              className="size-4 rounded-full ring-1 ring-border"
              style={{ background: c }}
            />
          ))}
        </div>
        <button
          onClick={handleLike}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={`size-7 flex items-center justify-center rounded-full transition ${liked ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
        >
          <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}
