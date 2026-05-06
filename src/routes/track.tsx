import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

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
      <div className="mx-auto max-w-md px-4 py-16 animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-center">Track your order</h1>
        <p className="text-sm text-muted-foreground text-center mt-2">No login needed. Just your order ID and phone.</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input value={oid} onChange={(e) => setOid(e.target.value)} placeholder="Order ID (e.g. BD-2026-00421)" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full h-12 px-5 rounded-full border bg-card text-sm outline-none focus:border-foreground" />
          <button className="w-full text-center h-12 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">Track order</button>
        </form>
        {orders.length > 0 && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Recent</p>
            <ul className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <button onClick={() => navigate({ to: "/order/$id", params: { id: o.id } })} className="w-full text-left rounded-xl border p-3 hover:border-foreground transition">
                    <p className="text-sm font-medium">{o.id}</p>
                    <p className="text-xs text-muted-foreground capitalize">{o.status} · ৳{o.total.toLocaleString()}</p>
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
