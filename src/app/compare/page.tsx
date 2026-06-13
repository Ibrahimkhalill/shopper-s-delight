"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect, Fragment } from "react";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { useStore } from "@/lib/store";
import { Price } from "@/components/site/Price";
import { Star, Trash2, ShoppingCart, Plus, Search, X, Minus, Check } from "lucide-react";
import { toast } from "sonner";
import { useProductCache } from "@/hooks/useProductCache";
import type { Product } from "@/components/site/ProductCard";

const MAX_SLOTS = 4;

function StarsRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-border text-border"}`}
        />
      ))}
    </div>
  );
}

function ratingForProduct(productId: string, reviews: { productId: string; rating: number }[]) {
  const list = reviews.filter((r) => r.productId === productId);
  if (!list.length) return 4.6;
  return list.reduce((s, r) => s + r.rating, 0) / list.length;
}

function SearchSlot({ onAdd, compareList }: { onAdd: (id: string) => void; compareList: string[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/products?search=${encodeURIComponent(q)}&limit=6`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(({ products }) => setResults((products ?? []).filter((p: Product) => !compareList.includes(p.id))))
      .catch(() => {});
    return () => ctrl.abort();
  }, [query, compareList]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-8" ref={ref}>
      <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground">
        <Plus className="size-5" />
      </div>
      <p className="text-center text-xs text-muted-foreground">Search to add a product</p>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        )}
        {open && results.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onAdd(p.id); setQuery(""); setOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-secondary/60 transition"
              >
                <img src={p.image} alt="" className="size-8 shrink-0 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type QuantityMap = Record<string, number>;

const ROWS: { key: string; label: string }[] = [
  { key: "name", label: "Product Name" },
  { key: "colors", label: "Color" },
  { key: "sizes", label: "Size" },
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
  { key: "brand", label: "Brand" },
  { key: "material", label: "Material" },
  { key: "availability", label: "Availability" },
];

function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCompare, addToCart, reviews } = useStore();
  const [qty, setQty] = useState<QuantityMap>({});
  const productCache = useProductCache(compareList);

  const products = useMemo(
    () => compareList.map((id) => productCache[id]).filter(Boolean) as Product[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compareList, productCache],
  );

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => products[i] ?? null);

  function getQty(id: string) { return qty[id] ?? 1; }
  function changeQty(id: string, delta: number) {
    setQty((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
  }

  const reviewCount = (pid: string) => reviews.filter((r) => r.productId === pid).length;

  const gridCols = `160px repeat(${MAX_SLOTS}, minmax(180px, 1fr))`;

  return (
    <Layout>
      <PageHeader
        centered
        color="oklch(0.96 0 0)"
        title="Compare products"
        subtitle="Compare your favourite products side by side to find the best match for your needs, style, and everyday lifestyle."
        crumbs={[{ label: "Home", to: "/" }, { label: "Compare" }]}
      />

      <div className="mx-auto max-w-7xl overflow-x-clip px-4 py-6 pb-24 lg:px-6 lg:py-8 lg:pb-10">
        {compareList.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { clearCompare(); toast("Compare list cleared"); }}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-border/80 bg-card shadow-sm" style={{ contain: "paint" }}>
          <div className="overflow-x-auto">
            <div
              className="grid min-w-215 divide-x divide-border/60"
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* ── Product image row ── */}
              <div className="sticky left-0 z-10 border-b border-border/60 bg-secondary/40 px-3 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-end">
                Product
              </div>
              {slots.map((p, i) =>
                p ? (
                  <div key={p.id} className="relative border-b border-border/60 bg-secondary/20 px-3 py-5 text-center">
                    <button
                      type="button"
                      onClick={() => { removeFromCompare(p.id); toast("Removed from compare"); }}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition hover:border-foreground/30 hover:text-foreground"
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                    <Link href={`/product/${p.id}`} className="mx-auto block">
                      <div className="mx-auto aspect-3/4 max-h-44 overflow-hidden rounded-xl bg-secondary">
                        <img src={p.image} alt="" className="size-full object-cover" />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">{p.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{p.category}</p>
                    </Link>
                  </div>
                ) : (
                  <div key={`empty-img-${i}`} className="border-b border-border/60 bg-secondary/10">
                    <SearchSlot onAdd={(id) => addToCompare(id)} compareList={compareList} />
                  </div>
                ),
              )}

              {/* ── Spec rows ── */}
              {ROWS.map((row, rowIdx) => (
                <Fragment key={row.key}>
                  <div
                    className={`sticky left-0 z-10 flex items-center border-b border-border/60 px-3 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${rowIdx % 2 === 1 ? "bg-secondary/25" : "bg-background"}`}
                  >
                    {row.label}
                  </div>
                  {slots.map((p, i) => (
                    <div
                      key={`${row.key}-${i}`}
                      className={`flex items-center justify-center border-b border-border/60 px-2 py-3.5 text-center text-sm ${rowIdx % 2 === 1 ? "bg-secondary/15" : ""}`}
                    >
                      {p ? (
                        <>
                          {row.key === "name" && (
                            <span className="text-sm font-medium text-foreground leading-snug">{p.name}</span>
                          )}
                          {row.key === "colors" && (
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {p.colors.map((c, ci) => (
                                <span
                                  key={ci}
                                  className="box-border size-5 shrink-0 rounded-full border border-border/80"
                                  style={{ background: c }}
                                  title={c}
                                />
                              ))}
                            </div>
                          )}
                          {row.key === "sizes" && (
                            <div className="flex flex-wrap justify-center gap-1">
                              {p.sizes.map((s) => (
                                <span key={s} className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {row.key === "rating" && (
                            <div className="flex flex-col items-center gap-1">
                              <StarsRow rating={ratingForProduct(p.id, reviews)} />
                              <span className="text-[11px] text-muted-foreground">
                                ({reviewCount(p.id)} {reviewCount(p.id) === 1 ? "review" : "reviews"})
                              </span>
                            </div>
                          )}
                          {row.key === "price" && (
                            <div className="flex flex-col items-center gap-0.5">
                              <Price amount={p.price} size="sm" className="font-bold!" />
                              {p.oldPrice && <Price amount={p.oldPrice} size="xs" muted struck className="text-[11px]!" />}
                            </div>
                          )}
                          {row.key === "brand" && <span className="font-medium">{p.brand}</span>}
                          {row.key === "material" && (
                            <span className="max-w-37.5 text-[13px] leading-snug text-muted-foreground">{p.material ?? "—"}</span>
                          )}
                          {row.key === "availability" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <Check className="size-3" strokeWidth={2.5} />
                              In Stock
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">—</span>
                      )}
                    </div>
                  ))}
                </Fragment>
              ))}

              {/* ── Add to cart row ── */}
              <div className="sticky left-0 z-10 flex items-center bg-background px-3 py-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Add to cart
              </div>
              {slots.map((p, i) => (
                <div key={`cart-${i}`} className="flex items-center justify-center px-3 py-5">
                  {p ? (
                    <div className="flex w-full max-w-50 flex-col items-center gap-3">
                      {/* Quantity selector */}
                      <div className="flex items-center overflow-hidden rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => changeQty(p.id, -1)}
                          className="flex size-8 items-center justify-center text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-8 border-x border-border text-center text-sm font-semibold tabular-nums py-1">
                          {getQty(p.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQty(p.id, 1)}
                          className="flex size-8 items-center justify-center text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      {/* Add to cart button */}
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(p.id, { qty: getQty(p.id), size: p.sizes[0] });
                          toast.success("Added to cart", { description: p.name });
                        }}
                        className="h-9 w-full rounded-lg bg-foreground text-xs font-bold text-background transition hover:opacity-90 active:scale-[0.98]"
                      >
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <ShoppingCart className="size-3.5" strokeWidth={2.25} />
                          Add to cart
                        </span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/40">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {compareList.length === 0 && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border/80 bg-card px-6 py-10 text-center">
            <p className="text-base font-semibold text-foreground">Nothing to compare yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Search for products in the slots above, or open any product page and tap{" "}
              <strong className="text-foreground">Compare</strong>.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Browse products
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ComparePage;
