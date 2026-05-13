"use client";

import Link from "next/link";
import { useMemo, Fragment } from "react";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { useStore } from "@/lib/store";
import { Price } from "@/components/site/Price";
import { Star, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/components/site/ProductCard";

function StarsRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 sm:size-4 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-border text-border"}`}
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

const ROWS: { key: string; label: string }[] = [
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
  { key: "type", label: "Type" },
  { key: "brand", label: "Brand" },
  { key: "sizes", label: "Size" },
  { key: "colors", label: "Color" },
  { key: "material", label: "Material" },
];

function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, resolveProduct, addToCart, reviews } = useStore();

  const products = useMemo(
    () => compareList.map((id) => resolveProduct(id)).filter(Boolean) as Product[],
    [compareList, resolveProduct],
  );

  const n = products.length;
  const gridCols = `140px repeat(${Math.max(n, 1)}, minmax(140px, 1fr))`;

  return (
    <Layout>
      <PageHeader
        centered
        title="Compare products"
        subtitle="Compare your favourite products side by side to find the best match for your needs, style, and everyday lifestyle."
        crumbs={[{ label: "Home", to: "/" }, { label: "Compare" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:px-6 lg:py-8 lg:pb-10">
        {n === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card px-6 py-14 text-center">
            <p className="text-lg font-semibold text-foreground">Nothing to compare yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Open any product and tap <strong className="text-foreground">Compare</strong>, or add up to{" "}
              <strong className="text-foreground">4</strong> items from product pages.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  clearCompare();
                  toast("Compare list cleared");
                }}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
              <div
                className="grid min-w-[720px] divide-x divide-border/70"
                style={{ gridTemplateColumns: gridCols }}
              >
                {/* Header row */}
                <div className="sticky left-0 z-10 border-b border-border/70 bg-secondary/40 px-3 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Product
                </div>
                {products.map((p) => (
                  <div key={p.id} className="relative border-b border-border/70 bg-secondary/20 px-3 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCompare(p.id);
                        toast("Removed from compare");
                      }}
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition hover:border-foreground/30 hover:text-foreground"
                      aria-label={`Remove ${p.name} from compare`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <Link href={`/product/${p.id}`} className="mx-auto block max-w-[160px]">
                      <div className="mx-auto aspect-square max-h-36 overflow-hidden rounded-xl bg-secondary">
                        <img src={p.image} alt="" className="size-full object-cover" />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">{p.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {p.category}
                      </p>
                    </Link>
                  </div>
                ))}

                {/* Spec rows */}
                {ROWS.map((row, rowIdx) => {
                  const reviewCount = (pid: string) => reviews.filter((r) => r.productId === pid).length;
                  return (
                  <Fragment key={row.key}>
                    <div
                      className={`sticky left-0 z-10 flex items-center border-b border-border/70 bg-background px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                        rowIdx % 2 === 1 ? "bg-secondary/25" : ""
                      }`}
                    >
                      {row.label}
                    </div>
                    {products.map((p) => (
                      <div
                        key={`${row.key}-${p.id}`}
                        className={`flex items-center justify-center border-b border-border/70 px-2 py-3 text-center text-sm ${
                          rowIdx % 2 === 1 ? "bg-secondary/15" : ""
                        }`}
                      >
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
                            <Price amount={p.price} size="sm" className="!font-bold" />
                            {p.oldPrice ? (
                              <Price amount={p.oldPrice} size="xs" muted struck className="!text-[11px]" />
                            ) : null}
                          </div>
                        )}
                        {row.key === "type" && <span className="text-muted-foreground">{p.category}</span>}
                        {row.key === "brand" && <span className="font-medium">{p.brand}</span>}
                        {row.key === "sizes" && (
                          <span className="text-[13px] text-muted-foreground">{p.sizes.join(", ")}</span>
                        )}
                        {row.key === "colors" && (
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {p.colors.map((c, i) => (
                              <span
                                key={i}
                                className="box-border size-6 shrink-0 rounded-full border border-border/80"
                                style={{ background: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        )}
                        {row.key === "material" && (
                          <span className="max-w-[140px] text-[13px] leading-snug text-muted-foreground">
                            {p.material ?? "—"}
                          </span>
                        )}
                      </div>
                    ))}
                  </Fragment>
                  );
                })}

                {/* Add to cart row */}
                <div className="sticky left-0 z-10 flex items-center bg-background px-3 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Add to cart
                </div>
                {products.map((p) => (
                  <div key={`cart-${p.id}`} className="flex items-center justify-center px-3 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p.id, { size: p.sizes[0] });
                        toast.success("Added to cart", { description: p.name });
                      }}
                      className="h-10 w-full max-w-[180px] rounded-lg bg-foreground text-xs font-bold text-background transition hover:opacity-90 active:scale-[0.98]"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <ShoppingCart className="size-3.5" strokeWidth={2.25} />
                        Add to cart
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default ComparePage;
