import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Package, Search } from "lucide-react";

export const Route = createFileRoute("/track")({ component: TrackPage });

function TrackPage() {
  const { orders } = useStore();
  const navigate = useNavigate();
  const [oid, setOid] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const o = orders.find((x) => x.id.toLowerCase() === oid.trim().toLowerCase() && x.phone.includes(phone.trim()));
    if (!o) { toast.error("Order not found", { description: "Check your order ID and phone." }); return; }
    navigate({ to: "/order/$id", params: { id: o.id } });
  };

  return (
    <Layout>
      <PageHeader
        title="Track order"
        subtitle="No login needed — just your order ID and phone"
        crumbs={[{ label: "Home", to: "/" }, { label: "Track order" }]}
      />

      <div className="mx-auto max-w-md px-4 py-8 animate-fade-up">
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Package className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={oid}
              onChange={(e) => setOid(e.target.value)}
              placeholder="Order ID (e.g. BD-2026-00421)"
              className="w-full h-12 pl-11 pr-4 rounded-xl border bg-card text-sm outline-none focus:border-foreground transition"
            />
          </div>
          <div className="relative">
            <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              type="tel"
              className="w-full h-12 pl-11 pr-4 rounded-xl border bg-card text-sm outline-none focus:border-foreground transition"
            />
          </div>
          <button className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition">
            Track order
          </button>
        </form>

        {orders.length > 0 && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Recent orders</p>
            <ul className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => navigate({ to: "/order/$id", params: { id: o.id } })}
                    className="w-full text-left rounded-xl border p-4 hover:border-foreground transition flex items-center gap-3"
                  >
                    <div className="size-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Package className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{o.id}</p>
                      <p className="text-xs text-muted-foreground capitalize">{o.status} · ৳{o.total.toLocaleString()}</p>
                    </div>
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
