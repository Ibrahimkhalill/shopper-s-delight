import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PRODUCTS } from "@/lib/products";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const [items, setItems] = useState(
    PRODUCTS.slice(0, 3).map((p) => ({ ...p, qty: 1 }))
  );
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 1500 ? 0 : 80;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your cart</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} items</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((it, idx) => (
              <div key={it.id} className="flex gap-4 rounded-2xl border p-4">
                <div className="size-24 rounded-xl bg-secondary overflow-hidden shrink-0">
                  <img src={it.image} alt={it.name} className="size-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground tracking-wider">{it.category}</p>
                      <p className="font-medium mt-0.5">{it.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Size {it.sizes[0]}</p>
                    </div>
                    <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center h-9 rounded-full border">
                      <button onClick={() => setItems(items.map((x, i) => i === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="size-9 flex items-center justify-center"><Minus className="size-3.5" /></button>
                      <span className="w-7 text-center text-sm">{it.qty}</span>
                      <button onClick={() => setItems(items.map((x, i) => i === idx ? { ...x, qty: x.qty + 1 } : x))} className="size-9 flex items-center justify-center"><Plus className="size-3.5" /></button>
                    </div>
                    <p className="font-semibold">৳{(it.price * it.qty).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border p-6 h-fit lg:sticky lg:top-32">
            <p className="font-medium mb-4">Order summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>Included</span></div>
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-semibold"><span>Total</span><span>৳{(subtotal + shipping).toLocaleString()}</span></div>
            <Link to="/checkout" className="mt-5 block text-center h-12 leading-[3rem] rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">Checkout</Link>
            <p className="mt-3 text-xs text-muted-foreground text-center">Cash on Delivery available</p>
          </aside>
        </div>
      </div>
    </Layout>
  );
}