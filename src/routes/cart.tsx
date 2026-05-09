import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { useStore } from "@/lib/store";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, ShieldCheck, RotateCcw, Tag, Sparkles, Heart, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/cart")({ component: CartPage });

const FREE_SHIP_THRESHOLD = 1500;

function CartPage() {
  const { cart, resolveProduct, setQty, removeFromCart, cartSubtotal, clearCart, toggleWishlist } = useStore();
  const items = cart.map((it) => ({ ...it, p: resolveProduct(it.id)! })).filter((x) => x.p);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = cartSubtotal > FREE_SHIP_THRESHOLD || items.length === 0 ? 0 : 80;
  const total = Math.max(0, cartSubtotal - discount + shipping);
  const progress = Math.min(100, (cartSubtotal / FREE_SHIP_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - cartSubtotal);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (code === "SHOPBD10") { setDiscount(Math.round(cartSubtotal * 0.1)); toast.success("Coupon applied · 10% off"); }
    else if (code === "WELCOME") { setDiscount(200); toast.success("Coupon applied · ৳200 off"); }
    else { setDiscount(0); toast.error("Invalid coupon"); }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center animate-fade-up">
          <div className="relative mx-auto size-28 mb-6">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-2xl" />
            <div className="relative size-28 rounded-full bg-gradient-to-br from-secondary to-background border flex items-center justify-center">
              <ShoppingBag className="size-12" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your cart is empty</h1>
          <p className="mt-3 text-muted-foreground">Add a few favourites and we'll get them on the way.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-8 h-12 px-7 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 group">
            Continue shopping <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        centered
        title="Shopping Cart"
        subtitle="Review your items, apply coupons, and proceed to a fast and secure checkout."
        crumbs={[{ label: "Home", to: "/" }, { label: "Cart" }]}
        actions={
          <button onClick={() => { clearCart(); toast("Cart cleared"); }} className="h-9 px-4 rounded-full border text-xs text-muted-foreground hover:border-accent hover:text-accent transition">
            Clear all
          </button>
        }
      />

      {/* Free shipping progress */}
      <div className="mx-auto max-w-4xl px-4 pt-5">
        <div className="rounded-2xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="size-4 text-accent shrink-0" />
            {shipping === 0 ? (
              <span className="font-medium">You've unlocked <span className="text-accent">free shipping</span> 🎉</span>
            ) : (
              <span>Add <span className="font-semibold text-foreground tabular-nums">৳{remaining.toLocaleString()}</span> more for <span className="text-accent font-medium">free shipping</span></span>
            )}
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-accent transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-5 space-y-3 animate-fade-up">
        {/* Items */}
        {items.map((it, i) => (
          <article
            key={it.id + (it.size ?? "")}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group rounded-2xl border bg-card p-3 sm:p-4 transition animate-fade-up"
          >
            <div className="flex gap-3 sm:gap-4">
              {/* Image */}
              <Link to="/product/$id" params={{ id: it.id }} className="size-20 sm:size-24 rounded-xl bg-secondary overflow-hidden shrink-0">
                <img src={it.p.image} alt={it.p.name} className="size-full object-cover group-hover:scale-105 transition duration-500" />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Top row: name + price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.p.category}</p>
                    <Link to="/product/$id" params={{ id: it.id }} className="text-sm font-semibold mt-0.5 block line-clamp-1 hover:text-accent transition">{it.p.name}</Link>
                    {it.size && <p className="text-xs text-muted-foreground mt-0.5">Size · <span className="text-foreground">{it.size}</span></p>}
                  </div>
                  <p className="text-sm font-bold tabular-nums whitespace-nowrap shrink-0">৳{(it.p.price * it.qty).toLocaleString()}</p>
                </div>

                {/* Bottom row: qty stepper + actions */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center h-8 rounded-full border bg-background">
                    <button onClick={() => setQty(it.id, it.qty - 1)} className="size-8 flex items-center justify-center hover:bg-secondary rounded-l-full transition" aria-label="Decrease"><Minus className="size-3" /></button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">{it.qty}</span>
                    <button onClick={() => setQty(it.id, it.qty + 1)} className="size-8 flex items-center justify-center hover:bg-secondary rounded-r-full transition" aria-label="Increase"><Plus className="size-3" /></button>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <button onClick={() => { toggleWishlist(it.id); removeFromCart(it.id); toast("Saved for later"); }} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-secondary hover:text-foreground transition">
                      <Heart className="size-3.5" /> <span className="hidden sm:inline">Save</span>
                    </button>
                    <button onClick={() => { removeFromCart(it.id); toast("Item removed"); }} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-secondary hover:text-accent transition">
                      <X className="size-3.5" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowRight className="size-3.5 rotate-180" /> Continue shopping
        </Link>

        {/* Order Summary */}
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <p className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="size-4 text-accent" /> Order summary</p>

          {/* Coupon */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="w-full h-11 pl-10 pr-3 rounded-xl border bg-background text-sm uppercase tracking-wide outline-none focus:border-foreground transition"
              />
            </div>
            <button onClick={applyCoupon} className="h-11 px-4 rounded-xl border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition shrink-0">Apply</button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Try{" "}
            <button onClick={() => setCoupon("SHOPBD10")} className="font-mono text-foreground hover:text-accent">SHOPBD10</button>
            {" "}or{" "}
            <button onClick={() => setCoupon("WELCOME")} className="font-mono text-foreground hover:text-accent">WELCOME</button>
          </p>

          <div className="border-t my-4" />

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">৳{cartSubtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-accent"><span>Discount</span><span className="tabular-nums">-৳{discount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-accent font-medium" : ""}>{shipping === 0 ? "Free 🎉" : `৳${shipping}`}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span className="text-muted-foreground">Included</span></div>
          </div>

          <div className="border-t my-4" />

          <div className="flex justify-between items-baseline mb-4">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-bold tabular-nums">৳{total.toLocaleString()}</span>
          </div>

          <Link to="/checkout" className="flex items-center justify-center gap-2 h-13 rounded-2xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition group shadow-sm">
            <Lock className="size-4" /> Proceed to checkout · ৳{total.toLocaleString()}
          </Link>
          <p className="mt-3 text-xs text-muted-foreground text-center">Cash on Delivery · bKash · Card · SSLCommerz</p>

          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-3 text-center">
            {[
              { icon: ShieldCheck, label: "Secure" },
              { icon: RotateCcw, label: "7-day return" },
              { icon: Truck, label: "Fast delivery" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                <Icon className="size-4" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
