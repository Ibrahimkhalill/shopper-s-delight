import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { getProduct, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { ChevronRight, Heart, Truck, RotateCcw, ShieldCheck, Minus, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => <Layout><div className="p-20 text-center">Product not found</div></Layout>,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = getProduct(id);
  const [size, setSize] = useState(p?.sizes[0]);
  const [qty, setQty] = useState(1);
  if (!p) return <Layout><div className="p-20 text-center">Product not found</div></Layout>;
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-5">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <span>{p.category}</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{p.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 grid lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-secondary overflow-hidden">
            <img src={p.image} alt={p.name} className="size-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[p.image, p.image, p.image, p.image].map((img, i) => (
              <div key={i} className={`aspect-square rounded-xl bg-secondary overflow-hidden border ${i === 0 ? "border-foreground" : "border-border"}`}>
                <img src={img} alt="" className="size-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-amber-500">★★★★☆</span>
            <span className="text-muted-foreground">128 reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">৳{p.price.toLocaleString()}</span>
            {p.oldPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">৳{p.oldPrice.toLocaleString()}</span>
                <span className="text-xs font-medium bg-accent text-accent-foreground rounded-full px-2 py-0.5">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            Premium quality {p.name.toLowerCase()} crafted with attention to detail. Soft, durable, and made for everyday wear in Bangladesh's climate.
          </p>

          {/* Color */}
          <div className="mt-7">
            <p className="text-sm font-medium mb-2.5">Color</p>
            <div className="flex items-center gap-2">
              {p.colors.map((c, i) => (
                <button key={i} className="size-8 rounded-full ring-1 ring-border hover:ring-foreground" style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-2.5">Size</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 h-11 px-4 rounded-full border text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Qty + CTAs */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex items-center h-12 rounded-full border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-12 flex items-center justify-center"><Minus className="size-4" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="size-12 flex items-center justify-center"><Plus className="size-4" /></button>
            </div>
            <button className="flex-1 h-12 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">Add to cart</button>
            <button className="size-12 rounded-full border flex items-center justify-center hover:border-foreground"><Heart className="size-5" /></button>
          </div>

          <Link to="/cart" className="mt-3 block w-full h-12 rounded-full bg-foreground text-background text-sm font-medium leading-[3rem] text-center">Buy now</Link>

          {/* Trust */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            {[
              { i: Truck, t: "Free delivery", s: "Over ৳1,500" },
              { i: RotateCcw, t: "7-day returns", s: "Easy refund" },
              { i: ShieldCheck, t: "Cash on delivery", s: "Pay at door" },
            ].map(({ i: Icon, t, s }) => (
              <div key={t} className="rounded-xl border p-3">
                <Icon className="size-4 mb-2" />
                <p className="font-medium text-foreground">{t}</p>
                <p className="text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">You may also like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRODUCTS.filter((x) => x.id !== p.id).slice(0, 5).map((x) => <ProductCard key={x.id} p={x} />)}
        </div>
      </section>
    </Layout>
  );
}