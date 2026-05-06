import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";

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
      <div className="size-12 md:size-14 rounded-lg bg-white text-black flex items-center justify-center text-lg md:text-xl font-semibold tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}

export function OffersSection() {
  const target = useState(() => Date.now() + 1000 * 60 * 60 * 12)[0];
  const { h, m, s } = useCountdown(target);
  const deals = PRODUCTS.filter((p) => p.oldPrice).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-2xl bg-black text-white p-6 md:p-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <span className="inline-block text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-2.5 py-1 rounded-full font-semibold">
              Limited time
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Mega deals — up to <span className="text-accent">50% OFF</span>
            </h2>
            <p className="mt-2 text-sm text-white/70 max-w-md">
              Hand-picked offers refreshed daily. Shop before the timer runs out.
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Cell value={h} label="Hrs" />
            <span className="text-xl text-white/40">:</span>
            <Cell value={m} label="Min" />
            <span className="text-xl text-white/40">:</span>
            <Cell value={s} label="Sec" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((p) => (
            <div key={p.id} className="bg-white text-foreground rounded-2xl">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}