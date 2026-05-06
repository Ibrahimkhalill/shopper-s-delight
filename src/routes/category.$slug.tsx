import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/category/$slug")({ component: CategoryPage });

const PRICE_BANDS = [
  { id: "u1k", t: "Under ৳1,000", test: (n: number) => n < 1000 },
  { id: "1k5k", t: "৳1,000 – ৳5,000", test: (n: number) => n >= 1000 && n < 5000 },
  { id: "5k10k", t: "৳5,000 – ৳10,000", test: (n: number) => n >= 5000 && n < 10000 },
  { id: "o10k", t: "Over ৳10,000", test: (n: number) => n >= 10000 },
];

function CategoryPage() {
  const { slug } = Route.useParams();
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  const [bands, setBands] = useState<string[]>([]);
  const [sort, setSort] = useState<"feat" | "lh" | "hl">("feat");
  const [drawer, setDrawer] = useState(false);

  const list = useMemo(() => {
    let arr = [...PRODUCTS];
    if (bands.length) arr = arr.filter((p) => PRICE_BANDS.filter((b) => bands.includes(b.id)).some((b) => b.test(p.price)));
    if (sort === "lh") arr.sort((a, b) => a.price - b.price);
    if (sort === "hl") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [bands, sort]);

  const toggleBand = (id: string) => setBands((b) => b.includes(id) ? b.filter((x) => x !== id) : [...b, id]);

  const Filters = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Price</p>
          {bands.length > 0 && <button onClick={() => setBands([])} className="text-xs text-accent">Clear</button>}
        </div>
        <ul className="space-y-2.5 text-sm">
          {PRICE_BANDS.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <input id={b.id} type="checkbox" checked={bands.includes(b.id)} onChange={() => toggleBand(b.id)} className="size-4 accent-[oklch(0.62_0.24_25)]" />
              <label htmlFor={b.id} className="cursor-pointer text-muted-foreground">{b.t}</label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-up">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{title}</span>
        </nav>
        <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{list.length} products</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 px-4 rounded-full border bg-card text-sm outline-none focus:border-foreground">
              <option value="feat">Featured</option>
              <option value="lh">Price: low to high</option>
              <option value="hl">Price: high to low</option>
            </select>
            <button onClick={() => setDrawer(true)} className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-full border text-sm">
              <SlidersHorizontal className="size-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 grid grid-cols-12 gap-6">
        <aside className="hidden lg:block col-span-3"><Filters /></aside>
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
          {list.length === 0 && <p className="col-span-3 text-center text-muted-foreground py-16">No products match your filters.</p>}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l p-5 overflow-auto animate-slide-down">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-semibold">Filters</p>
              <button onClick={() => setDrawer(false)}><X className="size-5" /></button>
            </div>
            <Filters />
            <button onClick={() => setDrawer(false)} className="mt-6 w-full h-11 rounded-full bg-foreground text-background text-sm font-medium">Apply</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
