import { useEffect, useState } from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/products";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Price } from "@/components/site/Price";

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);
  return { h, m, s };
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white text-black flex items-center justify-center text-base sm:text-lg font-bold tabular-nums shadow-sm">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-widest text-white/55 sm:text-[11px]">{label}</span>
    </div>
  );
}

function DealCard({ p }: { p: typeof PRODUCTS[0] }) {
  const { addToCart } = useStore();
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group flex flex-col bg-white/10 hover:bg-white/15 rounded-2xl overflow-hidden transition border border-white/10"
    >
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        <img src={p.image} alt={p.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-col gap-1.5 p-3.5 sm:p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/55 sm:text-xs">{p.category}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[0.9375rem]">{p.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col gap-0.5">
            <Price
              amount={p.price}
              size="sm"
              tone="inherit"
              className="text-white sm:!text-base"
              symbolClassName="text-white/70"
            />
            {p.oldPrice && (
              <Price
                amount={p.oldPrice}
                size="xs"
                tone="inherit"
                struck
                className="!text-[10px] text-white/40"
              />
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(p.id, { size: p.sizes[0] }); toast.success("Added to cart"); }}
            className="size-8 rounded-full bg-accent text-white flex items-center justify-center hover:scale-110 transition"
          >
            <ShoppingCart className="size-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export function OffersSection() {
  const target = useState(() => Date.now() + 1000 * 60 * 60 * 12)[0];
  const { h, m, s } = useCountdown(target);
  const deals = PRODUCTS.filter((p) => p.oldPrice).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <div className="rounded-2xl sm:rounded-3xl bg-black text-white overflow-hidden">

        {/* Top banner */}
        <div className="px-5 sm:px-10 pt-6 sm:pt-10 pb-5 sm:pb-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 border-b border-white/10">
          <div className="flex-1">
            <span className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white sm:text-xs">
              Limited time
            </span>
            <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-[2rem] lg:text-4xl">
              Mega deals —<br className="sm:hidden" /> up to <span className="text-accent">50% OFF</span>
            </h2>
            <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-white/65 sm:text-sm">
              Hand-picked offers refreshed daily.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-end gap-2 sm:gap-3 shrink-0">
            <Cell value={h} label="Hrs" />
            <span className="text-xl text-white/30 pb-5">:</span>
            <Cell value={m} label="Min" />
            <span className="text-xl text-white/30 pb-5">:</span>
            <Cell value={s} label="Sec" />
          </div>
        </div>

        {/* Deal cards */}
        <div className="p-4 sm:p-8">
          {/* Mobile: horizontal scroll */}
          <div className="sm:hidden -mx-0 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 snap-x snap-mandatory pb-1">
              {deals.map((p) => (
                <div key={p.id} className="snap-start shrink-0 w-[52vw]">
                  <DealCard p={p} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((p) => <DealCard key={p.id} p={p} />)}
          </div>

          <Link
            to="/category/$slug"
            params={{ slug: "deals" }}
            className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white transition"
          >
            View all deals <ArrowRight className="size-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
