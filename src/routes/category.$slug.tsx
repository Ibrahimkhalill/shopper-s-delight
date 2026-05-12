import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/lib/products";
import {
  ChevronRight, SlidersHorizontal, X, Search,
  ArrowUpDown, LayoutGrid, List, ChevronDown, Check,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Price } from "@/components/site/Price";

export const Route = createFileRoute("/category/$slug")({ component: CategoryPage });

const PRICE_BANDS = [
  { id: "u1k",   label: "Under ৳1,000",       test: (n: number) => n < 1000 },
  { id: "1k5k",  label: "৳1,000 – ৳5,000",    test: (n: number) => n >= 1000 && n < 5000 },
  { id: "5k10k", label: "৳5,000 – ৳10,000",   test: (n: number) => n >= 5000 && n < 10000 },
  { id: "o10k",  label: "Over ৳10,000",        test: (n: number) => n >= 10000 },
];

const SORT_OPTIONS = [
  { value: "feat", label: "Featured" },
  { value: "lh",   label: "Price: Low to High" },
  { value: "hl",   label: "Price: High to Low" },
  { value: "sale", label: "On Sale" },
  { value: "new",  label: "Newest First" },
] as const;

type SortKey = typeof SORT_OPTIONS[number]["value"];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "1 size", "7", "8", "10", "BLK"];
const ALL_CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];

