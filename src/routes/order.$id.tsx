import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Check, Package, Truck, Home } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

const STATUSES = ["placed", "packed", "shipped", "delivered"] as const;

function OrderPage() {
  const { id } = Route.useParams();
  const { orders, resolveProduct } = useStore();
  const order = orders.find((o) => o.id === id);

  const stepIdx = order ? STATUSES.indexOf(order.status) : 0;
  const steps = [
    { i: Check, t: "Order placed" },
    { i: Package, t: "Packed" },
    { i: Truck, t: "Out for delivery" },
    { i: Home, t: "Delivered" },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-up">
        <div className="text-center">
          <div className="mx-auto size-16 rounded-full bg-accent/10 flex items-center justify-center animate-scale-in">
            <Check className="size-8 text-accent" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Order confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">Thank you. We've sent a confirmation to your phone.</p>
          <p className="mt-1 text-sm">Order ID · <span className="font-medium">{id}</span></p>
        </div>

        <div className="mt-10 rounded-2xl border p-6">
          <p className="font-medium mb-6">Tracking</p>
          <ol className="space-y-5">
            {steps.map((s, i) => {
              const done = i <= stepIdx;
              return (
                <li key={i} className="flex items-start gap-4">
                  <div className={`size-9 rounded-full flex items-center justify-center shrink-0 transition ${done ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                    <s.i className="size-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${done ? "" : "text-muted-foreground"}`}>{s.t}</p>
                    {i === stepIdx && <p className="text-xs text-accent mt-0.5">Current status</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {order && (
          <div className="mt-6 rounded-2xl border p-6">
            <p className="font-medium mb-4">Items</p>
            <div className="space-y-3">
              {order.items.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <Link to="/product/$id" params={{ id: it.id }} key={it.id} className="flex items-center gap-3 hover:bg-secondary rounded-xl p-2 -m-2 transition">
                    <img src={p.image} className="size-12 rounded-lg object-cover" alt="" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground">Qty {it.qty}</p></div>
                    <span className="text-sm tabular-nums">৳{(p.price * it.qty).toLocaleString()}</span>
                  </Link>
                );
              })}
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-semibold"><span>Total paid</span><span className="tabular-nums">৳{order.total.toLocaleString()}</span></div>
            <p className="mt-2 text-xs text-muted-foreground">Payment: <span className="capitalize">{order.payment}</span> · Ship to: {order.address}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/track" className="flex-1 h-12 leading-[3rem] text-center rounded-full border text-sm font-medium hover:border-foreground">Track another order</Link>
          <Link to="/" className="flex-1 h-12 leading-[3rem] text-center rounded-full bg-foreground text-background text-sm font-medium">Continue shopping</Link>
        </div>
      </div>
    </Layout>
  );
}
