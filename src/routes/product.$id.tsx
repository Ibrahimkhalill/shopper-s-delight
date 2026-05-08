import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { getProduct, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import {
  ChevronRight, Heart, Truck, RotateCcw, ShieldCheck,
  Minus, Plus, Star, Share2, Zap, Check, Package,
  MessageSquare, Info, ChevronDown, BadgeCheck,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => <Layout><div className="p-20 text-center">Product not found</div></Layout>,
});

function StarsRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "size-5" : "size-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${s} ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-border text-border"}`} />
      ))}
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const p = getProduct(id);
  const { addToCart, toggleWishlist, wishlist, reviews, addReview, user } = useStore();
  const navigate = useNavigate();
  const [size, setSize]         = useState(p?.sizes[0]);
  const [color, setColor]       = useState(0);
  const [qty, setQty]           = useState(1);
  const [tab, setTab]           = useState<"desc" | "reviews" | "shipping">("desc");
  const [rating, setRating]     = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [zoom, setZoom]         = useState({ active: false, x: 0, y: 0 });
  const [thumb, setThumb]       = useState(0);
  const [added, setAdded]       = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const productReviews = useMemo(() => reviews.filter((r) => r.productId === id), [reviews, id]);
  const avg = productReviews.length
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    : 4.6;

  if (!p) return <Layout><div className="p-20 text-center">Product not found</div></Layout>;

  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const liked    = wishlist.includes(p.id);
  const related  = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 5);
  const savings  = p.oldPrice ? p.oldPrice - p.price : 0;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleAddToCart = () => {
    addToCart(p.id, { qty, size });
    setAdded(true);
    toast.success("Added to cart", { description: `${p.name} × ${qty}` });
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart(p.id, { qty, size });
    navigate({ to: "/checkout" });
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }
    } catch {}
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) { toast.error("Please write a review"); return; }
    addReview({ productId: p.id, user: user?.name ?? "Guest", rating, text: reviewText });
    setReviewText("");
    toast.success("Review posted!");
  };

  const thumbs = [p.image, p.image, p.image, p.image];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/category/$slug" params={{ slug: p.category.toLowerCase() }} className="hover:text-foreground transition">{p.category}</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground truncate max-w-48">{p.name}</span>
        </nav>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid lg:grid-cols-[1fr_1fr] gap-10 xl:gap-16 animate-fade-up">

        {/* ── LEFT: Image gallery ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex gap-3">

            {/* Vertical thumbnails — desktop */}
            <div className="hidden sm:flex flex-col gap-2 w-[72px] shrink-0">
              {thumbs.map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setThumb(i)}
                  onClick={() => setThumb(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === thumb ? "border-foreground shadow-md scale-[1.03]" : "border-transparent hover:border-border"}`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative min-w-0">
              <div
                ref={imgRef}
                onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
                onMouseLeave={() => setZoom({ active: false, x: 0, y: 0 })}
                onMouseMove={handleMove}
                className="relative aspect-square rounded-2xl bg-secondary overflow-hidden border cursor-none"
              >
                {/* Base image */}
                <img
                  src={thumbs[thumb]}
                  alt={p.name}
                  className="size-full object-cover transition duration-500"
                />

                {/* Inline zoom — zoomed image clipped to a circle following the cursor */}
                {zoom.active && (
                  <div
                    className="hidden lg:block absolute pointer-events-none"
                    style={{
                      width: 160,
                      height: 160,
                      left: `calc(${zoom.x}% - 80px)`,
                      top: `calc(${zoom.y}% - 80px)`,
                      borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
                      backgroundImage: `url(${thumbs[thumb]})`,
                      backgroundSize: "350%",
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                      backgroundRepeat: "no-repeat",
                      zIndex: 20,
                    }}
                  />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {discount > 0 && (
                    <span className="rounded-full bg-accent text-white text-[11px] font-bold px-2.5 py-1 shadow-sm">
                      -{discount}%
                    </span>
                  )}
                  {p.badge && (
                    <span className="rounded-full bg-foreground text-background text-[11px] font-bold px-2.5 py-1 shadow-sm">
                      {p.badge.label}
                    </span>
                  )}
                </div>

                {/* Action buttons on image */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button
                    onClick={share}
                    className="size-9 rounded-full bg-white/90 backdrop-blur border border-border shadow-sm flex items-center justify-center hover:bg-white hover:scale-105 transition"
                  >
                    <Share2 className="size-4" />
                  </button>
                  <button
                    onClick={() => { toggleWishlist(p.id); toast(liked ? "Removed from wishlist" : "Saved to wishlist"); }}
                    className={`size-9 rounded-full bg-white/90 backdrop-blur border shadow-sm flex items-center justify-center hover:scale-105 transition ${liked ? "border-accent text-accent" : "border-border"}`}
                  >
                    <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Mobile thumbnails */}
              <div className="sm:hidden mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {thumbs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setThumb(i)}
                    className={`shrink-0 size-16 rounded-xl overflow-hidden border-2 transition ${i === thumb ? "border-foreground" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trust badges — below image on desktop */}
          <div className="hidden lg:grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: Truck, label: "Free shipping", sub: "Over ৳1,500" },
              { icon: RotateCcw, label: "7-day returns", sub: "Hassle-free" },
              { icon: ShieldCheck, label: "Buyer protect", sub: "100% safe" },
            ].map((b) => (
              <div key={b.label} className="rounded-xl border bg-card p-3 flex items-center gap-2.5 text-xs">
                <b.icon className="size-4 text-accent shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{b.label}</p>
                  <p className="text-muted-foreground">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Product info ── */}
        <div className="flex flex-col gap-0">

          {/* Category + brand */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{p.category}</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <BadgeCheck className="size-3.5" /> In stock
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{p.name}</h1>

          {/* Rating row */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <StarsRow rating={avg} />
            <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
            <button onClick={() => setTab("reviews")} className="text-sm text-muted-foreground hover:text-foreground transition underline underline-offset-2">
              {productReviews.length} {productReviews.length === 1 ? "review" : "reviews"}
            </button>
            <span className="text-border text-sm">·</span>
            <span className="text-sm text-emerald-600 font-medium">1.2k sold</span>
          </div>

          {/* Price block */}
          <div className="mt-5  flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-xl font-black tracking-tight text-accent">৳{p.price.toLocaleString()}</span>
                {p.oldPrice && (
                  <span className="text-base text-muted-foreground line-through">৳{p.oldPrice.toLocaleString()}</span>
                )}
              </div>
               {discount > 0 && (
              <span className=" px-4 py-1 text-sm bg-red-50 rounded-2xl text-red-600 font-semibold">-{discount}%</span>
            )}
            </div>
           
          </div>

          {/* Color picker */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Color</p>
              <p className="text-xs text-muted-foreground">Option {color + 1} of {p.colors.length}</p>
            </div>
            <div className="flex items-center gap-3">
              {p.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColor(i)}
                  aria-label={`Color ${i + 1}`}
                  className={`size-5 rounded-full ring-1 ring-offset-1 ring-offset-background transition-all ${color === i ? "ring-foreground scale-100 shadow-md" : "ring-border hover:ring-foreground/40 hover:scale-105"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Size</p>
              <button className="text-xs text-accent hover:underline underline-offset-2 flex items-center gap-1">
                <Info className="size-3" /> Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[2rem] h-7 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    size === s
                      ? "border-foreground bg-foreground text-background shadow-sm scale-[1.02]"
                      : "border-border hover:border-foreground/60 hover:bg-secondary/60"
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Quantity + CTA */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {/* Qty stepper */}
            <div className="flex items-center h-12 rounded-xl border-2 border-border overflow-hidden shrink-0">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="size-12 flex items-center justify-center hover:bg-secondary transition text-muted-foreground hover:text-foreground"
              ><Minus className="size-4" /></button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="size-12 flex items-center justify-center hover:bg-secondary transition text-muted-foreground hover:text-foreground"
              ><Plus className="size-4" /></button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 min-w-[140px] h-12 rounded-xl border-2 text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                added
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              {added ? <><Check className="size-4" /> Added!</> : "Add to cart"}
            </button>

            {/* Buy now */}
            <button
              onClick={buyNow}
              className="flex-1 min-w-[140px] h-12 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            >
              <Zap className="size-4 fill-current" /> Buy now
            </button>
          </div>

          {/* Free shipping note */}
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Truck className="size-3.5 text-accent" />
            Free shipping on this order · Delivery in 1–3 business days
          </p>

          {/* Divider */}
          <div className="my-5 border-t" />

          {/* Short description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium quality {p.name.toLowerCase()} crafted with attention to detail. Soft, durable, and designed for everyday wear in the Bangladesh climate. Perfect for any occasion.
          </p>

          {/* Mobile trust badges */}
          <div className="lg:hidden mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Truck, label: "Free shipping", sub: "Over ৳1,500" },
              { icon: RotateCcw, label: "7-day returns", sub: "Hassle-free" },
              { icon: ShieldCheck, label: "Buyer protect", sub: "100% safe" },
            ].map((b) => (
              <div key={b.label} className="rounded-xl border bg-card p-3 flex flex-col items-center gap-1 text-xs text-center">
                <b.icon className="size-4 text-accent" />
                <p className="font-semibold text-foreground">{b.label}</p>
                <p className="text-muted-foreground">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Reviews / Shipping ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border rounded-2xl overflow-hidden">

          {/* Tab header */}
          <div className="flex border-b bg-secondary/30 overflow-x-auto no-scrollbar">
            {[
              { id: "desc" as const,     icon: Info,           label: "Description" },
              { id: "reviews" as const,  icon: MessageSquare,  label: `Reviews (${productReviews.length})` },
              { id: "shipping" as const, icon: Package,        label: "Shipping & Returns" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  tab === m.id
                    ? "border-accent text-foreground bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <m.icon className="size-4" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8 animate-fade-in">
            {tab === "desc" && (
              <div className="grid sm:grid-cols-2 gap-8 max-w-3xl">
                <div>
                  <h3 className="font-semibold mb-3 text-base">About this product</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The {p.name} is engineered for everyday excellence. Premium materials, considered details, and a fit that flatters every body type.
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {["Premium quality construction", "Designed for Bangladesh climate", "Breathable & lightweight", "Hassle-free 7-day returns"].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="size-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="size-3 text-emerald-600" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-base">Specifications</h3>
                  <div className="space-y-2.5">
                    {[
                      ["Category", p.category],
                      ["Available sizes", p.sizes.join(", ")],
                      ["Colors", `${p.colors.length} options`],
                      ["Material", "Premium fabric"],
                      ["Origin", "Bangladesh"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-2 border-b last:border-0">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "shipping" && (
              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
                {[
                  {
                    icon: Truck,
                    title: "Delivery",
                    items: [
                      "Free shipping on orders over ৳1,500",
                      "Standard shipping ৳80",
                      "1–3 business days nationwide",
                      "Same-day delivery in Dhaka (select areas)",
                    ],
                  },
                  {
                    icon: RotateCcw,
                    title: "Returns & exchanges",
                    items: [
                      "7-day return window from delivery",
                      "Item must be unused, original packaging",
                      "Free return pickup in Dhaka",
                      "Refund processed within 3–5 days",
                    ],
                  },
                ].map((s) => (
                  <div key={s.title} className="rounded-2xl border p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="size-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <s.icon className="size-5 text-accent" />
                      </span>
                      <h3 className="font-semibold">{s.title}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {s.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="max-w-2xl">
                {/* Rating summary */}
                <div className="flex items-center gap-6 mb-8 p-5 rounded-2xl bg-secondary/50 border">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black">{avg.toFixed(1)}</p>
                    <StarsRow rating={avg} size="lg" />
                    <p className="text-xs text-muted-foreground mt-1">{productReviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = productReviews.filter((r) => Math.round(r.rating) === n).length;
                      const pct = productReviews.length ? (count / productReviews.length) * 100 : n === 5 ? 70 : n === 4 ? 20 : 5;
                      return (
                        <div key={n} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-right text-muted-foreground">{n}</span>
                          <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write review */}
                <form onSubmit={submitReview} className="rounded-2xl border p-5 mb-6 bg-card">
                  <p className="font-semibold mb-4">Write a review</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setRating(n)} className="hover:scale-110 transition">
                        <Star className={`size-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "fill-border text-border"}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">{["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}</span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-xl border bg-secondary/40 p-3.5 text-sm outline-none focus:border-foreground transition resize-none"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{user ? `Posting as ${user.name}` : "Posting as Guest"}</p>
                    <button type="submit" className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
                      Post review
                    </button>
                  </div>
                </form>

                {/* Reviews list */}
                {productReviews.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <MessageSquare className="size-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to review this product</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productReviews.map((r) => (
                      <div key={r.id} className="rounded-2xl border p-5 bg-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                              {r.user.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{r.user}</p>
                              <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                          </div>
                          <StarsRow rating={r.rating} />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Related products ── */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">More to explore</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">You may also like</h2>
          </div>
          <Link to="/category/$slug" params={{ slug: p.category.toLowerCase() }} className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1">
            View all <ChevronDown className="size-4 -rotate-90" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 snap-x snap-mandatory pb-1">
            {related.map((rp) => (
              <div key={rp.id} className="snap-start shrink-0 w-[52vw]"><ProductCard p={rp} /></div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
          {related.map((rp) => <ProductCard key={rp.id} p={rp} />)}
        </div>
      </section>

      {/* ── Mobile sticky bottom CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t px-4 py-3 flex gap-3">
        <button
          onClick={handleAddToCart}
          className={`flex-1 h-12 rounded-xl border-2 text-sm font-bold transition flex items-center justify-center gap-2 ${
            added ? "border-emerald-500 bg-emerald-500 text-white" : "border-foreground bg-background text-foreground"
          }`}
        >
          {added ? <><Check className="size-4" /> Added!</> : "Add to cart"}
        </button>
        <button
          onClick={buyNow}
          className="flex-1 h-12 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Zap className="size-4 fill-current" /> Buy now
        </button>
      </div>
      <div className="lg:hidden h-20" />
    </Layout>
  );
}