function CategoryPage() {
  const { slug } = Route.useParams();
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  const [search, setSearch]       = useState("");
  const [bands, setBands]         = useState<string[]>([]);
  const [sizes, setSizes]         = useState<string[]>([]);
  const [cats, setCats]           = useState<string[]>([]);
  const [sort, setSort]           = useState<SortKey>("feat");
  const [drawer, setDrawer]       = useState(false);
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen]   = useState(false);

  const toggleBand = (id: string) => setBands((b) => b.includes(id) ? b.filter((x) => x !== id) : [...b, id]);
  const toggleSize = (s: string)  => setSizes((v) => v.includes(s) ? v.filter((x) => x !== s) : [...v, s]);
  const toggleCat  = (c: string)  => setCats((v)  => v.includes(c) ? v.filter((x) => x !== c) : [...v, c]);

  const activeFilterCount = bands.length + sizes.length + cats.length + (search ? 1 : 0);

  const clearAll = () => { setBands([]); setSizes([]); setCats([]); setSearch(""); };

  const list = useMemo(() => {
    let arr = [...PRODUCTS];
    if (search) arr = arr.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (bands.length) arr = arr.filter((p) => PRICE_BANDS.filter((b) => bands.includes(b.id)).some((b) => b.test(p.price)));
    if (sizes.length) arr = arr.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    if (cats.length)  arr = arr.filter((p) => cats.includes(p.category));
    if (sort === "lh")   arr.sort((a, b) => a.price - b.price);
    if (sort === "hl")   arr.sort((a, b) => b.price - a.price);
    if (sort === "sale") arr = arr.filter((p) => p.oldPrice).concat(arr.filter((p) => !p.oldPrice));
    if (sort === "new")  arr.reverse();
    return arr;
  }, [search, bands, sizes, cats, sort]);

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort)!;

  const FilterPanel = () => (
    <div className="space-y-1">

      {/* Search inside filter */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border bg-secondary/50 text-sm outline-none focus:border-foreground transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="size-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category */}
      <FilterGroup title="Category" onClear={cats.length ? () => setCats([]) : undefined}>
        <div className="flex flex-wrap gap-2 pt-1">
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              className={`h-8 px-3 rounded-full text-xs font-medium border transition ${cats.includes(c) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}
            >{c}</button>
          ))}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price" onClear={bands.length ? () => setBands([]) : undefined}>
        <ul className="space-y-2 pt-1">
          {PRICE_BANDS.map((b) => (
            <li key={b.id}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${bands.includes(b.id) ? "bg-foreground border-foreground" : "border-border group-hover:border-foreground/40"}`}>
                  {bands.includes(b.id) && <Check className="size-3 text-background" />}
                </span>
                <input type="checkbox" checked={bands.includes(b.id)} onChange={() => toggleBand(b.id)} className="sr-only" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition">{b.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {/* Size */}
      <FilterGroup title="Size" onClear={sizes.length ? () => setSizes([]) : undefined}>
        <div className="flex flex-wrap gap-2 pt-1">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`h-9 min-w-[2.5rem] px-3 rounded-xl text-xs font-medium border-2 transition ${sizes.includes(s) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/60"}`}
            >{s}</button>
          ))}
        </div>
      </FilterGroup>

      {/* On sale toggle */}
      <FilterGroup title="Deals">
        <label className="flex items-center justify-between cursor-pointer pt-1">
          <span className="text-sm text-muted-foreground">On sale only</span>
          <button
            role="switch"
            aria-checked={sort === "sale"}
            onClick={() => setSort((s) => s === "sale" ? "feat" : "sale")}
            className={`relative w-11 h-6 rounded-full transition ${sort === "sale" ? "bg-accent" : "bg-border"}`}
          >
            <span className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform ${sort === "sale" ? "translate-x-5" : ""}`} />
          </button>
        </label>
      </FilterGroup>
    </div>
  );

  return (
    <Layout>
      {/* Hero banner */}
      <div className="border-b bg-linear-to-b from-secondary/50 to-background">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-5">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">{title}</span>
          </nav>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {list.length} {list.length === 1 ? "product" : "products"}
                {activeFilterCount > 0 && <> · <button onClick={clearAll} className="text-accent hover:underline">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active — clear all</button></>}
              </p>
            </div>

            {/* Top-bar controls */}
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 h-10 px-4 rounded-full border bg-card text-sm hover:border-foreground/60 transition"
                >
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <span>{currentSort.label}</span>
                  <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border bg-card shadow-xl z-20 py-1.5 overflow-hidden animate-scale-in">
                      {SORT_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => { setSort(o.value); setSortOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-secondary transition ${sort === o.value ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        >
                          {o.label}
                          {sort === o.value && <Check className="size-3.5 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex items-center gap-1 h-10 px-1.5 rounded-full border bg-card">
                <button onClick={() => setView("grid")} className={`size-7 rounded-full flex items-center justify-center transition ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                  <LayoutGrid className="size-3.5" />
                </button>
                <button onClick={() => setView("list")} className={`size-7 rounded-full flex items-center justify-center transition ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                  <List className="size-3.5" />
                </button>
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setDrawer(true)}
                className={`lg:hidden flex items-center gap-2 h-10 px-4 rounded-full border text-sm transition ${activeFilterCount > 0 ? "border-foreground bg-foreground text-background" : "hover:border-foreground/60"}`}
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 && <span className="size-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {search && (
                <Chip label={`"${search}"`} onRemove={() => setSearch("")} />
              )}
              {cats.map((c) => <Chip key={c} label={c} onRemove={() => toggleCat(c)} />)}
              {bands.map((b) => <Chip key={b} label={PRICE_BANDS.find((x) => x.id === b)!.label} onRemove={() => toggleBand(b)} />)}
              {sizes.map((s) => <Chip key={s} label={`Size ${s}`} onRemove={() => toggleSize(s)} />)}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6 animate-fade-up">

        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold flex items-center gap-2">
                <SlidersHorizontal className="size-4" /> Filters
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-accent hover:underline">Clear all ({activeFilterCount})</button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Search className="size-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search term</p>
              <button onClick={clearAll} className="mt-5 h-10 px-6 rounded-full bg-foreground text-background text-sm font-medium">Clear all filters</button>
            </div>
          ) : view === "list" ? (
            <div className="space-y-3">
              {list.map((p) => <ListCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-background border-r shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between p-5 border-b">
              <p className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal className="size-5" /> Filters
                {activeFilterCount > 0 && <span className="size-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </p>
              <button onClick={() => setDrawer(false)} className="size-9 rounded-full border flex items-center justify-center hover:bg-secondary transition">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <FilterPanel />
            </div>
            <div className="p-5 border-t flex gap-3">
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="flex-1 h-11 rounded-full border text-sm font-medium hover:border-foreground transition">
                  Clear all
                </button>
              )}
              <button onClick={() => setDrawer(false)} className="flex-1 h-11 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
                Show {list.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function FilterGroup({ title, children, onClear }: { title: string; children: React.ReactNode; onClear?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t py-4 first:border-t-0 first:pt-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-2 group">
        <span className="text-sm font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          {onClear && <span onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-xs text-accent hover:underline">Clear</span>}
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && children}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full bg-secondary border text-xs font-medium">
      {label}
      <button onClick={onRemove} className="size-4 rounded-full flex items-center justify-center hover:bg-border transition">
        <X className="size-2.5" />
      </button>
    </span>
  );
}

function ListCard({ p }: { p: typeof PRODUCTS[0] }) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <Link to="/product/$id" params={{ id: p.id }} className="flex gap-4 rounded-2xl border bg-card p-3 hover:border-foreground/40 hover:shadow-sm transition group">
      <div className="relative size-24 sm:size-28 rounded-xl bg-secondary overflow-hidden shrink-0">
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-accent text-white text-[9px] font-bold px-1.5 py-0.5">-{discount}%</span>
        )}
        <img src={p.image} alt={p.name} className="size-full object-cover group-hover:scale-105 transition duration-500" />
      </div>
      <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.category}</p>
        <h3 className="mt-0.5 text-sm font-medium leading-snug line-clamp-2">{p.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <Price amount={p.price} size="md" className="!font-semibold" />
          {p.oldPrice && <Price amount={p.oldPrice} size="xs" muted struck />}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {p.colors.map((c, i) => <span key={i} className="size-3.5 rounded-full ring-1 ring-border" style={{ background: c }} />)}
        </div>
      </div>
      <div className="hidden sm:flex items-center shrink-0 pr-2">
        <span className="text-xs text-muted-foreground">{p.sizes.join(" · ")}</span>
      </div>
    </Link>
  );
}
