"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import TakaSvg from "@/assets/TakaSvg";
import { MapPin, Phone, Mail, ChevronLeft, Truck, ShoppingBag, Receipt } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";

function Price({ amount, className }: { amount: number | string; className?: string }) {
  const num = typeof amount === "number" ? amount.toLocaleString() : amount;
  return (
    <span className={`inline-flex items-baseline gap-px ${className ?? ""}`}>
      <span className="text-[0.82em] font-bold leading-none translate-y-px"><TakaSvg /></span>
      <span>{num}</span>
    </span>
  );
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  placed:    { label: "Order Placed",  cls: "bg-accent text-white" },
  packed:    { label: "Packed",        cls: "bg-foreground text-background" },
  shipped:   { label: "Delivering",   cls: "bg-foreground text-background" },
  delivered: { label: "Delivered",    cls: "bg-black text-white" },
  cancelled: { label: "Cancelled",    cls: "bg-border text-foreground" },
};

function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const { orders, resolveProduct } = useStore();
  const order = orders.find((o) => o.id === id);

  const createdDate = order
    ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  if (!order) {
    return (
      <Layout hideTrust>
        <PageHeader
          centered
          color="oklch(0.96 0 0)"
          title="Order Details"
          crumbs={[{ label: "Home", to: "/" }, { label: "Account", to: "/profile" }, { label: "Order" }]}
        />
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <Receipt className="size-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="font-bold text-base">Order not found</p>
          <p className="text-sm text-muted-foreground">This order doesn&apos;t exist or may have been removed.</p>
          <Link href="/profile" className="mt-2 h-10 px-6 rounded-full bg-black text-white text-sm font-semibold inline-flex items-center hover:bg-accent transition">
            Back to Account
          </Link>
        </div>
      </Layout>
    );
  }

  const subtotal = order.items.reduce((sum, it) => {
    const p = resolveProduct(it.id);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);

  const shippingCost = order.shippingCost ?? (order.total - subtotal + (order.discount ?? 0));
  const discount = order.discount ?? 0;
  const meta = STATUS_META[order.status] ?? STATUS_META.placed;

  return (
    <Layout hideTrust>
      <PageHeader
        centered
        color="oklch(0.96 0 0)"
        title="Order Details"
        subtitle="Complete breakdown of your order including items, charges, and delivery info."
        crumbs={[{ label: "Home", to: "/" }, { label: "Account", to: "/profile" }, { label: "Order Details" }]}
      />

      <div className="bg-secondary/20 min-h-screen pb-16">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">

          {/* Back + Track links */}
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <ChevronLeft className="size-4" /> My Account
            </Link>
            <Link
              href={`/order/${id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition"
            >
              <Truck className="size-4" /> Track Order
            </Link>
          </div>

          {/* Order meta card */}
          <div className="bg-card rounded-2xl border shadow-sm p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Order ID</p>
                <p className="font-mono font-bold text-base">#{id.slice(0, 12).toUpperCase()}</p>
              </div>
              <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${meta.cls}`}>
                {meta.label}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Order Date</p>
                <p className="text-sm font-semibold">{createdDate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Payment</p>
                <p className="text-sm font-semibold uppercase">{order.payment}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Items</p>
                <p className="text-sm font-semibold">{order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <h3 className="font-bold text-base">Items Ordered</h3>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <Link
                    key={it.id}
                    href={`/product/${it.id}`}
                    className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 bg-secondary rounded-xl overflow-hidden shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-snug line-clamp-2">{p.name}</p>
                      {it.size && <p className="text-xs text-muted-foreground mt-0.5">Size: {it.size}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Price amount={p.price} className="inline" /> × {it.qty}
                      </p>
                    </div>
                    <Price amount={p.price * it.qty} className="font-extrabold text-sm shrink-0" />
                  </Link>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="px-5 sm:px-6 py-5 border-t border-border bg-secondary/20 space-y-2.5">
              <h4 className="text-sm font-bold mb-3">Order Summary</h4>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({order.items.length} items)</span>
                <Price amount={subtotal} className="font-semibold" />
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-accent">
                  <span>Discount</span>
                  <span className="font-semibold flex items-baseline gap-0.5">
                    <span>−</span>
                    <Price amount={discount} className="font-semibold" />
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-semibold">
                  {shippingCost === 0
                    ? <span className="text-green-600">Free</span>
                    : <Price amount={shippingCost} />}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold pt-3 border-t border-border">
                <span>Total</span>
                <Price amount={order.total} />
              </div>

              <div className="flex justify-between text-sm pt-3 border-t border-border">
                <span className="text-muted-foreground">
                  {order.payment === "cod" ? "Amount Due (COD)" : "Amount Paid"}
                </span>
                <Price
                  amount={order.total}
                  className={`font-semibold ${order.payment === "cod" ? "text-accent" : "text-green-600"}`}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card rounded-2xl border shadow-sm p-5 sm:p-6">
            <h3 className="font-bold text-base mb-4">Delivery Address</h3>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm">{order.name}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{order.address}</p>
                <div className="flex flex-col gap-1.5 mt-3 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-muted-foreground shrink-0" />
                    {order.phone}
                  </div>
                  {order.email && (
                    <div className="flex items-center gap-2 font-medium text-muted-foreground">
                      <Mail size={13} className="shrink-0" />
                      <a href={`mailto:${order.email}`} className="hover:text-foreground hover:underline truncate">
                        {order.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/order/${id}`}
              className="h-12 flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:border-foreground transition"
            >
              <Truck size={15} /> Track Order
            </Link>
            <Link
              href="/"
              className="h-12 flex items-center justify-center gap-2 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-80 transition"
            >
              <ShoppingBag size={15} /> Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default OrderDetailsPage;
