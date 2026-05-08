import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, ShieldCheck, RotateCcw, Tag, Sparkles, Heart } from "lucide-react";
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
      {/* Header */}
      <section className="border-b bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10 animate-fade-up">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 of 3</p>
              <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">Shopping cart</h1>
              <p className="text-sm text-muted-foreground mt-1">{items.length} {items.length === 1 ? "item" : "items"} ready for checkout</p>
            </div>
            <button onClick={() => { clearCart(); toast("Cart cleared"); }} className="text-xs text-muted-foreground hover:text-accent">Clear all</button>
          </div>

          {/* Free shipping progress */}
          <div className="mt-6 rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-accent" />
              {shipping === 0 ? (
                <span className="font-medium">You've unlocked <span className="text-accent">free shipping</span> 🎉</span>
              ) : (
                <span>Add <span className="font-semibold text-foreground tabular-nums">৳{remaining.toLocaleString()}</span> more for <span className="text-accent font-medium">free shipping</span></span>
              )}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 grid lg:grid-cols-[1fr_400px] gap-8 animate-fade-up">
        {/* Items */}
        <div className="space-y-3">
          {items.map((it, i) => (
            <article
              key={it.id + (it.size ?? "")}
              style={{ animationDelay: `${i * 50}ms` }}
              className="group relative rounded-2xl border bg-card p-4 hover:shadow-md transition animate-fade-up"
            >
              <div className="flex gap-4">
                <Link to="/product/$id" params={{ id: it.id }} className="size-24 sm:size-28 rounded-xl bg-secondary overflow-hidden shrink-0">
                  <img src={it.p.image} alt={it.p.name} className="size-full object-cover group-hover:scale-105 transition duration-500" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{it.p.category}</p>
                      <Link to="/product/$id" params={{ id: it.id }} className="font-medium mt-0.5 block truncate hover:text-accent">{it.p.name}</Link>
                      {it.size && <p className="text-xs text-muted-foreground mt-1">Size · <span className="text-foreground">{it.size}</span></p>}
                    </div>
                    <p className="font-semibold tabular-nums whitespace-nowrap">৳{(it.p.price * it.qty).toLocaleString()}</p>
                  </div>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="flex items-center h-9 rounded-full border bg-background">
                      <button onClick={() => setQty(it.id, it.qty - 1)} className="size-9 flex items-center justify-center hover:bg-secondary rounded-l-full transition" aria-label="Decrease"><Minus className="size-3.5" /></button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">{it.qty}</span>
                      <button onClick={() => setQty(it.id, it.qty + 1)} className="size-9 flex items-center justify-center hover:bg-secondary rounded-r-full transition" aria-label="Increase"><Plus className="size-3.5" /></button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <button onClick={() => { toggleWishlist(it.id); removeFromCart(it.id); toast("Saved for later"); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-secondary hover:text-foreground transition"><Heart className="size-3.5" /> Save</button>
                      <button onClick={() => { removeFromCart(it.id); toast("Item removed"); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-secondary hover:text-accent transition"><X className="size-3.5" /> Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          <Link to="/" className="inline-flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="size-3.5 rotate-180" /> Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-32 h-fit space-y-4">
          <div className="rounded-2xl border bg-card p-6">
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
              <button onClick={applyCoupon} className="h-11 px-4 rounded-xl border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition">Apply</button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Try <button onClick={() => setCoupon("SHOPBD10")} className="font-mono text-foreground hover:text-accent">SHOPBD10</button> or <button onClick={() => setCoupon("WELCOME")} className="font-mono text-foreground hover:text-accent">WELCOME</button></p>

            <div className="border-t my-5" />
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">৳{cartSubtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-accent"><span>Discount</span><span className="tabular-nums">-৳{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-accent font-medium" : ""}>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span className="text-muted-foreground">Included</span></div>
            </div>
            <div className="border-t my-5" />
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-semibold tabular-nums">৳{total.toLocaleString()}</span>
            </div>

            <Link to="/checkout" className="mt-5 flex items-center justify-center gap-2 h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition group">
              Proceed to checkout <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </Link>
            <p className="mt-3 text-xs text-muted-foreground text-center">Cash on Delivery · bKash · Card</p>
          </div>

          {/* Trust */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 text-sm">
            <div className="flex items-center gap-3"><div className="size-9 rounded-full bg-secondary flex items-center justify-center"><ShieldCheck className="size-4" /></div><div><p className="font-medium">Secure checkout</p><p className="text-xs text-muted-foreground">256-bit SSL encryption</p></div></div>
            <div className="flex items-center gap-3"><div className="size-9 rounded-full bg-secondary flex items-center justify-center"><RotateCcw className="size-4" /></div><div><p className="font-medium">7-day returns</p><p className="text-xs text-muted-foreground">Hassle-free, no questions asked</p></div></div>
            <div className="flex items-center gap-3"><div className="size-9 rounded-full bg-secondary flex items-center justify-center"><Truck className="size-4" /></div><div><p className="font-medium">Fast delivery</p><p className="text-xs text-muted-foreground">1–3 days across Bangladesh</p></div></div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
