import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { cart, resolveProduct, setQty, removeFromCart, cartSubtotal, clearCart } = useStore();
  const items = cart.map((it) => ({ ...it, p: resolveProduct(it.id)! })).filter((x) => x.p);
  const shipping = cartSubtotal > 1500 || items.length === 0 ? 0 : 80;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-fade-up">
          <div className="mx-auto size-20 rounded-full bg-secondary flex items-center justify-center"><ShoppingBag className="size-8 text-muted-foreground" /></div>
          <h1 className="mt-5 text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Looks like you haven't added anything yet.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">Start shopping <ArrowRight className="size-4" /></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-up">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your cart</h1>
            <p className="text-sm text-muted-foreground mt-1">{items.length} {items.length === 1 ? "item" : "items"}</p>
          </div>
          <button onClick={() => { clearCart(); toast("Cart cleared"); }} className="text-xs text-muted-foreground hover:text-accent">Clear all</button>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <div key={it.id + (it.size ?? "")} className="flex gap-4 rounded-2xl border p-4 hover-lift">
                <Link to="/product/$id" params={{ id: it.id }} className="size-24 rounded-xl bg-secondary overflow-hidden shrink-0">
                  <img src={it.p.image} alt={it.p.name} className="size-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase text-muted-foreground tracking-wider">{it.p.category}</p>
                      <Link to="/product/$id" params={{ id: it.id }} className="font-medium mt-0.5 block truncate hover:text-accent">{it.p.name}</Link>
                      {it.size && <p className="text-xs text-muted-foreground mt-1">Size {it.size}</p>}
                    </div>
                    <button onClick={() => { removeFromCart(it.id); toast("Item removed"); }} className="text-muted-foreground hover:text-accent transition"><X className="size-4" /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center h-9 rounded-full border">
                      <button onClick={() => setQty(it.id, it.qty - 1)} className="size-9 flex items-center justify-center"><Minus className="size-3.5" /></button>
                      <span className="w-7 text-center text-sm tabular-nums">{it.qty}</span>
                      <button onClick={() => setQty(it.id, it.qty + 1)} className="size-9 flex items-center justify-center"><Plus className="size-3.5" /></button>
                    </div>
                    <p className="font-semibold tabular-nums">৳{(it.p.price * it.qty).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border p-6 h-fit lg:sticky lg:top-32">
            <p className="font-medium mb-4">Order summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">৳{cartSubtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>Included</span></div>
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span className="tabular-nums">৳{(cartSubtotal + shipping).toLocaleString()}</span></div>
            <Link to="/checkout" className="mt-5 flex items-center justify-center gap-2 h-12 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition">Checkout <ArrowRight className="size-4" /></Link>
            <p className="mt-3 text-xs text-muted-foreground text-center">Cash on Delivery available</p>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
