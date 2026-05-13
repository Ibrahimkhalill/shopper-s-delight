"use client";

import Link from "next/link";
import { Layout } from "@/components/site/Layout";
import { getProduct, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import {
  ChevronRight,
  Heart,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Star,
  Share2,
  Zap,
  Check,
  Package,
  MessageSquare,
  ChevronDown,
  BadgeCheck,
  ArrowLeftRight,
  HelpCircle,
  Ruler,
  Clock,
  Eye,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Price } from "@/components/site/Price";
import { colorLabelFromHex } from "@/lib/product-filters";

function StarsRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "size-5" : "size-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${s} ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-border text-border"}`}
        />
      ))}
    </div>
  );
}

function pseudoSku(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0;
  return String(500000 + (n % 900000));
}

function viewersNow(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 17 + id.charCodeAt(i)) >>> 0;
  return 8 + (n % 35);
}

function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const p = getProduct(id);
  const {
    addToCart,
    toggleWishlist,
    wishlist,
    reviews,
    addReview,
    user,
    compareList,
    addToCompare,
    removeFromCompare,
  } = useStore();
  const router = useRouter();
  const [size, setSize] = useState(p?.sizes[0]);
  const [color, setColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "reviews" | "shipping">("desc");
  const [reviewSort, setReviewSort] = useState<"recent" | "oldest" | "high" | "low">("recent");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [zoom, setZoom] = useState({ active: false, x: 0, y: 0 });
  const [thumb, setThumb] = useState(0);
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const productReviews = useMemo(() => reviews.filter((r) => r.productId === id), [reviews, id]);
  const sortedReviews = useMemo(() => {
    const list = [...productReviews];
    if (reviewSort === "recent") list.sort((a, b) => b.createdAt - a.createdAt);
    else if (reviewSort === "oldest") list.sort((a, b) => a.createdAt - b.createdAt);
    else if (reviewSort === "high") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [productReviews, reviewSort]);
  const avg = productReviews.length
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    : 4.6;

  if (!p) notFound();

  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const liked = wishlist.includes(p.id);
  const inCompare = compareList.includes(p.id);
  const related = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 5);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Side-by-side magnifier geometry
  const LENS_SIZE = 38; // % of image — also determines zoom factor (100 / 38 ≈ 2.6×)
  const halfLens = LENS_SIZE / 2;
  const lensCx = Math.max(halfLens, Math.min(100 - halfLens, zoom.x));
  const lensCy = Math.max(halfLens, Math.min(100 - halfLens, zoom.y));
  const lensLeft = lensCx - halfLens;
  const lensTop = lensCy - halfLens;
  const bgX = (lensLeft / (100 - LENS_SIZE)) * 100;
  const bgY = (lensTop / (100 - LENS_SIZE)) * 100;
  const bgSize = (100 / LENS_SIZE) * 100; // ≈ 263%

  const handleAddToCart = () => {
    addToCart(p.id, { qty, size });
    setAdded(true);
    toast.success("Added to cart", { description: `${p.name} × ${qty}` });
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart(p.id, { qty, size });
    router.push("/checkout");
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch {}
  };

  const handleCompare = () => {
    if (inCompare) {
      removeFromCompare(p.id);
      toast("Removed from compare");
      return;
    }
    if (compareList.length >= 4) {
      toast.error("You can compare up to 4 products");
      return;
    }
    addToCompare(p.id);
    toast.success("Added to compare", { description: "Open compare to see side by side." });
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    addReview({ productId: p.id, user: user?.name ?? "Guest", rating, text: reviewText });
    setReviewText("");
    toast.success("Review posted!");
  };

  const thumbs = [p.image, p.image, p.image, p.image];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-3 pb-1 lg:pt-5 lg:pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href={`/category/${p.category.toLowerCase()}`}
            className="hover:text-foreground transition"
          >
            {p.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground truncate max-w-48">{p.name}</span>
        </nav>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 pt-3 pb-5 lg:py-6 grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10 xl:gap-16 animate-fade-up">
        {/* ── LEFT: Image gallery ── */}
        {/* z-30 ensures the zoom panel beats any stacking contexts created by transforms in the right column */}
        <div className="relative z-30 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-3">
            {/* Vertical thumbnails — lg+ only (reference: row below image on mobile/tablet) */}
            <div className="hidden lg:flex flex-col gap-2 w-[72px] shrink-0 order-2 lg:order-1">
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

            {/* Main image + horizontal strip */}
            <div className="flex-1 relative min-w-0 order-1 lg:order-2">
              <div
                ref={imgRef}
                onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
                onMouseLeave={() => setZoom({ active: false, x: 0, y: 0 })}
                onMouseMove={handleMove}
                className="relative aspect-square rounded-2xl bg-secondary overflow-hidden border lg:cursor-crosshair"
              >
                {/* Base image */}
                <img
                  src={thumbs[thumb]}
                  alt={p.name}
                  className="size-full object-cover transition duration-500"
                />

                {/* Rectangular zoom lens — desktop only, follows the cursor */}
                {zoom.active && (
                  <div
                    className="hidden lg:block absolute pointer-events-none rounded-sm border border-foreground/30 bg-foreground/[0.06] backdrop-saturate-50 transition-opacity duration-150"
                    style={{
                      left: `${lensLeft}%`,
                      top: `${lensTop}%`,
                      width: `${LENS_SIZE}%`,
                      height: `${LENS_SIZE}%`,
                      boxShadow: "0 0 0 9999px oklch(0 0 0 / 0.10), 0 2px 8px oklch(0 0 0 / 0.18)",
                      zIndex: 15,
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
              </div>

              {/* ── Side-by-side magnifier panel — desktop only ──────────── */}
              {zoom.active && (
                <div
                  aria-hidden
                  className="
                    hidden lg:block absolute top-0 aspect-square pointer-events-none
                    overflow-hidden rounded-2xl border border-border bg-background
                    shadow-[0_24px_60px_-24px_oklch(0_0_0/0.25),0_8px_24px_-12px_oklch(0_0_0/0.10)]
                    animate-in fade-in duration-150
                  "
                  style={{
                    left: "calc(100% + 2.5rem)",
                    width: "100%",
                    backgroundImage: `url(${thumbs[thumb]})`,
                    backgroundSize: `${bgSize}%`,
                    backgroundPosition: `${bgX}% ${bgY}%`,
                    backgroundRepeat: "no-repeat",
                    zIndex: 30,
                  }}
                />
              )}

              {/* Horizontal thumbnails — tablet & mobile (under main image) */}
              <div className="lg:hidden flex justify-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-0.5 pt-1">
                {thumbs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setThumb(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`shrink-0 size-16 sm:size-[72px] rounded-lg sm:rounded-xl overflow-hidden bg-secondary transition-all duration-200 border-2 ${
                      i === thumb
                        ? "border-foreground shadow-sm"
                        : "border-transparent opacity-80 hover:opacity-100 hover:border-border active:scale-[0.97]"
                    }`}
                  >
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Product info ── */}
        {/* z-10 keeps any locally-stacked elements (transforms, scales) BELOW the zoom panel */}
        <div className="relative z-10 mt-2 lg:mt-0 flex flex-col">
          {/* Category + brand */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {p.category}
            </span>
            <span className="text-border">·</span>
            <span className="text-[11px] font-medium text-muted-foreground">{p.brand}</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <BadgeCheck className="size-3.5" strokeWidth={2.25} /> In stock
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-2 text-[22px] leading-[1.2] font-bold tracking-tight sm:text-[26px] sm:leading-[1.2] lg:text-[30px] lg:leading-tight">
            {p.name}
          </h1>

          {/* Rating row — reference: stars + (reviews); share/heart right */}
          <div className="mt-3 flex items-center gap-x-2 gap-y-2 flex-wrap sm:gap-x-2.5">
            <StarsRow rating={avg} />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {avg.toFixed(1)}
            </span>
            <button
              type="button"
              onClick={() => setTab("reviews")}
              className="text-[13px] text-muted-foreground hover:text-foreground transition"
            >
              ({productReviews.length} {productReviews.length === 1 ? "review" : "reviews"})
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={share}
                aria-label="Share"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:border-foreground hover:bg-secondary/60 hover:text-foreground active:scale-95"
              >
                <Share2 className="size-4" strokeWidth={2} />
              </button>
              {/* <button
                type="button"
                onClick={handleCompare}
                aria-label={inCompare ? "Remove from compare" : "Add to compare"}
                aria-pressed={inCompare}
                className={`inline-flex size-9 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
                  inCompare
                    ? "border-foreground/40 bg-secondary text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <ArrowLeftRight className="size-4" strokeWidth={2} />
              </button> */}
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(p.id);
                  toast(liked ? "Removed from wishlist" : "Saved to wishlist");
                }}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={liked}
                className={`inline-flex size-9 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
                  liked
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:border-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Heart
                  className={`size-4 transition-transform ${liked ? "fill-current scale-110" : ""}`}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Sold + SKU — reference strip */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] sm:text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Zap className="size-3.5 shrink-0 text-accent" fill="currentColor" />
              18 sold in last 32 hours
            </span>
            <span className="text-border">|</span>
            <span>SKU: {pseudoSku(p.id)}</span>
          </div>

          {/* Price */}
          <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <Price
              amount={p.price}
              size="xl"
              tone="inherit"
              className="text-accent !font-black !tracking-tight !text-[26px] sm:!text-[28px] lg:!text-[32px]"
            />
            {p.oldPrice && <Price amount={p.oldPrice} size="md" muted struck />}
            {discount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] sm:text-xs font-bold uppercase tracking-wide bg-red-50 text-red-600 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            Made with care for everyday wear. Quality materials and a flattering fit — part of our
            commitment to better basics for Bangladesh.
          </p>

          {/* Social proof */}
          <p className="mt-3 inline-flex items-center gap-2 text-[12px] sm:text-[13px] text-muted-foreground">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground text-background">
              <Eye className="size-4" strokeWidth={2.25} />
            </span>
            <span>
              <span className="font-semibold text-foreground">{viewersNow(p.id)}</span> people are
              viewing this right now.
            </span>
          </p>

          <div className="my-5 h-px w-full bg-border/80 lg:my-6" />

          {/* Colors — square image swatches like reference */}
          <div>
            <p className="mb-3 text-sm font-medium text-foreground sm:text-[15px]">
              <span className="font-semibold">Colors:</span>{" "}
              <span className="text-muted-foreground">
                {colorLabelFromHex(p.colors[color] ?? "#ccc")}
              </span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {p.colors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setColor(i)}
                  aria-label={`Color ${colorLabelFromHex(c)}`}
                  aria-pressed={color === i}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-secondary/60 p-1 transition-all duration-200 active:scale-[0.98] sm:size-[4.5rem] ${
                    color === i ? "border-foreground" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <span className="relative block size-full overflow-hidden rounded-md bg-white">
                    <img src={p.image} alt="" className="absolute inset-0 size-full object-cover" />
                    <span
                      className="absolute inset-0 mix-blend-multiply opacity-85"
                      style={{ backgroundColor: c }}
                      aria-hidden
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-5 pt-5 border-t border-border/60 lg:border-t-0 lg:pt-0">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium sm:text-[15px]">
                <span className="font-semibold text-foreground">Size:</span>{" "}
                <span className="text-muted-foreground">{size}</span>
              </p>
              <button
                type="button"
                className="text-xs font-medium text-accent underline underline-offset-2 sm:text-[13px]"
              >
                <span className="inline-flex items-center gap-1">
                  <Ruler className="size-3.5" strokeWidth={2} /> Size guide
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] sm:min-h-12 sm:min-w-12 ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart (same row at sm+) + Buy now full width — reference */}
          <div className="mt-5 space-y-3 pt-5 border-t border-border/60 lg:border-t-0 lg:pt-0">
            <p className="text-sm font-semibold text-foreground">Quantity:</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-12 w-full items-center justify-between rounded-full border border-border bg-secondary/40 px-1.5 sm:w-44 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-200 active:scale-[0.98] sm:flex-1 ${
                  added
                    ? "bg-emerald-500 text-white"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {added ? (
                  <>
                    <Check className="mr-1.5 size-4" strokeWidth={2.5} /> Added
                  </>
                ) : (
                  "Add to cart"
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={buyNow}
              className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-md transition-all duration-200 hover:opacity-92 active:scale-[0.98]"
            >
              Buy it now
            </button>
          </div>

          {/* Utility links — 2×2 reference */}
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:text-sm">
            <button
              type="button"
              onClick={() => handleCompare()}
              className="flex items-center gap-2 text-left font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeftRight className="size-4 shrink-0 text-foreground/70" strokeWidth={2} />
              Compare
            </button>
            <button
              type="button"
              onClick={() => setTab("reviews")}
              className="flex items-center gap-2 text-left font-medium text-muted-foreground transition hover:text-foreground"
            >
              <HelpCircle className="size-4 shrink-0 text-foreground/70" strokeWidth={2} />
              Ask a question
            </button>
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
              <Ruler className="size-4 shrink-0 text-foreground/70" strokeWidth={2} />
              Size guide
            </span>
            <button
              type="button"
              onClick={share}
              className="flex items-center gap-2 text-left font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Share2 className="size-4 shrink-0 text-foreground/70" strokeWidth={2} />
              Share
            </button>
          </div>

          {/* Delivery & returns — reference */}
          <div className="mt-6 space-y-4 rounded-xl border border-border/70 bg-secondary/20 p-4 sm:p-5">
            <p className="flex gap-3 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
              <Clock className="mt-0.5 size-4 shrink-0 text-foreground" strokeWidth={2} />
              <span>
                <span className="font-semibold text-foreground">Estimated delivery:</span> 3–6 days
                (Dhaka metro), 5–10 days (nationwide).
              </span>
            </p>
            <p className="flex gap-3 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
              <RotateCcw className="mt-0.5 size-4 shrink-0 text-foreground" strokeWidth={2} />
              <span>
                Return within <span className="font-semibold text-foreground">7 days</span> of
                delivery. Items must be unworn with tags.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Customer Reviews / Shipping ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          {/* Tab header — text + thick underline (reference) */}
          <div className="flex border-b border-border/70 bg-background overflow-x-auto no-scrollbar">
            {[
              { id: "desc" as const, label: "Description" },
              { id: "reviews" as const, label: "Customer Reviews" },
              { id: "shipping" as const, label: "Shipping & returns" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTab(m.id)}
                className={`relative flex-1 min-w-[8rem] px-4 py-3.5 text-center text-sm font-semibold whitespace-nowrap transition-colors sm:px-6 sm:py-4 sm:text-[15px] ${
                  tab === m.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {m.label}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-[3px] rounded-full transition-opacity sm:left-4 sm:right-4 ${
                    tab === m.id ? "bg-foreground opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-4 py-6 sm:px-8 sm:py-8 animate-fade-in">
            {tab === "desc" && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {p.name}
                </h2>
                <p className="mt-4 text-[13px] leading-[1.7] text-muted-foreground sm:text-sm">
                  Designed for everyday comfort and a flattering silhouette. Soft fabric with a
                  clean finish — easy to dress up or down for work, weekends, and everything in
                  between.
                </p>
                <p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground sm:text-sm">
                  Breathable weave. Easy care. Thoughtful stitching. A wardrobe staple you will
                  reach for again and again.
                </p>

                <h3 className="mt-8 text-base font-bold text-foreground sm:text-lg">
                  Composition, origin and care
                </h3>
                <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {[
                    "Composition: 95% cotton, 5% elastane (varies by style)",
                    "Designed in Dhaka",
                    "Origin: Bangladesh",
                    "Machine wash cold with like colours. Do not bleach. Line dry or tumble dry low.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="shrink-0 font-medium text-foreground">-</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-8 text-base font-bold text-foreground sm:text-lg">
                  Specifications
                </h3>
                <dl className="mt-4 space-y-2 border-t border-border/60 pt-2 text-[13px] sm:text-sm">
                  {[
                    ["Category", p.category],
                    ["Brand", p.brand],
                    ["Sizes", p.sizes.join(", ")],
                    ["Colours", `${p.colors.length} options`],
                    ["Material", "Premium fabric blend"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-4 border-b border-border/40 py-2.5 last:border-0"
                    >
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
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
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
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
              <div className="max-w-4xl">
                {/* Summary left + histogram right (reference layout) */}
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10 lg:gap-14">
                  <div className="shrink-0 text-left md:pt-1">
                    <p className="text-5xl font-black tabular-nums tracking-tight text-foreground sm:text-6xl">
                      {avg.toFixed(1)}
                    </p>
                    <div className="mt-2 flex justify-start">
                      <StarsRow rating={avg} size="lg" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      ({productReviews.length.toLocaleString()}{" "}
                      {productReviews.length === 1 ? "Rating" : "Ratings"})
                    </p>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2.5 md:max-w-md lg:max-w-lg">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = productReviews.filter((r) => Math.round(r.rating) === n).length;
                      const pct = productReviews.length
                        ? Math.round((count / productReviews.length) * 100)
                        : n === 5
                          ? 60
                          : n === 4
                            ? 20
                            : n === 3
                              ? 10
                              : n === 2
                                ? 7
                                : 3;
                      return (
                        <div key={n} className="flex items-center gap-2.5 text-sm sm:gap-3">
                          <span className="w-3 shrink-0 text-right font-medium tabular-nums text-muted-foreground">
                            {n}
                          </span>
                          <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400 sm:size-4" />
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-border/80">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:text-sm">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form
                  id="write-review-form"
                  onSubmit={submitReview}
                  className="mt-8 rounded-xl border border-border/80 bg-secondary/20 p-4 sm:p-5"
                >
                  <p className="font-semibold text-foreground">Write a review</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setRating(n)}
                        className="rounded p-0.5 transition hover:scale-110"
                      >
                        <Star
                          className={`size-6 sm:size-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "fill-border text-border"}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground sm:text-sm">
                      {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                    </span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Share your experience with this product..."
                    className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none transition focus:border-foreground"
                  />
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      {user ? `Posting as ${user.name}` : "Posting as Guest"}
                    </p>
                    <button
                      type="submit"
                      className="h-11 w-full rounded-full bg-foreground text-sm font-bold text-background transition hover:opacity-90 sm:w-auto sm:px-8"
                    >
                      Write a review
                    </button>
                  </div>
                </form>

                <div
                  id="reviews-list"
                  className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {String(productReviews.length).padStart(2, "0")} Comments
                  </p>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <span className="shrink-0">Sort by:</span>
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value as typeof reviewSort)}
                      className="h-9 min-w-[10.5rem] rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground outline-none focus:border-foreground"
                    >
                      <option value="recent">Most recent</option>
                      <option value="oldest">Oldest</option>
                      <option value="high">Highest rating</option>
                      <option value="low">Lowest rating</option>
                    </select>
                  </label>
                </div>

                {productReviews.length === 0 ? (
                  <div className="mt-8 text-left text-muted-foreground">
                    <MessageSquare className="mb-3 size-10 opacity-30" />
                    <p className="font-medium text-foreground">No reviews yet</p>
                    <p className="mt-1 text-sm">Be the first to review this product</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {sortedReviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl border border-border/70 bg-background p-4 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                              {r.user.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{r.user}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(r.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <StarsRow rating={r.rating} />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {r.text}
                        </p>
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
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              More to explore
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">You may also like</h2>
          </div>
          <Link
            href={`/category/${p.category.toLowerCase()}`}
            className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            View all <ChevronDown className="size-4 -rotate-90" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 snap-x snap-mandatory pb-1">
            {related.map((rp) => (
              <div key={rp.id} className="snap-start shrink-0 w-[52vw]">
                <ProductCard p={rp} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
          {related.map((rp) => (
            <ProductCard key={rp.id} p={rp} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default ProductPage;
