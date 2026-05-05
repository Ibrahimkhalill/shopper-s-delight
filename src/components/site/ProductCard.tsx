import { Heart, Eye, Repeat, ShoppingCart } from "lucide-react";

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
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-3 transition hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)]">
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
        <img
          src={p.image}
          alt={p.name}
          width={800}
          height={800}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Hover icon row */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition">
          <button className="size-9 rounded-full bg-card shadow flex items-center justify-center text-muted-foreground hover:text-foreground"><Eye className="size-4" /></button>
          <button className="size-9 rounded-full bg-card shadow flex items-center justify-center text-muted-foreground hover:text-foreground"><Repeat className="size-4" /></button>
          <button className="size-9 rounded-full bg-accent text-accent-foreground shadow flex items-center justify-center"><ShoppingCart className="size-4" /></button>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{p.category}</span>
        <span className="space-x-1.5">
          {p.sizes.map((s) => (<span key={s}>{s}</span>))}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-1.5 text-[15px] font-medium text-foreground leading-snug">{p.name}</h3>

      {/* Price */}
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[15px] font-semibold">৳{p.price}</span>
        {p.oldPrice && (
          <span className="text-xs text-muted-foreground line-through">৳{p.oldPrice}</span>
        )}
      </div>

      {/* Footer: colors + heart */}
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
        <button className={`size-7 flex items-center justify-center rounded-full ${p.liked ? "text-accent" : "text-muted-foreground hover:text-accent"}`}>
          <Heart className={`size-4 ${p.liked ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}