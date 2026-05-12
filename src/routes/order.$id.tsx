import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import TakaSvg from "@/assets/TakaSvg";
import {
  Check, Package, Truck, Home, ShoppingBag,
  MapPin, Phone, ChevronLeft,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

function Price({ amount, className }: { amount: number | string; className?: string }) {
  const num = typeof amount === "number" ? amount.toLocaleString() : amount;
  return (
    <span className={`inline-flex items-baseline gap-[1px] ${className ?? ""}`}>
      <span className="text-[0.82em] font-bold leading-none translate-y-px"><TakaSvg /></span>
      <span>{num}</span>
    </span>
  );
}

const STATUSES = ["placed", "packed", "shipped", "delivered"] as const;

const TIMELINE_STEPS = [
  { icon: Check,       label: "Order Placed",       key: "placed" },
  { icon: Check,       label: "Address Confirmed",   key: "placed" },
  { icon: Check,       label: "Confirmed",           key: "placed" },
  { icon: Package,     label: "Packed",              key: "packed" },
  { icon: Truck,       label: "Out for Delivery",    key: "shipped" },
  { icon: Home,        label: "Delivered",           key: "delivered" },
];

const STATUS_LABEL: Record<string, string> = {
  placed:    "Order Placed",
  packed:    "Packed",
  shipped:   "Delivering",
  delivered: "Delivered",
};

function OrderPage() {
  const { id } = Route.useParams();
  const { orders, resolveProduct } = useStore();
  const order = orders.find((o) => o.id === id);
  const stepIdx = order ? STATUSES.indexOf(order.status) : 0;

  // Map status → how many timeline steps are "done"
  const doneCount = { placed: 3, packed: 4, shipped: 5, delivered: 6 }[order?.status ?? "placed"] ?? 3;

  const createdDate = order
    ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <Layout hideTrust>
      {/* ── Header ──────────────────────────────────────────────────── */}
        <PageHeader
            centered
            title="Order Tracking"
            subtitle="Review your selected items, update quantities, and get ready for a smooth and
   easy checkout experience."
            crumbs={[{ label: "Home", to: "/" }, { label: "order" }]}
          />

      <div className="bg-secondary/20 min-h-screen pb-12">
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">

          {/* ── Order Summary Card ───────────────────────────────────── */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            {/* Status row */}
            

            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {([
                { label: "Order ID",     value: `#${id.slice(0, 8).toUpperCase()}` },
                { label: "Order Date",   value: createdDate },
                { label: "Total Amount", value: order ? <Price amount={order.total} /> : "—" },
                { label: "Status",       value: STATUS_LABEL[order?.status ?? "placed"] },
              ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{label}</p>
                  <p className="font-bold text-base capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Two-column: Timeline + Items/Address ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* Timeline */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-bold mb-6">Timeline</h3>
              <div className="flex flex-col">
                {TIMELINE_STEPS.map((step, i) => {
                  const done    = i < doneCount;
                  const active  = i === doneCount - 1;
                  const future  = i >= doneCount;
                  const isLast  = i === TIMELINE_STEPS.length - 1;
                  const Icon    = step.icon;

                  return (
                    <div key={i} className={`flex gap-4 ${isLast ? "min-h-10" : "min-h-18"} ${future ? "opacity-40" : ""}`}>
                      {/* Dot + line */}
                      <div className="flex flex-col items-center">
                        {active ? (
                          <div className="relative w-11 h-11 -ml-0.5 rounded-full bg-foreground text-background flex items-center justify-center z-10 shadow-lg shrink-0">
                            <Icon size={18} />
                            <span className="absolute -right-0.5 -top-0.5 w-3 h-3 bg-foreground border-2 border-background rounded-full animate-pulse" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${done ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"}`}>
                            {done ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
                          </div>
                        )}
                        {!isLast && (
                          <div className={`w-0.5 flex-1 -my-0.5 ${done && !active ? "bg-green-500" : "bg-border"} ${future ? "opacity-40" : ""}`} />
                        )}
                      </div>

                      {/* Label */}
                      <div className={`pb-6 ${active ? "pl-1" : ""}`}>
                        <h4 className={`font-bold ${active ? "text-base" : "text-sm"}`}>{step.label}</h4>
                        {active && (
                          <p className="text-xs text-muted-foreground mt-0.5">{createdDate}</p>
                        )}
                        {future && step.key === "delivered" && (
                          <p className="text-xs mt-0.5">Estimated soon</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column: Items + Address */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Items list */}
              <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-bold">Items ({order?.items.length ?? 0})</h3>
                  
                </div>
                <div className="divide-y divide-border">
                  {order ? order.items.map((it) => {
                    const p = resolveProduct(it.id);
                    if (!p) return null;
                    return (
                      <Link
                        key={it.id}
                        to="/product/$id"
                        params={{ id: it.id }}
                        className="flex items-center gap-5 p-5 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="w-20 h-20 bg-secondary rounded-lg overflow-hidden shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-snug line-clamp-2">{p.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-baseline gap-1"><Price amount={p.price} /> × {it.qty}</p>
                        </div>
                        <Price amount={p.price * it.qty} className="font-extrabold text-base shrink-0" />
                      </Link>
                    );
                  }) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">Order not found</div>
                  )}
                </div>

                {/* Order Summary */}
                {order && (() => {
                  const subtotal = order.items.reduce((sum, it) => {
                    const p = resolveProduct(it.id);
                    return sum + (p ? p.price * it.qty : 0);
                  }, 0);
                  const shipping = order.total - subtotal;
                  return (
                    <div className="px-6 py-4 border-t border-border space-y-2">
                      <h4 className="text-sm font-bold mb-3">Order Summary</h4>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <Price amount={subtotal} className="font-medium text-foreground" />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span className="font-medium text-foreground">
                          {shipping === 0 ? <span className="text-green-600">Free</span> : <Price amount={shipping} />}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-extrabold pt-2 border-t border-border">
                        <span>Total</span>
                        <Price amount={order.total} />
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-muted-foreground">Paid Amount</span>
                        <span className="font-semibold text-green-600">
                          {order.payment === "cod" ? <Price amount={0} /> : <Price amount={order.total} />}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Amount</span>
                        <span className={`font-semibold ${order.payment === "cod" ? "text-red-500" : "text-green-600"}`}>
                          {order.payment === "cod" ? <Price amount={order.total} /> : <Price amount={0} />}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Payment info */}
                
              </div>

              {/* Shipping address */}
              {order && (
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-5">Shipping Address</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">{order.name}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{order.address}</p>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Phone size={14} />
                        {order.phone}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/track"
                  className="h-12 flex items-center justify-center rounded-md border border-border text-sm font-semibold hover:border-foreground transition"
                >
                  Track another
                </Link>
                <Link
                  to="/"
                  className="h-12 flex items-center justify-center rounded-md bg-foreground text-background text-sm font-bold hover:opacity-80 transition gap-2"
                >
                  <ShoppingBag size={15} /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
