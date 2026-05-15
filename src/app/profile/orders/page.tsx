"use client";

import Link from "next/link";
import { useState } from "react";
import { ProfileShell } from "@/components/site/ProfileShell";
import { useStore } from "@/lib/store";
import { Package, PackageCheck, Truck } from "lucide-react";
import { Price } from "@/components/site/Price";
import { toast } from "sonner";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  placed:    { label: "Processing", cls: "bg-yellow-100 text-yellow-700" },
  packed:    { label: "Processing", cls: "bg-yellow-100 text-yellow-700" },
  shipped:   { label: "Delivering", cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Completed",  cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled",  cls: "bg-secondary text-muted-foreground" },
};

type Filter = "all" | "processing" | "delivering" | "completed" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "processing", label: "Processing" },
  { id: "delivering", label: "Delivering" },
  { id: "completed",  label: "Completed" },
  { id: "cancelled",  label: "Cancelled" },
];

function matchFilter(status: string, f: Filter) {
  if (f === "all")        return true;
  if (f === "processing") return status === "placed" || status === "packed";
  if (f === "delivering") return status === "shipped";
  if (f === "completed")  return status === "delivered";
  if (f === "cancelled")  return status === "cancelled";
  return true;
}

export default function OrdersPage() {
  const { orders, addToCart } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = orders.filter((o) => matchFilter(o.status, filter));

  return (
    <ProfileShell>
      <div className="space-y-4 animate-fade-up">
        {/* Filter tabs */}
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max px-0.5 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border transition-all duration-200 active:scale-[0.97] ${
                  filter === f.id
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground bg-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border py-16 text-center">
            <Package className="size-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-sm">No orders here</p>
            <p className="text-muted-foreground text-xs mt-1">Orders matching this filter will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => {
              const meta = STATUS_META[o.status] ?? STATUS_META.placed;
              const date = new Date(o.createdAt).toLocaleString("en-GB", {
                hour: "2-digit", minute: "2-digit", hour12: true,
                day: "2-digit", month: "long", year: "numeric",
              });
              const totalItems = o.items.reduce((s, it) => s + it.qty, 0);
              const isFree = o.total >= 1500;

              return (
                <div key={o.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b">
                    <p className="font-mono font-bold text-sm">
                      Order ID : <span>#{o.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <span className={`text-[11px] px-3 py-1 rounded-full font-semibold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="divide-y px-5">
                    <div className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <PackageCheck className="size-4 shrink-0" strokeWidth={1.75} />
                        <span className="text-sm font-medium text-foreground">Order Date</span>
                      </div>
                      <span className="text-sm font-semibold">{date}</span>
                    </div>
                    <div className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Package className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                        <span className="text-sm font-medium text-foreground">Order Items</span>
                      </div>
                      <span className="text-sm font-semibold">{totalItems} Product{totalItems !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Truck className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                        <span className="text-sm font-medium text-foreground">Delivery Method</span>
                      </div>
                      <span className="text-sm font-semibold">{isFree ? "Free Delivery" : "Standard Delivery"}</span>
                    </div>
                    <div className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="size-4 shrink-0 flex items-center justify-center">
                          <span className="size-3.5 rounded-sm border-2 border-muted-foreground/40" />
                        </span>
                        <span className="text-sm font-medium text-foreground">Amount Payable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Price amount={o.total} size="sm" className="font-bold!" />
                        {o.payment === "cod" && (
                          <span className="text-[11px] text-amber-600 font-semibold">(Unpaid)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-t bg-secondary/30">
                    <Link
                      href={`/order/${o.id}/details`}
                      className="h-9 px-5 rounded-full border border-border text-sm font-semibold hover:border-foreground hover:bg-white transition flex items-center gap-1.5"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        o.items.forEach((it) => addToCart(it.id, { qty: it.qty, size: it.size }));
                        toast.success("Items added to cart");
                      }}
                      className="h-9 px-5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 transition"
                    >
                      Order Again
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProfileShell>
  );
}
