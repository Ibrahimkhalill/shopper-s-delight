import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Check, Package, Truck, Home } from "lucide-react";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

function OrderPage() {
  const { id } = Route.useParams();
  const steps = [
    { i: Check, t: "Order placed", d: "Today, 2:14 PM", done: true },
    { i: Package, t: "Packed", d: "Within 24h", done: true },
    { i: Truck, t: "Out for delivery", d: "1–3 days", done: false },
    { i: Home, t: "Delivered", d: "Pay on arrival", done: false },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <div className="mx-auto size-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Check className="size-8 text-accent" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Order confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you. We've sent a confirmation to your phone.
          </p>
          <p className="mt-1 text-sm">Order ID · <span className="font-medium">{id}</span></p>
        </div>

        <div className="mt-10 rounded-2xl border p-6">
          <p className="font-medium mb-6">Tracking</p>
          <ol className="space-y-5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                  <s.i className="size-4" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${s.done ? "" : "text-muted-foreground"}`}>{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/track" className="flex-1 h-12 leading-[3rem] text-center rounded-full border text-sm font-medium">Track another order</Link>
          <Link to="/" className="flex-1 h-12 leading-[3rem] text-center rounded-full bg-foreground text-background text-sm font-medium">Continue shopping</Link>
        </div>
      </div>
    </Layout>
  );
}