import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { getProduct, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { ChevronRight, Heart, Truck, RotateCcw, ShieldCheck, Minus, Plus, Star, Share2, Zap, Check } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => <Layout><div className="p-20 text-center">Product not found</div></Layout>,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = getProduct(id);
  const { addToCart, toggleWishlist, wishlist, reviews, addReview, user } = useStore();
  const navigate = useNavigate();
  const [size, setSize] = useState(p?.sizes[0]);
  const [color, setColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "reviews" | "shipping">("desc");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [zoom, setZoom] = useState({ active: false, x: 0, y: 0 });
  const [thumb, setThumb] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  const productReviews = useMemo(() => reviews.filter((r) => r.productId === id), [reviews, id]);
  const avg = productReviews.length ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1) : "4.6";

  if (!p) return <Layout><div className="p-20 text-center">Product not found</div></Layout>;
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const liked = wishlist.includes(p.id);
  const related = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 5);
  const inStock = true;
  const savings = p.oldPrice ? p.oldPrice - p.price : 0;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const buyNow = () => {
    addToCart(p.id, { qty, size });
    navigate({ to: "/checkout" });
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }
    } catch {}
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) { toast.error("Please write a review"); return; }
    addReview({ productId: p.id, user: user?.name ?? "Guest", rating, text: reviewText });
    setReviewText("");
    toast.success("Review posted");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-5">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <span>{p.category}</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground truncate">{p.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 grid lg:grid-cols-2 gap-10 animate-fade-up">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex gap-3">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2.5 w-20 shrink-0">
              {[p.image, p.image, p.image, p.image].map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setThumb(i)}
                  onClick={() => setThumb(i)}
                  className={`aspect-square rounded-xl bg-secondary overflow-hidden border-2 transition ${i === thumb ? "border-foreground shadow-sm" : "border-transparent hover:border-border"}`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image with magnify */}
            <div className="flex-1 relative">
              <div
                ref={imgRef}
                onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
                onMouseLeave={() => setZoom({ active: false, x: 0, y: 0 })}
                onMouseMove={handleMove}
                className="relative aspect-square rounded-2xl bg-secondary overflow-hidden border cursor-crosshair group"
              >
                <img src={p.image} alt={p.name} className="size-full object-cover" />
                {zoom.active && (
                  <div
                    className="hidden lg:block absolute pointer-events-none border-2 border-foreground/40 bg-foreground/10 backdrop-blur-[1px]"
                    style={{
                      width: 160, height: 160,
                      left: `calc(${zoom.x}% - 80px)`,
                      top: `calc(${zoom.y}% - 80px)`,
                    }}
                  />
                )}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 rounded-full bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1">-{discount}%</span>
                )}
                <button onClick={share} className="absolute top-3 right-3 size-9 rounded-full bg-card/90 backdrop-blur border flex items-center justify-center hover:bg-card transition">
                  <Share2 className="size-4" />
                </button>
              </div>

              {/* Zoom panel */}
              {zoom.active && (
                <div
                  className="hidden lg:block absolute top-0 left-[calc(100%+1.5rem)] w-[420px] h-[420px] rounded-2xl border bg-secondary overflow-hidden shadow-xl z-30"
                  style={{
                    backgroundImage: `url(${p.image})`,
                    backgroundSize: "250%",
                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}

              {/* Mobile thumbnails */}
              <div className="sm:hidden mt-3 grid grid-cols-4 gap-2">
                {[p.image, p.image, p.image, p.image].map((img, i) => (
                  <button key={i} onClick={() => setThumb(i)} className={`aspect-square rounded-lg bg-secondary overflow-hidden border-2 transition ${i === thumb ? "border-foreground" : "border-transparent"}`}>
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((n) => <Star key={n} className={`size-4 ${n <= Math.round(Number(avg)) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}
            </div>
            <span className="text-muted-foreground">{avg} · {productReviews.length} reviews</span>
            <span className="text-muted-foreground">·</span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${inStock ? "text-emerald-600" : "text-accent"}`}>
              <Check className="size-3.5" /> {inStock ? "In stock" : "Out of stock"}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border bg-secondary/40 p-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold tracking-tight text-accent">৳{p.price.toLocaleString()}</span>
              {p.oldPrice && (
                <>
                  <span className="text-base text-muted-foreground line-through">৳{p.oldPrice.toLocaleString()}</span>
                  <span className="text-xs font-semibold bg-accent text-accent-foreground rounded-full px-2.5 py-1">-{discount}%</span>
                </>
              )}
            </div>
            {savings > 0 && (
              <p className="mt-1.5 text-xs text-emerald-600 font-medium">You save ৳{savings.toLocaleString()}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Inclusive of all taxes · Free shipping over ৳1,500</p>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-medium">Color</p>
              <p className="text-xs text-muted-foreground">{color + 1} of {p.colors.length}</p>
            </div>
            <div className="flex items-center gap-2">
              {p.colors.map((c, i) => (
                <button key={i} onClick={() => setColor(i)} className={`size-10 rounded-full ring-2 ring-offset-2 ring-offset-background transition ${color === i ? "ring-foreground scale-110" : "ring-border hover:ring-foreground/40"}`} style={{ background: c }} aria-label={`Color ${i + 1}`} />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-medium">Size</p>
              <button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-14 h-12 px-5 rounded-xl border-2 text-sm font-medium transition ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium mb-2.5">Quantity</p>
            <div className="flex items-center h-12 w-fit rounded-xl border-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-12 flex items-center justify-center hover:bg-secondary rounded-l-lg transition"><Minus className="size-4" /></button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="size-12 flex items-center justify-center hover:bg-secondary rounded-r-lg transition"><Plus className="size-4" /></button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => { addToCart(p.id, { qty, size }); toast.success("Added to cart", { description: `${p.name} × ${qty}` }); }}
              className="h-13 py-3.5 rounded-xl border-2 border-foreground bg-background text-foreground text-sm font-semibold hover:bg-foreground hover:text-background transition active:scale-[0.98]"
            >Add to cart</button>
            <button
              onClick={buyNow}
              className="h-13 py-3.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            ><Zap className="size-4 fill-current" /> Buy now</button>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => { toggleWishlist(p.id); toast(liked ? "Removed" : "Saved to wishlist"); }}
              className={`flex-1 h-11 rounded-xl border flex items-center justify-center gap-2 text-sm hover:border-foreground transition ${liked ? "text-accent border-accent" : ""}`}
            ><Heart className={`size-4 ${liked ? "fill-current" : ""}`} /> {liked ? "Wishlisted" : "Add to wishlist"}</button>
            <button onClick={share} className="h-11 px-5 rounded-xl border flex items-center justify-center gap-2 text-sm hover:border-foreground transition">
              <Share2 className="size-4" /> Share
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
            {[
              { i: Truck, t: "Free over ৳1500" },
              { i: RotateCcw, t: "7-day returns" },
              { i: ShieldCheck, t: "Buyer protected" },
            ].map((b) => (
              <div key={b.t} className="rounded-xl border bg-card p-3 flex flex-col items-center gap-1.5 text-center hover:border-foreground/40 transition">
                <b.i className="size-4 text-accent" />
                <span className="font-medium">{b.t}</span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            Premium quality {p.name.toLowerCase()} crafted with attention to detail. Soft, durable, and designed for everyday wear in the Bangladesh climate.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="border-b flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "desc" as const, t: "Description" },
            { id: "reviews" as const, t: `Reviews (${productReviews.length})` },
            { id: "shipping" as const, t: "Shipping & returns" },
          ].map((m) => (
            <button key={m.id} onClick={() => setTab(m.id)} className={`pb-3 text-sm border-b-2 transition whitespace-nowrap ${tab === m.id ? "border-foreground text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{m.t}</button>
          ))}
        </div>
        <div className="py-6 text-sm text-muted-foreground leading-relaxed max-w-3xl animate-fade-in">
          {tab === "desc" && (
            <div className="space-y-3">
              <p>The {p.name} is engineered for everyday excellence. Premium materials, considered details, and a fit that flatters.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Premium quality construction</li>
                <li>Designed for the Bangladesh climate</li>
                <li>Hassle-free 7-day returns</li>
              </ul>
            </div>
          )}
          {tab === "shipping" && (
            <div className="space-y-2">
              <p>Free delivery on orders above ৳1,500. Standard shipping ৳80, delivered within 1–3 business days nationwide.</p>
              <p>Returns accepted within 7 days of delivery. Item must be unused with original packaging.</p>
            </div>
          )}
          {tab === "reviews" && (
            <div>
              <form onSubmit={submitReview} className="rounded-2xl border p-5 mb-5 bg-card">
                <p className="text-foreground font-medium mb-3">Write a review</p>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)}>
                      <Star className={`size-5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} placeholder="Share your experience..." className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-foreground text-foreground" />
                <button className="mt-3 h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium">Post review</button>
              </form>
              {productReviews.length === 0 ? (
                <p>No reviews yet. Be the first.</p>
              ) : (
                <div className="space-y-4">
                  {productReviews.map((r) => (
                    <div key={r.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-foreground font-medium text-sm">{r.user}</p>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((n) => <Star key={n} className={`size-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{r.text}</p>
                      <p className="mt-1 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-5">You may also like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {related.map((rp) => <ProductCard key={rp.id} p={rp} />)}
        </div>
      </section>
    </Layout>
  );
}
