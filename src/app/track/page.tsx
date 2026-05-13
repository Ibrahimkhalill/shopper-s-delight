"use client";

import { useRouter } from "next/navigation";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Package, Search } from "lucide-react";
import { Price } from "@/components/site/Price";

function TrackPage() {
  const { orders } = useStore();
  const router = useRouter();
  const [oid, setOid] = useState("");

  const submit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const o = orders.find((x) => x.id.toLowerCase() === oid.trim().toLowerCase());
    if (!o) { toast.error("Order not found", { description: "Check your order ID and try again." }); return; }
    router.push(`/order/${o.id}`);
  };

  return (
    <Layout hideTrust>
      <div className="flex min-h-screen w-full min-w-0 flex-col items-center justify-start bg-secondary/20 px-4 pt-20 pb-16">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Package size={28} className="text-foreground" strokeWidth={1.75} />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-foreground text-center">Order Tracking</h1>
        <p className="mt-3 text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
          Enter your order ID to see the current status and detailed tracking information for your shipment.
        </p>

        {/* Search bar — icon-only submit (no “Track Order” label), single pill like reference */}
        <form onSubmit={submit} className="mt-8 w-full min-w-0 max-w-lg">
          <div className="flex w-full min-w-0 items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-4 pr-1.5 shadow-sm transition focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
            <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={oid}
              onChange={(e) => setOid(e.target.value)}
              placeholder="Enter your order ID"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Track order"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition hover:opacity-90 active:scale-95"
            >
              <Search size={16} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </form>

        {/* Recent orders */}
        {orders.length > 0 && (
          <div className="mt-10 w-full min-w-0 max-w-lg">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">Recent orders</p>
            <ul className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => router.push(`/order/${o.id}`)}
                    className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-foreground transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Package size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="mt-0.5 inline-flex items-baseline gap-1 text-xs capitalize text-muted-foreground">
                        {o.status} ·{" "}
                        <Price amount={o.total} size="xs" tone="inherit" className="!font-semibold" />
                      </p>
                    </div>
                    <Search size={14} className="text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TrackPage;
