import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { Check, Package, Truck, Home, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

const STATUSES = ["placed", "packed", "shipped", "delivered"] as const;

function OrderPage() {
  const { id } = Route.useParams();
  const { orders, resolveProduct } = useStore();
  const order = orders.find((o) => o.id === id);
  const stepIdx = order ? STATUSES.indexOf(order.status) : 0;

  const steps = [
    { icon: Check,   label: "Order placed",     sub: "We've received your order" },
    { icon: Package, label: "Packed",            sub: "Your items are being packed" },
    { icon: Truck,   label: "Out for delivery",  sub: "On the way to you" },
    { icon: Home,    label: "Delivered",          sub: "Enjoy your purchase!" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Order confirmed"
        subtitle={`Order ID · ${id}`}
        crumbs={[{ label: "Home", to: "/" }, { label: "Track", to: "/track" }, { label: id }]}
        badge={
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
            <Check className="size-3" /> Payment successful
          </div>
        }
      />

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4 animate-fade-up">

        {/* Tracking steps */}
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <p className="font-semibold mb-5 flex items-center gap-2">
            <Truck className="size-4 text-accent" /> Delivery tracking
          </p>
          <ol className="space-y-4">
            {steps.map((s, i) => {
              const done = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <li key={i} className="flex items-start gap-4">
                  <div className={`size-9 rounded-full flex items-center justify-center shrink-0 transition ${done ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                    <s.icon className="size-4" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                    {active && <p className="text-xs text-accent mt-0.5 font-medium">Current status</p>}
                    {!active && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
                  </div>
                  {done && !active && <Check className="size-4 text-emerald-500 mt-1 shrink-0" />}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Items */}
        {order && (
          <div className="rounded-2xl border bg-card p-5 sm:p-6">
            <p className="font-semibold mb-4">Order items</p>
            <div className="space-y-3">
              {order.items.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <Link to="/product/$id" params={{ id: it.id }} key={it.id}
                    className="flex items-center gap-3 rounded-xl hover:bg-secondary p-2 -mx-2 transition group"
                  >
                    <img src={p.image} className="size-14 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-accent transition">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">৳{(p.price * it.qty).toLocaleString()}</span>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-bold text-base">
              <span>Total paid</span>
              <span className="tabular-nums">৳{order.total.toLocaleString()}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Payment: <span className="capitalize font-medium text-foreground">{order.payment}</span>
              <span className="mx-1.5 text-border">·</span>
              Ship to: {order.address}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/track" className="h-12 flex items-center justify-center rounded-xl border text-sm font-medium hover:border-foreground transition">
            Track another
          </Link>
          <Link to="/" className="h-12 flex items-center justify-center rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
            Continue shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}
